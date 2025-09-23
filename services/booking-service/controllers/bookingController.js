const Booking = require('../models/Booking');
const axios = require('axios');

const {
  middleware: { asyncHandler },
  helpers: { ResponseFormatter },
  constants: { httpStatus },
  logger,
  rabbitmq: { publisher }
} = require('@rent-a-car/shared-utils');

class BookingController {
  /**
   * @desc    Yeni rezervasyon oluştur
   * @route   POST /api/bookings
   * @access  Private
   */
  static createBooking = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const bookingData = { ...req.body, userId };

    // 1. Araç müsaitlik kontrolü
    const conflictingBooking = await Booking.checkCarAvailability(
      bookingData.carId,
      bookingData.startDate,
      bookingData.endDate
    );

    if (conflictingBooking) {
      return res.status(httpStatus.CONFLICT).json(
        ResponseFormatter.error('Seçilen tarihler arasında araç müsait değil', httpStatus.CONFLICT)
      );
    }

    // 2. Araç bilgilerini car service'ten al
    try {
      const carResponse = await axios.get(
        `${process.env.CAR_SERVICE_URL || 'http://car-service:5002'}/api/cars/${bookingData.carId}`
      );
      const car = carResponse.data.data.car;

      if (!car || car.status !== 'available') {
        return res.status(httpStatus.BAD_REQUEST).json(
          ResponseFormatter.error('Seçilen araç rezervasyon için uygun değil', httpStatus.BAD_REQUEST)
        );
      }

      // Günlük fiyatı otomatik olarak set et
      if (!bookingData.pricing) {
        bookingData.pricing = {};
      }
      bookingData.pricing.dailyRate = car.pricePerDay;
      bookingData.pricing.currency = car.currency || 'TRY';

    } catch (error) {
      logger.error('Araç bilgileri alınırken hata:', error);
      return res.status(httpStatus.SERVICE_UNAVAILABLE).json(
        ResponseFormatter.error('Araç bilgileri alınamadı', httpStatus.SERVICE_UNAVAILABLE)
      );
    }

    // 3. Rezervasyonu oluştur
    const booking = await Booking.create(bookingData);
    
    // 4. Araç durumunu güncelle
    try {
      await axios.patch(
        `${process.env.CAR_SERVICE_URL || 'http://car-service:5002'}/api/cars/${bookingData.carId}/status`,
        { status: 'rented' },
        {
          headers: {
            'Authorization': req.headers.authorization
          }
        }
      );
    } catch (error) {
      logger.warn('Araç durumu güncellenirken hata:', error);
    }

    // 5. Bildirim mesajını kuyruğa ekle
    try {
      await publisher.publish('booking_created', {
        bookingId: booking._id,
        userId: booking.userId,
        bookingNumber: booking.bookingNumber,
        userEmail: req.user.email,
        carInfo: `${req.body.carBrand} ${req.body.carModel}`,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalAmount: booking.pricing.totalAmount
      });
    } catch (error) {
      logger.warn('Bildirim mesajı gönderilemedi:', error);
    }

    logger.info(`Yeni rezervasyon oluşturuldu: ${booking.bookingNumber}`);

