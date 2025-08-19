const http = require('http');
const dotenv = require('dotenv');
const express = require('express');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

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
const DonationRequestConfirmation = require('./models/DonationRequestConfirmation');
const { notifyUser } = require('./utils/notify');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ✅ اجعله متاحًا مبكرًا لكل الكنترولرز
app.set('io', io);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));
app.use(logger);

// تحضير uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// صحّة السيرفر
app.get('/', (req, res) => res.send('API is running...'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/blood-requests', require('./routes/bloodRequestRoute'));
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/donation-confirmations', donationConfirmationRoutes);
app.use('/api/donation-request-confirmations', donationRequestConfirmationRoutes);
app.use('/api/donationRequests', require('./routes/donationRequestRoute'));

// Swagger في التطوير فقط
if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
  require('./swagger')(app);
}

async function scanOverdueConfirmations(app) {
  const now = new Date();
  const list = await DonationRequestConfirmation.find({
    status: 'pending_verification',
    reminderDueAt: { $lte: now },
    overdue: false,
  }).select('requestId donor');

  for (const c of list) {
    try {
      // أرسل تذكيرًا للطرفين بتوثيق العملية
      await notifyUser({
        app,
        userId: c.donor,
        title: 'تذكير توثيق التبرع',
        message: 'مرّت 48 ساعة دون توثيق التبرع. يرجى إتمام التوثيق لتجنّب تعليق النشر.',
        type: 'verification_reminder',
        referenceId: c._id,
      });

      // نحاول معرفة صاحب الطلب لرسالة مماثلة
      // (توفير userId مباشرة إن أردت، أو استعلام خفيف)
      const reqDoc = await mongoose.model('DonationRequest').findById(c.requestId).select('userId');
      if (reqDoc?.userId) {
        await notifyUser({
          app,
          userId: reqDoc.userId,
          title: 'تذكير توثيق التبرع',
          message: 'مرّت 48 ساعة دون توثيق التبرع. يرجى إتمام التوثيق لتجنّب تعليق النشر.',
          type: 'verification_reminder',
          referenceId: c._id,
        });
      }

      c.overdue = true;
      await c.save();
    } catch (e) {
      console.error('overdue reminder error:', e);
    }
  }
}

// شغّل فحصًا كل ساعة
setInterval(() => scanOverdueConfirmations(app), 60 * 60 * 1000);



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
