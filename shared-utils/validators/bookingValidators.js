const Joi = require('joi');

class BookingValidators {
  static createBookingSchema = Joi.object({
    carId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Geçersiz araç ID formatı',
        'any.required': 'Araç seçimi zorunludur'
      }),

    startDate: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.min': 'Başlangıç tarihi bugünden önce olamaz',
        'any.required': 'Başlangıç tarihi zorunludur'
      }),

    endDate: Joi.date()
      .greater(Joi.ref('startDate'))
      .required()
      .messages({
        'date.greater': 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır',
        'any.required': 'Bitiş tarihi zorunludur'
      }),

    pickupTime: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': 'Geçerli saat formatı: HH:MM (örn: 14:30)',
        'any.required': 'Teslim alma saati zorunludur'
      }),

    returnTime: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': 'Geçerli saat formatı: HH:MM (örn: 14:30)',
        'any.required': 'İade saati zorunludur'
      }),

    pickupLocation: Joi.object({
      branch: Joi.string().required().messages({
        'any.required': 'Teslim alma şubesi zorunludur'
      }),
      address: Joi.string(),
      coordinates: Joi.object({
        type: Joi.string().valid('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2)
      })
    }).required(),

    returnLocation: Joi.object({
      branch: Joi.string().required().messages({
        'any.required': 'İade şubesi zorunludur'
      }),
      address: Joi.string(),
      coordinates: Joi.object({
        type: Joi.string().valid('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2)
      })
    }).required(),

    extras: Joi.array().items(
      Joi.string().valid(
        'gps_navigation',
        'child_seat',
        'additional_driver',
        'wifi_hotspot',
        'roof_rack',
        'ski_equipment',
        'full_insurance',
        'roadside_assistance'
      )
    ).default([]),

    pricing: Joi.object({
      extras: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        price: Joi.number().min(0).required(),
        quantity: Joi.number().integer().min(1).default(1)
      })).default([]),
      discountAmount: Joi.number().min(0).default(0),
      taxAmount: Joi.number().min(0).default(0)
    }),

    driverInfo: Joi.object({
      primaryDriver: Joi.object({
        name: Joi.string().required(),
        surname: Joi.string().required(),
        licenseNumber: Joi.string().required(),
        licenseExpiry: Joi.date().greater('now').required()
      }).required(),
      additionalDrivers: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        surname: Joi.string().required(),
        licenseNumber: Joi.string().required(),
        licenseExpiry: Joi.date().greater('now').required(),
        relationToPrimary: Joi.string()
      })).default([])
    }).required(),

    paymentInfo: Joi.object({
      method: Joi.string()
        .valid('credit_card', 'debit_card', 'cash', 'bank_transfer')
        .required()
        .messages({
          'any.only': 'Geçersiz ödeme yöntemi',
          'any.required': 'Ödeme yöntemi seçimi zorunludur'
        })
    }).required(),

    notes: Joi.object({
      customerNotes: Joi.string().max(1000).messages({
        'string.max': 'Müşteri notu en fazla 1000 karakter olabilir'
      })
    }),

    notifications: Joi.object({
      sms: Joi.boolean().default(true),
      email: Joi.boolean().default(true),
      whatsapp: Joi.boolean().default(false)
    })
  });

  static checkAvailabilitySchema = Joi.object({
    carId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Geçersiz araç ID formatı',
        'any.required': 'Araç ID zorunludur'
      }),

    startDate: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.min': 'Başlangıç tarihi bugünden önce olamaz',
        'any.required': 'Başlangıç tarihi zorunludur'
      }),

    endDate: Joi.date()
      .greater(Joi.ref('startDate'))
      .required()
      .messages({
        'date.greater': 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır',
        'any.required': 'Bitiş tarihi zorunludur'
      })
  });

  static updateStatusSchema = Joi.object({
    status: Joi.string()
      .valid('pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show', 'expired')
      .required()
      .messages({
        'any.only': 'Geçersiz rezervasyon durumu',
        'any.required': 'Durum bilgisi zorunludur'
      }),

    notes: Joi.string().max(1000).messages({
      'string.max': 'Not en fazla 1000 karakter olabilir'
    })
  });

  static cancelBookingSchema = Joi.object({
    reason: Joi.string()
      .max(500)
      .required()
      .messages({
        'string.max': 'İptal nedeni en fazla 500 karakter olabilir',
        'any.required': 'İptal nedeni zorunludur'
      })
  });

  static vehiclePickupSchema = Joi.object({
    mileage: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.min': 'Kilometre bilgisi negatif olamaz',
        'any.required': 'Kilometre bilgisi zorunludur'
      }),

    fuelLevel: Joi.number()
      .min(0)
      .max(100)
      .required()
      .messages({
        'number.min': 'Yakıt seviyesi 0-100 arasında olmalıdır',
        'number.max': 'Yakıt seviyesi 0-100 arasında olmalıdır',
        'any.required': 'Yakıt seviyesi zorunludur'
      }),

    condition: Joi.string()
      .max(1000)
      .required()
      .messages({
        'string.max': 'Araç durumu açıklaması en fazla 1000 karakter olabilir',
        'any.required': 'Araç durumu açıklaması zorunludur'
      }),

    notes: Joi.string().max(1000).messages({
      'string.max': 'Not en fazla 1000 karakter olabilir'
    }),

    images: Joi.array().items(Joi.string().uri()).default([])
  });

  static vehicleReturnSchema = Joi.object({
    mileage: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.min': 'Kilometre bilgisi negatif olamaz',
        'any.required': 'Kilometre bilgisi zorunludur'
      }),

    fuelLevel: Joi.number()
      .min(0)
      .max(100)
      .required()
      .messages({
        'number.min': 'Yakıt seviyesi 0-100 arasında olmalıdır',
        'number.max': 'Yakıt seviyesi 0-100 arasında olmalıdır',
        'any.required': 'Yakıt seviyesi zorunludur'
      }),

    condition: Joi.string()
      .max(1000)
      .required()
      .messages({
        'string.max': 'Araç durumu açıklaması en fazla 1000 karakter olabilir',
        'any.required': 'Araç durumu açıklaması zorunludur'
      }),

    notes: Joi.string().max(1000).messages({
      'string.max': 'Not en fazla 1000 karakter olabilir'
    }),

    images: Joi.array().items(Joi.string().uri()).default([]),

    damages: Joi.array().items(Joi.object({
      type: Joi.string().required().messages({
        'any.required': 'Hasar türü zorunludur'
      }),
      description: Joi.string().max(500).required().messages({
        'string.max': 'Hasar açıklaması en fazla 500 karakter olabilir',
        'any.required': 'Hasar açıklaması zorunludur'
      }),
      severity: Joi.string()
        .valid('minor', 'moderate', 'major')
        .required()
        .messages({
          'any.only': 'Hasar şiddeti: minor, moderate veya major olmalıdır',
          'any.required': 'Hasar şiddeti zorunludur'
        }),
      cost: Joi.number().min(0).messages({
        'number.min': 'Hasar maliyeti negatif olamaz'
      })
    })).default([])
  });
}

module.exports = BookingValidators;