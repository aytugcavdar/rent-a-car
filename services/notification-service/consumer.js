require("dotenv").config();
const { rabbitmq, logger, helpers } = require("@rent-a-car/shared-utils");
const { EmailHelper } = helpers; // EmailHelper'ı shared-utils'dan alıyoruz

const QUEUE_NAME = "booking_created_queue";

const startConsumer = async () => {
  try {
    const connection = await rabbitmq.connection.connect();
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    logger.info(`[*] Waiting for messages in ${QUEUE_NAME}.`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        const bookingDetails = JSON.parse(msg.content.toString());

        logger.info(
          `[✔] Received new booking notification request: Booking ID ${bookingDetails.bookingId}`
        );

        try {
          // Merkezi EmailHelper'ı çağırıyoruz
          await EmailHelper.sendEmail({
            email: bookingDetails.userEmail,
            subject: `Rezervasyon Onayı - No: ${bookingDetails.bookingId}`,
            message: `Merhaba, ${bookingDetails.carInfo} aracınız için rezervasyonunuz başarıyla alınmıştır.`,
          });
        } catch (error) {
          logger.error(
            `Failed to send email for booking ${bookingDetails.bookingId}:`,
            error
          );
        }

        channel.ack(msg);
      }
    });
  } catch (error) {
    logger.error("Notification service consumer failed:", error);
    process.exit(1);
  }
};

startConsumer();
