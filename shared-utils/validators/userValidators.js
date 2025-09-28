const Joi = require('joi');
const { userRoles } = require('../constants');

class UserValidators {
  static registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.base': 'İsim metin formatında olmalıdır.',
      'string.empty': 'İsim alanı boş bırakılamaz.',
      'string.min': 'İsim en az 2 karakter olmalıdır.',
      'string.max': 'İsim en fazla 50 karakter olabilir.',
      'any.required': 'İsim alanı zorunludur.'
    }),
    
    surname: Joi.string().min(2).max(50).required().messages({
      'string.base': 'Soyisim metin formatında olmalıdır.',
      'string.empty': 'Soyisim alanı boş bırakılamaz.',
      'string.min': 'Soyisim en az 2 karakter olmalıdır.',
      'string.max': 'Soyisim en fazla 50 karakter olabilir.',
      'any.required': 'Soyisim alanı zorunludur.'
    }),
    
    email: Joi.string().email().required().messages({
      'string.base': 'E-posta metin formatında olmalıdır.',
      'string.empty': 'E-posta alanı boş bırakılamaz.',
      'string.email': 'Lütfen geçerli bir e-posta adresi giriniz.',
      'any.required': 'E-posta alanı zorunludur.'
    }),
    
    password: Joi.string().min(8).required().messages({
      'string.base': 'Şifre metin formatında olmalıdır.',
      'string.empty': 'Şifre alanı boş bırakılamaz.',
      'string.min': 'Şifre en az 8 karakter olmalıdır.',
      'any.required': 'Şifre alanı zorunludur.'
    }),
    
    phone: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required()
      .messages({
        'string.pattern.base': 'Lütfen geçerli bir telefon numarası giriniz.',
        'any.required': 'Telefon numarası zorunludur.'
      }),
    
    driverLicense: Joi.object({
      number: Joi.string().required().messages({
        'any.required': 'Ehliyet numarası zorunludur.'
      }),
      issuedDate: Joi.date().required().messages({
        'any.required': 'Ehliyet verilme tarihi zorunludur.'
      }),
      expirationDate: Joi.date().greater('now').required().messages({
        'date.greater': 'Ehliyet geçerlilik tarihi gelecekte bir tarih olmalıdır.',
        'any.required': 'Ehliyet geçerlilik tarihi zorunludur.'
      })
    }).required(),
    
    address: Joi.string().min(10).max(500).required().messages({
      'string.base': 'Adres metin formatında olmalıdır.',
      'string.empty': 'Adres alanı boş bırakılamaz.',
      'string.min': 'Adres en az 10 karakter olmalıdır.',
      'string.max': 'Adres en fazla 500 karakter olabilir.',
      'any.required': 'Adres alanı zorunludur.'
    }),
    
    role: Joi.string().valid(userRoles.CUSTOMER, userRoles.ADMIN).default(userRoles.CUSTOMER)
  });

  static loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'E-posta alanı boş bırakılamaz.',
      'string.email': 'Lütfen geçerli bir e-posta adresi giriniz.',
      'any.required': 'E-posta alanı zorunludur.'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Şifre alanı boş bırakılamaz.',
      'any.required': 'Şifre alanı zorunludur.'
    })
  });

  // E-posta doğrulama için
  static emailVerificationSchema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Lütfen geçerli bir e-posta adresi giriniz.',
      'any.required': 'E-posta alanı zorunludur.'
    }),
    token: Joi.string().required().messages({
      'any.required': 'Doğrulama token\'ı zorunludur.'
    })
  });

  // Doğrulama maili yeniden gönderme için
  static resendVerificationSchema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Lütfen geçerli bir e-posta adresi giriniz.',
      'any.required': 'E-posta alanı zorunludur.'
    })
  });

  // Şifre sıfırlama talebi için
  static forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Lütfen geçerli bir e-posta adresi giriniz.',
      'any.required': 'E-posta alanı zorunludur.'
    })
  });
}

module.exports = UserValidators;