    res.status(httpStatus.CREATED).json(
      ResponseFormatter.success({ booking }, 'Rezervasyon başarıyla oluşturuldu', httpStatus.CREATED)
    );
  });

  /**
   * @desc    Kullanıcının rezervasyonlarını listele
   * @route   GET /api/bookings
   * @access  Private
   */
  static getUserBookings = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = { userId: req.user.id };
    if (status) filters.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('carId', 'brand model year plateNumber category images');

    const totalBookings = await Booking.countDocuments(filters);
    const totalPages = Math.ceil(totalBookings / Number(limit));

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({
        bookings,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalBookings,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }, 'Rezervasyonlar başarıyla listelendi')
    );
  });

  /**
   * @desc    Tüm rezervasyonları listele (Admin)
   * @route   GET /api/bookings/admin/all
   * @access  Private (Admin only)
   */
  static getAllBookings = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      carId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (userId) filters.userId = userId;
    if (carId) filters.carId = carId;
    
    // Tarih aralığı filtresi
    if (startDate || endDate) {
      filters.startDate = {};
      if (startDate) filters.startDate.$gte = new Date(startDate);
      if (endDate) filters.startDate.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name surname email')
      .populate('carId', 'brand model year plateNumber category');

    const totalBookings = await Booking.countDocuments(filters);
    const totalPages = Math.ceil(totalBookings / Number(limit));

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({
        bookings,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalBookings,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }, 'Tüm rezervasyonlar listelendi')
    );
  });

  /**
   * @desc    Belirli bir rezervasyonu getir
   * @route   GET /api/bookings/:id
   * @access  Private
   */
  static getBookingById = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name surname email phone')
      .populate('carId', 'brand model year plateNumber category images pricePerDay');

    if (!booking) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Rezervasyon bulunamadı', httpStatus.NOT_FOUND)
      );
    }

    // Kullanıcı sadece kendi rezervasyonunu görebilir (admin hariç)
    if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user.id) {
      return res.status(httpStatus.FORBIDDEN).json(
        ResponseFormatter.error('Bu rezervasyona erişim yetkiniz yok', httpStatus.FORBIDDEN)
      );
    }

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({ booking }, 'Rezervasyon detayları')
    );
  });

  /**
   * @desc    Rezervasyon durumunu güncelle
   * @route   PATCH /api/bookings/:id/status
   * @access  Private (Admin only)
   */
  static updateBookingStatus = asyncHandler(async (req, res) => {
    const { status, notes } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Rezervasyon bulunamadı', httpStatus.NOT_FOUND)
      );
    }

    const oldStatus = booking.status;
    booking.status = status;
    
    if (notes) {
      booking.notes.internalNotes = notes;
    }

    // Araç durumunu güncelle
    if (status === 'completed' || status === 'cancelled') {
      try {
        await axios.patch(
          `${process.env.CAR_SERVICE_URL || 'http://car-service:5002'}/api/cars/${booking.carId}/status`,
          { status: 'available' },
          {
            headers: { 'Authorization': req.headers.authorization }
          }
        );
      } catch (error) {
        logger.warn('Araç durumu güncellenirken hata:', error);
      }
    }

    await booking.save();

    // Durum değişikliği bildirimini gönder
    try {
      await publisher.publish('booking_status_changed', {
        bookingId: booking._id,
        userId: booking.userId,
        bookingNumber: booking.bookingNumber,
        oldStatus,
        newStatus: status,
        updatedBy: req.user.email
      });
    } catch (error) {
      logger.warn('Bildirim mesajı gönderilemedi:', error);
    }

    logger.info(`Rezervasyon durumu güncellendi: ${booking.bookingNumber} (${oldStatus} -> ${status})`);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({ booking }, 'Rezervasyon durumu güncellendi')
    );
  });

  /**
   * @desc    Rezervasyonu iptal et
   * @route   DELETE /api/bookings/:id
   * @access  Private
   */
  static cancelBooking = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Rezervasyon bulunamadı', httpStatus.NOT_FOUND)
      );
    }

    // Kullanıcı sadece kendi rezervasyonunu iptal edebilir
    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user.id) {
      return res.status(httpStatus.FORBIDDEN).json(
        ResponseFormatter.error('Bu rezervasyonu iptal etme yetkiniz yok', httpStatus.FORBIDDEN)
      );
    }

    // İptal edilebilir mi kontrol et
    if (!booking.canBeCancelled) {
      return res.status(httpStatus.BAD_REQUEST).json(
        ResponseFormatter.error('Bu rezervasyon artık iptal edilemez', httpStatus.BAD_REQUEST)
      );
    }

    const cancelledBy = req.user.role === 'admin' ? 'admin' : 'customer';
    await booking.cancel(reason, cancelledBy);

    // Araç durumunu müsait yap
    try {
      await axios.patch(
        `${process.env.CAR_SERVICE_URL || 'http://car-service:5002'}/api/cars/${booking.carId}/status`,
        { status: 'available' },
        {
          headers: { 'Authorization': req.headers.authorization }
        }
      );
    } catch (error) {
      logger.warn('Araç durumu güncellenirken hata:', error);
    }

    // İptal bildirimini gönder
    try {
      await publisher.publish('booking_cancelled', {
        bookingId: booking._id,
        userId: booking.userId,
        bookingNumber: booking.bookingNumber,
        cancelledBy,
        reason,
        refundAmount: booking.cancellation.refundAmount,
        cancellationFee: booking.cancellation.cancellationFee
      });
    } catch (error) {
      logger.warn('Bildirim mesajı gönderilemedi:', error);
    }

    logger.info(`Rezervasyon iptal edildi: ${booking.bookingNumber} (${cancelledBy})`);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({ booking }, 'Rezervasyon başarıyla iptal edildi')
    );
  });

  /**
   * @desc    Araç teslim alma işlemi
   * @route   POST /api/bookings/:id/pickup
   * @access  Private (Admin only)
   */
  static vehiclePickup = asyncHandler(async (req, res) => {
    const { mileage, fuelLevel, condition, notes, images } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Rezervasyon bulunamadı', httpStatus.NOT_FOUND)
      );
    }

    if (booking.status !== 'confirmed') {
      return res.status(httpStatus.BAD_REQUEST).json(
        ResponseFormatter.error('Sadece onaylanmış rezervasyonlar teslim alınabilir', httpStatus.BAD_REQUEST)
      );
    }

    booking.vehicleHandover.pickupDetails = {
      datetime: new Date(),
      mileage,
      fuelLevel,
      condition,
      notes,
      images: images || [],
      handledBy: req.user.email
    };

    booking.status = 'active';
    await booking.save();

    // Teslim alma bildirimini gönder
    try {
      await publisher.publish('vehicle_picked_up', {
        bookingId: booking._id,
        userId: booking.userId,
        bookingNumber: booking.bookingNumber,
        pickupDatetime: booking.vehicleHandover.pickupDetails.datetime,
        handledBy: req.user.email
      });
    } catch (error) {
      logger.warn('Bildirim mesajı gönderilemedi:', error);
    }

    logger.info(`Araç teslim alındı: ${booking.bookingNumber}`);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({ booking }, 'Araç başarıyla teslim alındı')
    );
  });

  /**
   * @desc    Araç iade işlemi
   * @route   POST /api/bookings/:id/return
   * @access  Private (Admin only)
   */
  static vehicleReturn = asyncHandler(async (req, res) => {
    const { mileage, fuelLevel, condition, notes, images, damages } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Rezervasyon bulunamadı', httpStatus.NOT_FOUND)
      );
    }

    if (booking.status !== 'active') {
      return res.status(httpStatus.BAD_REQUEST).json(
        ResponseFormatter.error('Sadece aktif rezervasyonlar iade edilebilir', httpStatus.BAD_REQUEST)
      );
    }

    booking.vehicleHandover.returnDetails = {
      datetime: new Date(),
      mileage,
      fuelLevel,
      condition,
      notes,
      images: images || [],
      damages: damages || [],
      handledBy: req.user.email
    };

    booking.status = 'completed';
    await booking.save();

    // Araç durumunu güncelle
    const newCarStatus = damages && damages.length > 0 ? 'maintenance' : 'available';
    try {
      await axios.patch(
        `${process.env.CAR_SERVICE_URL || 'http://car-service:5002'}/api/cars/${booking.carId}/status`,
        { status: newCarStatus },
        {
          headers: { 'Authorization': req.headers.authorization }
        }
      );
    } catch (error) {
      logger.warn('Araç durumu güncellenirken hata:', error);
    }

    // İade bildirimini gönder
    try {
      await publisher.publish('vehicle_returned', {
        bookingId: booking._id,
        userId: booking.userId,
        bookingNumber: booking.bookingNumber,
        returnDatetime: booking.vehicleHandover.returnDetails.datetime,
        damages: damages || [],
        handledBy: req.user.email
      });
    } catch (error) {
      logger.warn('Bildirim mesajı gönderilemedi:', error);
    }

    logger.info(`Araç iade edildi: ${booking.bookingNumber}`);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({ booking }, 'Araç başarıyla iade edildi')
    );
  });

  /**
   * @desc    Araç müsaitlik kontrolü
   * @route   POST /api/bookings/check-availability
   * @access  Public
   */
  static checkAvailability = asyncHandler(async (req, res) => {
    const { carId, startDate, endDate } = req.body;

    const conflictingBooking = await Booking.checkCarAvailability(carId, startDate, endDate);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({
        available: !conflictingBooking,
        conflictingBooking: conflictingBooking ? {
          bookingNumber: conflictingBooking.bookingNumber,
          startDate: conflictingBooking.startDate,
          endDate: conflictingBooking.endDate
        } : null
      }, 'Müsaitlik kontrolü tamamlandı')
    );
  });

  /**
   * @desc    Rezervasyon istatistikleri
   * @route   GET /api/bookings/admin/stats
   * @access  Private (Admin only)
   */
  static getBookingStats = asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Genel istatistikler
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'active' });
    const monthlyBookings = await Booking.countDocuments({ 
      createdAt: { $gte: startOfMonth } 
    });

    // Durum bazlı istatistikler
    const statusStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    // Aylık gelir
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear },
          status: { $in: ['completed', 'active'] }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$pricing.totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({
        overview: {
          totalBookings,
          activeBookings,
          monthlyBookings
        },
        statusStats,
        monthlyRevenue
      }, 'Rezervasyon istatistikleri')
    );
  });
}

module.exports = BookingController;