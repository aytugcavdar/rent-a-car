require('dotenv').config();
const mongoose = require('mongoose');
const { rabbitmq, logger } = require('@rent-a-car/shared-utils');
const Payment = require('./models/Payment');

const QUEUE_NAME = 'payment_process_queue';

const startConsumer = async () => {
  try {
    // Önce veritabanına bağlan
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connection successful for Payment Service.');
    
    // Sonra RabbitMQ'ya bağlan
    const connection = await rabbitmq.connection.connect();
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    logger.info(`[*] Waiting for messages in ${QUEUE_NAME}.`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        const paymentData = JSON.parse(msg.content.toString());
        logger.info(`[✔] Received payment process request for Booking ID ${paymentData.bookingId}`);
        
        try {
          // --- ÖDEME SİMÜLASYONU ---
          // Gerçekte burada Stripe, Iyzico vb. bir servise istek atılır.
          // %90 ihtimalle başarılı, %10 ihtimalle başarısız olsun.
          const isSuccess = Math.random() < 0.9;
          
          if (isSuccess) {
            await Payment.create({
              bookingId: paymentData.bookingId,
              userId: paymentData.userId,
              amount: paymentData.totalPrice,
              currency: paymentData.currency,
              status: 'completed',
              transactionId: `tr_${new Date().getTime()}` // Benzersiz bir ID oluştur
            });
            logger.info(`[SUCCESS] Payment for booking ${paymentData.bookingId} completed.`);
            // TODO: booking-service'e ödemenin başarılı olduğuna dair bir event gönder (RabbitMQ)
          } else {
            throw new Error('Bankadan onay alınamadı.');
          }
          // --- SİMÜLASYON SONU ---

        } catch (error) {
          await Payment.create({
            bookingId: paymentData.bookingId,
            userId: paymentData.userId,
            amount: paymentData.totalPrice,
            currency: paymentData.currency,
            status: 'failed',
            errorMessage: error.message
          });
          logger.error(`[FAIL] Payment for booking ${paymentData.bookingId} failed: ${error.message}`);
          // TODO: booking-service'e ödemenin başarısız olduğuna dair bir event gönder (RabbitMQ)
        }
        
        channel.ack(msg);
      }
    });
  } catch (error) {
    logger.error('Payment service consumer failed:', error);
    process.exit(1);
  }
};

startConsumer();