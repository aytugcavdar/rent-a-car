// frontend/src/features/admin/pages/EditCarPage.tsx
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useGetCarByIdQuery, useUpdateCarMutation } from '../../cars/api/carsApi';
import { Loading, ErrorMessage } from '../../../shared/components/ui/feedback';
import CarForm from '../../cars/components/forms/CarForm';
import type { CreateCarDto } from '../../cars/api/carsApi';

const EditCarPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: carData, isLoading, error } = useGetCarByIdQuery(id!);
  const [updateCar, { isLoading: isUpdating }] = useUpdateCarMutation();

  const handleSubmit = async (data: CreateCarDto) => {
    try {
      await updateCar({ id: id!, data }).unwrap();
      toast.success('Araç başarıyla güncellendi!');
      navigate('/admin/cars');
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Araç güncellenirken bir hata oluştu.';
      toast.error(errorMessage);
      console.error('Araç güncelleme hatası:', error);
    }
  };

  if (isLoading) {
    return <Loading message="Araç bilgileri yükleniyor..." />;
  }

  if (error || !carData?.data) {
    return (
      <ErrorMessage
        title="Araç Bulunamadı"
        message="Düzenlemek istediğiniz araç bulunamadı."
        onRetry={() => navigate('/admin/cars')}
      />
    );
  }

  const car = carData.data;

  // API'den gelen veriyi form formatına dönüştür
  const initialData: Partial<CreateCarDto> = {
    brand: car.brand,
    model: car.model,
    year: car.year,
    plateNumber: car.plateNumber,
    category: car.category,
    fuelType: car.fuelType,
    transmission: car.transmission,
    seats: car.seats,
    doors: car.doors,
    pricePerDay: car.pricePerDay,
    currency: car.currency,
    mileage: car.mileage,
    features: car.features,
    location: {
      branch: car.location.branch,
      address: car.location.address,
    },
    insurance: {
      company: car.insurance?.company,
      policyNumber: car.insurance?.policyNumber,
      expiryDate: car.insurance?.expiryDate,
    },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Araç Düzenle: {car.brand} {car.model}
        </h1>
        <p className="text-gray-600">Araç bilgilerini güncelleyin</p>
      </div>

      <CarForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isUpdating}
        submitButtonText="Değişiklikleri Kaydet"
      />
    </div>
  );
};

export default EditCarPage;