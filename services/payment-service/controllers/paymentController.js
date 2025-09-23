const Payment = require('../models/Payment');
const PaymentGateway = require('../services/paymentGateway');
const axios = require('axios');

const {
  middleware: { asyncHandler },
  helpers: { ResponseFormatter },
  constants: { httpStatus },
  logger,
  rabbitmq: { publisher }
} = require('@rent-a-car/shared-utils');

class PaymentController {
  /**
   * @desc    Ödeme işlemi başlat
   * @route   POST /api/payments
   * @access  Private
   */
  static createPayment = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const {
      bookingId,
      amount,
      currency = 'TRY',
      paymentMethod,
      billingAddress,
      saveCard = false,
      useStoredCard = false,
      storedCardId = null
    } = req.body;

    // 1. Rezervasyon kontrolü
    try {
      const bookingResponse = await axios.get(
        `${process.env.BOOKING_SERVICE_URL || 'http://booking-service:5003'}/api/bookings/${bookingId}`,
        {
          headers: { 'Authorization': req.headers.authorization }
        }
      );
      
      const booking = bookingResponse.data.data.booking;
      if (!booking || booking.userId !== userId) {
        return res.status(httpStatus.FORBIDDEN).json(
          ResponseFormatter.error('Bu rezervasyona ödeme yapma yetkiniz yok', httpStatus.FORBIDDEN)
        );
      }

      if (booking.paymentInfo.status === 'paid') {
        return res.status(httpStatus.BAD_REQUEST).json(
          ResponseFormatter.error('Bu rezervasyon zaten ödenmiş', httpStatus.BAD_REQUEST)
        );
      }

    } catch (error) {
      logger.error('Rezervasyon bilgileri alınırken hata:', error);
      return res.status(httpStatus.SERVICE_UNAVAILABLE).json(
        ResponseFormatter.error('Rezervasyon bilgileri alınamadı', httpStatus.SERVICE_UNAVAILABLE)
      );
    }

    // 2. Güvenlik bilgilerini topla
    const securityInfo = {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      fraudScore: 0 // Basit fraud detection implementasyonu
    };

    // 3. Ödeme kaydını oluştur
    const payment = await Payment.create({
      userId,
      bookingId,
      amount,
      currency,
      paymentMethod: {
        type: paymentMethod.type,
        provider: paymentMethod.provider
      },
      billingAddress,
      securityInfo,
      status: 'processing'
    });

