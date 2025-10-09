import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../app/store';


interface UpdateProfileData {
  name?: string;
  surname?: string;
  phone?: string;
  address?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface User {
  _id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl?: string;
  role: string;
  driverLicense: {
    number: string;
    issuedDate: string;
    expirationDate: string;
  };
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  }

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/auth`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    // Kullanıcı bilgilerini getir
    getProfile: builder.query<{ success: boolean; data: User }, void>({
      query: () => '/me',
      providesTags: ['Profile'],
    }),

    // Profil bilgilerini güncelle
    updateProfile: builder.mutation<{ success: boolean; data: User }, UpdateProfileData>({
      query: (data) => ({
        url: '/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Avatar yükle
    uploadAvatar: builder.mutation<{ success: boolean; data: { avatarUrl: string } }, FormData>({
      query: (formData) => ({
        url: '/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Şifre değiştir
    changePassword: builder.mutation<{ success: boolean; message: string }, ChangePasswordData>({
      query: (data) => ({
        url: '/change-password',
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useChangePasswordMutation,
} = profileApi;