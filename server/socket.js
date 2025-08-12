const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Message = require('./models/message');
const User = require('./models/user');
// انتبه لاسم الملف الحقيقي (notification vs Notification)
const Notification = require('./models/Notification');

const isValidId = (id) => !!id && mongoose.Types.ObjectId.isValid(id);

const setupSocket = (io) => {
  // مصادقة الـsocket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const currentUserId = socket.userId;
    if (!currentUserId) return socket.disconnect(true);
    socket.join(currentUserId);

    // تحميل المحادثات (مع مستلم واحد) + دعم بسيط للصفحة
    socket.on('loadMessages', async ({ recipientId, limit = 50, skip = 0 } = {}) => {
      try {
        if (!isValidId(recipientId)) {
          return socket.emit('error', { message: 'Invalid recipient ID' });
        }

        const msgs = await Message.find({
          $or: [
            { sender: currentUserId, recipient: recipientId },
            { sender: recipientId, recipient: currentUserId }
          ],
        })
          .sort({ timestamp: 1 }) // تصاعدي لعرض قديم → جديد
          .skip(skip)
          .limit(Math.min(limit, 200)); // سقف أمان

        // نضيف أسماء/صور المرسلين عند الحاجة
        const userIds = [...new Set(msgs.flatMap(m => [String(m.sender), String(m.recipient)]))];
        const usersMap = Object.fromEntries(
          (await User.find({ _id: { $in: userIds } }).select('firstName lastName profileImage'))
            .map(u => [String(u._id), u])
        );

        const hydrated = msgs.map(m => {
          const sender = usersMap[String(m.sender)];
          return {
            ...m.toObject(),
            senderName: sender ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'مستخدم' : 'مستخدم',
            senderProfileImage: sender?.profileImage || ''
          };
        });

        socket.emit('chatHistory', hydrated);
      } catch (err) {
        console.error('loadMessages error:', err);
        socket.emit('error', { message: 'تعذر تحميل المحادثة' });
      }
    });

    // مؤشر الكتابة
    socket.on('typing', ({ recipientId } = {}) => {
      if (!isValidId(recipientId) || recipientId === currentUserId) return;
      io.to(recipientId).emit('typing', { senderId: currentUserId });
    });

    // إرسال رسالة
    socket.on('sendMessage', async ({ recipientId, content, requestId, offerId, type } = {}) => {
      try {
        if (!isValidId(recipientId)) {
          return socket.emit('error', { message: 'Invalid recipient ID' });
        }
        if (recipientId === currentUserId) {
          return socket.emit('error', { message: 'لا يمكنك مراسلة نفسك' });
        }

        const body = (content || '').trim();
        if (!body) {
          return socket.emit('error', { message: 'لا يمكن إرسال رسالة فارغة' });
        }
        if (body.length > 2000) {
          return socket.emit('error', { message: 'النص طويل جدًا' });
        }

        const safeRequestId = isValidId(requestId) ? requestId : undefined;
        const safeOfferId = isValidId(offerId) ? offerId : undefined;

        const message = await Message.create({
          sender: currentUserId,
          recipient: recipientId,
          content: body,
          timestamp: new Date(),
          read: false,
          requestId: safeRequestId,
          offerId: safeOfferId
        });

        const sender = await User.findById(currentUserId).select('firstName lastName profileImage');
        const senderName = sender ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'مستخدم' : 'مستخدم';
        const senderProfileImage = sender?.profileImage || '';

        // إشعار
        await Notification.create({
          userId: recipientId,
          sender: currentUserId,
          title: type === 'offer' ? '🤝 عرض تبرع جديد' : '💬 رسالة جديدة',
          message: body.length > 100 ? body.slice(0, 100) + '...' : body,
          read: false,
          type: type || 'message',
          referenceId: safeOfferId || safeRequestId || null,
          date: new Date()
        });

        const enriched = {
          ...message.toObject(),
          senderName,
          senderProfileImage
        };

        // إلى المستلم
        io.to(recipientId).emit('receiveMessage', enriched);
        // رجّع للمرسل نفس الشكل
        socket.emit('messageSent', enriched);
      } catch (error) {
        console.error('sendMessage error:', error);
        socket.emit('error', { message: 'فشل في إرسال الرسالة' });
      }
    });

    // (اختياري) وضع علامة مقروءة
    socket.on('markRead', async ({ messageIds = [] } = {}) => {
      try {
        await Message.updateMany(
          { _id: { $in: messageIds.filter(isValidId) }, recipient: currentUserId },
          { $set: { read: true } }
        );
      } catch (e) {
        // تجاهُل بهدوء
      }
    });
  });
};

module.exports = setupSocket;
