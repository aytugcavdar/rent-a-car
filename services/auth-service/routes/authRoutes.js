const express = require('express');
const multer = require('multer');
const AuthController = require('../controllers/authController');
const { validators, middleware } = require('@rent-a-car/shared-utils');

const { UserValidators } = validators;
const { ValidationMiddleware } = middleware; // Yeni middleware'imizi import ediyoruz

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/auth/register
router.post(
  '/register',
  upload.single('avatar'),
  ValidationMiddleware.validateRequest(UserValidators.registerSchema), // <-- ARTIK ÇOK DAHA TEMİZ!
  AuthController.register
);

// POST /api/auth/login
router.post(
  '/login',
  ValidationMiddleware.validateRequest(UserValidators.loginSchema), // <-- ARTIK ÇOK DAHA TEMİZ!
  AuthController.login
);

module.exports = router;