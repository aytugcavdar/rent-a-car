// frontend/src/features/admin/pages/UserManagement.tsx
import { useGetUsersQuery } from '../../auth/api/authApi';
import { Loading, ErrorMessage } from '../../../shared/components/ui/feedback';
import UserTable from '../components/UserTable'; // UserTable bileşenini import ediyoruz

const UserManagementPage = () => {
  // RTK Query ile kullanıcı verilerini çekiyoruz
  const { data: usersData, isLoading, error } = useGetUsersQuery();

  if (isLoading) return <Loading message="Kullanıcılar yükleniyor..." />;
  if (error) return <ErrorMessage title="Hata" message="Kullanıcılar yüklenemedi." />;

  const users = usersData?.data || [];

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Kullanıcı Yönetimi</h1>
      
      {/* Veriyi UserTable bileşenine prop olarak iletiyoruz */}
      <UserTable users={users} />
    </>
  );
};

export default UserManagementPage;