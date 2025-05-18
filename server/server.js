const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');  // إضافة حزمة cors
const { userRoutes } = require('./routes/userRoute');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const logger = require('./middlewares/logger');
const { otpRoutes } = require('./routes/otpRoute');

dotenv.config();
const app = express();

// استخدام CORS
app.use(cors()); // هذا سيسمح بجميع طلبات CORS من أي مصدر

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit the process with a failure code
    });

app.use(express.json());
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