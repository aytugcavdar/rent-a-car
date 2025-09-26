const express = require('express');
const CarController = require('../controllers/carController');
const { middleware, validators } = require('@rent-a-car/shared-utils');

const { AuthMiddleware, ValidationMiddleware } = middleware;
const { CarValidators } = validators;

const router = express.Router();

// Public Routes
router.get('/', CarController.getAllCars);
router.get('/:id', CarController.getCarById);

// Admin Only Routes
router.post(
  '/',
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireRole(['admin']),
  ValidationMiddleware.validateRequest(CarValidators.createCarSchema),
  CarController.createCar
);

module.exports = router;