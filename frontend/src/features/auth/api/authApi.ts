import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../../../app/store'

// API Response Types
interface User {
  _id: string
  name: string
  surname: string
  email: string
  role: 'customer' | 'admin'
  phone: string
  avatarUrl?: string
  isEmailVerified: boolean
}

interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  name: string
  surname: string
  email: string
  password: string
  phone: string
  address: string
  driverLicense: {
    number: string
    issuedDate: string
    expirationDate: string
  }
  avatar?: File
}

interface VerifyEmailRequest {
  email: string
  token: string
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/auth',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Register
    register: builder.mutation<AuthResponse, FormData>({
      query: (formData) => ({
        url: '/register',
        method: 'POST',
        body: formData,
      }),
    }),

    // Verify Email
    verifyEmail: builder.mutation<AuthResponse, VerifyEmailRequest>({
      query: (data) => ({
        url: '/verify-email',
        method: 'POST',
        body: data,
      }),
    }),

    // Resend Verification Email
    resendVerification: builder.mutation<AuthResponse, { email: string }>({
      query: (data) => ({
        url: '/resend-verification',
        method: 'POST',
        body: data,
      }),
    }),

    // Get Current User
    getMe: builder.query<AuthResponse, void>({
      query: () => '/me',
      providesTags: ['Auth'],
    }),

    // Logout
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi