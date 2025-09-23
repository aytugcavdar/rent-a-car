const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Kullanıcı ve Araç Referansları
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Kullanıcı ID gereklidir']
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Araç ID gereklidir']
  },
  
  // Rezervasyon Numarası
  bookingNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Tarih Bilgileri
  startDate: {
    type: Date,
    required: [true, 'Başlangıç tarihi gereklidir'],
    validate: {
      validator: function(date) {
        return date >= new Date();
      },
      message: 'Başlangıç tarihi bugünden önce olamaz'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'Bitiş tarihi gereklidir'],
    validate: {
      validator: function(date) {
        return date > this.startDate;
      },
      message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'
    }
  },
  
  // Saat Bilgileri
  pickupTime: {
    type: String,
    required: [true, 'Teslim alma saati gereklidir'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli saat formatı: HH:MM']
  },
  returnTime: {
    type: String,
    required: [true, 'İade saati gereklidir'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli saat formatı: HH:MM']
  },
  
  // Lokasyon Bilgileri
  pickupLocation: {
    branch: {
      type: String,
      required: [true, 'Teslim alma şubesi gereklidir']
    },
    address: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    }
  },
  
  returnLocation: {
    branch: {
      type: String,
      required: [true, 'İade şubesi gereklidir']
    },
    address: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number]
      }
    }
  },
  
  // Fiyatlandırma
  pricing: {
    dailyRate: {
      type: Number,
      required: [true, 'Günlük fiyat gereklidir'],
      min: [0, 'Fiyat negatif olamaz']
    },
    totalDays: {
      type: Number,
      required: [true, 'Toplam gün sayısı gereklidir'],
      min: [1, 'En az 1 gün olmalıdır']
    },
    subtotal: {
      type: Number,
      required: true
    },
    extras: [{
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 }
    }],
    extrasTotal: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: [true, 'Toplam tutar gereklidir']
    },
    currency: {
      type: String,
      default: 'TRY',
      enum: ['TRY', 'USD', 'EUR']
    }
  },
  
  // Ekstra Hizmetler
  extras: [{
    type: String,
    enum: [
      'gps_navigation',
      'child_seat',
      'additional_driver',
      'wifi_hotspot',
      'roof_rack',
      'ski_equipment',
      'full_insurance',
      'roadside_assistance'
    ]
  }],
  
  // Sürücü Bilgileri
  driverInfo: {
    primaryDriver: {
      name: String,
      surname: String,
      licenseNumber: String,
      licenseExpiry: Date
    },
    additionalDrivers: [{
      name: String,
      surname: String,
      licenseNumber: String,
      licenseExpiry: Date,
      relationToPrimary: String
    }]
  },
  
  // Rezervasyon Durumu
  status: {
    type: String,
    enum: [
      'pending',           // Beklemede
      'confirmed',         // Onaylandı
      'active',           // Aktif (araç teslim edildi)
      'completed',        // Tamamlandı
      'cancelled',        // İptal edildi
      'no_show',          // Gelmedi
      'expired'           // Süresi doldu
    ],
    default: 'pending'
  },
  
  // Ödeme Bilgileri
  paymentInfo: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'cash', 'bank_transfer'],
      required: [true, 'Ödeme yöntemi gereklidir']
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAmount: {
      type: Number,
      default: 0
    },
    paymentDate: Date,
    refundAmount: {
      type: Number,
      default: 0
    },
    refundDate: Date
  },
  
  // Araç Teslim/İade Bilgileri
  vehicleHandover: {
    pickupDetails: {
      datetime: Date,
      mileage: Number,
      fuelLevel: {
        type: Number,
        min: 0,
        max: 100
      },
      condition: String,
      images: [String],
      notes: String,
      handledBy: String // Personel adı
    },
    returnDetails: {
      datetime: Date,
      mileage: Number,
      fuelLevel: {
        type: Number,
        min: 0,
        max: 100
      },
      condition: String,
      images: [String],
      notes: String,
      handledBy: String,
      damages: [{
        type: String,
        description: String,
        severity: {
          type: String,
          enum: ['minor', 'moderate', 'major']
        },
        cost: Number
      }]
    }
  },
  
  // İptal Bilgileri
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: String,
      enum: ['customer', 'admin', 'system']
    },
    reason: String,
    refundAmount: Number,
    cancellationFee: Number
  },
  
  // Özel Notlar
  notes: {
    customerNotes: String,
    internalNotes: String
  },
  
  // İletişim Tercihleri
  notifications: {
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
bookingSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

bookingSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

bookingSchema.virtual('canBeCancelled').get(function() {
  const now = new Date();
  const startDate = new Date(this.startDate);
  const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);
  
  return ['pending', 'confirmed'].includes(this.status) && hoursUntilStart > 24;
});

// Indexes
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ carId: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

// Pre-save middleware
bookingSchema.pre('save', function(next) {
  // Rezervasyon numarası oluştur
  if (!this.bookingNumber) {
    const prefix = 'RC';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingNumber = `${prefix}${timestamp}${random}`;
  }
  
  // Fiyat hesaplamaları
  if (this.startDate && this.endDate && this.pricing.dailyRate) {
    const days = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
    this.pricing.totalDays = days;
    this.pricing.subtotal = this.pricing.dailyRate * days;
    
    // Ekstra hizmetler toplamı
    this.pricing.extrasTotal = this.pricing.extras.reduce((sum, extra) => {
      return sum + (extra.price * (extra.quantity || 1));
    }, 0);
    
    // Toplam tutar hesapla
    this.pricing.totalAmount = this.pricing.subtotal + 
                               this.pricing.extrasTotal + 
                               this.pricing.taxAmount - 
                               this.pricing.discountAmount;
  }
  
  next();
});

// Methods
bookingSchema.methods.cancel = function(reason, cancelledBy = 'customer') {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledAt: new Date(),
    cancelledBy,
    reason,
    cancellationFee: this.calculateCancellationFee(),
    refundAmount: this.calculateRefundAmount()
  };
  return this.save();
};

bookingSchema.methods.calculateCancellationFee = function() {
  const now = new Date();
  const startDate = new Date(this.startDate);
  const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);
  
  if (hoursUntilStart > 48) return 0;
  if (hoursUntilStart > 24) return this.pricing.totalAmount * 0.1;
  if (hoursUntilStart > 2) return this.pricing.totalAmount * 0.25;
  return this.pricing.totalAmount * 0.5;
};

bookingSchema.methods.calculateRefundAmount = function() {
  const cancellationFee = this.calculateCancellationFee();
  return Math.max(0, this.paymentInfo.paidAmount - cancellationFee);
};

// Static methods
bookingSchema.statics.findActiveBookings = function() {
  return this.find({
    status: 'active',
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });
};

bookingSchema.statics.findOverdueBookings = function() {
  return this.find({
    status: 'active',
    endDate: { $lt: new Date() }
  });
};

bookingSchema.statics.checkCarAvailability = function(carId, startDate, endDate, excludeBookingId = null) {
  const query = {
    carId: new mongoose.Types.ObjectId(carId),
    status: { $in: ['confirmed', 'active'] },
    $or: [
      {
        startDate: { $lte: new Date(startDate) },
        endDate: { $gte: new Date(startDate) }
      },
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(endDate) }
      },
      {
        startDate: { $gte: new Date(startDate) },
        endDate: { $lte: new Date(endDate) }
      }
    ]
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  return this.findOne(query);
};

module.exports = mongoose.model('Booking', bookingSchema);