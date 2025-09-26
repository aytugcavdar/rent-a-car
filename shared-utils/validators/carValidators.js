const Joi = require('joi');

class CarValidators {
  static createCarSchema = Joi.object({
    brand: Joi.string().min(2).max(50).required().messages({
      'string.base': 'Marka metin formatında olmalıdır.',
      'string.empty': 'Marka alanı boş bırakılamaz.',
      'string.min': 'Marka en az 2 karakter olmalıdır.',
      'string.max': 'Marka en fazla 50 karakter olabilir.',
      'any.required': 'Marka alanı zorunludur.'
    }),
    
    model: Joi.string().min(1).max(50).required().messages({
      'string.base': 'Model metin formatında olmalıdır.',
      'string.empty': 'Model alanı boş bırakılamaz.',
      'string.max': 'Model en fazla 50 karakter olabilir.',
      'any.required': 'Model alanı zorunludur.'
    }),
    
    year: Joi.number()
      .integer()
      .min(1990)
      .max(new Date().getFullYear() + 1)
      .required()
      .messages({
        'number.base': 'Model yılı sayı formatında olmalıdır.',
        'number.integer': 'Model yılı tam sayı olmalıdır.',
        'number.min': 'Model yılı 1990 ve üzeri olmalıdır.',
        'number.max': 'Geçersiz model yılı.',
        'any.required': 'Model yılı zorunludur.'
      }),
    
    plateNumber: Joi.string()
      .pattern(/^(0[1-9]|[1-7][0-9]|8[01])[A-Z]{2,3}\d{2,4}$/)
      .required()
      .messages({
        'string.pattern.base': 'Geçerli bir Türkiye plakası giriniz (örn: 34ABC123).',
        'any.required': 'Plaka numarası zorunludur.'
      }),
    
    category: Joi.string()
      .valid('economy', 'compact', 'intermediate', 'standard', 'premium', 'luxury', 'suv', 'minivan')
      .required()
      .messages({
        'any.only': 'Geçersiz kategori seçimi.',
        'any.required': 'Kategori seçimi zorunludur.'
      }),
    
    fuelType: Joi.string()
      .valid('gasoline', 'diesel', 'hybrid', 'electric')
      .required()
      .messages({
        'any.only': 'Geçersiz yakıt türü.',
        'any.required': 'Yakıt türü zorunludur.'
      }),
    
    transmission: Joi.string()
      .valid('manual', 'automatic')
      .required()
      .messages({
        'any.only': 'Vites türü manual veya automatic olmalıdır.',
        'any.required': 'Vites türü zorunludur.'
      }),
    
    seats: Joi.number()
      .integer()
      .min(2)
      .max(9)
      .required()
      .messages({
        'number.base': 'Koltuk sayısı sayı formatında olmalıdır.',
        'number.integer': 'Koltuk sayısı tam sayı olmalıdır.',
        'number.min': 'En az 2 koltuk olmalıdır.',
        'number.max': 'En fazla 9 koltuk olabilir.',
        'any.required': 'Koltuk sayısı zorunludur.'
      }),
    
    doors: Joi.number()
      .integer()
      .valid(2, 3, 4, 5)
      .required()
      .messages({
        'any.only': 'Kapı sayısı 2, 3, 4 veya 5 olmalıdır.',
        'any.required': 'Kapı sayısı zorunludur.'
      }),
    
    pricePerDay: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.base': 'Günlük fiyat sayı formatında olmalıdır.',
        'number.positive': 'Fiyat pozitif bir sayı olmalıdır.',
        'any.required': 'Günlük fiyat zorunludur.'
      }),
    
    currency: Joi.string()
      .valid('TRY', 'USD', 'EUR')
      .default('TRY'),
    
    status: Joi.string()
      .valid('available', 'rented', 'maintenance', 'out_of_service')
      .default('available'),
    
    condition: Joi.string()
      .valid('excellent', 'good', 'fair', 'poor')
      .default('excellent'),
    
    mileage: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.base': 'Kilometre bilgisi sayı formatında olmalıdır.',
        'number.min': 'Kilometre negatif olamaz.',
        'any.required': 'Kilometre bilgisi zorunludur.'
      }),
    
    features: Joi.array()
      .items(Joi.string().valid(
        'air_conditioning', 'gps', 'bluetooth', 'usb_port', 'aux_input',
        'cd_player', 'mp3_player', 'cruise_control', 'parking_sensors',
        'backup_camera', 'sunroof', 'leather_seats', 'heated_seats',
        'child_safety_locks', 'airbags', 'abs', 'power_steering',
        'power_windows', 'remote_locking'
      ))
      .default([]),
    
    location: Joi.object({
      branch: Joi.string().required().messages({
        'any.required': 'Şube bilgisi zorunludur.'
      }),
      address: Joi.string(),
      coordinates: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2)
      })
    }).required(),
    
    insurance: Joi.object({
      company: Joi.string(),
      policyNumber: Joi.string(),
      expiryDate: Joi.date(),
      coverage: Joi.string().valid('basic', 'comprehensive', 'full').default('comprehensive')
    })
  });
  
  // ... (updateCarSchema ve diğerleri)
}

module.exports = CarValidators;