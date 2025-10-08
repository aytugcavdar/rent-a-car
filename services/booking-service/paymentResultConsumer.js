const { rabbitmq, logger } = require('@rent-a-car/shared-utils');
const Booking = require('./models/Booking');

const QUEUE_NAME = 'payment_result_queue';

/**
 * Ödeme sonucu mesajlarını işler
 */
const handlePaymentResult = async (result) => {
  try {
    const booking = await Booking.findById(result.bookingId);
    
    if (!booking) {
      logger.error(`Booking ${result.bookingId} not found!`);
      return;
    }

    if (result.status === 'success') {
      // Ödeme başarılı - rezervasyonu onayla
      booking.status = 'confirmed';
      booking.paymentInfo.status = 'completed';
      booking.paymentInfo.transactionId = result.transactionId;
      
      await booking.save();
      logger.info(`[SUCCESS] Booking ${result.bookingId} confirmed after successful payment.`);
      
    } else {
      // Ödeme başarısız - rezervasyonu iptal et
      booking.status = 'cancelled';
      booking.paymentInfo.status = 'failed';
      
      await booking.save();
      logger.warn(`[CANCELLED] Booking ${result.bookingId} cancelled due to payment failure: ${result.errorMessage}`);
    }
    
  } catch (error) {
    logger.error(`Error processing payment result for booking ${result.bookingId}:`, error);
    throw error;
  }
};

/**
 * Payment result consumer'ı başlatır
 */
async function startPaymentResultConsumer() {
  try {
    await rabbitmq.consumer.consumeWithRetry(
      QUEUE_NAME,
      handlePaymentResult,
      3 // Maksimum 3 deneme
    );
    
    logger.info(`[✓] Payment result consumer started: ${QUEUE_NAME}`);
    
  } catch (error) {
    logger.error(`[✗] Failed to start payment result consumer:`, error);
    throw error;
  }
}

module.exports = { startPaymentResultConsumer };