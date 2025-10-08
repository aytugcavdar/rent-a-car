require('dotenv').config();
const mongoose = require('mongoose');
const { rabbitmq, logger } = require('@rent-a-car/shared-utils');
const Payment = require('./models/Payment');

const QUEUE_NAME = 'payment_process_queue';
const RESULT_QUEUE = 'payment_result_queue';

const startConsumer = async () => {
  try {
    // Önce veritabanına bağlan
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connection successful for Payment Service.');
    
    // Sonra RabbitMQ consumer'ı başlat
    await rabbitmq.consumer.consume(
      QUEUE_NAME,
      async (paymentData, msg) => {
        logger.info(`[✔] Received payment process request for Booking ID ${paymentData.bookingId}`);
        
        try {
          // --- ÖDEME SİMÜLASYONU ---
          // %90 ihtimalle başarılı, %10 ihtimalle başarısız
          const isSuccess = Math.random() < 0.9;
          
          if (isSuccess) {
            const transactionId = `tr_${new Date().getTime()}`;
            
            await Payment.create({
              bookingId: paymentData.bookingId,
              userId: paymentData.userId,
              amount: paymentData.totalPrice,
              currency: paymentData.currency,
              status: 'completed',
              transactionId: transactionId
            });
            
            logger.info(`[SUCCESS] Payment for booking ${paymentData.bookingId} completed.`);
            
            // Booking-service'e başarı mesajı gönder
            await rabbitmq.publisher.publish(RESULT_QUEUE, {
              bookingId: paymentData.bookingId,
              status: 'success',
              transactionId: transactionId
            });
            
            logger.info(`[>] Payment success result sent for booking ${paymentData.bookingId}`);
            
          } else {
            throw new Error('Bankadan onay alınamadı.');
          }

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
          
          // Booking-service'e başarısızlık mesajı gönder
          await rabbitmq.publisher.publish(RESULT_QUEUE, {
            bookingId: paymentData.bookingId,
            status: 'failed',
            errorMessage: error.message
          });
          
          logger.info(`[>] Payment failure result sent for booking ${paymentData.bookingId}`);
        }
      },
      {
        prefetch: 10 // Aynı anda max 10 ödeme işle
      }
    );
    
    logger.info(`[✓] Payment consumer started: ${QUEUE_NAME}`);
    
  } catch (error) {
    logger.error('Payment service consumer failed:', error);
    process.exit(1);
  }
};

startConsumer();