import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetCarByIdQuery } from '../api/carsApi';
import { Loading, ErrorMessage } from '../../../shared/components/ui/feedback';
import Container from '../../../shared/components/layout/Container';
import type { RootState } from '../../../app/store';

const CarDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading, error } = useGetCarByIdQuery(id!);

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/cars/${id}` } });
      return;
    }

    if (!startDate || !endDate) {
      alert('Lütfen alış ve teslim tarihlerini seçin');
      return;
    }

    navigate(`/booking/create/${id}?startDate=${startDate}&endDate=${endDate}`);
  };

  if (isLoading) {
    return <Loading message="Araç bilgileri yükleniyor..." />;
  }

  if (error || !data?.data) {
    return (
      <Container>
        <ErrorMessage
          title="Araç Bulunamadı"
          message="Aradığınız araç bulunamadı veya kaldırılmış olabilir."
          onRetry={() => navigate('/cars')}
        />
      </Container>
    );
  }

  const car = data.data;

  const getStatusBadge = (status: string) => {
    const badges = {
      available: { text: 'Müsait', color: 'bg-green-100 text-green-800' },
      rented: { text: 'Kiralandı', color: 'bg-yellow-100 text-yellow-800' },
      maintenance: { text: 'Bakımda', color: 'bg-red-100 text-red-800' },
    };
    return badges[status as keyof typeof badges] || badges.available;
  };

  const statusBadge = getStatusBadge(car.status);

  // Gün sayısı ve toplam fiyat hesaplama
  const calculatePrice = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days * car.pricePerDay : 0;
  };

  const totalPrice = calculatePrice();
  const days = startDate && endDate 
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Container>
      <div className="py-8">
        {/* Geri Butonu */}
        <button
          onClick={() => navigate('/cars')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Araçlara Dön
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon - Görseller ve Bilgiler */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ana Görsel */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {car.images && car.images.length > 0 ? (
                <>
                  <img
                    src={car.images[selectedImage]}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-96 object-cover"
                  />
                  {car.images.length > 1 && (
                    <div className="p-4 grid grid-cols-4 gap-2">
                      {car.images.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`relative aspect-video rounded-lg overflow-hidden ${
                            selectedImage === index ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${car.brand} ${car.model} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Görsel Yok</span>
                </div>
              )}
            </div>

            {/* Araç Bilgileri */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {car.brand} {car.model}
                  </h1>
                  <p className="text-gray-600">{car.year} Model</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusBadge.color}`}>
                  {statusBadge.text}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {car.seats} Kişi
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {car.transmission === 'automatic' ? 'Otomatik' : 'Manuel'}
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {car.fuelType}
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  {car.doors} Kapı
                </div>
              </div>

              {/* Özellikler */}
              {car.features && car.features.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Özellikler</h3>
                  <div className="flex flex-wrap gap-2">
                    {car.features.map((feature: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Lokasyon */}
              <div className="border-t mt-4 pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Lokasyon</h3>
                <div className="flex items-start text-gray-600">
                  <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">{car.location.branch}</p>
                    {car.location.address && (
                      <p className="text-sm">{car.location.address}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Kolon - Rezervasyon Formu */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-bold text-blue-600">
                    {car.pricePerDay} {car.currency}
                  </span>
                  <span className="text-gray-600">/gün</span>
                </div>
                <p className="text-sm text-gray-500">Kilometre sınırsız</p>
              </div>

              {car.status === 'available' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alış Tarihi
                    </label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teslim Tarihi
                    </label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {days > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>{car.pricePerDay} {car.currency} x {days} gün</span>
                        <span className="font-semibold">{totalPrice} {car.currency}</span>
                      </div>
                      <div className="border-t border-blue-200 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Toplam</span>
                          <span className="text-xl font-bold text-blue-600">
                            {totalPrice} {car.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleBooking}
                    disabled={!startDate || !endDate}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Rezervasyon Yap
                  </button>

                  {!isAuthenticated && (
                    <p className="text-xs text-center text-gray-500">
                      Rezervasyon yapmak için{' '}
                      <Link to="/login" className="text-blue-600 hover:underline">
                        giriş yapın
                      </Link>
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600 font-medium">Bu araç şu an müsait değil</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {car.status === 'rented' ? 'Araç kiralanmış durumda' : 'Araç bakımda'}
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Önemli Bilgiler</h4>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Ücretsiz iptal (48 saat öncesine kadar)
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Hasar sigortası dahil
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    7/24 yol yardımı
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Sürücü yaşı: En az 21
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CarDetail;