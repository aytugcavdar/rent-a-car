const express = require('express');
const multer = require('multer');
const AuthController = require('../controllers/authController');

// Relative path kullan
const { validators, middleware } = require('@rent-a-car/shared-utils');

const { UserValidators } = validators;
const { ValidationMiddleware, AuthMiddleware } = middleware;

const router = express.Router();

// Multer konfigürasyonu - dosya yükleme sınırları ve filtreleme
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir'), false);
    }
  }
});

// POST /api/auth/register - Kullanıcı kaydı + E-posta doğrulama
router.post(
  '/register',
  upload.single('avatar'),
  ValidationMiddleware.validateRequest(UserValidators.registerSchema),
  AuthController.register
);

// POST /api/auth/login - Kullanıcı girişi + Cookie
router.post(
  '/login',
  ValidationMiddleware.validateRequest(UserValidators.loginSchema),
  AuthController.login
);

// POST /api/auth/verify-email - E-posta doğrulama
router.post(
  '/verify-email',
  ValidationMiddleware.validateRequest(UserValidators.emailVerificationSchema),
  AuthController.verifyEmail
);

// POST /api/auth/resend-verification - Doğrulama maili yeniden gönder
router.post(
  '/resend-verification',
  ValidationMiddleware.validateRequest(UserValidators.resendVerificationSchema),
  AuthController.resendVerificationEmail
);

// POST /api/auth/forgot-password - Şifre sıfırlama talebi
/* 
router.post(
  '/forgot-password',
  ValidationMiddleware.validateRequest(UserValidators.forgotPasswordSchema),
  AuthController.forgotPassword
);
 */

// POST /api/auth/logout - Çıkış yap
router.post('/logout', AuthController.logout);

// GET /api/auth/me - Kullanıcı bilgilerini getir (Authentication gerekli)
/* 
router.get('/me', AuthMiddleware.verifyToken, AuthController.getMe);
 */
router.get('/users', AuthMiddleware.verifyToken, AuthMiddleware.isAdmin, AuthController.getAllUsers);

module.exports = router;