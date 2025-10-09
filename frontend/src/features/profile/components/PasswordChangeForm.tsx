import { useState } from 'react';
import { useChangePasswordMutation } from '../api/profileApi';
import { Input } from '../../../shared/components/ui/base';
import Button from '../../../shared/components/ui/base/Button';
import toast from 'react-hot-toast';

const PasswordChangeForm = () => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

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

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Mevcut şifre zorunludur';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Yeni şifre zorunludur';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Şifre en az 8 karakter olmalıdır';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı zorunludur';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Yeni şifre mevcut şifreden farklı olmalıdır';
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
      await changePassword(formData).unwrap();
      
      toast.success('Şifreniz başarıyla değiştirildi!');
      
      // Formu temizle
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error?.data?.message || 'Şifre değiştirilirken bir hata oluştu.');
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const labels = ['', 'Çok Zayıf', 'Zayıf', 'Orta', 'Güçlü', 'Çok Güçlü'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];

    return {
      strength: (strength / 5) * 100,
      label: labels[strength],
      color: colors[strength]
    };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Güvenli şifre oluşturma önerileri:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>En az 8 karakter uzunluğunda olmalı</li>
              <li>Büyük ve küçük harfler içermeli</li>
              <li>En az bir rakam içermeli</li>
              <li>Özel karakterler kullanın (!@#$%^&*)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative">
        <Input
          label="Mevcut Şifre"
          name="currentPassword"
          type={showPasswords.current ? 'text' : 'password'}
          value={formData.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
          required
          fullWidth
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility('current')}
          className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
        >
          {showPasswords.current ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>

      <div className="relative">
        <Input
          label="Yeni Şifre"
          name="newPassword"
          type={showPasswords.new ? 'text' : 'password'}
          value={formData.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          required
          fullWidth
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility('new')}
          className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
        >
          {showPasswords.new ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
        
        {formData.newPassword && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Şifre Gücü:</span>
              <span className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                style={{ width: `${passwordStrength.strength}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <Input
          label="Yeni Şifre (Tekrar)"
          name="confirmPassword"
          type={showPasswords.confirm ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
          fullWidth
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility('confirm')}
          className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
        >
          {showPasswords.confirm ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setFormData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
            setErrors({});
          }}
          disabled={isLoading}
        >
          İptal
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Şifreyi Değiştir
        </Button>
      </div>
    </form>
  );
};

export default PasswordChangeForm;