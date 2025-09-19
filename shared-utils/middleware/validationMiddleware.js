const { ErrorHandler } = require('./errorHandler');

/**
 * Gelen isteğin body'sini (özellikle form-data) Joi şemasına göre doğrular.
 * @param {Joi.Schema} schema Doğrulama şeması.
 */
const validateRequest = (schema) => (req, res, next) => {
  const dataToValidate = { ...req.body };

  // Body içindeki string'e çevrilmiş JSON'ları parse etmeye çalışır.
  // Örn: '{"number": "123", "issuedDate": "..."}' -> { number: "123", ... }
  for (const key in dataToValidate) {
    if (typeof dataToValidate[key] === 'string' && (dataToValidate[key].startsWith('{') || dataToValidate[key].startsWith('['))) {
      try {
        dataToValidate[key] = JSON.parse(dataToValidate[key]);
      } catch (error) {
        // Parse hatası olursa görmezden gel, Joi zaten format hatası verecektir.
      }
    }
  }

  const { error } = schema.validate(dataToValidate);

  if (error) {
    error.isJoi = true;
    // Hata durumunda, merkezi errorHandler'a yönlendiriyoruz.
    return next(error); 
  }

  // Doğrulanmış ve temizlenmiş veriyi `req.body`'e geri yazıyoruz.
  req.body = dataToValidate;
  next();
};

module.exports = {
  validateRequest,
};