    try {
      // 4. Ödeme gateway'i ile işlem yap
      let paymentResult;
      
      if (paymentMethod.type === 'cash') {
        // Nakit ödeme - sadece kayıt tut
        paymentResult = {
          success: true,
          transactionId: payment.transactionId,
          status: 'pending' // Admin onayı bekleyecek
        };
      } else {
        // Kart/dijital ödeme
        paymentResult = await PaymentGateway.processPayment({
          amount,
          currency,
          paymentMethod,
          billingAddress,
          transactionId: payment.transactionId,
          useStoredCard,
          storedCardId,
          saveCard,
          userId
        });
      }

      // 5. Sonuca göre ödeme durumunu güncelle
      if (paymentResult.success) {
        if (paymentMethod.type === 'cash') {
          payment.status = 'pending';
        } else {
          await payment.markAsCompleted(paymentResult.providerResponse);
          
          // Rezervasyon ödeme durumunu güncelle
          try {
            await axios.patch(
              `${process.env.BOOKING_SERVICE_URL || 'http://booking-service:5003'}/api/bookings/${bookingId}/payment`,
              {
                status: 'paid',
                transactionId: payment.transactionId,
                paymentDate: new Date()
              },
              {
                headers: { 'Authorization': req.headers.authorization }
              }
            );
          } catch (error) {
            logger.warn('Rezervasyon ödeme durumu güncellenirken hata:', error);
          }
        }

        // Ödeme bildirimi gönder
        try {
          await publisher.publish('payment_processed', {
            paymentId: payment._id,
            userId: payment.userId,
            bookingId: payment.bookingId,
            amount: payment.amount,
            status: payment.status,
            transactionId: payment.transactionId
          });
        } catch (error) {
          logger.warn('Ödeme bildirimi gönderilemedi:', error);
        }

        logger.info(`Ödeme işlendi: ${payment.transactionId} - ${amount} ${currency}`);

        res.status(httpStatus.CREATED).json(
          ResponseFormatter.success({
            payment: {
              transactionId: payment.transactionId,
              amount: payment.amount,
              currency: payment.currency,
              status: payment.status,
              paymentMethod: payment.paymentMethod.type,
              createdAt: payment.createdAt
            }
          }, 'Ödeme başarıyla işlendi', httpStatus.CREATED)
        );

      } else {
        await payment.markAsFailed({
          code: paymentResult.errorCode,
          message: paymentResult.errorMessage,
          details: paymentResult.details
        });

        res.status(httpStatus.BAD_REQUEST).json(
          ResponseFormatter.error(
            paymentResult.errorMessage || 'Ödeme işlemi başarısız',
            httpStatus.BAD_REQUEST
          )
        );
      }

    } catch (error) {
      logger.error('Ödeme işlemi sırasında hata:', error);
      
      await payment.markAsFailed({
        code: 'PROCESSING_ERROR',
        message: 'Ödeme işlemi sırasında teknik hata oluştu',
        details: error.message
      });

      res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
        ResponseFormatter.error(
          'Ödeme işlemi sırasında hata oluştu',
          httpStatus.INTERNAL_SERVER_ERROR
        )
      );
    }
  });

  /**
   * @desc    Kullanıcının ödemelerini listele
   * @route   GET /api/payments
   * @access  Private
   */
  static getUserPayments = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      status,
      bookingId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = { userId: req.user.id };
    if (status) filters.status = status;
    if (bookingId) filters.bookingId = bookingId;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const payments = await Payment.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('bookingId', 'bookingNumber startDate endDate status');

    const totalPayments = await Payment.countDocuments(filters);
    const totalPages = Math.ceil(totalPayments / Number(limit));

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({
        payments,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalPayments,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }, 'Ödemeler listelendi')
    );
  });

  /**
   * @desc    Ödeme detayını getir
   * @route   GET /api/payments/:id
   * @access  Private
   */
  static getPaymentById = asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id)
      .populate('userId', 'name surname email')
      .populate('bookingId', 'bookingNumber startDate endDate totalAmount');

    if (!payment) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Ödeme bulunamadı', httpStatus.NOT_FOUND)
      );
    }

    // Kullanıcı sadece kendi ödemelerini görebilir
    if (req.user.role !== 'admin' && payment.userId._id.toString() !== req.user.id) {
      return res.status(httpStatus.FORBIDDEN).json(
        ResponseFormatter.error('Bu ödemeye erişim yetkiniz yok', httpStatus.FORBIDDEN)
      );
    }

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({ payment }, 'Ödeme detayları')
    );
  });

  /**
   * @desc    Ödeme iade et
   * @route   POST /api/payments/:id/refund
   * @access  Private (Admin only)
   */
  static refundPayment = asyncHandler(async (req, res) => {
    const { refundAmount, reason, isFullRefund = false } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Ödeme bulunamadı', httpStatus.NOT_FOUND)
      );
    }

    if (!payment.canBeRefunded) {
      return res.status(httpStatus.BAD_REQUEST).json(
        ResponseFormatter.error('Bu ödeme iade edilemez', httpStatus.BAD_REQUEST)
      );
    }

    const finalRefundAmount = isFullRefund ? payment.remainingRefundAmount : refundAmount;

    try {
      // Payment gateway üzerinden iade işlemi
      let refundResult;
      
      if (payment.paymentMethod.type === 'cash') {
        // Nakit ödemeler için sadece kayıt
        refundResult = { success: true };
      } else {
        refundResult = await PaymentGateway.processRefund({
          originalTransactionId: payment.transactionId,
          refundAmount: finalRefundAmount,
          currency: payment.currency,
          reason
        });
      }

      if (refundResult.success) {
        await payment.processRefund(finalRefundAmount, reason, req.user.id);

        // İade bildirimi gönder
        try {
          await publisher.publish('payment_refunded', {
            paymentId: payment._id,
            userId: payment.userId,
            bookingId: payment.bookingId,
            refundAmount: finalRefundAmount,
            reason,
            refundedBy: req.user.email
          });
        } catch (error) {
          logger.warn('İade bildirimi gönderilemedi:', error);
        }

        logger.info(`Ödeme iade edildi: ${payment.transactionId} - ${finalRefundAmount} ${payment.currency}`);

        res.status(httpStatus.OK).json(
          ResponseFormatter.success({ payment }, 'Ödeme başarıyla iade edildi')
        );
      } else {
        res.status(httpStatus.BAD_REQUEST).json(
          ResponseFormatter.error('İade işlemi başarısız', httpStatus.BAD_REQUEST)
        );
      }

    } catch (error) {
      logger.error('İade işlemi sırasında hata:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
        ResponseFormatter.error('İade işlemi sırasında hata oluştu', httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  });

  /**
   * @desc    Webhook handler
   * @route   POST /api/payments/webhook/:provider
   * @access  Public (但有signature验证)
   */
  static handleWebhook = asyncHandler(async (req, res) => {
    const { provider } = req.params;
    const signature = req.get('X-Signature') || req.get('Stripe-Signature');

    try {
      // Webhook signature doğrulama
      const isValidSignature = await PaymentGateway.verifyWebhookSignature(
        provider,
        req.body,
        signature
      );

      if (!isValidSignature) {
        return res.status(httpStatus.UNAUTHORIZED).json(
          ResponseFormatter.error('Geçersiz webhook signature', httpStatus.UNAUTHORIZED)
        );
      }

      // Webhook event işleme
      const eventData = await PaymentGateway.processWebhookEvent(provider, req.body);
      
      if (eventData.transactionId) {
        const payment = await Payment.findOne({ 
          $or: [
            { transactionId: eventData.transactionId },
            { paymentIntentId: eventData.paymentIntentId }
          ]
        });

        if (payment) {
          await payment.addWebhookEvent(eventData.eventType, eventData.data);
          
          // Duruma göre ödeme status güncelle
          if (eventData.eventType === 'payment.completed') {
            await payment.markAsCompleted(eventData.providerResponse);
          } else if (eventData.eventType === 'payment.failed') {
            await payment.markAsFailed(eventData.errorInfo);
          }

          logger.info(`Webhook işlendi: ${eventData.eventType} - ${payment.transactionId}`);
        }
      }

      res.status(httpStatus.OK).json({ received: true });

    } catch (error) {
      logger.error('Webhook işleme hatası:', error);
      res.status(httpStatus.BAD_REQUEST).json(
        ResponseFormatter.error('Webhook işlenemedi', httpStatus.BAD_REQUEST)
      );
    }
  });

  /**
   * @desc    Ödeme istatistikleri
   * @route   GET /api/payments/admin/stats
   * @access  Private (Admin only)
   */
  static getPaymentStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Genel istatistikler
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });

    // Durum bazlı istatistikler
    const statusStats = await Payment.getPaymentStats(start, end);

    // Ödeme yöntemi istatistikleri
    const methodStats = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$paymentMethod.type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    // Günlük gelir trendi
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({
        overview: {
          totalPayments,
          completedPayments,
          pendingPayments,
          completionRate: totalPayments > 0 ? (completedPayments / totalPayments * 100).toFixed(2) : 0
        },
        statusStats,
        methodStats,
        dailyRevenue
      }, 'Ödeme istatistikleri')
    );
  });

  /**
   * @desc    Bekleyen ödemeleri onaylama (Nakit ödemeler için)
   * @route   PATCH /api/payments/:id/confirm
   * @access  Private (Admin only)
   */
  static confirmCashPayment = asyncHandler(async (req, res) => {
    const { notes } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Ödeme bulunamadı', httpStatus.NOT_FOUND)
      );
    }

    if (payment.paymentMethod.type !== 'cash' || payment.status !== 'pending') {
      return res.status(httpStatus.BAD_REQUEST).json(
        ResponseFormatter.error('Bu ödeme onaylanamaz', httpStatus.BAD_REQUEST)
      );
    }

    await payment.markAsCompleted({
      confirmedBy: req.user.email,
      confirmedAt: new Date(),
      notes
    });

    // Rezervasyon ödeme durumunu güncelle
    try {
      await axios.patch(
        `${process.env.BOOKING_SERVICE_URL || 'http://booking-service:5003'}/api/bookings/${payment.bookingId}/payment`,
        {
          status: 'paid',
          transactionId: payment.transactionId,
          paymentDate: new Date()
        },
        {
          headers: { 'Authorization': req.headers.authorization }
        }
      );
    } catch (error) {
      logger.warn('Rezervasyon ödeme durumu güncellenirken hata:', error);
    }

    logger.info(`Nakit ödeme onaylandı: ${payment.transactionId}`);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({ payment }, 'Nakit ödeme başarıyla onaylandı')
    );
  });
}

module.exports = PaymentController;