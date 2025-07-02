const http = require('http');
const dotenv = require('dotenv');
const express = require('express');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');  // إضافة حزمة cors
const { userRoutes } = require('./routes/userRoute');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const logger = require('./middlewares/logger');
const { otpRoutes } = require('./routes/otpRoute');
const setupSocket = require('./socket');

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // يمكنك تحديد مصدر معين بدلاً من استخدام * للسماح بجميع المصادر
    // methods: ['GET', 'POST'],
  },
});

// استخدام CORS
app.use(cors()); // هذا سيسمح بجميع طلبات CORS من أي مصدر

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit the process with a failure code
    });

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '30mb' }));
app.use('/uploads', express.static('uploads'));

app.use(logger);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/blood-requests', require('./routes/bloodRequestRoute'));
app.use('/api/otp', otpRoutes);


if(!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
    require('./swagger')(app);
}

app.use(notFound);
app.use(errorHandler);

setupSocket(io);

app.set('io', io); // Make io available in the app