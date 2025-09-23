const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  // Temel bilgiler
  brand: {
    type: String,
    required: [true, 'Araç markası zorunludur'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Araç modeli zorunludur'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Model yılı zorunludur'],
    min: [1990, 'Model yılı 1990 ve üzeri olmalıdır'],
    max: [new Date().getFullYear() + 1, 'Geçersiz model yılı']
  },
  plateNumber: {
    type: String,
    required: [true, 'Plaka numarası zorunludur'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^(0[1-9]|[1-7][0-9]|8[01])[A-Z]{2,3}\d{2,4}$/, 'Geçerli bir Türkiye plakası giriniz']
  },
  
  // Araç özellikleri
  category: {
    type: String,
    enum: ['economy', 'compact', 'intermediate', 'standard', 'premium', 'luxury', 'suv', 'minivan'],
    required: [true, 'Araç kategorisi zorunludur']
  },
  fuelType: {
    type: String,
    enum: ['gasoline', 'diesel', 'hybrid', 'electric'],
    required: [true, 'Yakıt türü zorunludur']
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    required: [true, 'Vites türü zorunludur']
  },
  seats: {
    type: Number,
    required: [true, 'Koltuk sayısı zorunludur'],
    min: [2, 'En az 2 koltuk olmalıdır'],
    max: [9, 'En fazla 9 koltuk olabilir']
  },
  doors: {
    type: Number,
    required: [true, 'Kapı sayısı zorunludur'],
    enum: [2, 3, 4, 5]
  },
  
  // Fiyatlandırma
  pricePerDay: {
    type: Number,
    required: [true, 'Günlük fiyat zorunludur'],
    min: [0, 'Fiyat negatif olamaz']
  },
  currency: {
    type: String,
    default: 'TRY',
    enum: ['TRY', 'USD', 'EUR']
  },
  
  // Durum bilgileri
  status: {
    type: String,
    enum: ['available', 'rented', 'maintenance', 'out_of_service'],
    default: 'available'
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'excellent'
  },
  mileage: {
    type: Number,
    required: [true, 'Kilometre bilgisi zorunludur'],
    min: [0, 'Kilometre negatif olamaz']
  },
  
  // Ek özellikler
  features: [{
    type: String,
    enum: [
      'air_conditioning', 'gps', 'bluetooth', 'usb_port', 'aux_input',
      'cd_player', 'mp3_player', 'cruise_control', 'parking_sensors',
      'backup_camera', 'sunroof', 'leather_seats', 'heated_seats',
      'child_safety_locks', 'airbags', 'abs', 'power_steering',
      'power_windows', 'remote_locking'
    ]
  }],
  
  // Resimler
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Konum bilgisi
  location: {
    branch: {
      type: String,
      required: [true, 'Şube bilgisi zorunludur']
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
  
  // Bakım geçmişi
  maintenanceHistory: [{
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['routine', 'repair', 'inspection', 'cleaning'],
      required: true
    },
    description: String,
    cost: Number,
    mileageAtMaintenance: Number
  }],
  
  // Sigorta bilgileri
  insurance: {
    company: String,
    policyNumber: String,
    expiryDate: Date,
    coverage: {
      type: String,
      enum: ['basic', 'comprehensive', 'full'],
      default: 'comprehensive'
    }
  },
  
  // Meta bilgiler
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
carSchema.virtual('displayName').get(function() {
  return `${this.brand} ${this.model} (${this.year})`;
});

carSchema.virtual('isAvailable').get(function() {
  return this.status === 'available' && this.isActive;
});

carSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : null);
});

// Indexes
carSchema.index({ plateNumber: 1 });
carSchema.index({ status: 1, isActive: 1 });
carSchema.index({ category: 1, pricePerDay: 1 });
carSchema.index({ 'location.coordinates': '2dsphere' });
carSchema.index({ brand: 1, model: 1 });

// Methods
carSchema.methods.addMaintenanceRecord = function(record) {
  this.maintenanceHistory.push({
    ...record,
    date: new Date()
  });
  return this.save();
};

carSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Statics
carSchema.statics.findAvailable = function(filters = {}) {
  return this.find({
    status: 'available',
    isActive: true,
    ...filters
  });
};

carSchema.statics.findByCategory = function(category) {
  return this.find({
    category,
    status: 'available',
    isActive: true
  }).sort({ pricePerDay: 1 });
};

module.exports = mongoose.model('Car', carSchema);