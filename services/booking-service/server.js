require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const {
  logger,
  middleware: { ErrorHandler },
  rabbitmq: { connection: rabbitmqConnection }
} = require('@rent-a-car/shared-utils');

const bookingRoutes = require('./routes/bookingRoutes.js');

const app = express();

// Middleware'ler
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Booking Service is healthy', timestamp: new Date().toISOString() });
});

// Error handlers
app.use(ErrorHandler.notFound);
app.use(ErrorHandler.handle);

const PORT = process.env.PORT || 5003;

const startServer = async () => {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connection successful (Booking Service)');

    // RabbitMQ bağlantısı
    try {
      await rabbitmqConnection.connect();
      logger.info('RabbitMQ connection successful (Booking Service)');
    } catch (error) {
      logger.warn('RabbitMQ connection failed, continuing without messaging:', error.message);
    }

    app.listen(PORT, () => {
      logger.info(`Booking Service is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start Booking Service:', error);
    process.exit(1);
  }
};

startServer();