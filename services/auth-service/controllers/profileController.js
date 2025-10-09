const User = require('../models/User');

const {
  middleware: { asyncHandler },
  helpers: { ResponseFormatter, PasswordUtils, CloudinaryHelper },
  constants: { httpStatus },
  logger,
} = require('@rent-a-car/shared-utils');

class ProfileController {
  /**
   * @desc    Kullanıcı bilgilerini getir
   * @route   GET /api/auth/me
   * @access  Private
   */
  static getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Kullanıcı bulunamadı.', httpStatus.NOT_FOUND)
      );
    }

    res.status(httpStatus.OK).json(
      ResponseFormatter.success(user.toJSON(), 'Profil bilgileri başarıyla getirildi.')
    );
  });

  /**
   * @desc    Profil bilgilerini güncelle
   * @route   PUT /api/auth/profile
   * @access  Private
   */
  static updateProfile = asyncHandler(async (req, res) => {
    const { name, surname, phone, address } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Kullanıcı bulunamadı.', httpStatus.NOT_FOUND)
      );
    }

    // Güncellenebilir alanları kontrol et ve güncelle
    if (name !== undefined) user.name = name;
    if (surname !== undefined) user.surname = surname;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();

    logger.info(`Profil güncellendi: ${user.email}`);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success(user.toJSON(), 'Profil başarıyla güncellendi.')
    );
  });

  /**
   * @desc    Avatar yükle
   * @route   POST /api/auth/avatar
   * @access  Private
   */
  static uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(httpStatus.BAD_REQUEST).json(
        ResponseFormatter.error('Lütfen bir resim dosyası seçiniz.', httpStatus.BAD_REQUEST)
      );
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Kullanıcı bulunamadı.', httpStatus.NOT_FOUND)
      );
    }

    try {
      // Eski avatar'ı Cloudinary'den sil (eğer varsa ve default değilse)
      if (user.avatarUrl && !user.avatarUrl.includes('ui-avatars.com')) {
        try {
          await CloudinaryHelper.deleteByUrl(user.avatarUrl);
        } catch (error) {
          logger.warn('Eski avatar silinirken hata:', error.message);
        }
      }

      // Yeni avatar'ı yükle
      const result = await CloudinaryHelper.uploadFromBuffer(
        req.file.buffer,
        'rent-a-car/avatars'
      );

      user.avatarUrl = result.secure_url;
      await user.save({ validateBeforeSave: false });

      logger.info(`Avatar güncellendi: ${user.email}`);

      res.status(httpStatus.OK).json(
        ResponseFormatter.success(
          { avatarUrl: user.avatarUrl },
          'Profil resmi başarıyla güncellendi.'
        )
      );
    } catch (error) {
      logger.error('Avatar yükleme hatası:', error);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
        ResponseFormatter.error(
          'Profil resmi yüklenirken bir hata oluştu.',
          httpStatus.INTERNAL_SERVER_ERROR
        )
      );
    }
  });

  /**
   * @desc    Şifre değiştir
   * @route   PUT /api/auth/change-password
   * @access  Private
   */
  static changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Şifrelerin eşleşmesini kontrol et
    if (newPassword !== confirmPassword) {
      return res.status(httpStatus.BAD_REQUEST).json(
        ResponseFormatter.error('Yeni şifreler eşleşmiyor.', httpStatus.BAD_REQUEST)
      );
    }

    // Kullanıcıyı şifresi ile birlikte getir
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json(
        ResponseFormatter.error('Kullanıcı bulunamadı.', httpStatus.NOT_FOUND)
      );
    }

    // Mevcut şifreyi doğrula
    const isPasswordMatch = await PasswordUtils.compare(currentPassword, user.password);

    if (!isPasswordMatch) {
      return res.status(httpStatus.UNAUTHORIZED).json(
        ResponseFormatter.error('Mevcut şifre hatalı.', httpStatus.UNAUTHORIZED)
      );
    }

    // Yeni şifrenin mevcut şifreden farklı olduğunu kontrol et
    const isSamePassword = await PasswordUtils.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(httpStatus.BAD_REQUEST).json(
        ResponseFormatter.error(
          'Yeni şifre mevcut şifreden farklı olmalıdır.',
          httpStatus.BAD_REQUEST
        )
      );
    }

    // Yeni şifreyi kaydet
    user.password = newPassword;
    await user.save();

    logger.info(`Şifre değiştirildi: ${user.email}`);

    res.status(httpStatus.OK).json(
      ResponseFormatter.success({}, 'Şifreniz başarıyla değiştirildi.')
    );
  });
}

module.exports = ProfileController;