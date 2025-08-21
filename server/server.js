// server/server.js
const http = require('http');
const dotenv = require('dotenv');
const express = require('express');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { ensureUploadTree } = require('./middlewares/upload');

const { userRoutes } = require('./routes/userRoute');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const logger = require('./middlewares/logger');
const { otpRoutes } = require('./routes/otpRoute');
const setupSocket = require('./socket');

const donationConfirmationRoutes = require('./routes/donationConfirmationRoutes'); // الدم
const donationRequestRoutes = require('./routes/donationRequestRoute');           // الطلبات العامة
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoute');
const donationRequestConfirmationRoutes = require('./routes/donationRequestConfirmationRoutes');

dotenv.config();

/* تأكد من شجرة الرفع قبل أي شيء */
ensureUploadTree();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// اجعل الـ io متاحًا للكонтролرز
app.set('io', io);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));
app.use(logger);

// Static للملفات المرفوعة (مجلد واحد داخل server/)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// صحة
app.get('/', (req, res) => res.send('API is running...'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/blood-requests', require('./routes/bloodRequestRoute'));
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/donation-confirmations', donationConfirmationRoutes);
app.use('/api/donation-request-confirmations', donationRequestConfirmationRoutes);
app.use('/api/donationRequests', donationRequestRoutes);

// Swagger في التطوير
if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
  require('./swagger')(app);
}

// Errors
app.use(notFound);
app.use(errorHandler);

// Socket.IO
setupSocket(io);

// DB + Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
