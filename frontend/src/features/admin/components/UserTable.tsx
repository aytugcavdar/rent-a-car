import type { User } from '../../auth/api/authApi';

interface UserTableProps {
  users: User[];
}

const UserTable = ({ users }: UserTableProps) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad Soyad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doğrulama</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id}>
              <td className="px-6 py-4 text-sm font-medium">{user.name} {user.surname}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{user.role}</td>
              <td className="px-6 py-4 text-sm">
                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                      {user.isEmailVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                 </span>
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium">
                <button className="text-indigo-600 hover:text-indigo-900">Düzenle</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;