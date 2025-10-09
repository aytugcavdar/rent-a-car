import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProfileQuery, useUpdateProfileMutation } from '../api/profileApi';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { updateUser } from '../../auth/slice/authSlice';
import { 
  setProfile, 
  setIsEditing, 
  setIsSaving,
  updateProfileData,
  setError,
  setSuccessMessage,
  clearMessages
} from '../slice/profileSlice';
import { Loading, ErrorMessage } from '../../../shared/components/ui/feedback';
import Container from '../../../shared/components/layout/Container';
import { Input } from '../../../shared/components/ui/base';
import Button from '../../../shared/components/ui/base/Button';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data, isLoading: isLoadingProfile, error: fetchError } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  
  const { profile, isSaving, error, successMessage } = useAppSelector((state) => state.profile);
  const authUser = useAppSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    address: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Profil verilerini yükle
  useEffect(() => {
    if (data?.data) {
      dispatch(setProfile(data.data));
      setFormData({
        name: data.data.name || '',
        surname: data.data.surname || '',
        phone: data.data.phone || '',
        address: data.data.address || '',
      });
    }
  }, [data, dispatch]);

  // Düzenleme modunu aç
  useEffect(() => {
    dispatch(setIsEditing(true));
    return () => {
      dispatch(setIsEditing(false));
      dispatch(clearMessages());
    };
  }, [dispatch]);

  // Değişiklikleri kontrol et
  useEffect(() => {
    if (profile) {
      const changed = 
        formData.name !== profile.name ||
        formData.surname !== profile.surname ||
        formData.phone !== profile.phone ||
        formData.address !== profile.address;
      setHasChanges(changed);
    }
  }, [formData, profile]);

  // Başarı mesajı göster
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);
    }
  }, [successMessage, dispatch]);

  // Hata mesajı göster
  useEffect(() => {
    if (error) {
      toast.error(error);
      setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
    }
  }, [error, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Hata mesajını temizle
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'İsim alanı zorunludur';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'İsim en az 2 karakter olmalıdır';
    }

    if (!formData.surname.trim()) {
      errors.surname = 'Soyisim alanı zorunludur';
    } else if (formData.surname.trim().length < 2) {
      errors.surname = 'Soyisim en az 2 karakter olmalıdır';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Telefon numarası zorunludur';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone)) {
      errors.phone = 'Geçerli bir telefon numarası giriniz';
    }

    if (!formData.address.trim()) {
      errors.address = 'Adres alanı zorunludur';
    } else if (formData.address.trim().length < 10) {
      errors.address = 'Adres en az 10 karakter olmalıdır';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      dispatch(setError('Lütfen tüm alanları doğru şekilde doldurunuz.'));
      return;
    }

    if (!hasChanges) {
      toast.info('Değişiklik yapılmadı');
      return;
    }

    dispatch(setIsSaving(true));

    try {
      const result = await updateProfile(formData).unwrap();
      
      // Redux store'ları güncelle
      dispatch(updateProfileData(result.data));
      dispatch(updateUser({
        ...authUser!,
        name: result.data.name,
        surname: result.data.surname,
        phone: result.data.phone,
      }));

      dispatch(setSuccessMessage('Profil bilgileriniz başarıyla güncellendi!'));
      
      // 2 saniye sonra profil sayfasına yönlendir
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err: any) {
      console.error('Profile update error:', err);
      dispatch(setError(err?.data?.message || 'Profil güncellenirken bir hata oluştu.'));
    } finally {
      dispatch(setIsSaving(false));
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm('Değişiklikleri kaydetmeden çıkmak istediğinize emin misiniz?');
      if (!confirmed) return;
    }
    navigate('/profile');
  };

  if (isLoadingProfile) {
    return <Loading fullScreen message="Profil bilgileri yükleniyor..." />;
  }

  if (fetchError || !profile) {
    return (
      <Container className="py-8">
        <ErrorMessage
          message="Profil bilgileri yüklenirken bir hata oluştu."
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profili Düzenle</h1>
              <p className="text-gray-600 mt-2">
                Hesap bilgilerinizi güncelleyin
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Kapat
            </Button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Bilgilendirme:</p>
                  <p className="mt-1">E-posta adresiniz ve ehliyet bilgileriniz güvenlik nedeniyle değiştirilemez.</p>
                </div>
              </div>
            </div>

            {/* Name & Surname */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="İsim"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={formErrors.name}
                required
                fullWidth
                placeholder="Adınızı giriniz"
              />

              <Input
                label="Soyisim"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                error={formErrors.surname}
                required
                fullWidth
                placeholder="Soyadınızı giriniz"
              />
            </div>

            {/* Email (Disabled) */}
            <Input
              label="E-posta"
              name="email"
              type="email"
              value={profile.email}
              disabled
              helperText="E-posta adresi değiştirilemez"
              fullWidth
              icon={
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            {/* Phone */}
            <Input
              label="Telefon"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={formErrors.phone}
              placeholder="+90 555 555 55 55"
              required
              fullWidth
              icon={
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              }
            />

            {/* Address */}
            <Input
              label="Adres"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={formErrors.address}
              placeholder="Tam adresinizi giriniz"
              required
              fullWidth
              icon={
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />

            {/* Change Indicator */}
            {hasChanges && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-yellow-800 font-medium">
                    Kaydedilmemiş değişiklikleriniz var
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={isSaving || isUpdating}
              >
                İptal
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving || isUpdating}
                disabled={!hasChanges || isSaving || isUpdating}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Değişiklikleri Kaydet
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default EditProfile;