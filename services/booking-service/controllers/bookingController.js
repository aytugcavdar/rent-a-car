const axios = require('axios');
const Booking = require('../models/Booking');
const {
  middleware: { asyncHandler },
  helpers: { ResponseFormatter },
  constants: { httpStatus },
  logger,
  rabbitmq, // RabbitMQ modülünü import ediyoruz
} = require('@rent-a-car/shared-utils');

const { publisher } = rabbitmq; // Publisher'ı pratik kullanım için alıyoruz

// Diğer servislerin URL'lerini ortam değişkenlerinden alıyoruz.
const CAR_SERVICE_URL = process.env.CAR_SERVICE_URL || 'http://localhost:5002';

class BookingController {
  /**
   * @desc    Yeni bir rezervasyon oluşturur
   * @route   POST /api/bookings
   * @access  Private (Authenticated User)
   */
  static createBooking = asyncHandler(async (req, res) => {
    const { carId, startDate, endDate } = req.body;
    const userId = req.user.id; // Token'dan gelen kullanıcı ID'si

    // 1. Car-Service'e istek atarak araç bilgilerini al
    let car;
    try {
      const response = await axios.get(`${CAR_SERVICE_URL}/api/cars/${carId}`);
      car = response.data.data;
      if (car.status !== 'available') {
        return res.status(httpStatus.CONFLICT).json(
          ResponseFormatter.error('Seçilen araç şu an müsait değil.', httpStatus.CONFLICT)
        );
      }
    } catch (error) {
      logger.error(`Car service'ten araç bilgisi alınamadı: ${error.message}`);
      if (error.response && error.response.status === 404) {
          return res.status(httpStatus.NOT_FOUND).json(
            ResponseFormatter.error('Rezervasyon yapılmak istenen araç bulunamadı.', httpStatus.NOT_FOUND)
          );
      }
      return res.status(httpStatus.SERVICE_UNAVAILABLE).json(
        ResponseFormatter.error('Araç servisine ulaşılamıyor, lütfen daha sonra tekrar deneyin.', httpStatus.SERVICE_UNAVAILABLE)
      );
    }

    // 2. Belirtilen tarihlerde aracın başka bir rezervasyonu var mı kontrol et
    const existingBooking = await Booking.findOne({
      carId,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        { startDate: { $lt: endDate }, endDate: { $gt: startDate } },
      ],
    });

    if (existingBooking) {
      return res.status(httpStatus.CONFLICT).json(
        ResponseFormatter.error('Araç bu tarihler arasında zaten rezerve edilmiş.', httpStatus.CONFLICT)
      );
    }

    // 3. Toplam fiyatı hesapla
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = days * car.pricePerDay;

    // 4. Rezervasyonu veritabanında oluştur
    const booking = await Booking.create({
      ...req.body,
      userId,
      totalPrice,
      currency: car.currency,
    });
    
    logger.info(`Yeni rezervasyon oluşturuldu: ${booking._id} - Araç: ${car.plateNumber}`);
    
    // 5. RabbitMQ'ya 'booking_created_queue' kuyruğuna bildirim mesajı gönder
    try {
      const notificationMessage = {
        bookingId: booking._id,
        userEmail: req.user.email, // Token'dan gelen bilgi
        carInfo: `${car.brand} ${car.model}`,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString()
      };
      await publisher.publish('booking_created_queue', notificationMessage);
      logger.info(`[>] Booking ID ${booking._id} için bildirim isteği kuyruğa gönderildi.`);
    } catch (error) {
      logger.error(`Rezervasyon sonrası bildirim mesajı gönderilemedi:`, error);
    }

    // 6. RabbitMQ'ya 'payment_process_queue' kuyruğuna ödeme mesajı gönder
    try {
      const paymentMessage = {
        bookingId: booking._id,
        userId: booking.userId,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
      };
      await publisher.publish('payment_process_queue', paymentMessage);
      logger.info(`[>] Booking ID ${booking._id} için ödeme isteği kuyruğa gönderildi.`);
    } catch (error) {
      logger.error(`Rezervasyon sonrası ödeme mesajı gönderilemedi:`, error);
    }

    // 7. Başarılı cevabı kullanıcıya anında dön
    res.status(httpStatus.CREATED).json(
      ResponseFormatter.success(booking, 'Rezervasyon başarıyla oluşturuldu.', httpStatus.CREATED)
    );
  });

}

module.exports = BookingController;