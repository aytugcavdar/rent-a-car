const express = require('express');
const multer = require('multer');
const AuthController = require('../controllers/authController');
const ProfileController = require('../controllers/profileController');

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

// ==================== AUTH ROUTES ====================

// POST /api/auth/register - Kullanıcı kaydı
router.post(
  '/register',
  upload.single('avatar'),
  ValidationMiddleware.validateRequest(UserValidators.registerSchema),
  AuthController.register
);

// POST /api/auth/login - Kullanıcı girişi
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

// POST /api/auth/logout - Çıkış yap
router.post('/logout', AuthController.logout);

// GET /api/auth/users - Tüm kullanıcıları getir (Admin)
router.get(
  '/users',
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireRole(['admin']),
  AuthController.getAllUsers
);

// ==================== PROFILE ROUTES ====================

// GET /api/auth/me - Kullanıcı bilgilerini getir
router.get(
  '/me',
  AuthMiddleware.verifyToken,
  ProfileController.getProfile
);

// PUT /api/auth/profile - Profil bilgilerini güncelle
router.put(
  '/profile',
  AuthMiddleware.verifyToken,
  ProfileController.updateProfile
);

// POST /api/auth/avatar - Avatar yükle
router.post(
  '/avatar',
  AuthMiddleware.verifyToken,
  upload.single('avatar'),
  ProfileController.uploadAvatar
);

// PUT /api/auth/change-password - Şifre değiştir
router.put(
  '/change-password',
  AuthMiddleware.verifyToken,
  ProfileController.changePassword
);

module.exports = router;