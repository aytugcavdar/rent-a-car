import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCarByIdQuery } from '../api/carsApi';
import { Container } from '../../../shared/components/layout';
import { Loading, ErrorMessage } from '../../../shared/components/ui/feedback';
import { Button } from '../../../shared/components/ui/base';
import { useAppSelector } from '../../../app/hooks';

const CarDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { data, isLoading, error } = useGetCarByIdQuery(id!);

  const car = data?.data;

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/cars/${id}` } });
      return;
    }
    navigate(`/bookings/new?carId=${id}`);
  };

  if (isLoading) return <Loading message="Araç detayları yükleniyor..." />;

  if (error || !car) {
    return (
      <Container>
        <ErrorMessage
          title="Araç Bulunamadı"
          message="Aradığınız araç bulunamadı."
          onRetry={() => navigate('/cars')}
        />
      </Container>
    );
  }

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Araç görseli ve detayları burada */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold mb-4">
              {car.brand} {car.model}
            </h1>
            <p className="text-gray-600 mb-6">{car.year} Model</p>
            
            {/* Görsel galerisi */}
            {car.images && car.images.length > 0 && (
              <div className="mb-6">
                <img
                  src={car.images[selectedImageIndex]}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-96 object-cover rounded-lg"
                />
                <div className="flex gap-2 mt-4">
                  {car.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-20 h-20 rounded border-2 ${
                        selectedImageIndex === idx ? 'border-blue-600' : 'border-gray-200'
                      }`}
                    >
                      <img src={img} alt={`${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Özellikler */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded">
                <p className="text-2xl font-bold">{car.seats}</p>
                <p className="text-sm text-gray-600">Kişi</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <p className="text-sm font-semibold">{car.transmission === 'automatic' ? 'Otomatik' : 'Manuel'}</p>
                <p className="text-sm text-gray-600">Vites</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <p className="text-sm font-semibold">{car.fuelType === 'gasoline' ? 'Benzin' : 'Dizel'}</p>
                <p className="text-sm text-gray-600">Yakıt</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <p className="text-sm font-semibold">{car.mileage.toLocaleString('tr-TR')} km</p>
                <p className="text-sm text-gray-600">Kilometre</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rezervasyon Kartı */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <div className="text-4xl font-bold text-blue-600 mb-4">
              ₺{car.pricePerDay.toLocaleString('tr-TR')}
              <span className="text-sm text-gray-500 block">/ günlük</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={car.status !== 'available'}
              onClick={handleBooking}
            >
              {car.status === 'available' ? 'Rezervasyon Yap' : 'Müsait Değil'}
            </Button>

            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <p>✓ Sigorta dahil</p>
              <p>✓ Ücretsiz iptal</p>
              <p>✓ 7/24 yol yardım</p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CarDetail;