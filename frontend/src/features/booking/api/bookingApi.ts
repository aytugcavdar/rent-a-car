import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../app/store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Booking {
  _id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  pickupLocation: {
    branch: string;
    address?: string;
  };
  returnLocation: {
    branch: string;
    address?: string;
  };
  paymentInfo: {
    method: string;
    transactionId?: string;
    status: string;
  };
  notes?: string;
  car?: any; // Araç bilgisi backend'den gelecek
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDto {
  carId: string;
  startDate: string;
  endDate: string;
  pickupLocation: {
    branch: string;
    address?: string;
  };
  returnLocation: {
    branch: string;
    address?: string;
  };
  paymentInfo: {
    method: string;
  };
  notes?: string;
}

export interface BookingListResponse {
  success: boolean;
  data: {
    bookings: Booking[];
    totalPages: number;
    currentPage: number;
    total: number;
  };
  message: string;
}

export interface BookingResponse {
  success: boolean;
  data: Booking;
  message: string;
}

export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/bookings`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Booking', 'UserBookings', 'AdminBookings'],
  endpoints: (builder) => ({
    // Kullanıcı Endpoints
    createBooking: builder.mutation<BookingResponse, CreateBookingDto>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserBookings'],
    }),

    getUserBookings: builder.query<BookingListResponse, { status?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/',
        params,
      }),
      providesTags: ['UserBookings'],
    }),

    getBookingById: builder.query<BookingResponse, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Booking', id }],
    }),

    cancelBooking: builder.mutation<BookingResponse, string>({
      query: (id) => ({
        url: `/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Booking', id },
        'UserBookings',
        'AdminBookings',
      ],
    }),

    // Admin Endpoints
    getAllBookings: builder.query<BookingListResponse, { status?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/admin/all',
        params,
      }),
      providesTags: ['AdminBookings'],
    }),

    updateBookingStatus: builder.mutation<BookingResponse, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Booking', id },
        'AdminBookings',
        'UserBookings',
      ],
    }),

    deleteBooking: builder.mutation<BookingResponse, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminBookings'],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetUserBookingsQuery,
  useGetBookingByIdQuery,
  useCancelBookingMutation,
  useGetAllBookingsQuery,
  useUpdateBookingStatusMutation,
  useDeleteBookingMutation,
} = bookingApi;