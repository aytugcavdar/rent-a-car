// frontend/src/features/booking/pages/CreateBooking.tsx
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useCreateBookingMutation } from '../api/bookingApi';
import { useGetCarByIdQuery } from '../../cars/api/carsApi';
import { Loading, ErrorMessage } from '../../../shared/components/ui/feedback';
import { Input, Select, Textarea, Button } from '../../../shared/components/ui/base';
import Container from '../../../shared/components/layout/Container';
import type { CreateBookingDto } from '../api/bookingApi';

const CreateBooking = () => {
  const { carId } = useParams<{ carId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // URL'den tarih bilgilerini al
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  const { data: carData, isLoading: carLoading, error: carError } = useGetCarByIdQuery(carId!);
  const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateBookingDto>({
    defaultValues: {
      carId: carId,
      startDate: startDateParam || '',
      endDate: endDateParam || '',
      pickupLocation: {
        branch: '',
        address: '',
      },
      returnLocation: {
        branch: '',
        address: '',
      },
      paymentInfo: {
        method: 'credit_card',
      },
      notes: '',
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Fiyat hesaplama
  const calculateTotalPrice = () => {
    if (!startDate || !endDate || !carData?.data) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return 0;
    
    return days * carData.data.pricePerDay;
  };

  const totalPrice = calculateTotalPrice();
  const days = startDate && endDate 
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const onSubmit = async (data: CreateBookingDto) => {
    try {
      const result = await createBooking(data).unwrap();
      toast.success('Rezervasyon başarıyla oluşturuldu!');
      navigate(`/bookings/${result.data._id}`);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Rezervasyon oluşturulurken bir hata oluştu.');
    }
  };

  if (carLoading) {
    return <Loading message="Araç bilgileri yükleniyor..." />;
  }

  if (carError || !carData?.data) {
    return (
      <Container>
        <ErrorMessage
          title="Araç Bulunamadı"
          message="Rezervasyon yapmak istediğiniz araç bulunamadı."
          onRetry={() => navigate('/cars')}
        />
      </Container>
    );
  }

  const car = carData.data;

  const branches = [
    { value: 'İstanbul Atatürk Havalimanı', label: 'İstanbul Atatürk Havalimanı' },
    { value: 'İstanbul Sabiha Gökçen Havalimanı', label: 'İstanbul Sabiha Gökçen Havalimanı' },
    { value: 'Ankara Esenboğa Havalimanı', label: 'Ankara Esenboğa Havalimanı' },
    { value: 'İzmir Adnan Menderes Havalimanı', label: 'İzmir Adnan Menderes Havalimanı' },
    { value: 'Antalya Havalimanı', label: 'Antalya Havalimanı' },
    { value: 'Bodrum Milas Havalimanı', label: 'Bodrum Milas Havalimanı' },
  ];

  const paymentMethods = [
    { value: 'credit_card', label: 'Kredi Kartı' },
    { value: 'debit_card', label: 'Banka Kartı' },
    { value: 'cash', label: 'Nakit' },
    { value: 'bank_transfer', label: 'Havale/EFT' },
  ];

  return (
    <Container>
      <div className="py-8">
        {/* Başlık */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Geri Dön
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rezervasyon Oluştur</h1>
          <p className="text-gray-600">Aşağıdaki bilgileri doldurun ve rezervasyonunuzu tamamlayın.</p>
        </div>

        {/* Adım Göstergesi */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Tarih ve Lokasyon</span>
            </div>
            <div className="w-24 h-0.5 mx-4 bg-gray-300"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Ödeme Bilgileri</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sol Kolon - Form */}
            <div className="lg:col-span-2">
              {step === 1 && (
                <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Tarih ve Lokasyon Bilgileri</h2>

                  {/* Tarih Seçimi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Alış Tarihi"
                      type="datetime-local"
                      {...register('startDate', {
                        required: 'Alış tarihi gereklidir',
                      })}
                      error={errors.startDate?.message}
                      fullWidth
                    />
                    <Input
                      label="Teslim Tarihi"
                      type="datetime-local"
                      {...register('endDate', {
                        required: 'Teslim tarihi gereklidir',
                        validate: (value) => {
                          const start = new Date(startDate);
                          const end = new Date(value);
                          return end > start || 'Teslim tarihi alış tarihinden sonra olmalıdır';
                        },
                      })}
                      error={errors.endDate?.message}
                      fullWidth
                    />
                  </div>

                  {/* Alış Lokasyonu */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Alış Yeri</h3>
                    <Select
                      label="Şube"
                      {...register('pickupLocation.branch', {
                        required: 'Alış şubesi gereklidir',
                      })}
                      options={branches}
                      error={errors.pickupLocation?.branch?.message}
                      fullWidth
                    />
                    <Input
                      label="Adres (Opsiyonel)"
                      {...register('pickupLocation.address')}
                      placeholder="Detaylı adres bilgisi"
                      fullWidth
                    />
                  </div>

                  {/* Teslim Lokasyonu */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Teslim Yeri</h3>
                    <Select
                      label="Şube"
                      {...register('returnLocation.branch', {
                        required: 'Teslim şubesi gereklidir',
                      })}
                      options={branches}
                      error={errors.returnLocation?.branch?.message}
                      fullWidth
                    />
                    <Input
                      label="Adres (Opsiyonel)"
                      {...register('returnLocation.address')}
                      placeholder="Detaylı adres bilgisi"
                      fullWidth
                    />
                  </div>

                  {/* İleri Butonu */}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => {
                        if (startDate && endDate && watch('pickupLocation.branch') && watch('returnLocation.branch')) {
                          setStep(2);
                        } else {
                          toast.error('Lütfen tüm gerekli alanları doldurun.');
                        }
                      }}
                      variant="primary"
                      size="lg"
                    >
                      İleri
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Ödeme Bilgileri</h2>

                  <Select
                    label="Ödeme Yöntemi"
                    {...register('paymentInfo.method', {
                      required: 'Ödeme yöntemi gereklidir',
                    })}
                    options={paymentMethods}
                    error={errors.paymentInfo?.method?.message}
                    fullWidth
                  />

                  <Textarea
                    label="Notlar (Opsiyonel)"
                    {...register('notes')}
                    placeholder="Rezervasyonunuzla ilgili özel taleplerinizi buraya yazabilirsiniz..."
                    rows={4}
                    fullWidth
                  />

                  {/* Geri ve Rezervasyon Yap Butonları */}
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      variant="ghost"
                      size="lg"
                    >
                      Geri
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isCreating}
                    >
                      Rezervasyonu Tamamla
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Sağ Kolon - Özet */}
            <div className="space-y-6">
              {/* Araç Kartı */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-20">
                {car.images && car.images.length > 0 && (
                  <img
                    src={car.images[0]}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-gray-600 mb-4">{car.plateNumber}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {car.seats} Kişi
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {car.transmission === 'automatic' ? 'Otomatik' : 'Manuel'}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {car.fuelType}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      {car.year}
                    </div>
                  </div>

                  {/* Fiyat Özeti */}
                  <div className="border-t pt-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Günlük Fiyat</span>
                        <span>{car.pricePerDay} {car.currency}</span>
                      </div>
                      {days > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Gün Sayısı</span>
                          <span>{days} gün</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Toplam</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {totalPrice > 0 ? totalPrice.toLocaleString('tr-TR') : '---'} {car.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Önemli Notlar */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2 text-sm">Önemli Bilgiler</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Sürücünün en az 21 yaşında olması gerekir</li>
                      <li>• Geçerli ehliyet ve kimlik gereklidir</li>
                      <li>• Araç temiz ve yakıt deposu dolu teslim edilir</li>
                      <li>• İptal koşulları için sözleşmeyi okuyun</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default CreateBooking;