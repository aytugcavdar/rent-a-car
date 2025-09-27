const express = require('express');
const BookingController = require('../controllers/bookingController');
const { middleware, validators } = require('@rent-a-car/shared-utils');

const { AuthMiddleware, ValidationMiddleware } = middleware;
const { BookingValidators } = validators;

const router = express.Router();

// Bu endpoint'e sadece giriş yapmış kullanıcılar erişebilir.
router.post(
  '/',
  AuthMiddleware.verifyToken,
  ValidationMiddleware.validateRequest(BookingValidators.createBookingSchema),
  BookingController.createBooking
);

module.exports = router;