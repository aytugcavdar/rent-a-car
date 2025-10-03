// frontend/src/features/admin/pages/CarManagement.tsx
import { Link } from 'react-router-dom';
import { useGetCarsQuery, useDeleteCarMutation } from '../../cars/api/carsApi';
import { Loading, ErrorMessage } from '../../../shared/components/ui/feedback';
import { Button } from '../../../shared/components/ui/base';
import { toast } from 'react-hot-toast';
import CarTable from '../components/CarTable'; // CarTable bileşenini import ediyoruz

const CarManagementPage = () => {
  // RTK Query ile verileri ve fonksiyonları çekiyoruz
  const { data: carsData, isLoading, error } = useGetCarsQuery();
  const [deleteCar, { isLoading: isDeleting }] = useDeleteCarMutation();

  // Silme işlemini yönetecek fonksiyon
  const handleDeleteCar = async (id: string, plate: string) => {
    if (window.confirm(`${plate} plakalı aracı silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteCar(id).unwrap();
        toast.success('Araç başarıyla silindi.');
      } catch (err) {
        toast.error('Araç silinirken bir hata oluştu.');
      }
    }
  };

  if (isLoading) return <Loading message="Araçlar yükleniyor..." />;
  if (error) return <ErrorMessage title="Hata" message="Araçlar yüklenemedi." />;

  const cars = carsData?.data || [];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Araç Yönetimi</h1>
        <Button as={Link} to="/admin/car-management/new" variant="primary">
          Yeni Araç Ekle
        </Button>
      </div>

      {/* Veriyi ve fonksiyonu CarTable bileşenine prop olarak iletiyoruz */}
      <CarTable 
        cars={cars} 
        onDelete={handleDeleteCar} 
        isDeleting={isDeleting} 
      />
    </>
  );
};

export default CarManagementPage;