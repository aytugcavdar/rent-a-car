const mongoose = require('mongoose');

const { helpers } = require('@rent-a-car/shared-utils');
const { PasswordUtils } = helpers;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim alanı zorunludur.'],
    trim: true,
  },
  surname: {
    type: String,
    required: [true, 'Soyisim alanı zorunludur.'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'E-posta alanı zorunludur.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Lütfen geçerli bir e-posta adresi giriniz.',
    ],
  },
  password: {
    type: String,
    required: [true, 'Şifre alanı zorunludur.'],
    minLength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
  },
  // --- ÖNERİ 1: Alanları Gruplama ---
  driverLicense: {
    number: {
      type: String,
      required: [true, 'Ehliyet numarası zorunludur.'],
      unique: true,
      sparse: true, // `null` değerlerin unique kuralını ihlal etmesini engeller
    },
    issuedDate: {
      type: Date,
      required: [true, 'Ehliyet verilme tarihi zorunludur.'],
    },
    expirationDate: {
      type: Date,
      required: [true, 'Ehliyet geçerlilik tarihi zorunludur.'],
    },
  },
  phone: {
    type: String,
    required: [true, 'Telefon numarası zorunludur.'],
    match: [
      /^\+?[1-9]\d{1,14}$/,
      'Lütfen geçerli bir telefon numarası giriniz.',
    ],
  },
  address: {
    type: String,
    required: [true, 'Adres alanı zorunludur.'],
  },
  avatarUrl: {
    type: String,
    // --- ÖNERİ 4: Varsayılan Avatar ---
    default: function() {
      const fullName = `${this.name} ${this.surname}`.replace(/\s+/g, '+');
      return `https://ui-avatars.com/api/?name=${fullName}&background=random`;
    }
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lockUntil: {
    type: Date,
    select: false
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true }, // Virtual'ların JSON'a dahil edilmesini sağlar
  toObject: { virtuals: true }
});

// --- ÖNERİ 2: Sanal Alanlar (Virtuals) ---
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual('isLicenseExpired').get(function() {
  return !!(this.driverLicense.expirationDate && this.driverLicense.expirationDate < Date.now());
});


// --- ÖNERİ 3: Güvenlik için toJSON Transform ---
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  delete userObject.__v; // Mongoose'un eklediği versiyon anahtarını kaldır
  return userObject;
};
userSchema.virtual('fullName').get(function() {
  return `${this.name} ${this.surname}`;
});
// --- ÖNERİ 5: İndeksleme ---
userSchema.index({ 'driverLicense.number': 1 });

// Şifre hash'leme (Mevcut kodun)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await PasswordUtils.hash(this.password);
  next();
});

// Senin yazdığın harika login denemesi metodları
userSchema.methods.handleFailedLogin = async function() {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME_MS = 2 * 60 * 60 * 1000; // 2 saat

  if (this.isLocked) return; // Zaten kilitliyse bir şey yapma

  this.loginAttempts += 1;
  if (this.loginAttempts >= MAX_ATTEMPTS) {
    this.lockUntil = Date.now() + LOCK_TIME_MS;
  }
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};



module.exports = mongoose.model('User', userSchema);