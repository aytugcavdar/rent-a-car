import { Link } from 'react-router-dom';
import type { Booking } from '../api/bookingApi';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: string) => void;
  isCancelling?: boolean;
}

const BookingCard = ({ booking, onCancel, isCancelling }: BookingCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'confirmed':
        return 'Onaylandı';
      case 'active':
        return 'Aktif';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Araç Bilgisi */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {booking.car ? `${booking.car.brand} ${booking.car.model}` : 'Araç Bilgisi Yükleniyor...'}
            </h3>
            {booking.car && (
              <p className="text-sm text-gray-500">{booking.car.plateNumber}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
            {getStatusText(booking.status)}
          </span>
        </div>

        {/* Tarih Bilgileri */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span><strong>Alış:</strong> {formatDate(booking.startDate)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span><strong>Teslim:</strong> {formatDate(booking.endDate)}</span>
          </div>
        </div>

        {/* Lokasyon Bilgileri */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="font-medium">Alış Yeri:</p>
              <p>{booking.pickupLocation.branch}</p>
            </div>
          </div>
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="font-medium">Teslim Yeri:</p>
              <p>{booking.returnLocation.branch}</p>
            </div>
          </div>
        </div>

        {/* Fiyat */}
        <div className="border-t pt-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Toplam Tutar:</span>
            <span className="text-2xl font-bold text-gray-900">
              {booking.totalPrice.toLocaleString('tr-TR')} {booking.currency}
            </span>
          </div>
        </div>

        {/* Aksiyonlar */}
        <div className="flex space-x-3">
          <Link
            to={`/bookings/${booking._id}`}
            className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Detayları Gör
          </Link>
          {canCancel && onCancel && (
            <button
              onClick={() => onCancel(booking._id)}
              disabled={isCancelling}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isCancelling ? 'İptal Ediliyor...' : 'İptal Et'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;