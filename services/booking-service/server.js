require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const {
  logger,
  middleware,
  rabbitmq,
} = require('@rent-a-car/shared-utils');

const { ErrorHandler } = middleware;
const bookingRoutes = require('./routes/bookingRoutes');
const { startPaymentResultConsumer } = require('./paymentResultConsumer');

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

// Graceful Shutdown - Uygulama kapatılırken temiz bir şekilde kapat
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  try {
    await rabbitmq.consumer.stopAll();
    logger.info('[✓] All consumers stopped');
    
    await mongoose.connection.close();
    logger.info('[✓] MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    logger.error('[✗] Error during shutdown:', error);
    process.exit(1);
  }
};

// Shutdown sinyallerini dinle
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Sunucuyu başlat
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connection successful for Booking Service.');

    // Payment result consumer'ı başlat
    await startPaymentResultConsumer();
    logger.info('Payment result consumer started successfully.');

    app.listen(PORT, () => {
      logger.info(`Booking Service is running on port ${PORT}`);
    });
    
  } catch (error) {
    logger.error('Failed to start Booking Service:', error);
    process.exit(1);
  }
};

startServer();