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
}

module.exports = UserValidators;