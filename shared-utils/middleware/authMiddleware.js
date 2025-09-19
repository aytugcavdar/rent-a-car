const jwt = require('jsonwebtoken');
const { httpStatus } = require('../constants');
const { ResponseFormatter } = require('../helpers');

// JWT token'larını doğrular ve kullanıcı rollerini kontrol eder.
class AuthMiddleware {
  static verifyToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json(
        ResponseFormatter.error('Access denied. No token provided.', httpStatus.UNAUTHORIZED)
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, email, role }
      next();
    } catch (error) {
      return res.status(httpStatus.UNAUTHORIZED).json(
        ResponseFormatter.error('Invalid token.', httpStatus.UNAUTHORIZED)
      );
    }
  }

  static requireRole(allowedRoles) {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(httpStatus.FORBIDDEN).json(
          ResponseFormatter.error('Forbidden. Insufficient permissions.', httpStatus.FORBIDDEN)
        );
      }
      next();
    };
  }
}

module.exports = AuthMiddleware;