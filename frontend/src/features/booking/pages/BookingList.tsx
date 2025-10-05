import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useGetUserBookingsQuery, useCancelBookingMutation } from '../api/bookingApi';
import { Loading, ErrorMessage } from '../../../shared/components/ui/feedback';
import Container from '../../../shared/components/layout/Container';
import BookingCard from '../components/BookingCard';

const BookingList = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useGetUserBookingsQuery({
    status: statusFilter || undefined,
    page: currentPage,
    limit: 9,
  });

  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) {
      try {
        await cancelBooking(bookingId).unwrap();
        toast.success('Rezervasyon başarıyla iptal edildi.');
      } catch (error: any) {
        toast.error(error?.data?.message || 'Rezervasyon iptal edilirken bir hata oluştu.');
      }
    }
  };

  if (isLoading) {
    return <Loading message="Rezervasyonlar yükleniyor..." />;
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage
          title="Hata"
          message="Rezervasyonlar yüklenemedi."
        />
      </Container>
    );
  }

  const bookings = data?.data?.bookings || [];
  const totalPages = data?.data?.totalPages || 1;

  return (
    <Container>
      <div className="py-8">
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rezervasyonlarım</h1>
          <p className="text-gray-600">Tüm rezervasyonlarınızı buradan görüntüleyebilirsiniz.</p>
        </div>

        {/* Filtreler */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Durum:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tümü</option>
              <option value="pending">Beklemede</option>
              <option value="confirmed">Onaylandı</option>
              <option value="active">Aktif</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
          </div>
        </div>

        {/* Rezervasyon Listesi */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz rezervasyonunuz yok</h3>
            <p className="text-gray-500 mb-4">Araçlarımıza göz atarak ilk rezervasyonunuzu yapabilirsiniz.</p>
            <a
              href="/cars"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Araçları İncele
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                  isCancelling={isCancelling}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Sayfa {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
};

export default BookingList;