import { useRef, useState } from 'react';
import { useUploadAvatarMutation } from '../api/profileApi';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { updateUser } from '../../auth/slice/authSlice';
import { updateAvatar } from '../slice/profileSlice';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
}

const AvatarUpload = ({ currentAvatar, userName }: AvatarUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadAvatar, { isLoading }] = useUploadAvatarMutation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır.');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      toast.error('Sadece resim dosyaları yüklenebilir.');
      return;
    }

    // Önizleme oluştur
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload işlemi
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const result = await uploadAvatar(formData).unwrap();
      
      // Redux store'ları güncelle
      dispatch(updateUser({ 
        ...authUser!,
        avatarUrl: result.data.avatarUrl 
      }));
      
      dispatch(updateAvatar(result.data.avatarUrl));

      toast.success('Profil resmi başarıyla güncellendi!');
      setPreviewUrl(null);
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error?.data?.message || 'Profil resmi yüklenirken bir hata oluştu.');
      setPreviewUrl(null);
    }
  };

  const displayAvatar = previewUrl || currentAvatar || `https://ui-avatars.com/api/?name=${userName}&background=random&size=128`;

  return (
    <div className="relative">
      <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
        <img
          src={displayAvatar}
          alt={userName}
          className="w-full h-full object-cover"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Profil resmini değiştir"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;