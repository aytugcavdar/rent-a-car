import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCarsQuery, type Car } from '../api/carsApi';
import { Container } from '../../../shared/components/layout';
import { Loading } from '../../../shared/components/ui/feedback';
import { Button, Select } from '../../../shared/components/ui/base';

const CarComparePage = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetCarsQuery();
  
  const [selectedCar1, setSelectedCar1] = useState<Car | null>(null);
  const [selectedCar2, setSelectedCar2] = useState<Car | null>(null);

  const cars = data?.data || [];
  
  const carOptions = [
    { value: '', label: 'Araç Seçiniz' },
    ...cars.map((car) => ({
      value: car._id,
      label: `${car.brand} ${car.model} (${car.year})`,
    })),
  ];

  const handleCar1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const car = cars.find((c) => c._id === e.target.value);
    setSelectedCar1(car || null);
  };

  const handleCar2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const car = cars.find((c) => c._id === e.target.value);
    setSelectedCar2(car || null);
  };

  if (isLoading) return <Loading message="Araçlar yükleniyor..." />;

  return (
    <Container className="py-8">
      <button
        onClick={() => navigate('/cars')}
        className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Araç Listesine Dön
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Araç Karşılaştır</h1>

      {/* Araç Seçimi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Select
          options={carOptions}
          value={selectedCar1?._id || ''}
          onChange={handleCar1Change}
          label="1. Araç"
          fullWidth
        />
        <Select
          options={carOptions}
          value={selectedCar2?._id || ''}
          onChange={handleCar2Change}
          label="2. Araç"
          fullWidth
        />
      </div>

      {/* Karşılaştırma Tablosu */}
      {selectedCar1 && selectedCar2 ? (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">Özellik</th>
                <th className="px-6 py-4 text-center">{selectedCar1.brand} {selectedCar1.model}</th>
                <th className="px-6 py-4 text-center">{selectedCar2.brand} {selectedCar2.model}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-6 py-4 font-medium">Fiyat</td>
                <td className="px-6 py-4 text-center">₺{selectedCar1.pricePerDay.toLocaleString('tr-TR')}/gün</td>
                <td className="px-6 py-4 text-center">₺{selectedCar2.pricePerDay.toLocaleString('tr-TR')}/gün</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Koltuk</td>
                <td className="px-6 py-4 text-center">{selectedCar1.seats} Kişi</td>
                <td className="px-6 py-4 text-center">{selectedCar2.seats} Kişi</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Vites</td>
                <td className="px-6 py-4 text-center">{selectedCar1.transmission === 'automatic' ? 'Otomatik' : 'Manuel'}</td>
                <td className="px-6 py-4 text-center">{selectedCar2.transmission === 'automatic' ? 'Otomatik' : 'Manuel'}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Yakıt</td>
                <td className="px-6 py-4 text-center">{selectedCar1.fuelType}</td>
                <td className="px-6 py-4 text-center">{selectedCar2.fuelType}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600">Karşılaştırmak için iki araç seçin</p>
        </div>
      )}
    </Container>
  );
};

export default CarComparePage;