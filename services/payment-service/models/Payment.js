const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Referanslar
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Kullanıcı ID gereklidir']
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Rezervasyon ID gereklidir']
  },
  
  // Ödeme Bilgileri
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  paymentIntentId: {
    type: String, // Stripe, PayPal vb. için
    sparse: true
  },
  
  // Tutar Bilgileri
  amount: {
    type: Number,
    required: [true, 'Ödeme tutarı gereklidir'],
    min: [0, 'Ödeme tutarı negatif olamaz']
  },
  currency: {
    type: String,
    default: 'TRY',
    enum: ['TRY', 'USD', 'EUR']
  },
  
  // Ödeme Yöntemi
  paymentMethod: {
    type: {
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'digital_wallet'],
      required: [true, 'Ödeme yöntemi gereklidir']
    },
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'iyzico', 'garanti', 'yapı_kredi', 'akbank', 'cash']
    },
    details: {
      // Kart bilgileri (hassas bilgiler hash'lenir)
      cardLast4: String,
      cardBrand: String, // visa, mastercard, amex
      cardExpMonth: Number,
      cardExpYear: Number,
      
      // Banka transferi için
      bankName: String,
      accountNumber: String, // Hash'lenir
      
      // Dijital cüzdan için
      walletType: String, // apple_pay, google_pay, samsung_pay
      walletId: String
    }
  },
  
  // Ödeme Durumu
  status: {
    type: String,
    enum: [
      'pending',           // Beklemede
      'processing',        // İşleniyor
      'completed',         // Tamamlandı
      'failed',           // Başarısız
      'cancelled',        // İptal edildi
      'refunded',         // İade edildi
      'partially_refunded' // Kısmi iade
    ],
    default: 'pending'
  },
  
  // İşlem Türü
  transactionType: {
    type: String,
    enum: ['payment', 'refund', 'partial_refund', 'chargeback'],
    default: 'payment'
  },
  
  // Zaman Bilgileri
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  
  // Hata Bilgileri
  errorInfo: {
    code: String,
    message: String,
    details: mongoose.Schema.Types.Mixed
  },
  
  // İade Bilgileri
  refundInfo: {
    refundAmount: {
      type: Number,
      min: 0
    },
    refundReason: String,
    refundedAt: Date,
    refundTransactionId: String,
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Güvenlik ve Doğrulama
  securityInfo: {
    ipAddress: String,
    userAgent: String,
    fraudScore: Number, // 0-100 arası risk skoru
    is3DSecureVerified: Boolean,
    cvvVerified: Boolean,
    avsVerified: Boolean // Address Verification System
  },
  
  // Faturalama Adresi
  billingAddress: {
    firstName: String,
    lastName: String,
    company: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  
  // Ödeme Sağlayıcısı Yanıtları
  providerResponse: {
    raw: mongoose.Schema.Types.Mixed, // Tam API yanıtı
    authorizationCode: String,
    referenceNumber: String,
    batchNumber: String
  },
  
  // Webhook Bilgileri
  webhookEvents: [{
    eventType: String,
    receivedAt: Date,
    processed: Boolean,
    data: mongoose.Schema.Types.Mixed
  }],
  
  // Notlar
  notes: {
    internal: String, // Admin notları
    customer: String  // Müşteri notları
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
paymentSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

paymentSchema.virtual('canBeRefunded').get(function() {
  return this.status === 'completed' && 
         (!this.refundInfo.refundAmount || this.refundInfo.refundAmount < this.amount);
});

paymentSchema.virtual('remainingRefundAmount').get(function() {
  if (!this.isCompleted) return 0;
  return this.amount - (this.refundInfo.refundAmount || 0);
});

// Indexes
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ paymentIntentId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ 'paymentMethod.type': 1 });

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Transaction ID oluştur
  if (!this.transactionId) {
    const prefix = 'PAY';
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.transactionId = `${prefix}_${timestamp}_${random}`;
  }
  
  // Durum değişikliklerinde zaman damgalarını güncelle
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'processing':
        if (!this.processedAt) this.processedAt = now;
        break;
      case 'completed':
        if (!this.completedAt) this.completedAt = now;
        break;
      case 'failed':
        if (!this.failedAt) this.failedAt = now;
        break;
    }
  }
  
  next();
});

// Methods
paymentSchema.methods.markAsCompleted = function(providerResponse = {}) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.providerResponse = { ...this.providerResponse, ...providerResponse };
  return this.save();
};

paymentSchema.methods.markAsFailed = function(errorInfo) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.errorInfo = errorInfo;
  return this.save();
};

paymentSchema.methods.processRefund = function(refundAmount, reason, refundedBy) {
  if (!this.canBeRefunded) {
    throw new Error('Bu ödeme iade edilemez');
  }
  
  if (refundAmount > this.remainingRefundAmount) {
    throw new Error('İade tutarı kalan tutardan fazla olamaz');
  }
  
  const isFullRefund = refundAmount === this.remainingRefundAmount;
  
  this.refundInfo = {
    refundAmount: (this.refundInfo.refundAmount || 0) + refundAmount,
    refundReason: reason,
    refundedAt: new Date(),
    refundedBy
  };
  
  this.status = isFullRefund ? 'refunded' : 'partially_refunded';
  
  return this.save();
};

paymentSchema.methods.addWebhookEvent = function(eventType, data) {
  this.webhookEvents.push({
    eventType,
    receivedAt: new Date(),
    processed: false,
    data
  });
  return this.save();
};

// Static methods
paymentSchema.statics.findByBooking = function(bookingId) {
  return this.find({ bookingId }).sort({ createdAt: -1 });
};

paymentSchema.statics.findPendingPayments = function() {
  return this.find({
    status: 'pending',
    createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) } // 30 dakikadan eski
  });
};

paymentSchema.statics.getPaymentStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);
};

// Hassas bilgileri JSON'dan çıkar
paymentSchema.methods.toJSON = function() {
  const paymentObject = this.toObject();
  
  // Hassas bilgileri kaldır
  if (paymentObject.paymentMethod && paymentObject.paymentMethod.details) {
    delete paymentObject.paymentMethod.details.accountNumber;
    delete paymentObject.paymentMethod.details.walletId;
  }
  delete paymentObject.providerResponse.raw;
  delete paymentObject.securityInfo.ipAddress;
  delete paymentObject.securityInfo.userAgent;
  
  return paymentObject;
};

module.exports = mongoose.model('Payment', paymentSchema);