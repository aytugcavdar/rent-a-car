const Car = require('../models/Car');
const {
  middleware: { asyncHandler },
  helpers: { ResponseFormatter },
  constants: { httpStatus },
  logger,
} = require('@rent-a-car/shared-utils');

class CarController {
  /**
   * @desc    Yeni bir araç oluşturur
   * @route   POST /api/cars
   * @access  Private (Admin)
   */
  static createCar = asyncHandler(async (req, res) => {
    const { plateNumber } = req.body;

    const existingCar = await Car.findOne({ plateNumber });
    if (existingCar) {
      return res.status(httpStatus.CONFLICT).json(
        ResponseFormatter.error('Bu plakaya sahip bir araç zaten mevcut.', httpStatus.CONFLICT)
      );
    }

    const car = await Car.create(req.body);
    logger.info(`Yeni araç oluşturuldu: ${car.brand} ${car.model} - ${car.plateNumber}`);

    res.status(httpStatus.CREATED).json(
      ResponseFormatter.success(car, 'Araç başarıyla oluşturuldu.', httpStatus.CREATED)
    );
  });

  /**
   * @desc    Tüm araçları listeler
   * @route   GET /api/cars
   * @access  Public
   */
  static getAllCars = asyncHandler(async (req, res) => {
    const cars = await Car.find({ isActive: true });
    res.status(httpStatus.OK).json(ResponseFormatter.success(cars));
  });

  /**
   * @desc    ID'ye göre bir aracı getirir
   * @route   GET /api/cars/:id
   * @access  Public
   */
  static getCarById = asyncHandler(async (req, res) => {
    const car = await Car.findById(req.params.id);

    if (!car || !car.isActive) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Araç bulunamadı.', httpStatus.NOT_FOUND)
      );
    }

    res.status(httpStatus.OK).json(ResponseFormatter.success(car));
  });
}

module.exports = CarController;