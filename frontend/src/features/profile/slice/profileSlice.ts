import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface DriverLicense {
  number: string;
  issuedDate: string;
  expirationDate: string;
}

interface ProfileData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl?: string;
  driverLicense: DriverLicense;
  isEmailVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileState {
  profile: ProfileData | null;
  isEditing: boolean;
  isSaving: boolean;
  isUploadingAvatar: boolean;
  isChangingPassword: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ProfileState = {
  profile: null,
  isEditing: false,
  isSaving: false,
  isUploadingAvatar: false,
  isChangingPassword: false,
  error: null,
  successMessage: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Profil verilerini set et
    setProfile: (state, action: PayloadAction<ProfileData>) => {
      state.profile = action.payload;
      state.error = null;
    },

    // Düzenleme modunu aç/kapat
    setIsEditing: (state, action: PayloadAction<boolean>) => {
      state.isEditing = action.payload;
    },

    // Kaydetme durumu
    setIsSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },

    // Avatar yükleme durumu
    setIsUploadingAvatar: (state, action: PayloadAction<boolean>) => {
      state.isUploadingAvatar = action.payload;
    },

    // Şifre değiştirme durumu
    setIsChangingPassword: (state, action: PayloadAction<boolean>) => {
      state.isChangingPassword = action.payload;
    },

    // Profil güncelle (optimistic update için)
    updateProfileData: (state, action: PayloadAction<Partial<ProfileData>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },

    // Avatar güncelle
    updateAvatar: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.avatarUrl = action.payload;
      }
    },

    // Hata set et
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.successMessage = null;
    },

    // Başarı mesajı set et
    setSuccessMessage: (state, action: PayloadAction<string | null>) => {
      state.successMessage = action.payload;
      state.error = null;
    },

    // State'i temizle
    clearProfileState: (state) => {
      state.profile = null;
      state.isEditing = false;
      state.isSaving = false;
      state.isUploadingAvatar = false;
      state.isChangingPassword = false;
      state.error = null;
      state.successMessage = null;
    },

    // Mesajları temizle
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
});

export const {
  setProfile,
  setIsEditing,
  setIsSaving,
  setIsUploadingAvatar,
  setIsChangingPassword,
  updateProfileData,
  updateAvatar,
  setError,
  setSuccessMessage,
  clearProfileState,
  clearMessages,
} = profileSlice.actions;

export default profileSlice.reducer;