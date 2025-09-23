require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const {
  logger,
  middleware: { ErrorHandler },
  helpers: { CloudinaryHelper }
} = require('@rent-a-car/shared-utils');

const carRoutes = require('./routes/carRoutes');

const app = express();

// Cloudinary'i başlat
CloudinaryHelper.init();

// Middleware'ler
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cars', carRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Car Service is healthy', timestamp: new Date().toISOString() });
});

// Error handlers
app.use(ErrorHandler.notFound);
app.use(ErrorHandler.handle);

const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connection successful (Car Service)');

    app.listen(PORT, () => {
      logger.info(`Car Service is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start Car Service:', error);
    process.exit(1);
  }
};

startServer();