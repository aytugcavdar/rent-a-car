require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const carRoutes = require('./routes/carRoutes');

const {
  logger,
  middleware,
} = require('@rent-a-car/shared-utils');

const { ErrorHandler } = middleware;
// Henüz rotamız yok, şimdilik yorum satırı olarak kalsın
// const carRoutes = require('./routes/carRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/cars', carRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.use(ErrorHandler.notFound);
app.use(ErrorHandler.handle);

const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connection successful for Car Service.');

    app.listen(PORT, () => {
      logger.info(`Car Service is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB for Car Service:', error);
    process.exit(1);
  }
};

startServer();