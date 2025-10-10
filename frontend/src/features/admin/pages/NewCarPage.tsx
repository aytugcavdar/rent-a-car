// frontend/src/features/admin/pages/NewCarPage.tsx
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCreateCarMutation } from '../../cars/api/carsApi';
import CarForm from '../../cars/components/forms/CarForm';
import type { CreateCarDto } from '../../cars/api/carsApi';

const NewCarPage = () => {
  const navigate = useNavigate();
  const [createCar, { isLoading }] = useCreateCarMutation();

  const handleSubmit = async (data: CreateCarDto) => {
    try {
      await createCar(data).unwrap();
      toast.success('Araç başarıyla eklendi!');
      navigate('/admin/cars');
    } catch (error: any) {
      console.log(error);
      const errorMessage = error?.data?.message || 'Araç eklenirken bir hata oluştu.';
      toast.error(errorMessage);
      console.error('Araç ekleme hatası:', error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Yeni Araç Ekle</h1>
        <p className="text-gray-600">Sisteme yeni bir araç ekleyin</p>
      </div>

      <CarForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitButtonText="Aracı Ekle"
      />
    </div>
  );
};

export default NewCarPage;