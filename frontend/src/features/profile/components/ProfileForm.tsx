import { useState } from 'react';
import { useUpdateProfileMutation } from '../api/profileApi';
import { Input } from '../../../shared/components/ui/base';
import Button from '../../../shared/components/ui/base/Button';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../../../app/hooks';
import { updateProfileData } from '../slice/profileSlice';

interface User {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
}

interface ProfileFormProps {
  user: User;
}

const ProfileForm = ({ user }: ProfileFormProps) => {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const dispatch = useAppDispatch();
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    surname: user.surname || '',
    phone: user.phone || '',
    address: user.address || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Hata mesajını temizle
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'İsim alanı zorunludur';
    }

    if (!formData.surname.trim()) {
      newErrors.surname = 'Soyisim alanı zorunludur';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası zorunludur';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone)) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Adres alanı zorunludur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Lütfen tüm alanları doğru şekilde doldurunuz.');
      return;
    }

    try {
      const result = await updateProfile(formData).unwrap();
      
      // Redux store'u güncelle - updateProfileData kullan
      dispatch(updateProfileData({
        name: result.data.name,
        surname: result.data.surname,
        phone: result.data.phone,
        address: result.data.address,
      }));

      toast.success('Profil bilgileriniz başarıyla güncellendi!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error?.data?.message || 'Profil güncellenirken bir hata oluştu.');
    }
  };

  const hasChanges = 
    formData.name !== user.name ||
    formData.surname !== user.surname ||
    formData.phone !== user.phone ||
    formData.address !== user.address;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="İsim"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          fullWidth
        />

        <Input
          label="Soyisim"
          name="surname"
          value={formData.surname}
          onChange={handleChange}
          error={errors.surname}
          required
          fullWidth
        />
      </div>

      <Input
        label="E-posta"
        name="email"
        type="email"
        value={user.email}
        disabled
        helperText="E-posta adresi değiştirilemez"
        fullWidth
      />

      <Input
        label="Telefon"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
        placeholder="+90 555 555 55 55"
        required
        fullWidth
      />

      <Input
        label="Adres"
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
        required
        fullWidth
      />

      <div className="flex items-center justify-end space-x-4 pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setFormData({
            name: user.name,
            surname: user.surname,
            phone: user.phone,
            address: user.address,
          })}
          disabled={!hasChanges || isLoading}
        >
          İptal
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!hasChanges || isLoading}
        >
          Değişiklikleri Kaydet
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;