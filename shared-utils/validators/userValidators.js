const Joi = require('joi');
const { userRoles } = require('../constants');

class UserValidators {
 
  static registerSchema = {
    body: Joi.object({
      name: Joi.string().trim().min(2).max(50).required().messages({
        'string.base': 'İsim metin formatında olmalıdır.',
        'string.empty': 'İsim alanı boş bırakılamaz.',
        'string.min': 'İsim en az 2 karakter olmalıdır.',
        'string.max': 'İsim en fazla 50 karakter olabilir.',
        'any.required': 'İsim alanı zorunludur.'
      }),
      
      surname: Joi.string().trim().min(2).max(50).required().messages({
        'string.base': 'Soyisim metin formatında olmalıdır.',
        'string.empty': 'Soyisim alanı boş bırakılamaz.',
        'string.min': 'Soyisim en az 2 karakter olmalıdır.',
        'string.max': 'Soyisim en fazla 50 karakter olabilir.',
        'any.required': 'Soyisim alanı zorunludur.'
      }),
      
      email: Joi.string().trim().email().lowercase().required().messages({
        'string.base': 'E-posta metin formatında olmalıdır.',
        'string.empty': 'E-posta alanı boş bırakılamaz.',
        'string.email': 'Lütfen geçerli bir e-posta adresi giriniz.',
        'any.required': 'E-posta alanı zorunludur.'
      }),
      
      password: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
        'string.base': 'Şifre metin formatında olmalıdır.',
        'string.empty': 'Şifre alanı boş bırakılamaz.',
        'string.min': 'Şifre en az 8 karakter olmalıdır.',
        'string.max': 'Şifre en fazla 128 karakter olabilir.',
        'string.pattern.base': 'Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir.',
        'any.required': 'Şifre alanı zorunludur.'
      }),
      
      phone: Joi.string()
        .trim()
        .pattern(/^(\+90|0)?[1-9]\d{9}$/)
        .required()
        .messages({
          'string.pattern.base': 'Lütfen geçerli bir Türkiye telefon numarası giriniz. (Örn: +905551234567 veya 05551234567)',
          'any.required': 'Telefon numarası zorunludur.'
        }),
      
      address: Joi.string().trim().min(10).max(500).required().messages({
        'string.base': 'Adres metin formatında olmalıdır.',
        'string.empty': 'Adres alanı boş bırakılamaz.',
        'string.min': 'Adres en az 10 karakter olmalıdır.',
        'string.max': 'Adres en fazla 500 karakter olabilir.',
        'any.required': 'Adres alanı zorunludur.'
      }),
      
      // ✅ Düzleştirilmiş ehliyet alanları
      licenseNumber: Joi.string().trim().min(5).max(20).required().messages({
        'string.empty': 'Ehliyet numarası boş bırakılamaz.',
        'string.min': 'Ehliyet numarası en az 5 karakter olmalıdır.',
        'string.max': 'Ehliyet numarası en fazla 20 karakter olabilir.',
        'any.required': 'Ehliyet numarası zorunludur.'
      }),
      
      licenseIssuedDate: Joi.date().iso().max('now').required().messages({
        'date.base': 'Geçerli bir ehliyet verilme tarihi giriniz.',
        'date.max': 'Ehliyet verilme tarihi bugünden ileri bir tarih olamaz.',
        'any.required': 'Ehliyet verilme tarihi zorunludur.'
      }),
      
      licenseExpirationDate: Joi.date().iso().greater(Joi.ref('licenseIssuedDate')).required().messages({
        'date.base': 'Geçerli bir ehliyet geçerlilik tarihi giriniz.',
        'date.greater': 'Ehliyet geçerlilik tarihi, verilme tarihinden sonra olmalıdır.',
        'any.required': 'Ehliyet geçerlilik tarihi zorunludur.'
      }),
      
      role: Joi.string().valid(userRoles.CUSTOMER, userRoles.ADMIN).default(userRoles.CUSTOMER)
    })
  };

  // ✅ Login validation
  static loginSchema = {
    body: Joi.object({
      email: Joi.string().trim().email().lowercase().required().messages({
        'string.empty': 'E-posta alanı boş bırakılamaz.',
        'string.email': 'Lütfen geçerli bir e-posta adresi giriniz.',
        'any.required': 'E-posta alanı zorunludur.'
      }),
      password: Joi.string().required().messages({
        'string.empty': 'Şifre alanı boş bırakılamaz.',
        'any.required': 'Şifre alanı zorunludur.'
      })
    })
  };

  // ✅ E-posta doğrulama validation
  static emailVerificationSchema = {
    body: Joi.object({
      email: Joi.string().trim().email().lowercase().required().messages({
        'string.email': 'Lütfen geçerli bir e-posta adresi giriniz.',
        'any.required': 'E-posta alanı zorunludur.'
      }),
      token: Joi.string().trim().length(64).hex().required().messages({
        'string.length': 'Geçersiz doğrulama token\'ı.',
        'string.hex': 'Geçersiz doğrulama token\'ı formatı.',
        'any.required': 'Doğrulama token\'ı zorunludur.'
      })
    })
  };

  // ✅ Doğrulama maili yeniden gönderme validation
  static resendVerificationSchema = {
    body: Joi.object({
      email: Joi.string().trim().email().lowercase().required().messages({
        'string.email': 'Lütfen geçerli bir e-posta adresi giriniz.',
        'any.required': 'E-posta alanı zorunludur.'
      })
    })
  };

  // ✅ Şifre sıfırlama talebi validation
  static forgotPasswordSchema = {
    body: Joi.object({
      email: Joi.string().trim().email().lowercase().required().messages({
        'string.email': 'Lütfen geçerli bir e-posta adresi giriniz.',
        'any.required': 'E-posta alanı zorunludur.'
      })
    })
  };

  // ✅ Şifre sıfırlama validation
  static resetPasswordSchema = {
    body: Joi.object({
      token: Joi.string().trim().required().messages({
        'any.required': 'Sıfırlama token\'ı zorunludur.'
      }),
      password: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
        'string.min': 'Yeni şifre en az 8 karakter olmalıdır.',
        'string.max': 'Yeni şifre en fazla 128 karakter olabilir.',
        'string.pattern.base': 'Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir.',
        'any.required': 'Yeni şifre zorunludur.'
      }),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Şifreler eşleşmiyor.',
        'any.required': 'Şifre tekrarı zorunludur.'
      })
    })
  };

  // ✅ Profil güncelleme validation
  static updateProfileSchema = {
    body: Joi.object({
      name: Joi.string().trim().min(2).max(50).optional().messages({
        'string.min': 'İsim en az 2 karakter olmalıdır.',
        'string.max': 'İsim en fazla 50 karakter olabilir.'
      }),
      surname: Joi.string().trim().min(2).max(50).optional().messages({
        'string.min': 'Soyisim en az 2 karakter olmalıdır.',
        'string.max': 'Soyisim en fazla 50 karakter olabilir.'
      }),
      phone: Joi.string().trim().pattern(/^(\+90|0)?[1-9]\d{9}$/).optional().messages({
        'string.pattern.base': 'Lütfen geçerli bir Türkiye telefon numarası giriniz.'
      }),
      address: Joi.string().trim().min(10).max(500).optional().messages({
        'string.min': 'Adres en az 10 karakter olmalıdır.',
        'string.max': 'Adres en fazla 500 karakter olabilir.'
      })
    }).min(1).messages({
      'object.min': 'En az bir alan güncellenmelidir.'
    })
  };

  // ✅ Şifre değiştirme validation
  static changePasswordSchema = {
    body: Joi.object({
      currentPassword: Joi.string().required().messages({
        'any.required': 'Mevcut şifre zorunludur.'
      }),
      newPassword: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
        'string.min': 'Yeni şifre en az 8 karakter olmalıdır.',
        'string.max': 'Yeni şifre en fazla 128 karakter olabilir.',
        'string.pattern.base': 'Yeni şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir.',
        'any.required': 'Yeni şifre zorunludur.'
      }),
      confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Yeni şifreler eşleşmiyor.',
        'any.required': 'Şifre tekrarı zorunludur.'
      })
    })
  };
}

module.exports = UserValidators;