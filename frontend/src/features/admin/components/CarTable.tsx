// frontend/src/features/admin/components/CarTable.tsx
import { Link } from 'react-router-dom';
import type { Car } from '../../cars/api/carsApi';

interface CarTableProps {
  cars: Car[];
  onDelete: (id: string, plate: string) => void;
  isDeleting: boolean;
}

const CarTable = ({ cars, onDelete, isDeleting }: CarTableProps) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plaka</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marka & Model</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cars.map((car) => (
            <tr key={car._id}>
              <td className="px-6 py-4 text-sm font-medium">{car.plateNumber}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{car.brand} {car.model}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                  car.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {car.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium">
                <Link to={`/admin/cars/edit/${car._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Düzenle</Link>
                <button
                  onClick={() => onDelete(car._id, car.plateNumber)}
                  className="text-red-600 hover:text-red-900"
                  disabled={isDeleting}
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

export default CarTable;