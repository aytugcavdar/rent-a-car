const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  brand: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  plateNumber: { type: String, required: true, unique: true, trim: true },
  category: {
    type: String,
    enum: ['economy', 'compact', 'intermediate', 'standard', 'premium', 'luxury', 'suv', 'minivan'],
    required: true,
  },
  fuelType: {
    type: String,
    enum: ['gasoline', 'diesel', 'hybrid', 'electric'],
    required: true,
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    required: true,
  },
  seats: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  currency: { type: String, default: 'TRY' },
  status: {
    type: String,
    enum: ['available', 'rented', 'maintenance', 'out_of_service'],
    default: 'available',
  },
  mileage: { type: Number, required: true },
  features: [String],
  images: [{ type: String }], // Cloudinary'den gelen URL'ler
  location: {
    branch: { type: String, required: true },
    address: String,
  },
  insurance: {
    company: String,
    policyNumber: String,
    expiryDate: Date,
  },
  isActive: { type: Boolean, default: true }, // Aracın sistemde aktif olup olmadığını belirtir
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
    }
  }
});

carSchema.index({ plateNumber: 1 });
carSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('Car', carSchema);