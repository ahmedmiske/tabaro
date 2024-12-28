const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const { userRoutes } = require('./routes/userRoute');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const logger = require('./middlewares/logger');
const { otpRoutes } = require('./routes/otpRoute');


const app = express();

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');

        // Start the server only after the database is connected
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
    res.se/nd('API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/otp', otpRoutes);

app.use(notFound);
app.use(errorHandler);

