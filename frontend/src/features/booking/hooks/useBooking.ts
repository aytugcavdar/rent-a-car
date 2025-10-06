import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  useCreateBookingMutation,
  useCancelBookingMutation,
  useGetUserBookingsQuery,
  type CreateBookingDto,
  type Booking,
} from '../api/bookingApi';

interface UseBookingOptions {
  onSuccess?: (booking: Booking) => void;
  onError?: (error: any) => void;
  autoNavigate?: boolean;
}

export const useBooking = (options: UseBookingOptions = {}) => {
  const navigate = useNavigate();
  const { onSuccess, onError, autoNavigate = true } = options;

  const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();

  /**
   * Yeni rezervasyon oluşturur
   */
  const handleCreateBooking = useCallback(
    async (data: CreateBookingDto) => {
      try {
        const result = await createBooking(data).unwrap();
        toast.success('Rezervasyon başarıyla oluşturuldu!');
        
        if (onSuccess) {
          onSuccess(result.data);
        }
        
        if (autoNavigate) {
          navigate(`/bookings/${result.data._id}`);
        }
        
        return result.data;
      } catch (error: any) {
        const errorMessage = error?.data?.message || 'Rezervasyon oluşturulurken bir hata oluştu.';
        toast.error(errorMessage);
        
        if (onError) {
          onError(error);
        }
        
        throw error;
      }
    },
    [createBooking, navigate, onSuccess, onError, autoNavigate]
  );

  /**
   * Rezervasyonu iptal eder
   */
  const handleCancelBooking = useCallback(
    async (bookingId: string, confirmMessage?: string) => {
      const message = confirmMessage || 'Bu rezervasyonu iptal etmek istediğinizden emin misiniz?';
      
      if (!window.confirm(message)) {
        return false;
      }

      try {
        await cancelBooking(bookingId).unwrap();
        toast.success('Rezervasyon başarıyla iptal edildi.');
        return true;
      } catch (error: any) {
        const errorMessage = error?.data?.message || 'Rezervasyon iptal edilirken bir hata oluştu.';
        toast.error(errorMessage);
        
        if (onError) {
          onError(error);
        }
        
        return false;
      }
    },
    [cancelBooking, onError]
  );

  /**
   * Fiyat hesaplama yardımcı fonksiyonu
   */
  const calculatePrice = useCallback(
    (startDate: string, endDate: string, pricePerDay: number): number => {
      if (!startDate || !endDate) return 0;

      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays > 0 ? diffDays * pricePerDay : 0;
    },
    []
  );

  /**
   * Gün sayısı hesaplama
   */
  const calculateDays = useCallback((startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }, []);

  /**
   * Rezervasyon durumunu kontrol eder
   */
  const canCancelBooking = useCallback((booking: Booking): boolean => {
    if (!booking) return false;
    
    // Sadece pending ve confirmed durumdaki rezervasyonlar iptal edilebilir
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return false;
    }

    // Başlangıç tarihine 48 saatten az kaldıysa iptal edilemez
    const now = new Date();
    const startDate = new Date(booking.startDate);
    const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursUntilStart >= 48;
  }, []);

  /**
   * Rezervasyon durumu badge bilgisini döner
   */
  const getStatusInfo = useCallback((status: string) => {
    const statusMap = {
      pending: {
        text: 'Beklemede',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '⏳',
      },
      confirmed: {
        text: 'Onaylandı',
        color: 'bg-blue-100 text-blue-800',
        icon: '✓',
      },
      active: {
        text: 'Aktif',
        color: 'bg-green-100 text-green-800',
        icon: '🚗',
      },
      completed: {
        text: 'Tamamlandı',
        color: 'bg-gray-100 text-gray-800',
        icon: '✓',
      },
      cancelled: {
        text: 'İptal Edildi',
        color: 'bg-red-100 text-red-800',
        icon: '✕',
      },
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  }, []);

  /**
   * Tarih formatını döner
   */
  const formatBookingDate = useCallback((dateString: string, includeTime = false): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
    };

    return date.toLocaleDateString('tr-TR', options);
  }, []);

  /**
   * Rezervasyon validasyonu
   */
  const validateBookingDates = useCallback(
    (startDate: string, endDate: string): { isValid: boolean; error?: string } => {
      if (!startDate || !endDate) {
        return { isValid: false, error: 'Lütfen alış ve teslim tarihlerini seçin.' };
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();

      if (start < now) {
        return { isValid: false, error: 'Alış tarihi geçmişte olamaz.' };
      }

      if (end <= start) {
        return { isValid: false, error: 'Teslim tarihi alış tarihinden sonra olmalıdır.' };
      }

      const minHours = 24;
      const hoursDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < minHours) {
        return { isValid: false, error: `Minimum kiralama süresi ${minHours} saattir.` };
      }

      return { isValid: true };
    },
    []
  );

  return {
    // Mutations
    createBooking: handleCreateBooking,
    cancelBooking: handleCancelBooking,
    
    // Loading states
    isCreating,
    isCancelling,
    
    // Utilities
    calculatePrice,
    calculateDays,
    canCancelBooking,
    getStatusInfo,
    formatBookingDate,
    validateBookingDates,
  };
};

/**
 * Kullanıcının rezervasyonlarını getirir
 */
export const useUserBookings = (filters?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const { data, isLoading, error, refetch } = useGetUserBookingsQuery(filters || {});

  const bookings = useMemo(() => data?.data?.bookings || [], [data]);
  const totalPages = useMemo(() => data?.data?.totalPages || 1, [data]);
  const total = useMemo(() => data?.data?.total || 0, [data]);

  // İstatistikler
  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      active: bookings.filter((b) => b.status === 'active').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    };
  }, [bookings]);

  // Aktif rezervasyonlar (confirmed veya active)
  const activeBookings = useMemo(() => {
    return bookings.filter((b) => ['confirmed', 'active'].includes(b.status));
  }, [bookings]);

  // Gelecek rezervasyonlar
  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return bookings.filter((b) => {
      const startDate = new Date(b.startDate);
      return startDate > now && ['pending', 'confirmed'].includes(b.status);
    });
  }, [bookings]);

  // Geçmiş rezervasyonlar
  const pastBookings = useMemo(() => {
    const now = new Date();
    return bookings.filter((b) => {
      const endDate = new Date(b.endDate);
      return endDate < now || ['completed', 'cancelled'].includes(b.status);
    });
  }, [bookings]);

  return {
    bookings,
    totalPages,
    total,
    stats,
    activeBookings,
    upcomingBookings,
    pastBookings,
    isLoading,
    error,
    refetch,
  };
};

export default useBooking;