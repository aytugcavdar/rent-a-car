const express = require('express');
const BookingController = require('../controllers/bookingController');
const { middleware, validators } = require('@rent-a-car/shared-utils');

const { AuthMiddleware, ValidationMiddleware } = middleware;
const { BookingValidators } = validators;

const router = express.Router();

// Kullanıcı Rotaları
router.post(
  '/',
  AuthMiddleware.verifyToken,
  ValidationMiddleware.validateRequest(BookingValidators.createBookingSchema),
  BookingController.createBooking
);

router.get(
  '/',
  AuthMiddleware.verifyToken,
  BookingController.getUserBookings
);

router.get(
  '/:id',
  AuthMiddleware.verifyToken,
  BookingController.getBookingById
);

router.patch(
  '/:id/cancel',
  AuthMiddleware.verifyToken,
  BookingController.cancelBooking
);

// Admin Rotaları
router.get(
  '/admin/all',
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  BookingController.getAllBookings
);

router.patch(
  '/:id/status',
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  BookingController.updateBookingStatus
);

router.delete(
  '/:id',
  AuthMiddleware.verifyToken,
  AuthMiddleware.isAdmin,
  BookingController.deleteBooking
);

module.exports = router;