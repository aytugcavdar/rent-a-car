import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  useGetAllBookingsQuery, 
  useUpdateBookingStatusMutation, 
  useDeleteBookingMutation 
} from '../../booking/api/bookingApi';
import { Loading, ErrorMessage } from '../../../shared/components/ui/feedback';
import AdminBookingTable from '../components/AdminBookingTable';

const AdminBookingManagement = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useGetAllBookingsQuery({
    status: statusFilter || undefined,
    page: currentPage,
    limit: 10,
  });

  const [updateBookingStatus, { isLoading: isUpdating }] = useUpdateBookingStatusMutation();
  const [deleteBooking, { isLoading: isDeleting }] = useDeleteBookingMutation();

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateBookingStatus({ id, status }).unwrap();
      toast.success('Rezervasyon durumu güncellendi.');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Durum güncellenirken bir hata oluştu.');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (window.confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?')) {
      try {
        await deleteBooking(id).unwrap();
        toast.success('Rezervasyon başarıyla silindi.');
      } catch (error: any) {
        toast.error(error?.data?.message || 'Rezervasyon silinirken bir hata oluştu.');
      }
    }
  };

  if (isLoading) {
    return <Loading message="Rezervasyonlar yükleniyor..." />;
  }

  if (error) {
    return <ErrorMessage title="Hata" message="Rezervasyonlar yüklenemedi." />;
  }

  const bookings = data?.data?.bookings || [];
  const totalPages = data?.data?.totalPages || 1;
  const total = data?.data?.total || 0;

  // İstatistikler
  const stats = {
    total: total,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    active: bookings.filter(b => b.status === 'active').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div>
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rezervasyon Yönetimi</h1>
        <p className="text-gray-600">Tüm rezervasyonları buradan yönetebilirsiniz.</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Toplam</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-md p-4">
          <p className="text-sm text-yellow-800 mb-1">Beklemede</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-md p-4">
          <p className="text-sm text-blue-800 mb-1">Onaylandı</p>
          <p className="text-2xl font-bold text-blue-900">{stats.confirmed}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-md p-4">
          <p className="text-sm text-green-800 mb-1">Aktif</p>
          <p className="text-2xl font-bold text-green-900">{stats.active}</p>
        </div>
        <div className="bg-gray-50 rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Tamamlandı</p>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow-md p-4">
          <p className="text-sm text-red-800 mb-1">İptal Edildi</p>
          <p className="text-2xl font-bold text-red-900">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Durum Filtrele:</label>
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

      {/* Rezervasyon Tablosu */}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Rezervasyon bulunamadı</h3>
          <p className="text-gray-500">Seçilen filtreye uygun rezervasyon bulunmuyor.</p>
        </div>
      ) : (
        <>
          <AdminBookingTable
            bookings={bookings}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteBooking}
            isUpdating={isUpdating || isDeleting}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
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
  );
};

export default AdminBookingManagement;