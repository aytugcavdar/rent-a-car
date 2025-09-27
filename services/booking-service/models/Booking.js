const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  carId: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  currency: { type: String, default: 'TRY' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },
  pickupLocation: {
    branch: { type: String, required: true },
    address: String,
  },
  returnLocation: {
    branch: { type: String, required: true },
    address: String,
  },
  paymentInfo: {
    method: { type: String, required: true },
    transactionId: String, // Ödeme servisinden dönecek ID
    status: { type: String, default: 'pending' }
  },
  notes: String,
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
    }
  }
});

bookingSchema.index({ userId: 1 });
bookingSchema.index({ carId: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);