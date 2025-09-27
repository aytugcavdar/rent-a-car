const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'TRY' },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  transactionId: { type: String }, // Ödeme ağ geçidinden gelen benzersiz ID
  paymentGateway: { type: String, default: 'Stripe' }, // Simülasyon için
  errorMessage: { type: String },
}, { timestamps: true });

paymentSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);