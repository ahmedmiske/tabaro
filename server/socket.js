const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Message = require('./models/message');
const User = require('./models/user');
const Notification = require('./models/Notification'); // ✅     


const setupSocket = (io) => {
  // ✅ تحقق من JWT لتعيين socket.userId
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User ${socket.userId} connected via socket`);

    // ✅ ينضم المستخدم لغرفته الخاصة لتلقي الرسائل
    socket.join(socket.userId);

    // ✅ تأكيد للعميل أنه انضم بنجاح
    socket.emit('connectedToRoom', socket.userId);

    // ✅ إرسال رسالة بين المستخدمين
   socket.on('sendMessage', async ({ recipientId, content, requestId, offerId }) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(socket.userId) ||
      !mongoose.Types.ObjectId.isValid(recipientId)
    ) {
      return socket.emit('error', { message: 'Invalid user ID' });
    }

    console.log('📨 Socket Message Send Triggered');
    console.log('👉 From:', socket.userId);
    console.log('👉 To:', recipientId);
    console.log('👉 Content:', content);

    const message = new Message({
      sender: socket.userId,
      recipient: recipientId,
      content,
      timestamp: new Date(),
      read: false,
      requestId,
      offerId
    });

    await message.save();

    // ✅ إنشاء إشعار مرتبط بالرسالة
    await Notification.create({
      userId: recipientId,
      title: '💬 رسالة جديدة',
      message: content.length > 100 ? content.slice(0, 100) + '...' : content,
      read: false,
      type: 'message',
      date: new Date()
    });

    const sender = await User.findById(socket.userId).select('firstName lastName');
    const messageWithName = {
      ...message._doc,
      senderName: sender ? `${sender.firstName} ${sender.lastName}` : 'مستخدم'
    };

    const socketsInRoom = await io.in(recipientId).fetchSockets();
    console.log(`📡 Recipient socket count: ${socketsInRoom.length}`);

    io.to(recipientId).emit('receiveMessage', messageWithName);
    socket.emit('messageSent', messageWithName);
  } catch (error) {
    console.error('❌ Error sending message:', error);
    socket.emit('error', { message: 'Message failed' });
  }
});


    // ✅ إشعار نية التبرع
    socket.on('donationIntent', ({ recipientId, donationId }) => {
      io.to(recipientId).emit('donationIntentNotification', {
        title: '🩸 شخص يريد التبرع',
        message: `أحد المستخدمين أبدى نيته بالتبرع لحالتك`,
        donationId,
        type: 'offer',
        date: new Date()
      });
    });

    // ✅ المستخدم يكتب الآن
    socket.on('typing', ({ recipientId }) => {
      socket.to(recipientId).emit('typing', { senderId: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log(`🔴 User ${socket.userId} disconnected`);
    });
  });
};

module.exports = setupSocket;
// This code sets up a WebSocket server using Socket.IO.  