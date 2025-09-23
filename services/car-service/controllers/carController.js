const Car = require('../models/Car');
const {
  middleware: { asyncHandler },
  helpers: { ResponseFormatter, CloudinaryHelper },
  constants: { httpStatus },
  logger
} = require('@rent-a-car/shared-utils');

class CarController {
  /**
   * @desc    Tüm araçları listele (filtreleme ve sayfalama ile)
   * @route   GET /api/cars
   * @access  Public
   */
  static getAllCars = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      fuelType,
      transmission,
      brand,
      status = 'available',
      sortBy = 'pricePerDay',
      sortOrder = 'asc'
    } = req.query;

    // Filter objesi oluştur
    const filters = { isActive: true };
    
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (fuelType) filters.fuelType = fuelType;
    if (transmission) filters.transmission = transmission;
    if (brand) filters.brand = new RegExp(brand, 'i');
    
    // Fiyat aralığı filtresi
    if (minPrice || maxPrice) {
      filters.pricePerDay = {};
      if (minPrice) filters.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filters.pricePerDay.$lte = Number(maxPrice);
    }

    // Sıralama objesi
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const cars = await Car.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name surname');

    const totalCars = await Car.countDocuments(filters);
    const totalPages = Math.ceil(totalCars / Number(limit));

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({
        cars,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCars,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }, 'Araçlar başarıyla listelendi')
    );
  });

  /**
   * @desc    Belirli bir aracı getir
   * @route   GET /api/cars/:id
   * @access  Public
   */
  static getCarById = asyncHandler(async (req, res) => {
    const car = await Car.findById(req.params.id)
      .populate('createdBy', 'name surname');

    if (!car) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Araç bulunamadı', httpStatus.NOT_FOUND)
      );
    }

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({ car }, 'Araç detayları başarıyla getirildi')
    );
  });

  /**
   * @desc    Yeni araç ekle
   * @route   POST /api/cars
   * @access  Private (Admin only)
   */
  static createCar = asyncHandler(async (req, res) => {
    const carData = { ...req.body, createdBy: req.user.id };

    // Resim yükleme işlemi
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(async (file, index) => {
        try {
          const result = await CloudinaryHelper.uploadFromBuffer(
            file.buffer,
            'rent-a-car/cars'
          );
          return {
            url: result.secure_url,
            alt: `${carData.brand} ${carData.model} - Resim ${index + 1}`,
            isPrimary: index === 0 // İlk resim birincil resim
          };
        } catch (error) {
          logger.error('Resim yükleme hatası:', error);
          throw new Error('Resim yüklenirken hata oluştu');
        }
      });

      carData.images = await Promise.all(imagePromises);
    }

    const car = await Car.create(carData);
    
    logger.info(`Yeni araç eklendi: ${car.plateNumber} - ${car.displayName}`);

    res.status(httpStatus.CREATED).json(
      ResponseFormatter.success({ car }, 'Araç başarıyla eklendi', httpStatus.CREATED)
    );
  });

  /**
   * @desc    Araç bilgilerini güncelle
   * @route   PUT /api/cars/:id
   * @access  Private (Admin only)
   */
  static updateCar = asyncHandler(async (req, res) => {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Araç bulunamadı', httpStatus.NOT_FOUND)
      );
    }

    // Yeni resimler varsa ekle
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(async (file, index) => {
        const result = await CloudinaryHelper.uploadFromBuffer(
          file.buffer,
          'rent-a-car/cars'
        );
        return {
          url: result.secure_url,
          alt: `${req.body.brand || car.brand} ${req.body.model || car.model} - Yeni Resim ${index + 1}`,
          isPrimary: false
        };
      });

      const newImages = await Promise.all(imagePromises);
      req.body.images = [...car.images, ...newImages];
    }

    Object.assign(car, req.body);
    await car.save();

    logger.info(`Araç güncellendi: ${car.plateNumber}`);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({ car }, 'Araç başarıyla güncellendi')
    );
  });

  /**
   * @desc    Araç sil (soft delete)
   * @route   DELETE /api/cars/:id
   * @access  Private (Admin only)
   */
  static deleteCar = asyncHandler(async (req, res) => {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Araç bulunamadı', httpStatus.NOT_FOUND)
      );
    }

    car.isActive = false;
    car.status = 'out_of_service';
    await car.save();

    logger.info(`Araç silindi (soft delete): ${car.plateNumber}`);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success(null, 'Araç başarıyla silindi')
    );
  });

  /**
   * @desc    Araç durumunu güncelle
   * @route   PATCH /api/cars/:id/status
   * @access  Private (Admin only)
   */
  static updateCarStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Araç bulunamadı', httpStatus.NOT_FOUND)
      );
    }

    await car.updateStatus(status);

    logger.info(`Araç durumu güncellendi: ${car.plateNumber} -> ${status}`);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({ car }, 'Araç durumu başarıyla güncellendi')
    );
  });

  /**
   * @desc    Bakım kaydı ekle
   * @route   POST /api/cars/:id/maintenance
   * @access  Private (Admin only)
   */
  static addMaintenanceRecord = asyncHandler(async (req, res) => {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Araç bulunamadı', httpStatus.NOT_FOUND)
      );
    }

    await car.addMaintenanceRecord(req.body);

    logger.info(`Bakım kaydı eklendi: ${car.plateNumber}`);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({ car }, 'Bakım kaydı başarıyla eklendi')
    );
  });

  /**
   * @desc    Kategoriye göre araçları getir
   * @route   GET /api/cars/category/:category
   * @access  Public
   */
  static getCarsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const cars = await Car.findByCategory(category);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({ cars }, `${category} kategorisindeki araçlar`)
    );
  });

  /**
   * @desc    Mevcut araç kategorilerini listele
   * @route   GET /api/cars/categories
   * @access  Public
   */
  static getCategories = asyncHandler(async (req, res) => {
    const categories = await Car.distinct('category', { isActive: true });
    
    res.status(httpStatus.OK).json(
      ResponseFormatter.success({ categories }, 'Araç kategorileri')
    );
  });

  /**
   * @desc    Araç istatistikleri
   * @route   GET /api/cars/stats
   * @access  Private (Admin only)
   */
  static getCarStats = asyncHandler(async (req, res) => {
    const stats = await Car.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricePerDay' }
        }
      }
    ]);

    const categoryStats = await Car.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricePerDay' },
          minPrice: { $min: '$pricePerDay' },
          maxPrice: { $max: '$pricePerDay' }
        }
      }
    ]);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({
        statusStats: stats,
        categoryStats: categoryStats
      }, 'Araç istatistikleri')
    );
  });
}

module.exports = CarController;