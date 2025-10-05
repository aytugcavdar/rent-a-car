import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useGetBookingByIdQuery, useCancelBookingMutation } from '../api/bookingApi';
import { Loading, ErrorMessage } from '../../../shared/components/ui/feedback';
import Container from '../../../shared/components/layout/Container';

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useGetBookingByIdQuery(id!);
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();

  const handleCancelBooking = async () => {
    if (window.confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) {
      try {
        await cancelBooking(id!).unwrap();
        toast.success('Rezervasyon başarıyla iptal edildi.');
        navigate('/bookings');
      } catch (error: any) {
        toast.error(error?.data?.message || 'Rezervasyon iptal edilirken bir hata oluştu.');
      }
    }
  };

  if (isLoading) {
    return <Loading message="Rezervasyon detayı yükleniyor..." />;
  }

  if (error || !data?.data) {
    return (
      <Container>
        <ErrorMessage
          title="Rezervasyon Bulunamadı"
          message="Aradığınız rezervasyon bulunamadı veya erişim yetkiniz yok."
          onRetry={() => navigate('/bookings')}
        />
      </Container>
    );
  }

  const booking = data.data;
  const car = booking.car;

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <Container>
      <div className="py-8">
        {/* Başlık ve Geri Butonu */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/bookings')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Rezervasyonlara Dön
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Rezervasyon Detayı</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
              {getStatusText(booking.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon - Araç Bilgileri */}
          <div className="lg:col-span-2 space-y-6">
            {/* Araç Kartı */}
            {car && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {car.images && car.images.length > 0 && (
                  <img
                    src={car.images[0]}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {car.brand} {car.model}
                  </h2>
                  <p className="text-gray-600 mb-4">Plaka: {car.plateNumber}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {car.seats} Kişi
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {car.transmission === 'automatic' ? 'Otomatik' : 'Manuel'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {car.fuelType}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      {car.year}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rezervasyon Detayları */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Rezervasyon Bilgileri</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Alış Tarihi</p>
                    <p className="text-gray-600">{formatDate(booking.startDate)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Teslim Tarihi</p>
                    <p className="text-gray-600">{formatDate(booking.endDate)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Alış Yeri</p>
                    <p className="text-gray-600">{booking.pickupLocation.branch}</p>
                    {booking.pickupLocation.address && (
                      <p className="text-sm text-gray-500">{booking.pickupLocation.address}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Teslim Yeri</p>
                    <p className="text-gray-600">{booking.returnLocation.branch}</p>
                    {booking.returnLocation.address && (
                      <p className="text-sm text-gray-500">{booking.returnLocation.address}</p>
                    )}
                  </div>
                </div>

                {booking.notes && (
                  <div className="flex items-start">
                    <svg className="w-6 h-6 mr-3 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Notlar</p>
                      <p className="text-gray-600">{booking.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sağ Kolon - Ödeme ve İşlemler */}
          <div className="space-y-6">
            {/* Fiyat Özeti */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Fiyat Özeti</h3>
              
              <div className="space-y-3 border-b pb-4 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Günlük Fiyat</span>
                  <span>{car?.pricePerDay || 0} {booking.currency}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Gün Sayısı</span>
                  <span>
                    {Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))} gün
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Toplam</span>
                <span className="text-2xl font-bold text-blue-600">
                  {booking.totalPrice.toLocaleString('tr-TR')} {booking.currency}
                </span>
              </div>
            </div>

            {/* Ödeme Bilgisi */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ödeme Bilgisi</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ödeme Yöntemi</span>
                  <span className="font-medium">{booking.paymentInfo.method}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ödeme Durumu</span>
                  <span className={`font-medium ${booking.paymentInfo.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {booking.paymentInfo.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                  </span>
                </div>
                {booking.paymentInfo.transactionId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">İşlem No</span>
                    <span className="font-medium text-xs">{booking.paymentInfo.transactionId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* İşlemler */}
            {canCancel && (
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isCancelling ? 'İptal Ediliyor...' : 'Rezervasyonu İptal Et'}
              </button>
            )}

            {/* Rezervasyon Tarihi */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p>Rezervasyon Tarihi:</p>
              <p className="font-medium text-gray-900">
                {formatDate(booking.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default BookingDetail;