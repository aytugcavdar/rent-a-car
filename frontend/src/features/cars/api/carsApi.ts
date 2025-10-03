// frontend/src/features/cars/api/carsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../app/store';


/**
 * ARAÇ TİPLERİ
 * Backend'deki Car modeliyle uyumlu
 */
export interface Car {
  _id: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  category: 'economy' | 'compact' | 'intermediate' | 'standard' | 'premium' | 'luxury' | 'suv' | 'minivan';
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  transmission: 'manual' | 'automatic';
  seats: number;
  doors?: number;
  pricePerDay: number;
  currency: string;
  status: 'available' | 'rented' | 'maintenance' | 'out_of_service';
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  mileage: number;
  features: string[];
  images?: string[];
  location: {
    branch: string;
    address?: string;
    coordinates?: {
      type: string;
      coordinates: number[];
    };
  };
  insurance?: {
    company?: string;
    policyNumber?: string;
    expiryDate?: string;
    coverage?: 'basic' | 'comprehensive' | 'full';
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Yeni araç oluşturma için gerekli alanlar
export interface CreateCarDto {
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  category: string;
  fuelType: string;
  transmission: string;
  seats: number;
  doors?: number;
  pricePerDay: number;
  currency?: string;
  mileage: number;
  features?: string[];
  location: {
    branch: string;
    address?: string;
  };
  insurance?: {
    company?: string;
    policyNumber?: string;
    expiryDate?: string;
  };
}

// Filtreleme parametreleri
export interface CarFilters {
  category?: string;
  fuelType?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  branch?: string;
}

// API Response formatı
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * CARS API
 * RTK Query ile car service endpoints'leri
 */
export const carsApi = createApi({
  reducerPath: 'carsApi',
  baseQuery: fetchBaseQuery({
     baseUrl: '/api/cars',
    prepareHeaders: (headers, { getState }) => {
      // Token varsa header'a ekle (admin işlemleri için)
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Cars', 'Car'],
  endpoints: (builder) => ({
    /**
     * TÜM ARAÇLARI GETIR
     * GET /api/cars
     * Public endpoint - herkes erişebilir
     */
    getCars: builder.query<ApiResponse<Car[]>, CarFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value.toString());
          });
        }
        return `?${params.toString()}`;
      },
      providesTags: ['Cars'],
    }),

    /**
     * TEK ARAÇ DETAYI GETIR
     * GET /api/cars/:id
     * Public endpoint
     */
    getCarById: builder.query<ApiResponse<Car>, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Car', id }],
    }),

    /**
     * YENİ ARAÇ EKLE
     * POST /api/cars
     * Sadece Admin
     */
    createCar: builder.mutation<ApiResponse<Car>, CreateCarDto>({
      query: (carData) => ({
        url: '/',
        method: 'POST',
        body: carData,
      }),
      invalidatesTags: ['Cars'],
    }),

    /**
     * ARAÇ GÜNCELLE
     * PUT /api/cars/:id
     * Sadece Admin
     */
    updateCar: builder.mutation<ApiResponse<Car>, { id: string; data: Partial<CreateCarDto> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Car', id }, 'Cars'],
    }),

    /**
     * ARAÇ SİL (Soft Delete)
     * DELETE /api/cars/:id
     * Sadece Admin
     */
    deleteCar: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cars'],
    }),

    /**
     * MÜSAİT ARAÇLARI GETIR
     * GET /api/cars/available
     * Belirli tarihler arasında müsait olan araçları getirir
     */
    getAvailableCars: builder.query<
      ApiResponse<Car[]>,
      { startDate: string; endDate: string; filters?: CarFilters }
    >({
      query: ({ startDate, endDate, filters }) => {
        const params = new URLSearchParams({
          startDate,
          endDate,
        });
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value.toString());
          });
        }
        return `/available?${params.toString()}`;
      },
      providesTags: ['Cars'],
    }),
  }),
});

/**
 * AUTO-GENERATED HOOKS
 * RTK Query otomatik olarak bu hook'ları oluşturur
 */
export const {
  useGetCarsQuery,
  useGetCarByIdQuery,
  useCreateCarMutation,
  useUpdateCarMutation,
  useDeleteCarMutation,
  useGetAvailableCarsQuery,
  // Lazy queries - manuel tetiklemek için
  useLazyGetCarsQuery,
  useLazyGetCarByIdQuery,
  useLazyGetAvailableCarsQuery,
} = carsApi;