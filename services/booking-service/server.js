require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const {
  logger,
  middleware,
} = require('@rent-a-car/shared-utils');

const { ErrorHandler } = middleware;
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// API Rotaları
app.use('/api/bookings', bookingRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Hata Yönetimi
app.use(ErrorHandler.notFound);
app.use(ErrorHandler.handle);

const PORT = process.env.PORT || 5003;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connection successful for Booking Service.');

    app.listen(PORT, () => {
      logger.info(`Booking Service is running on port ${PORT}`);
    });
    
  } catch (error) {
    logger.error('Failed to connect to MongoDB for Booking Service:', error);
    process.exit(1);
  }
};

startServer();