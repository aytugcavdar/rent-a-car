const { httpStatus } = require('../constants');

// API cevaplarını standart bir formata sokar.
class ResponseFormatter {
  static success(data = null, message = 'Success', statusCode = httpStatus.OK) {
    return {
      success: true,
      message,
      data
    };
  }

  static error(message = 'Internal Server Error', statusCode = httpStatus.INTERNAL_SERVER_ERROR, errors = null) {
    return {
      success: false,
      message,
      errors
    };
  }
}

module.exports = ResponseFormatter;