require('dotenv').config(); // .env dosyasını en başta yükle
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Relative path yerine paket adını kullan
const {
  logger,
  middleware,
  helpers,
} = require('@rent-a-car/shared-utils');

const { ErrorHandler } = middleware;
const { CloudinaryHelper } = helpers;
const authRoutes = require('./routes/authRoutes');

// 2. Express uygulamasını başlat
const app = express();

// 3. Cloudinary'i başlat (dotenv yüklendikten sonra)
CloudinaryHelper.init();

// 4. Temel middleware'leri kullan
app.use(cors()); // Farklı domain'lerden gelen isteklere izin ver
app.use(express.json()); // Gelen JSON body'leri parse et

// 5. API Rotalarını tanımla
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Auth Service is running');
  req.end();
  
});

// 6. Hata Yönetimi Middleware'leri
app.use(ErrorHandler.notFound); // Bulunamayan rotalar için
app.use(ErrorHandler.handle);   // Genel hata yakalayıcı

// 7. Veritabanına bağlan ve sunucuyu başlat
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connection successful.');

    // Sunucuyu dinlemeye başla
    app.listen(PORT, () => {
      logger.info(`Auth Service is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1); // Bağlantı hatası olursa uygulamayı sonlandır
  }
};

startServer();