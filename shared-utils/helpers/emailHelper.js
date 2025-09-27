const nodemailer = require('nodemailer');
const { logger } = require('@rent-a-car/shared-utils');

const EmailHelper = async (options) => {
  // 1. E-posta taşıyıcısını (transporter) .env dosyasındaki bilgilere göre oluştur
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. E-posta seçeneklerini tanımla
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. E-postayı gönder
  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully: ${info.messageId}`);
  } catch (error) {
    logger.error(`Error sending email:`, error);
  }
};

module.exports = EmailHelper;