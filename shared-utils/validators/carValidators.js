// shared-utils/validators/carValidators.js
const Joi = require('joi');

const CarValidators = {
  createCarSchema: Joi.object({
    brand: Joi.string().trim().required().messages({
      'string.empty': 'Marka alanı boş olamaz.',
      'any.required': 'Marka alanı zorunludur.'
    }),
    
    model: Joi.string().trim().required().messages({
      'string.empty': 'Model alanı boş olamaz.',
      'any.required': 'Model alanı zorunludur.'
    }),
    
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required().messages({
      'number.base': 'Yıl sayı olmalıdır.',
      'number.min': 'Yıl 1900\'den küçük olamaz.',
      'number.max': 'Yıl gelecek yıldan büyük olamaz.',
      'any.required': 'Yıl alanı zorunludur.'
    }),
    
    plateNumber: Joi.string().trim().required().messages({
      'string.empty': 'Plaka alanı boş olamaz.',
      'any.required': 'Plaka alanı zorunludur.'
    }),
    
    category: Joi.string().valid(
      'economy', 'compact', 'intermediate', 'standard', 
      'premium', 'luxury', 'suv', 'minivan'
    ).required().messages({
      'any.only': 'Geçersiz kategori.',
      'any.required': 'Kategori alanı zorunludur.'
    }),
    
    fuelType: Joi.string().valid('gasoline', 'diesel', 'hybrid', 'electric').required().messages({
      'any.only': 'Geçersiz yakıt tipi.',
      'any.required': 'Yakıt tipi alanı zorunludur.'
    }),
    
    transmission: Joi.string().valid('manual', 'automatic').required().messages({
      'any.only': 'Geçersiz vites tipi.',
      'any.required': 'Vites tipi alanı zorunludur.'
    }),
    
    seats: Joi.number().integer().min(2).max(9).required().messages({
      'number.base': 'Koltuk sayısı sayı olmalıdır.',
      'number.min': 'Koltuk sayısı en az 2 olmalıdır.',
      'number.max': 'Koltuk sayısı en fazla 9 olmalıdır.',
      'any.required': 'Koltuk sayısı alanı zorunludur.'
    }),
    
    doors: Joi.number().integer().min(2).max(5).optional().messages({
      'number.base': 'Kapı sayısı sayı olmalıdır.',
      'number.min': 'Kapı sayısı en az 2 olmalıdır.',
      'number.max': 'Kapı sayısı en fazla 5 olmalıdır.'
    }),
    
    pricePerDay: Joi.number().min(0).required().messages({
      'number.base': 'Günlük fiyat sayı olmalıdır.',
      'number.min': 'Günlük fiyat 0\'dan küçük olamaz.',
      'any.required': 'Günlük fiyat alanı zorunludur.'
    }),
    
    currency: Joi.string().default('TRY').optional(),
    
    mileage: Joi.number().min(0).required().messages({
      'number.base': 'Kilometre sayı olmalıdır.',
      'number.min': 'Kilometre 0\'dan küçük olamaz.',
      'any.required': 'Kilometre alanı zorunludur.'
    }),
    
    // Serbest string array - kullanıcı istediği özelliği girebilir
    features: Joi.array().items(
      Joi.string().trim().min(1).max(100)
    ).optional().messages({
      'array.base': 'Özellikler dizi olmalıdır.',
      'string.min': 'Özellik en az 1 karakter olmalıdır.',
      'string.max': 'Özellik en fazla 100 karakter olabilir.'
    }),
    
    images: Joi.array().items(Joi.string().uri()).optional().messages({
      'array.base': 'Görseller dizi olmalıdır.',
      'string.uri': 'Geçersiz görsel URL\'si.'
    }),
    
    location: Joi.object({
      branch: Joi.string().trim().required().messages({
        'string.empty': 'Şube alanı boş olamaz.',
        'any.required': 'Şube alanı zorunludur.'
      }),
      address: Joi.string().trim().optional()
    }).required().messages({
      'any.required': 'Lokasyon bilgisi zorunludur.'
    }),
    
    insurance: Joi.object({
      company: Joi.string().trim().optional(),
      policyNumber: Joi.string().trim().optional(),
      expiryDate: Joi.date().optional()
    }).optional()
  }),

  updateCarSchema: Joi.object({
    brand: Joi.string().trim().optional(),
    model: Joi.string().trim().optional(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
    plateNumber: Joi.string().trim().optional(),
    category: Joi.string().valid(
      'economy', 'compact', 'intermediate', 'standard', 
      'premium', 'luxury', 'suv', 'minivan'
    ).optional(),
    fuelType: Joi.string().valid('gasoline', 'diesel', 'hybrid', 'electric').optional(),
    transmission: Joi.string().valid('manual', 'automatic').optional(),
    seats: Joi.number().integer().min(2).max(9).optional(),
    doors: Joi.number().integer().min(2).max(5).optional(),
    pricePerDay: Joi.number().min(0).optional(),
    currency: Joi.string().optional(),
    mileage: Joi.number().min(0).optional(),
    features: Joi.array().items(
      Joi.string().trim().min(1).max(100)
    ).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    location: Joi.object({
      branch: Joi.string().trim().optional(),
      address: Joi.string().trim().optional()
    }).optional(),
    insurance: Joi.object({
      company: Joi.string().trim().optional(),
      policyNumber: Joi.string().trim().optional(),
      expiryDate: Joi.date().optional()
    }).optional(),
    status: Joi.string().valid('available', 'rented', 'maintenance', 'out_of_service').optional()
  }).min(1)
};

module.exports = CarValidators;