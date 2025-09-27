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

// Parse and validate conversationId structure and membership
const parseConvId = (convId) => {
  const parts = String(convId || '').split(':');
  if (parts.length === 3 && parts[0] === 'dm') {
    const [_, a, b] = parts;
    return { type: 'dm', pair: [String(a), String(b)] };
  }
  if (parts.length === 4 && (parts[0] === 'req' || parts[0] === 'off')) {
    const [type, refId, a, b] = parts;
    return { type, refId: String(refId), pair: [String(a), String(b)] };
  }
  return null;
};

const isValidConvIdForUser = (convId, userId) => {
  const parsed = parseConvId(convId);
  if (!parsed) return false;
  const [a, b] = parsed.pair || [];
  if (!isValidId(a) || !isValidId(b)) return false;
  if (!String(userId) || (String(a) !== String(userId) && String(b) !== String(userId))) return false;
  if ((parsed.type === 'req' || parsed.type === 'off') && !isValidId(parsed.refId)) return false;
  return true;
};

module.exports = function setupSocket(io) {
  // مصادقة كل اتصال
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

      const uid =
        decoded.id ||
        decoded._id ||
        decoded.userId ||
        (decoded.user && (decoded.user._id || decoded.user.id || decoded.user.userId));

      if (!uid) return next(new Error('Invalid token payload'));
      socket.userId = String(uid);
      next();
    } catch (e) {
      if (e && e.name === 'TokenExpiredError') {
        return next(new Error('Token expired'));
      }
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    const currentUserId = socket.userId;
    if (!currentUserId) return socket.disconnect(true);

    // غرفة المستخدم للإشعارات
    socket.join(String(currentUserId));

    /* ============= غرف المحادثات ============= */
    socket.on('joinConversation', ({ conversationId } = {}) => {
      if (!conversationId) return;
      if (!isValidConvIdForUser(conversationId, currentUserId)) return;
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
        before, // ISO timestamp or message _id for cursor-based pagination
      } = {}) => {
        try {
          if (!isValidId(recipientId)) {
            return socket.emit('ws:error', { message: 'Invalid recipient ID' });
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

          const baseQuery = {
            $or: [
              { conversationId: convId }, // الجديدة
              pairQuery,                   // توافق قديم
            ],
          };

          const q = { ...baseQuery };

          // Cursor-based pagination: before can be timestamp or objectId
          if (before) {
            // try parse as date
            const beforeDate = new Date(before);
            if (!isNaN(beforeDate.getTime())) {
              q.timestamp = { $lt: beforeDate };
            } else if (isValidId(before)) {
              // fallback: use message _id as cursor
              q._id = { $lt: before };
            }
          }

          const msgs = await Message.find(q)
            .select('sender recipient content timestamp read conversationId')
            .sort({ timestamp: -1, _id: -1 })
            .limit(Math.min(Number(limit) || 50, 200))
            .lean();

          // Results are newest-first; reverse for UI
          const ordered = [...msgs].reverse();

          const userIds = [
            ...new Set(ordered.flatMap((m) => [String(m.sender), String(m.recipient)])),
          ];

          const users = await User.find({ _id: { $in: userIds } })
            .select('firstName lastName profileImage')
            .lean();
          const usersMap = Object.fromEntries(users.map((u) => [String(u._id), u]));

          const hydrated = ordered.map((m) => {
            const sender = usersMap[String(m.sender)];
            return {
              ...m,
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
          socket.emit('ws:error', { message: 'تعذر تحميل المحادثة' });
        }
      },
    );

    /* ============= مؤشر الكتابة ============= */
    socket.on('typing', ({ conversationId } = {}) => {
      if (!conversationId) return;
      if (!isValidConvIdForUser(conversationId, currentUserId)) return;
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
            return socket.emit('ws:error', { message: 'Invalid recipient ID' });
          }
          if (recipientId === currentUserId) {
            return socket.emit('ws:error', { message: 'لا يمكنك مراسلة نفسك' });
          }

          const body = (content || '').trim();
          if (!body) return socket.emit('ws:error', { message: 'لا يمكن إرسال رسالة فارغة' });
          if (body.length > 2000) return socket.emit('ws:error', { message: 'النص طويل جدًا' });

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

          // إزالة الإرسال لغرفة المحادثة لتجنّب التكرار
          // io.to(String(convId)).emit('receiveMessage', enriched);

          // تأكيد للمرسل
          socket.emit('messageSent', enriched);
          
          // إرسال للمستلم عبر غرفة المستخدم
          io.to(String(recipientId)).emit('receiveMessage', enriched);
        } catch (error) {
          console.error('sendMessage error:', error);
          socket.emit('ws:error', { message: 'فشل في إرسال الرسالة' });
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
