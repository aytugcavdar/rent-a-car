const express = require('express');
const BookingController = require('../controllers/bookingController');
const BookingValidators = require('../validators/bookingValidators');

const {
  middleware: { ValidationMiddleware, AuthMiddleware },
  constants: { userRoles }
} = require('@rent-a-car/shared-utils');

const router = express.Router();

// Public routes
router.post(
  '/check-availability',
  ValidationMiddleware.validateRequest(BookingValidators.checkAvailabilitySchema),
  BookingController.checkAvailability
);

// Protected routes (Customer & Admin)
router.use(AuthMiddleware.verifyToken);

router.get('/', BookingController.getUserBookings);

router.get(
  '/:id',
  BookingController.getBookingById
);

router.post(
  '/',
  ValidationMiddleware.validateRequest(BookingValidators.createBookingSchema),
  BookingController.createBooking
);

router.delete(
  '/:id',
  ValidationMiddleware.validateRequest(BookingValidators.cancelBookingSchema),
  BookingController.cancelBooking
);

// Admin only routes
router.get(
  '/admin/all',
  AuthMiddleware.requireRole([userRoles.ADMIN]),
  BookingController.getAllBookings
);

router.patch(
  '/:id/status',
  AuthMiddleware.requireRole([userRoles.ADMIN]),
  ValidationMiddleware.validateRequest(BookingValidators.updateStatusSchema),
  BookingController.updateBookingStatus
);

router.post(
  '/:id/pickup',
  AuthMiddleware.requireRole([userRoles.ADMIN]),
  ValidationMiddleware.validateRequest(BookingValidators.vehiclePickupSchema),
  BookingController.vehiclePickup
);

router.post(
  '/:id/return',
  AuthMiddleware.requireRole([userRoles.ADMIN]),
  ValidationMiddleware.validateRequest(BookingValidators.vehicleReturnSchema),
  BookingController.vehicleReturn
);

router.get(
  '/admin/stats',
  AuthMiddleware.requireRole([userRoles.ADMIN]),
  BookingController.getBookingStats
);

module.exports = router;