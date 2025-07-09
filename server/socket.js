const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Message = require('./models/message');
const User = require('./models/user'); // ⬅️ تأكد من وجود هذا

const setupSocket = (io) => {
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
    console.log(`✅ User ${socket.userId} connected`);
    socket.join(socket.userId);

    socket.on('sendMessage', async ({ recipientId, content }) => {
      try {
        if (
          !mongoose.Types.ObjectId.isValid(socket.userId) ||
          !mongoose.Types.ObjectId.isValid(recipientId)
        ) {
          return socket.emit('error', { message: 'Invalid user ID' });
        }

        const message = new Message({
          sender: socket.userId,
          recipient: recipientId,
          content,
          timestamp: new Date(), // ⬅️ Use current date for timestamp
          read: false // ⬅️ Default to unread
        });

        await message.save();

        // ⬅️ Populate sender name (firstName + lastName)
        const sender = await User.findById(socket.userId).select('firstName lastName');

        const messageWithName = {
          ...message._doc,
          senderName: sender ? `${sender.firstName} ${sender.lastName}` : 'مستخدم'
        };

        io.to(recipientId).emit('receiveMessage', messageWithName);
        socket.emit('messageSent', messageWithName);
      } catch (error) {
        console.error('❌ Error:', error);
        socket.emit('error', { message: 'Message failed' });
      }
    });
    

    socket.on('donationIntent', ({ recipientId, donationId }) => {
        io.to(recipientId).emit('donationIntentNotification', {
        title: '🩸 شخص يريد التبرع',
        message: `أحد المستخدمين أبدى نيته بالتبرع لحالتك`,
        donationId,
        date: new Date(),
        });
    });


    socket.on('typing', ({ recipientId }) => {
      socket.to(recipientId).emit('typing', { senderId: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log(`🔴 User ${socket.userId} disconnected`);
    });
  });
};

module.exports = setupSocket;
// This code sets up a Socket.IO server that handles real-time messaging between users.
// It authenticates users using JWT, allows sending messages, and emits typing events.