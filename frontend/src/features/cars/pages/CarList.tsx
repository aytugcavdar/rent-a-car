import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetCarsQuery, type CarFilters } from '../api/carsApi';
import { Container } from '../../../shared/components/layout';
import { Loading, ErrorMessage } from '../../../shared/components/ui/feedback';
import { Input, Select, Button } from '../../../shared/components/ui/base';

const CarList = () => {
  const [filters, setFilters] = useState<CarFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useGetCarsQuery(filters);

  const categoryOptions = [
    { value: '', label: 'Tüm Kategoriler' },
    { value: 'economy', label: 'Ekonomi' },
    { value: 'compact', label: 'Kompakt' },
    { value: 'suv', label: 'SUV' },
    { value: 'luxury', label: 'Lüks' },
  ];

  const transmissionOptions = [
    { value: '', label: 'Tüm Vites Tipleri' },
    { value: 'manual', label: 'Manuel' },
    { value: 'automatic', label: 'Otomatik' },
  ];

  const handleFilterChange = (key: keyof CarFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const filteredCars = data?.data.filter((car) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      car.brand.toLowerCase().includes(search) ||
      car.model.toLowerCase().includes(search)
    );
  });

  if (isLoading) return <Loading message="Araçlar yükleniyor..." />;

  if (error) {
    return (
      <Container>
        <ErrorMessage
          title="Araçlar Yüklenemedi"
          message="Araç listesi yüklenirken bir hata oluştu."
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Araç Kiralama</h1>
        <p className="text-gray-600">{data?.data.length} araç bulundu</p>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filtrele</h2>
          {/* Karşılaştırma sayfası linki */}
          <Link 
            to="/cars/compare" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Araçları Karşılaştır
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="text"
            placeholder="Marka veya model ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />

          <Select
            options={categoryOptions}
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            fullWidth
          />

          <Select
            options={transmissionOptions}
            value={filters.transmission || ''}
            onChange={(e) => handleFilterChange('transmission', e.target.value)}
            fullWidth
          />
        </div>

        {(Object.keys(filters).length > 0 || searchTerm) && (
          <div className="mt-4">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Filtreleri Temizle
            </Button>
          </div>
        )}
      </div>

      {/* Araç Kartları */}
      {filteredCars && filteredCars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <Link
              key={car._id}
              to={`/cars/${car._id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 bg-gray-200">
                {car.images && car.images.length > 0 ? (
                  <img
                    src={car.images[0]}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                )}
                
                {car.status !== 'available' && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                    Müsait Değil
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {car.brand} {car.model}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{car.year}</p>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>{car.seats} Kişi</span>
                  <span>{car.transmission === 'automatic' ? 'Otomatik' : 'Manuel'}</span>
                  <span>{car.fuelType === 'gasoline' ? 'Benzin' : 'Dizel'}</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        ₺{car.pricePerDay.toLocaleString('tr-TR')}
                      </p>
                      <p className="text-sm text-gray-500">/ günlük</p>
                    </div>
                    <Button variant="primary" size="sm">
                      Detaylar
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Araç Bulunamadı</h3>
          <p className="text-gray-600 mb-4">
            Aradığınız kriterlere uygun araç bulunamadı.
          </p>
          <Button variant="primary" onClick={clearFilters}>
            Filtreleri Temizle
          </Button>
        </div>
      )}
    </Container>
  );
};

export default CarList;