// server/socket.js
const jwt = require('jsonwebtoken');
const mongoose2 = require('mongoose');

const Message = require('./models/message');
const User = require('./models/user');
const { notifyUser } = require('./utils/notify');

const isValidId = (id) => !!id && mongoose2.Types.ObjectId.isValid(id);

module.exports = function setupSocket(io) {
  // مصادقة كل اتصال Socket
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) {
        console.warn('[socket] no token');
        return next(new Error('Authentication error'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // دعم مفاتيح متعددة للهوية داخل الـJWT
      const uid =
        decoded.id ||
        decoded._id ||
        decoded.userId ||
        (decoded.user &&
          (decoded.user._id || decoded.user.id || decoded.user.userId));

      if (!uid) {
        console.warn('[socket] invalid token payload');
        return next(new Error('Invalid token payload'));
      }

      socket.userId = String(uid);
      next();
    } catch (e) {
      console.warn('[socket] verify failed:', e.message);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const currentUserId = socket.userId;
    if (!currentUserId) return socket.disconnect(true);

    // الغرفة الخاصة بالمستخدم
    socket.join(String(currentUserId));

    /* ===================== جلب الرسائل ===================== */
    socket.on(
      'loadMessages',
      async ({ recipientId, limit = 50, skip = 0 } = {}) => {
        try {
          if (!isValidId(recipientId)) {
            return socket.emit('error', { message: 'Invalid recipient ID' });
          }

          const msgs = await Message.find({
            $or: [
              { sender: currentUserId, recipient: recipientId },
              { sender: recipientId, recipient: currentUserId },
            ],
          })
            .sort({ timestamp: 1 })
            .skip(Number(skip) || 0)
            .limit(Math.min(Number(limit) || 50, 200));

          const userIds = [
            ...new Set(
              msgs.flatMap((m) => [String(m.sender), String(m.recipient)]),
            ),
          ];

          const users = await User.find({ _id: { $in: userIds } }).select(
            'firstName lastName profileImage',
          );
          const usersMap = Object.fromEntries(
            users.map((u) => [String(u._id), u]),
          );

          const hydrated = msgs.map((m) => {
            const sender = usersMap[String(m.sender)];
            return {
              ...m.toObject(),
              senderName: sender
                ? `${sender.firstName || ''} ${sender.lastName || ''}`
                    .trim() || 'مستخدم'
                : 'مستخدم',
              senderProfileImage: sender?.profileImage || '',
            };
          });

          socket.emit('chatHistory', hydrated);
        } catch (err) {
          console.error('loadMessages error:', err);
          socket.emit('error', { message: 'تعذر تحميل المحادثة' });
        }
      },
    );

    /* ===================== مؤشر الكتابة ===================== */
    socket.on('typing', ({ recipientId } = {}) => {
      if (!isValidId(recipientId) || recipientId === currentUserId) return;
      io.to(String(recipientId)).emit('typing', { senderId: currentUserId });
    });

    /* ===================== إرسال رسالة ===================== */
    socket.on(
      'sendMessage',
      async ({
        recipientId,
        content,
        requestId,
        offerId,
        type,
        tempId, // 👈 سيصل من العميل لإرجاعه كما هو
      } = {}) => {
        try {
          if (!isValidId(recipientId)) {
            return socket.emit('error', { message: 'Invalid recipient ID' });
          }
          if (recipientId === currentUserId) {
            return socket.emit('error', { message: 'لا يمكنك مراسلة نفسك' });
          }

          const body = (content || '').trim();
          if (!body) {
            return socket.emit('error', {
              message: 'لا يمكن إرسال رسالة فارغة',
            });
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
            offerId: safeOfferId,
          });

          const sender = await User.findById(currentUserId).select(
            'firstName lastName profileImage',
          );

          const enriched = {
            ...message.toObject(),
            tempId: tempId || null, // 👈 نُعيد tempId ليستبدل العميل الرسالة التفاؤلية
            senderName: sender
              ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() ||
                'مستخدم'
              : 'مستخدم',
            senderProfileImage: sender?.profileImage || '',
          };

          // لا تُنشئ إشعارًا في حالة type === 'offer' (الإشعار يأتي من مسار التأكيد)
          if (type !== 'offer') {
            await notifyUser({
              io,
              userId: recipientId,
              sender: currentUserId,
              title: '💬 رسالة جديدة',
              message: body.length > 100 ? body.slice(0, 100) + '…' : body,
              type: 'message',
              referenceId: message._id,
            });
          }

          // للمستقبِل
          io.to(String(recipientId)).emit('receiveMessage', enriched);
          // للمرسل (ليستبدل التفاؤلية عبر tempId)
          socket.emit('messageSent', enriched);
        } catch (error) {
          console.error('sendMessage error:', error);
          socket.emit('error', { message: 'فشل في إرسال الرسالة' });
        }
      },
    );

    /* ===================== تعليم كمقروء ===================== */
    socket.on('markRead', async ({ messageIds = [] } = {}) => {
      try {
        const safeIds = messageIds.filter(isValidId);
        if (safeIds.length === 0) return;

        await Message.updateMany(
          { _id: { $in: safeIds }, recipient: currentUserId },
          { $set: { read: true } },
        );
      } catch (e) {
        console.error('Error marking messages as read:', e);
      }
    });
  });
};
