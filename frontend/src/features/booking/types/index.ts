/**
 * Rezervasyon durumları
 */
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

/**
 * Ödeme yöntemleri
 */
export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer';

/**
 * Lokasyon bilgisi
 */
export interface Location {
  branch: string;
  address?: string;
}

/**
 * Ödeme bilgisi
 */
export interface PaymentInfo {
  method: PaymentMethod;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * Rezervasyon filtre seçenekleri
 */
export interface BookingFilters {
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  carId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'totalPrice';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Rezervasyon istatistikleri
 */
export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  active: number;
  completed: number;
  cancelled: number;
  totalRevenue?: number;
  averageBookingValue?: number;
}

/**
 * Rezervasyon özeti
 */
export interface BookingSummary {
  bookingId: string;
  carName: string;
  carPlate: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  pickupLocation: string;
  returnLocation: string;
}

/**
 * Rezervasyon validasyon sonucu
 */
export interface BookingValidation {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Rezervasyon form adımları
 */
export enum BookingStep {
  CAR_SELECTION = 1,
  BOOKING_DETAILS = 2,
  PAYMENT = 3,
  CONFIRMATION = 4,
}

/**
 * Rezervasyon form verileri
 */
export interface BookingFormData {
  carId: string;
  startDate: string;
  endDate: string;
  pickupLocation: Location;
  returnLocation: Location;
  paymentInfo: {
    method: PaymentMethod;
  };
  notes?: string;
  // Ek alanlar
  driverInfo?: {
    name?: string;
    surname?: string;
    phone?: string;
    licenseNumber?: string;
    licenseIssueDate?: string;
  };
  additionalServices?: {
    childSeat?: boolean;
    gps?: boolean;
    additionalDriver?: boolean;
    insurance?: 'basic' | 'full';
  };
}

/**
 * Rezervasyon durum değişikliği
 */
export interface BookingStatusUpdate {
  bookingId: string;
  oldStatus: BookingStatus;
  newStatus: BookingStatus;
  updatedBy: string;
  updatedAt: string;
  reason?: string;
}

/**
 * Rezervasyon bildirimi
 */
export interface BookingNotification {
  type: 'created' | 'confirmed' | 'cancelled' | 'completed' | 'reminder';
  bookingId: string;
  userId: string;
  message: string;
  sentAt: string;
  read: boolean;
}

/**
 * Ek hizmetler ve ücretleri
 */
export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'per_day' | 'one_time';
  available: boolean;
}

/**
 * Rezervasyon iptal politikası
 */
export interface CancellationPolicy {
  allowCancellation: boolean;
  freeUntilHours: number; // Ücretsiz iptal için gereken minimum saat
  cancellationFee?: number;
  refundPercentage?: number;
}

/**
 * Rezervasyon şube bilgisi
 */
export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  workingHours: {
    weekday: string;
    weekend: string;
  };
}

/**
 * Toplam fiyat hesaplama detayı
 */
export interface PriceBreakdown {
  basePrice: number;
  numberOfDays: number;
  subtotal: number;
  additionalServices?: {
    name: string;
    price: number;
  }[];
  tax?: number;
  discount?: number;
  total: number;
  currency: string;
}

export default {
  BookingStep,
};