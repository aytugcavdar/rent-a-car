const bcrypt = require('bcryptjs');

// Şifre hash'leme ve karşılaştırma işlemleri için.
class PasswordUtils {
  static async hash(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async compare(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = PasswordUtils;