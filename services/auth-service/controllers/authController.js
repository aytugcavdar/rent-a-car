const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const {
  middleware: { asyncHandler },
  helpers: { ResponseFormatter, PasswordUtils, CloudinaryHelper, EmailHelper },
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

/**
 * Cookie ayarlarını döner
 */
const getCookieOptions = () => {
  const expiresInDays = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 30; // Varsayılan olarak 30 gün

  return {
    expires: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
};

/**
 * E-posta doğrulama token'ı oluşturur
 */
const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

class AuthController {
  /**
   * @desc    Yeni kullanıcı kaydı oluşturur, profil resmini yükler ve doğrulama maili gönderir.
   * @route   POST /api/auth/register
   * @access  Public
   */
  static register = asyncHandler(async (req, res) => {
    // 1. İstekten gelen metin verilerini al (JSON.parse kaldırıldı)
    const { name, surname, email, password, phone, driverLicense, address } = req.body;
    console.log('Kayıt isteği alındı:', { name, surname, email, phone, driverLicense, address });
    let avatarUrl = null;

    // 2. Eğer bir dosya (profil resmi) yüklendiyse, onu Cloudinary'e yükle
    if (req.file) {
      try {
        const result = await CloudinaryHelper.uploadFromBuffer(req.file.buffer, 'rent-a-car/avatars');
        avatarUrl = result.secure_url;
        logger.info(`Avatar Cloudinary'e yüklendi: ${avatarUrl}`);
      } catch (error) {
        logger.error('Cloudinary upload hatası:', error);
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

    // 4. E-posta doğrulama token'ı oluştur
    const emailVerificationToken = generateEmailVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat

    // 5. Yeni kullanıcıyı oluştur
    const user = await User.create({
      name,
      surname,
      email,
      password,
      phone,
      driverLicense,
      address,
      avatarUrl,
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false
    });

    // 6. Doğrulama maili gönder (Doğru kullanım ile güncellendi)
    try {
      const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${emailVerificationToken}&email=${email}`;
      
      await EmailHelper.sendEmail({
        email: user.email,
        subject: 'Rent-a-Car - E-posta Adresinizi Doğrulayın',
        message: `
Merhaba ${user.name} ${user.surname},

Rent-a-Car sistemine hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki bağlantıya tıklayarak e-posta adresinizi doğrulamanız gerekmektedir.

Doğrulama Bağlantısı: ${verificationUrl}

Bu bağlantı 24 saat geçerlidir.

Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.

İyi günler dileriz,
Rent-a-Car Ekibi
        `
      });

      logger.info(`Doğrulama maili gönderildi: ${user.email}`);
    } catch (error) {
      logger.error('E-posta gönderme hatası:', error);
      // E-posta gönderme başarısız olsa bile kayıt tamamlanır, ancak hata loglanır.
      // Sunucunun çökmemesi için hatayı burada yakalıyoruz.
    }

    // 7. JWT Token oluştur
    const token = generateToken(user);

    // 8. Cookie ayarla
    res.cookie('token', token, getCookieOptions());

    logger.info(`Yeni kullanıcı kaydoldu: ${user.email}`);

    // 9. Başarılı cevap gönder
    res.status(httpStatus.CREATED).json(
      ResponseFormatter.success(
        { 
          user: user.toJSON(), 
          token,
          message: 'E-posta adresinize gönderilen doğrulama bağlantısını kullanarak hesabınızı aktifleştirin.'
        }, 
        'Kayıt başarılı. Lütfen e-postanızı kontrol edin.', 
        httpStatus.CREATED
      )
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

    // 4. E-posta doğrulanmış mı kontrol et
    if (!user.isEmailVerified) {
      return res.status(httpStatus.FORBIDDEN).json(
        ResponseFormatter.error('Lütfen önce e-posta adresinizi doğrulayın. Doğrulama maili spam klasörünüzde olabilir.', httpStatus.FORBIDDEN, {
          needsEmailVerification: true,
          email: user.email
        })
      );
    }

    // 5. Başarılı giriş sonrası login denemelerini sıfırla
    await user.resetLoginAttempts();
    
    // 6. JWT Token oluştur
    const token = generateToken(user);
    
    // 7. Cookie ayarla
    res.cookie('token', token, getCookieOptions());
    
    logger.info(`Kullanıcı giriş yaptı: ${user.email}`);

    // 8. Başarılı cevap gönder
    res.status(httpStatus.OK).json(
      ResponseFormatter.success({ user: user.toJSON(), token }, 'Giriş başarılı.')
    );
  });

  /**
   * @desc    E-posta doğrulama
   * @route   POST /api/auth/verify-email
   * @access  Public
   */
  static verifyEmail = asyncHandler(async (req, res) => {
    const { token, email } = req.body;

    // 1. Token ve email ile kullanıcıyı bul
    const user = await User.findOne({
      email,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(httpStatus.BAD_REQUEST).json(
        ResponseFormatter.error('Geçersiz veya süresi dolmuş doğrulama token\'ı.', httpStatus.BAD_REQUEST)
      );
    }

    // 2. E-posta adresini doğrulanmış olarak işaretle
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.info(`E-posta doğrulandı: ${user.email}`);

    // 3. Başarılı cevap gönder
    res.status(httpStatus.OK).json(
      ResponseFormatter.success({ verified: true }, 'E-posta adresiniz başarıyla doğrulandı.')
    );
  });

  /**
   * @desc    Doğrulama mailini yeniden gönder
   * @route   POST /api/auth/resend-verification
   * @access  Public
   */
  static resendVerificationEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // 1. Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.', httpStatus.NOT_FOUND)
      );
    }

    // 2. Zaten doğrulanmışsa
    if (user.isEmailVerified) {
      return res.status(httpStatus.BAD_REQUEST).json(
        ResponseFormatter.error('E-posta adresiniz zaten doğrulanmış.', httpStatus.BAD_REQUEST)
      );
    }

    // 3. Yeni doğrulama token'ı oluştur
    const emailVerificationToken = generateEmailVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save({ validateBeforeSave: false });

    // 4. Doğrulama maili gönder
    try {
      const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${emailVerificationToken}&email=${email}`;
      
      await EmailHelper({
        email: user.email,
        subject: 'Rent-a-Car - E-posta Doğrulama (Yeniden Gönderim)',
        message: `
Merhaba ${user.name} ${user.surname},

E-posta doğrulama talebiniz alındı. Hesabınızı aktifleştirmek için aşağıdaki bağlantıya tıklayın:

Doğrulama Bağlantısı: ${verificationUrl}

Bu bağlantı 24 saat geçerlidir.

İyi günler dileriz,
Rent-a-Car Ekibi
        `
      });

      logger.info(`Doğrulama maili yeniden gönderildi: ${user.email}`);
    } catch (error) {
      logger.error('E-posta yeniden gönderme hatası:', error);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
        ResponseFormatter.error('E-posta gönderilirken bir hata oluştu.', httpStatus.INTERNAL_SERVER_ERROR)
      );
    }

    // 5. Başarılı cevap gönder
    res.status(httpStatus.OK).json(
      ResponseFormatter.success({}, 'Doğrulama maili yeniden gönderildi.')
    );
  });

  /**
   * @desc    Çıkış yap ve cookie'yi temizle
   * @route   POST /api/auth/logout
   * @access  Private
   */
  static logout = asyncHandler(async (req, res) => {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({}, 'Başarıyla çıkış yapıldı.')
    );
  });
}

module.exports = AuthController;