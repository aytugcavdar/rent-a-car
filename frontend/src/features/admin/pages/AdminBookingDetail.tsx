// frontend/src/features/admin/pages/AdminBookingDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  useGetBookingByIdQuery, 
  useUpdateBookingStatusMutation,
  useDeleteBookingMutation 
} from '../../booking/api/bookingApi';
import { Loading, ErrorMessage } from '../../../shared/components/ui/feedback';

const AdminBookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useGetBookingByIdQuery(id!);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateBookingStatusMutation();
  const [deleteBooking, { isLoading: isDeleting }] = useDeleteBookingMutation();

  const handleStatusUpdate = async (status: string) => {
    try {
      await updateStatus({ id: id!, status }).unwrap();
      toast.success('Rezervasyon durumu güncellendi.');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Durum güncellenirken bir hata oluştu.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?')) {
      try {
        await deleteBooking(id!).unwrap();
        toast.success('Rezervasyon başarıyla silindi.');
        navigate('/admin/bookings');
      } catch (error: any) {
        toast.error(error?.data?.message || 'Rezervasyon silinirken bir hata oluştu.');
      }
    }
  };

  if (isLoading) {
    return <Loading message="Rezervasyon detayı yükleniyor..." />;
  }

  if (error || !data?.data) {
    return (
      <ErrorMessage
        title="Rezervasyon Bulunamadı"
        message="Aradığınız rezervasyon bulunamadı."
        onRetry={() => navigate('/admin/bookings')}
      />
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Başlık ve Geri Butonu */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/bookings')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Rezervasyonlara Dön
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rezervasyon Detayı</h1>
            <p className="text-gray-600">#{booking._id.slice(-8).toUpperCase()}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon */}
        <div className="lg:col-span-2 space-y-6">
          {/* Araç Bilgileri */}
          {car && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Araç Bilgileri</h3>
              {car.images && car.images.length > 0 && (
                <img
                  src={car.images[0]}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Araç:</span>
                  <span className="font-semibold">{car.brand} {car.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plaka:</span>
                  <span className="font-semibold">{car.plateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kategori:</span>
                  <span className="font-semibold">{car.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Günlük Fiyat:</span>
                  <span className="font-semibold">{car.pricePerDay} {car.currency}</span>
                </div>
              </div>
            </div>
          )}

          {/* Rezervasyon Detayları */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Rezervasyon Bilgileri</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Alış Tarihi</p>
                <p className="font-semibold">{formatDate(booking.startDate)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Teslim Tarihi</p>
                <p className="font-semibold">{formatDate(booking.endDate)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Alış Yeri</p>
                <p className="font-semibold">{booking.pickupLocation.branch}</p>
                {booking.pickupLocation.address && (
                  <p className="text-sm text-gray-500">{booking.pickupLocation.address}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600">Teslim Yeri</p>
                <p className="font-semibold">{booking.returnLocation.branch}</p>
                {booking.returnLocation.address && (
                  <p className="text-sm text-gray-500">{booking.returnLocation.address}</p>
                )}
              </div>

              {booking.notes && (
                <div>
                  <p className="text-sm text-gray-600">Notlar</p>
                  <p className="font-semibold">{booking.notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Rezervasyon Tarihi</p>
                <p className="font-semibold">{formatDate(booking.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Ödeme Bilgileri */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ödeme Bilgileri</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Ödeme Yöntemi:</span>
                <span className="font-semibold">{booking.paymentInfo.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ödeme Durumu:</span>
                <span className={`font-semibold ${booking.paymentInfo.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {booking.paymentInfo.status}
                </span>
              </div>
              {booking.paymentInfo.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">İşlem No:</span>
                  <span className="font-mono text-xs">{booking.paymentInfo.transactionId}</span>
                </div>
              )}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Toplam Tutar:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {booking.totalPrice.toLocaleString('tr-TR')} {booking.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon - Yönetim */}
        <div className="space-y-6">
          {/* Durum Güncelleme */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Durum Yönetimi</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleStatusUpdate('pending')}
                disabled={isUpdating || booking.status === 'pending'}
                className="w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Beklemede İşaretle
              </button>
              <button
                onClick={() => handleStatusUpdate('confirmed')}
                disabled={isUpdating || booking.status === 'confirmed'}
                className="w-full px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Onayla
              </button>
              <button
                onClick={() => handleStatusUpdate('active')}
                disabled={isUpdating || booking.status === 'active'}
                className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Aktif İşaretle
              </button>
              <button
                onClick={() => handleStatusUpdate('completed')}
                disabled={isUpdating || booking.status === 'completed'}
                className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Tamamlandı İşaretle
              </button>
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={isUpdating || booking.status === 'cancelled'}
                className="w-full px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                İptal Et
              </button>
            </div>
          </div>

          {/* Kullanıcı Bilgileri */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Müşteri Bilgileri</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Kullanıcı ID</p>
                <p className="font-mono text-xs">{booking.userId}</p>
              </div>
            </div>
          </div>

          {/* Tehlikeli İşlemler */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-red-900 mb-4">Tehlikeli İşlemler</h3>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isDeleting ? 'Siliniyor...' : 'Rezervasyonu Sil'}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Bu işlem geri alınamaz. Rezervasyon kalıcı olarak silinecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingDetail;