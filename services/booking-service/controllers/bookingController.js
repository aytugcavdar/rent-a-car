const axios = require('axios');
const Booking = require('../models/Booking');
const {
  middleware: { asyncHandler },
  helpers: { ResponseFormatter },
  constants: { httpStatus },
  logger,
  rabbitmq,
} = require('@rent-a-car/shared-utils');

const { publisher } = rabbitmq;

const CAR_SERVICE_URL = process.env.CAR_SERVICE_URL || 'http://localhost:5002';

class BookingController {
  /**
   * @desc    Yeni bir rezervasyon oluşturur
   * @route   POST /api/bookings
   * @access  Private (Authenticated User)
   */
  static createBooking = asyncHandler(async (req, res) => {
    const { carId, startDate, endDate } = req.body;
    const userId = req.user.id;

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

    // 5. RabbitMQ bildirimleri
    try {
      const notificationMessage = {
        bookingId: booking._id,
        userEmail: req.user.email,
        carInfo: `${car.brand} ${car.model}`,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString()
      };
      await publisher.publish('booking_created_queue', notificationMessage);
      logger.info(`[>] Booking ID ${booking._id} için bildirim isteği kuyruğa gönderildi.`);
    } catch (error) {
      logger.error(`Rezervasyon sonrası bildirim mesajı gönderilemedi:`, error);
    }

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

    res.status(httpStatus.CREATED).json(
      ResponseFormatter.success(booking, 'Rezervasyon başarıyla oluşturuldu.', httpStatus.CREATED)
    );
  });

  /**
   * @desc    Kullanıcının tüm rezervasyonlarını getirir
   * @route   GET /api/bookings
   * @access  Private (Authenticated User)
   */
  static getUserBookings = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Booking.countDocuments(query);

    // Her rezervasyon için araç bilgilerini al
    const bookingsWithCarInfo = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const response = await axios.get(`${CAR_SERVICE_URL}/api/cars/${booking.carId}`);
          return {
            ...booking,
            car: response.data.data
          };
        } catch (error) {
          logger.error(`Rezervasyon ${booking._id} için araç bilgisi alınamadı`);
          return {
            ...booking,
            car: null
          };
        }
      })
    );

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({
        bookings: bookingsWithCarInfo,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }, 'Rezervasyonlar başarıyla getirildi.')
    );
  });

  /**
   * @desc    Tek bir rezervasyonun detayını getirir
   * @route   GET /api/bookings/:id
   * @access  Private (Authenticated User)
   */
  static getBookingById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const booking = await Booking.findById(id).lean();

    if (!booking) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Rezervasyon bulunamadı.', httpStatus.NOT_FOUND)
      );
    }

    // Admin değilse ve rezervasyon kendisine ait değilse erişim reddet
    if (!isAdmin && booking.userId.toString() !== userId) {
      return res.status(httpStatus.FORBIDDEN).json(
        ResponseFormatter.error('Bu rezervasyona erişim yetkiniz yok.', httpStatus.FORBIDDEN)
      );
    }

    // Araç bilgisini ekle
    try {
      const response = await axios.get(`${CAR_SERVICE_URL}/api/cars/${booking.carId}`);
      booking.car = response.data.data;
    } catch (error) {
      logger.error(`Araç bilgisi alınamadı: ${error.message}`);
      booking.car = null;
    }

    res.status(httpStatus.OK).json(
      ResponseFormatter.success(booking, 'Rezervasyon detayı başarıyla getirildi.')
    );
  });

  /**
   * @desc    Rezervasyonu iptal eder
   * @route   PATCH /api/bookings/:id/cancel
   * @access  Private (Authenticated User)
   */
  static cancelBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Rezervasyon bulunamadı.', httpStatus.NOT_FOUND)
      );
    }

    if (!isAdmin && booking.userId.toString() !== userId) {
      return res.status(httpStatus.FORBIDDEN).json(
        ResponseFormatter.error('Bu rezervasyonu iptal etme yetkiniz yok.', httpStatus.FORBIDDEN)
      );
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(httpStatus.BAD_REQUEST).json(
        ResponseFormatter.error('Bu rezervasyon zaten iptal edilmiş veya tamamlanmış.', httpStatus.BAD_REQUEST)
      );
    }

    booking.status = 'cancelled';
    await booking.save();

    logger.info(`Rezervasyon iptal edildi: ${booking._id}`);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success(booking, 'Rezervasyon başarıyla iptal edildi.')
    );
  });

  /**
   * @desc    Tüm rezervasyonları getirir (Admin)
   * @route   GET /api/bookings/admin/all
   * @access  Private/Admin
   */
  static getAllBookings = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10, search } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Booking.countDocuments(query);

    // Her rezervasyon için araç bilgilerini al
    const bookingsWithCarInfo = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const response = await axios.get(`${CAR_SERVICE_URL}/api/cars/${booking.carId}`);
          return {
            ...booking,
            car: response.data.data
          };
        } catch (error) {
          logger.error(`Rezervasyon ${booking._id} için araç bilgisi alınamadı`);
          return {
            ...booking,
            car: null
          };
        }
      })
    );

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({
        bookings: bookingsWithCarInfo,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }, 'Tüm rezervasyonlar başarıyla getirildi.')
    );
  });

  /**
   * @desc    Rezervasyon durumunu günceller (Admin)
   * @route   PATCH /api/bookings/:id/status
   * @access  Private/Admin
   */
  static updateBookingStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Rezervasyon bulunamadı.', httpStatus.NOT_FOUND)
      );
    }

    booking.status = status;
    await booking.save();

    logger.info(`Rezervasyon durumu güncellendi: ${booking._id} -> ${status}`);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success(booking, 'Rezervasyon durumu başarıyla güncellendi.')
    );
  });

  /**
   * @desc    Rezervasyonu siler (Admin)
   * @route   DELETE /api/bookings/:id
   * @access  Private/Admin
   */
  static deleteBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Rezervasyon bulunamadı.', httpStatus.NOT_FOUND)
      );
    }

    logger.info(`Rezervasyon silindi: ${id}`);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success(null, 'Rezervasyon başarıyla silindi.')
    );
  });
}

module.exports = BookingController;