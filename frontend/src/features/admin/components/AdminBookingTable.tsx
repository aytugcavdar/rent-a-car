import { Link } from 'react-router-dom';
import type { Booking } from '../../booking/api/bookingApi';

interface AdminBookingTableProps {
  bookings: Booking[];
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

const AdminBookingTable = ({ bookings, onStatusChange, onDelete, isUpdating }: AdminBookingTableProps) => {

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

  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Araç</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarihler</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam Fiyat</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking._id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {booking.car ? `${booking.car.brand} ${booking.car.model}` : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {booking.totalPrice} {booking.currency}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link to={`/admin/bookings/${booking._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Detay</Link>
                <button
                  onClick={() => onDelete(booking._id)}
                  className="text-red-600 hover:text-red-900"
                  disabled={isUpdating}
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBookingTable;