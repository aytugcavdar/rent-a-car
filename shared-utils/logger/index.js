const winston = require('winston');

// Loglarımızı (kayıtlarımızı) nasıl formatlayacağımızı belirliyoruz.
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Zaman damgası ekle
  winston.format.errors({ stack: true }), // Hata olursa stack trace'i göster
  winston.format.colorize(), // Renkli çıktı
  winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
);

// Logger'ımızı oluşturuyoruz.
const logger = winston.createLogger({
  level: 'info', // Sadece 'info' ve üzerindeki seviyeleri (warn, error) logla
  format: logFormat,
  transports: [
    // Logları konsola yazdır.
    new winston.transports.Console()
    // İleride logları bir dosyaya veya başka bir servise de gönderebiliriz.
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
  exitOnError: false,
});

module.exports = logger;