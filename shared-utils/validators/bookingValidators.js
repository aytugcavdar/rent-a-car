const Joi = require('joi');

class BookingValidators {
  // Yeni bir rezervasyon oluştururken kullanılacak doğrulama şeması
  static createBookingSchema = Joi.object({
    carId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/) // MongoDB'nin ObjectId formatına uygun olmalı
      .required()
      .messages({
        'string.pattern.base': 'Geçersiz araç ID formatı.',
        'any.required': 'Araç seçimi zorunludur.'
      }),

    startDate: Joi.date()
      .min('now') // Başlangıç tarihi bugünden önce olamaz
      .required()
      .messages({
        'date.min': 'Başlangıç tarihi bugünden önce olamaz.',
        'any.required': 'Başlangıç tarihi zorunludur.'
      }),

    endDate: Joi.date()
      .greater(Joi.ref('startDate')) // Bitiş tarihi, başlangıç tarihinden sonra olmalı
      .required()
      .messages({
        'date.greater': 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır.',
        'any.required': 'Bitiş tarihi zorunludur.'
      }),
      
    pickupLocation: Joi.object({
      branch: Joi.string().required().messages({
        'any.required': 'Teslim alma şubesi zorunludur.'
      }),
      address: Joi.string(),
    }).required(),

    returnLocation: Joi.object({
      branch: Joi.string().required().messages({
        'any.required': 'İade şubesi zorunludur.'
      }),
      address: Joi.string(),
    }).required(),
    
    paymentInfo: Joi.object({
      method: Joi.string()
        .valid('credit_card', 'debit_card', 'cash', 'bank_transfer')
        .required()
        .messages({
          'any.only': 'Geçersiz ödeme yöntemi.',
          'any.required': 'Ödeme yöntemi seçimi zorunludur.'
        })
    }).required(),

    notes: Joi.string().max(1000).optional().messages({
      'string.max': 'Not en fazla 1000 karakter olabilir.'
    })
  });

  // Diğer doğrulama şemaları (güncelleme, iptal etme vb.) buraya eklenebilir
  // static updateStatusSchema = Joi.object({ ... });
}

module.exports = BookingValidators;