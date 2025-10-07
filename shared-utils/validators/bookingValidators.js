const Joi = require('joi');

class BookingValidators {
  static createBookingSchema = {
    body: Joi.object({
      carId: Joi.string().length(24).hex().required().messages({
        'string.empty': 'Araç ID gereklidir',
        'string.length': 'Geçersiz araç ID formatı',
        'string.hex': 'Geçersiz araç ID formatı',
        'any.required': 'Araç ID gereklidir',
      }),
      startDate: Joi.date().iso().greater('now').required().messages({
        'date.base': 'Geçerli bir alış tarihi giriniz',
        'date.greater': 'Alış tarihi gelecekte olmalıdır',
        'any.required': 'Alış tarihi gereklidir',
      }),
      endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
        'date.base': 'Geçerli bir teslim tarihi giriniz',
        'date.greater': 'Teslim tarihi alış tarihinden sonra olmalıdır',
        'any.required': 'Teslim tarihi gereklidir',
      }),
      pickupLocation: Joi.object({
        branch: Joi.string().min(3).max(100).required().messages({
          'string.empty': 'Alış şubesi gereklidir',
          'string.min': 'Şube adı en az 3 karakter olmalıdır',
          'string.max': 'Şube adı en fazla 100 karakter olmalıdır',
          'any.required': 'Alış şubesi gereklidir',
        }),
        address: Joi.string().max(200).optional().allow(''),
      }).required(),
      returnLocation: Joi.object({
        branch: Joi.string().min(3).max(100).required().messages({
          'string.empty': 'Teslim şubesi gereklidir',
          'string.min': 'Şube adı en az 3 karakter olmalıdır',
          'string.max': 'Şube adı en fazla 100 karakter olmalıdır',
          'any.required': 'Teslim şubesi gereklidir',
        }),
        address: Joi.string().max(200).optional().allow(''),
      }).required(),
      paymentInfo: Joi.object({
        method: Joi.string()
          .valid('credit_card', 'debit_card', 'cash', 'bank_transfer')
          .required()
          .messages({
            'string.empty': 'Ödeme yöntemi gereklidir',
            'any.required': 'Ödeme yöntemi gereklidir',
            'any.only': 'Geçersiz ödeme yöntemi',
          }),
      }).required(),
      notes: Joi.string().max(500).optional().allow(''),
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

  static getBookingsQuerySchema = {
    query: Joi.object({
      status: Joi.string()
        .valid('pending', 'confirmed', 'active', 'completed', 'cancelled')
        .optional(),
      page: Joi.number().integer().min(1).default(1).optional(),
      limit: Joi.number().integer().min(1).max(100).default(10).optional(),
      sortBy: Joi.string()
        .valid('createdAt', 'startDate', 'endDate', 'totalPrice')
        .default('createdAt')
        .optional(),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc').optional(),
    }),
  };
}

module.exports = BookingValidators;