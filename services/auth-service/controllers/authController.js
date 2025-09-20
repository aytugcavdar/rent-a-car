const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Relative path kullan
const {
  middleware: { asyncHandler },
  helpers: { ResponseFormatter, PasswordUtils, CloudinaryHelper },
  constants: { httpStatus },
  logger,
} = require('@rent-a-car/shared-utils');

/**
 * Verilen kullanıcı bilgileriyle bir JWT oluşturur.
 * @param {object} user Kullanıcı objesi.
 * @returns {string} Oluşturulan JWT.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

class AuthController {
  /**
   * @desc    Yeni kullanıcı kaydı oluşturur, profil resmini yükler.
   * @route   POST /api/auth/register
   * @access  Public
   */
  static register = asyncHandler(async (req, res) => {
    // 1. İstekten gelen metin verilerini al
    const { name, surname, email, password } = req.body;
    // driverLicense ve address JSON string olarak geleceği için parse ediyoruz.
    const driverLicense = JSON.parse(req.body.driverLicense);
    const address = req.body.address;

    let avatarUrl = null;

    // 2. Eğer bir dosya (profil resmi) yüklendiyse, onu Cloudinary'e yükle
    if (req.file) {
      try {
        const result = await CloudinaryHelper.uploadFromBuffer(req.file.buffer, 'rent-a-car/avatars');
        avatarUrl = result.secure_url;
        logger.info(`Avatar Cloudinary'e yüklendi: ${avatarUrl}`);
      } catch (error) {
        logger.error('Cloudinary upload hatası:', error);
        // Resim yükleme başarısız olursa, işlemi durdurup hata dönebiliriz.
        // Bu, tutarlılığı sağlamak için daha iyi bir yaklaşımdır.
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
          ResponseFormatter.error('Profil resmi yüklenirken bir hata oluştu.', httpStatus.INTERNAL_SERVER_ERROR)
        );
      }
    }

    // 3. E-posta'nın veya ehliyet numarasının daha önce alınıp alınmadığını kontrol et
    const existingUser = await User.findOne({
      $or: [{ email }, { 'driverLicense.number': driverLicense.number }],
    });

    if (existingUser) {
      return res.status(httpStatus.CONFLICT).json(
        ResponseFormatter.error('Bu e-posta veya ehliyet numarası zaten kullanılıyor.', httpStatus.CONFLICT)
      );
    }

    // 4. Yeni kullanıcıyı oluştur (avatarUrl'i de ekleyerek)
    const user = await User.create({
      name,
      surname,
      email,
      password,
      driverLicense,
      address,
      avatarUrl, // Eğer resim yüklenmediyse bu null olacak ve modeldeki default avatar kullanılacak
    });

    // 5. JWT Token oluştur
    const token = generateToken(user);

    logger.info(`Yeni kullanıcı kaydoldu: ${user.email}`);

    // 6. Başarılı cevap gönder
    res.status(httpStatus.CREATED).json(
      ResponseFormatter.success({ user: user.toJSON(), token }, 'Kayıt başarılı.', httpStatus.CREATED)
    );
  });

  /**
   * @desc    Kullanıcı girişi yapar ve token döndürür.
   * @route   POST /api/auth/login
   * @access  Public
   */
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. Kullanıcıyı bul ve güvenlik alanlarını da sorguya dahil et
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json(
        ResponseFormatter.error('E-posta veya şifre hatalı.', httpStatus.UNAUTHORIZED)
      );
    }
    
    // 2. Hesabın kilitli olup olmadığını kontrol et
    if (user.isLocked) {
        return res.status(httpStatus.FORBIDDEN).json(
            ResponseFormatter.error('Çok sayıda hatalı deneme. Hesabınız geçici olarak kilitlenmiştir.', httpStatus.FORBIDDEN)
        );
    }

    // 3. Şifrelerin eşleşip eşleşmediğini kontrol et
    const isPasswordMatch = await PasswordUtils.compare(password, user.password);
    
    if (!isPasswordMatch) {
      await user.handleFailedLogin();
      return res.status(httpStatus.UNAUTHORIZED).json(
        ResponseFormatter.error('E-posta veya şifre hatalı.', httpStatus.UNAUTHORIZED)
      );
    }

    // 4. Başarılı giriş sonrası login denemelerini sıfırla
    await user.resetLoginAttempts();
    
    // 5. JWT Token oluştur
    const token = generateToken(user);
    
    logger.info(`Kullanıcı giriş yaptı: ${user.email}`);

    // 6. Başarılı cevap gönder
    res.status(httpStatus.OK).json(
      ResponseFormatter.success({ user: user.toJSON(), token }, 'Giriş başarılı.')
    );
  });
}

module.exports = AuthController;