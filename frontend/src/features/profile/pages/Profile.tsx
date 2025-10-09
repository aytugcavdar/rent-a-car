import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetProfileQuery } from '../api/profileApi';
import { Loading, ErrorMessage } from '../../../shared/components/ui/feedback';
import Container from '../../../shared/components/layout/Container';
import AvatarUpload from '../components/AvatarUpload';
import ProfileForm from '../components/ProfileForm';
import PasswordChangeForm from '../components/PasswordChangeForm';

const Profile = () => {
  const { data, isLoading, error } = useGetProfileQuery();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  if (isLoading) {
    return <Loading fullScreen message="Profil bilgileri yükleniyor..." />;
  }

  if (error || !data?.data) {
    return (
      <Container className="py-8">
        <ErrorMessage
          message="Profil bilgileri yüklenirken bir hata oluştu."
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }

  const user = data.data;

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profilim</h1>
              <p className="text-gray-600 mt-2">
                Hesap bilgilerinizi görüntüleyin ve güncelleyin
              </p>
            </div>
            <Link
              to="/profile/edit"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536M9 11l6.232-6.232a2 2 0 112.828 2.828L11.828 13.828a2 2 0 01-1.414.586H7v-3a1 1 0 011-1h1z"
                />
              </svg>
              Düzenle
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* User Info Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <AvatarUpload currentAvatar={user.avatarUrl} userName={user.name} />
              <div className="text-white">
                <h2 className="text-2xl font-bold">
                  {user.name} {user.surname}
                </h2>
                <p className="text-blue-100">{user.email}</p>
                <div className="flex items-center mt-2">
                  {user.isEmailVerified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      E-posta Doğrulandı
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      E-posta Doğrulanmadı
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profil Bilgileri
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'password'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Şifre Değiştir
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' ? (
              <ProfileForm user={user} />
            ) : (
              <PasswordChangeForm />
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Driver License Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ehliyet Bilgileri
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600">Ehliyet No</dt>
                <dd className="text-base font-medium text-gray-900">
                  {user.driverLicense.number}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Verilme Tarihi</dt>
                <dd className="text-base font-medium text-gray-900">
                  {new Date(user.driverLicense.issuedDate).toLocaleDateString('tr-TR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Geçerlilik Tarihi</dt>
                <dd className="text-base font-medium text-gray-900">
                  {new Date(user.driverLicense.expirationDate).toLocaleDateString('tr-TR')}
                </dd>
              </div>
            </dl>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hesap Bilgileri
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600">Hesap Türü</dt>
                <dd className="text-base font-medium text-gray-900">
                  {user.role === 'admin' ? 'Yönetici' : 'Müşteri'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Üyelik Tarihi</dt>
                <dd className="text-base font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Son Güncelleme</dt>
                <dd className="text-base font-medium text-gray-900">
                  {new Date(user.updatedAt).toLocaleDateString('tr-TR')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Profile;
