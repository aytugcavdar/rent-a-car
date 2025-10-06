// shared-utils/validators/bookingValidators.js
const Joi = require('joi');

class BookingValidators {
  static createBookingSchema = {
    body: Joi.object({
      carId: Joi.string().required().messages({
        'string.empty': 'Araç ID gereklidir',
        'any.required': 'Araç ID gereklidir',
      }),
      startDate: Joi.date().iso().required().messages({
        'date.base': 'Geçerli bir alış tarihi giriniz',
        'any.required': 'Alış tarihi gereklidir',
      }),
      endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
        'date.base': 'Geçerli bir teslim tarihi giriniz',
        'date.greater': 'Teslim tarihi alış tarihinden sonra olmalıdır',
        'any.required': 'Teslim tarihi gereklidir',
      }),
      pickupLocation: Joi.object({
        branch: Joi.string().required().messages({
          'string.empty': 'Alış şubesi gereklidir',
          'any.required': 'Alış şubesi gereklidir',
        }),
        address: Joi.string().optional().allow(''),
      }).required(),
      returnLocation: Joi.object({
        branch: Joi.string().required().messages({
          'string.empty': 'Teslim şubesi gereklidir',
          'any.required': 'Teslim şubesi gereklidir',
        }),
        address: Joi.string().optional().allow(''),
      }).required(),
      paymentInfo: Joi.object({
        method: Joi.string().valid('credit_card', 'debit_card', 'cash', 'bank_transfer').required().messages({
          'string.empty': 'Ödeme yöntemi gereklidir',
          'any.required': 'Ödeme yöntemi gereklidir',
          'any.only': 'Geçersiz ödeme yöntemi',
        }),
      }).required(),
      notes: Joi.string().optional().allow(''),
    }),
  };

  static updateBookingStatusSchema = {
    body: Joi.object({
      status: Joi.string()
        .valid('pending', 'confirmed', 'active', 'completed', 'cancelled')
        .required()
        .messages({
          'string.empty': 'Durum gereklidir',
          'any.required': 'Durum gereklidir',
          'any.only': 'Geçersiz durum değeri',
        }),
    }),
  };
}

module.exports = BookingValidators;