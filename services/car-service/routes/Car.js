const express = require('express');
const multer = require('multer');
const CarController = require('../controllers/carController');

const {
  middleware: { ValidationMiddleware, AuthMiddleware },
  constants: { userRoles }
} = require('@rent-a-car/shared-utils');

// Car validators - bu dosyayı shared-utils'e ekleyeceğiz
const CarValidators = require('../validators/carValidators');

const router = express.Router();

// Multer config for image uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir'), false);
    }
  }
});

// Public routes
router.get('/', CarController.getAllCars);
router.get('/categories', CarController.getCategories);
router.get('/category/:category', CarController.getCarsByCategory);
router.get('/:id', CarController.getCarById);

// Protected routes (Admin only)
router.post(
  '/',
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireRole([userRoles.ADMIN]),
  upload.array('images', 10), // Max 10 images
  ValidationMiddleware.validateRequest(CarValidators.createCarSchema),
  CarController.createCar
);

router.put(
  '/:id',
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireRole([userRoles.ADMIN]),
  upload.array('images', 10),
  ValidationMiddleware.validateRequest(CarValidators.updateCarSchema),
  CarController.updateCar
);

router.delete(
  '/:id',
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireRole([userRoles.ADMIN]),
  CarController.deleteCar
);

router.patch(
  '/:id/status',
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireRole([userRoles.ADMIN]),
  ValidationMiddleware.validateRequest(CarValidators.updateStatusSchema),
  CarController.updateCarStatus
);

router.post(
  '/:id/maintenance',
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireRole([userRoles.ADMIN]),
  ValidationMiddleware.validateRequest(CarValidators.maintenanceSchema),
  CarController.addMaintenanceRecord
);

router.get(
  '/admin/stats',
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireRole([userRoles.ADMIN]),
  CarController.getCarStats
);

module.exports = router;