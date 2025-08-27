// server/socket.js
const jwt = require('jsonwebtoken');
const mongoose2 = require('mongoose');

const Message = require('./models/message');
const User = require('./models/user');
const { notifyUser } = require('./utils/notify');

const isValidId = (id) => !!id && mongoose2.Types.ObjectId.isValid(id);

// ===== Helpers =====
const makePair = (a, b) => [String(a), String(b)].sort().join(':');
const makeConvId = ({ me, recipientId, requestId, offerId, conversationId }) => {
  if (conversationId && String(conversationId).trim()) return String(conversationId).trim();
  if (isValidId(requestId)) return `req:${requestId}:${makePair(me, recipientId)}`;
  if (isValidId(offerId))   return `off:${offerId}:${makePair(me, recipientId)}`;
  return `dm:${makePair(me, recipientId)}`; // Direct messages
};

module.exports = function setupSocket(io) {
  // مصادقة كل اتصال
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const uid =
        decoded.id ||
        decoded._id ||
        decoded.userId ||
        (decoded.user && (decoded.user._id || decoded.user.id || decoded.user.userId));

      if (!uid) return next(new Error('Invalid token payload'));
      socket.userId = String(uid);
      next();
    } catch (e) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const currentUserId = socket.userId;
    if (!currentUserId) return socket.disconnect(true);

    // غرفة المستخدم للإشعارات
    socket.join(String(currentUserId));

    /* ============= غرف المحادثات ============= */
    socket.on('joinConversation', ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.join(String(conversationId));
    });

    socket.on('leaveConversation', ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.leave(String(conversationId));
    });

    /* ============= تحميل السجل ============= */
    socket.on(
      'loadMessages',
      async ({
        conversationId,
        recipientId,   // مهم
        requestId,
        offerId,
        limit = 50,
        skip = 0,
      } = {}) => {
        try {
          if (!isValidId(recipientId)) {
            return socket.emit('error', { message: 'Invalid recipient ID' });
          }

          const convId = makeConvId({
            me: currentUserId,
            recipientId,
            requestId,
            offerId,
            conversationId,
          });

          // ندعم المستندات القديمة (بدون conversationId) + الجديدة
          const pairQuery = {
            $or: [
              { sender: currentUserId, recipient: recipientId },
              { sender: recipientId,   recipient: currentUserId },
            ],
          };
          const query = {
            $or: [
              { conversationId: convId }, // الجديدة
              pairQuery,                   // توافق قديم
            ],
          };

          const msgs = await Message.find(query)
            .sort({ timestamp: 1 })
            .skip(Number(skip) || 0)
            .limit(Math.min(Number(limit) || 50, 200));

          const userIds = [
            ...new Set(msgs.flatMap((m) => [String(m.sender), String(m.recipient)])),
          ];

          const users = await User.find({ _id: { $in: userIds } })
            .select('firstName lastName profileImage');
          const usersMap = Object.fromEntries(users.map((u) => [String(u._id), u]));

          const hydrated = msgs.map((m) => {
            const sender = usersMap[String(m.sender)];
            return {
              ...m.toObject(),
              conversationId: convId,
              senderName: sender
                ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'مستخدم'
                : 'مستخدم',
              senderProfileImage: sender?.profileImage || '',
            };
          });

          socket.emit('chatHistory', { conversationId: convId, messages: hydrated });
        } catch (err) {
          console.error('loadMessages error:', err);
          socket.emit('error', { message: 'تعذر تحميل المحادثة' });
        }
      },
    );

    /* ============= مؤشر الكتابة ============= */
    socket.on('typing', ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.to(String(conversationId)).emit('typing', { conversationId, from: currentUserId });
    });

    /* ============= إرسال رسالة ============= */
    socket.on(
      'sendMessage',
      async ({
        conversationId,
        recipientId,
        content,
        requestId,
        offerId,
        type,
        tempId,
      } = {}) => {
        try {
          if (!isValidId(recipientId)) {
            return socket.emit('error', { message: 'Invalid recipient ID' });
          }
          if (recipientId === currentUserId) {
            return socket.emit('error', { message: 'لا يمكنك مراسلة نفسك' });
          }

          const body = (content || '').trim();
          if (!body) return socket.emit('error', { message: 'لا يمكن إرسال رسالة فارغة' });
          if (body.length > 2000) return socket.emit('error', { message: 'النص طويل جدًا' });

          const safeRequestId = isValidId(requestId) ? requestId : undefined;
          const safeOfferId   = isValidId(offerId)   ? offerId   : undefined;

          const convId = makeConvId({
            me: currentUserId,
            recipientId,
            requestId: safeRequestId,
            offerId: safeOfferId,
            conversationId,
          });

          const message = await Message.create({
            conversationId: convId,        // ✅ مهم إذا كان في الـSchema required
            sender: currentUserId,
            recipient: recipientId,
            content: body,
            timestamp: new Date(),
            read: false,
            requestId: safeRequestId,
            offerId: safeOfferId,
          });

          const sender = await User.findById(currentUserId)
            .select('firstName lastName profileImage');

          const enriched = {
            ...message.toObject(),
            conversationId: convId,
            tempId: tempId || null,
            senderName: sender
              ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'مستخدم'
              : 'مستخدم',
            senderProfileImage: sender?.profileImage || '',
          };

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

          // للمنضمّين لغرفة المحادثة
          io.to(String(convId)).emit('receiveMessage', enriched);
          // تأكيد للمرسل
          socket.emit('messageSent', enriched);
          // توافق قديم: إشعار في غرفة المستخدم
          io.to(String(recipientId)).emit('receiveMessage', enriched);
        } catch (error) {
          console.error('sendMessage error:', error);
          socket.emit('error', { message: 'فشل في إرسال الرسالة' });
        }
      },
    );

    /* ============= تعليم كمقروء ============= */
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
