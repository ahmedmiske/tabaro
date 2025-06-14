const jwt = require('jsonwebtoken');
const Message = require('./models/message');

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
    console.log(`User ${socket.userId} connected`);

    // test sending notification
    // socket.emit('notification', {
    //   type: 'test',
    //   title: 'Test Notification',
    //   message: 'This is a test notification',
    //   date: new Date(),
    // });

    
    
    // Join a private room based on user ID
    socket.join(socket.userId);

    // Handle sending messages
    socket.on('sendMessage', async ({ recipientId, content }) => {
      try {
        const message = new Message({
          sender: socket.userId,
          recipient: recipientId,
          content,
        });
        await message.save();

        // Send message to recipient's room
        io.to(recipientId).emit('receiveMessage', message);
        // Send notification to recipient
        io.to(recipientId).emit('notification', {
          type: 'message',
          title: 'New Message',
          message: `New message from ${socket.userId}`,
          messageId: message._id,
          date: new Date(),
        });

        // Acknowledge to sender
        socket.emit('messageSent', message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ recipientId }) => {
      socket.to(recipientId).emit('typing', { senderId: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};

module.exports = setupSocket;