require("dotenv").config();
const { rabbitmq, logger, helpers } = require("@rent-a-car/shared-utils");
const { EmailHelper } = helpers;

const QUEUE_NAME = "booking_created_queue";

const startConsumer = async () => {
  try {
    // Shared consumer helper kullan
    await rabbitmq.consumer.consume(
      QUEUE_NAME,
      async (bookingDetails) => {
        logger.info(
          `[✔] Processing booking notification: Booking ID ${bookingDetails.bookingId}`
        );

        try {
          await EmailHelper.sendEmail({
            email: bookingDetails.userEmail,
            subject: `Rezervasyon Onayı - No: ${bookingDetails.bookingId}`,
            message: `Merhaba, ${bookingDetails.carInfo} aracınız için rezervasyonunuz başarıyla alınmıştır.`,
          });
          
          logger.info(`[✓] Email sent successfully for booking ${bookingDetails.bookingId}`);
        } catch (error) {
          logger.error(
            `Failed to send email for booking ${bookingDetails.bookingId}:`,
            error
          );
          throw error;
        }
      },
      {
        prefetch: 5, // Aynı anda max 5 mesaj işle
      }
    );

    logger.info(`[✓] Notification consumer started: ${QUEUE_NAME}`);
  } catch (error) {
    logger.error("Notification consumer failed:", error);
    process.exit(1);
  }
};

startConsumer();