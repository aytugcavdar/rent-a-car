import { useForm } from 'react-hook-form';
import { Input, Select, Textarea, Button } from '../../../shared/components/ui/base';
import type { CreateBookingDto } from '../api/bookingApi';

interface BookingFormProps {
  onSubmit: (data: CreateBookingDto) => void;
  isLoading?: boolean;
  initialData?: Partial<CreateBookingDto>;
  carId: string;
}

const BookingForm = ({ onSubmit, isLoading, initialData, carId }: BookingFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateBookingDto>({
    defaultValues: {
      carId,
      startDate: initialData?.startDate || '',
      endDate: initialData?.endDate || '',
      pickupLocation: {
        branch: initialData?.pickupLocation?.branch || '',
        address: initialData?.pickupLocation?.address || '',
      },
      returnLocation: {
        branch: initialData?.returnLocation?.branch || '',
        address: initialData?.returnLocation?.address || '',
      },
      paymentInfo: {
        method: initialData?.paymentInfo?.method || 'credit_card',
      },
      notes: initialData?.notes || '',
    },
  });

  const startDate = watch('startDate');

  const branches = [
    { value: '', label: 'Şube Seçiniz' },
    { value: 'İstanbul Atatürk Havalimanı', label: 'İstanbul Atatürk Havalimanı' },
    { value: 'İstanbul Sabiha Gökçen Havalimanı', label: 'İstanbul Sabiha Gökçen Havalimanı' },
    { value: 'Ankara Esenboğa Havalimanı', label: 'Ankara Esenboğa Havalimanı' },
    { value: 'İzmir Adnan Menderes Havalimanı', label: 'İzmir Adnan Menderes Havalimanı' },
    { value: 'Antalya Havalimanı', label: 'Antalya Havalimanı' },
    { value: 'Bodrum Milas Havalimanı', label: 'Bodrum Milas Havalimanı' },
    { value: 'Dalaman Havalimanı', label: 'Dalaman Havalimanı' },
    { value: 'Trabzon Havalimanı', label: 'Trabzon Havalimanı' },
  ];

  const paymentMethods = [
    { value: 'credit_card', label: 'Kredi Kartı' },
    { value: 'debit_card', label: 'Banka Kartı' },
    { value: 'cash', label: 'Nakit (Teslimatta Ödeme)' },
    { value: 'bank_transfer', label: 'Havale/EFT' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tarih Bilgileri */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Tarih Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Alış Tarihi ve Saati"
            type="datetime-local"
            {...register('startDate', {
              required: 'Alış tarihi gereklidir',
              validate: (value) => {
                const selectedDate = new Date(value);
                const now = new Date();
                return selectedDate > now || 'Alış tarihi gelecekte olmalıdır';
              },
            })}
            error={errors.startDate?.message}
            fullWidth
          />
          <Input
            label="Teslim Tarihi ve Saati"
            type="datetime-local"
            {...register('endDate', {
              required: 'Teslim tarihi gereklidir',
              validate: (value) => {
                const start = new Date(startDate);
                const end = new Date(value);
                if (end <= start) {
                  return 'Teslim tarihi alış tarihinden sonra olmalıdır';
                }
                const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                if (diffHours < 24) {
                  return 'Minimum kiralama süresi 24 saattir';
                }
                return true;
              },
            })}
            error={errors.endDate?.message}
            fullWidth
          />
        </div>
      </div>

      {/* Alış Lokasyonu */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Alış Yeri
        </h3>
        <div className="space-y-4">
          <Select
            label="Şube"
            {...register('pickupLocation.branch', {
              required: 'Alış şubesi seçilmelidir',
            })}
            options={branches}
            error={errors.pickupLocation?.branch?.message}
            fullWidth
          />
          <Input
            label="Detaylı Adres (Opsiyonel)"
            {...register('pickupLocation.address')}
            placeholder="Örn: Terminal 1, Dış Hatlar Giriş Kapısı"
            helperText="Şube içinde veya çevresinde özel bir buluşma noktası belirtebilirsiniz"
            fullWidth
          />
        </div>
      </div>

      {/* Teslim Lokasyonu */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Teslim Yeri
        </h3>
        <div className="space-y-4">
          <Select
            label="Şube"
            {...register('returnLocation.branch', {
              required: 'Teslim şubesi seçilmelidir',
            })}
            options={branches}
            error={errors.returnLocation?.branch?.message}
            fullWidth
          />
          <Input
            label="Detaylı Adres (Opsiyonel)"
            {...register('returnLocation.address')}
            placeholder="Örn: Otopark Giriş Katı"
            helperText="Şube içinde veya çevresinde özel bir teslim noktası belirtebilirsiniz"
            fullWidth
          />
        </div>
      </div>

      {/* Ödeme Bilgileri */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Ödeme Bilgileri
        </h3>
        <Select
          label="Ödeme Yöntemi"
          {...register('paymentInfo.method', {
            required: 'Ödeme yöntemi seçilmelidir',
          })}
          options={paymentMethods}
          error={errors.paymentInfo?.method?.message}
          helperText="Ödeme işlemi rezervasyon onayından sonra gerçekleştirilecektir"
          fullWidth
        />
      </div>

      {/* Notlar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Ek Notlar ve Talepler
        </h3>
        <Textarea
          label="Notlarınız (Opsiyonel)"
          {...register('notes')}
          placeholder="Özel taleplerinizi buraya yazabilirsiniz. Örn: Bebek koltuğu, GPS, ek sürücü vs."
          rows={4}
          helperText="Özel talepleriniz fiyata ek ücret getirebilir"
          fullWidth
        />
      </div>

      {/* Önemli Bilgiler */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Rezervasyon Koşulları
        </h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Sürücünün en az 21 yaşında ve en az 2 yıllık ehliyete sahip olması gerekmektedir
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Araç teslimi sırasında geçerli kimlik ve ehliyet ibraz edilmelidir
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Rezervasyonunuzu başlangıçtan 48 saat öncesine kadar ücretsiz iptal edebilirsiniz
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Araç temiz ve yakıt deposu dolu olarak teslim alınır, aynı şekilde teslim edilmelidir
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Trafik cezaları sürücünün sorumluluğundadır
          </li>
        </ul>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          fullWidth
        >
          Rezervasyonu Onayla
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;