// frontend/src/features/booking/slice/bookingSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { BookingFormData, BookingStep } from '../types';

interface BookingState {
  // Form state
  currentStep: BookingStep;
  formData: Partial<BookingFormData>;
  completedSteps: BookingStep[];
  
  // UI state
  isFormDirty: boolean;
  selectedCarId: string | null;
  selectedDates: {
    startDate: string | null;
    endDate: string | null;
  };
  
  // Filters for booking list
  filters: {
    status: string | null;
    page: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

const initialState: BookingState = {
  currentStep: 1,
  formData: {},
  completedSteps: [],
  isFormDirty: false,
  selectedCarId: null,
  selectedDates: {
    startDate: null,
    endDate: null,
  },
  filters: {
    status: null,
    page: 1,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    // Form step management
    setCurrentStep: (state, action: PayloadAction<BookingStep>) => {
      state.currentStep = action.payload;
    },
    
    nextStep: (state) => {
      if (state.currentStep < 4) {
        if (!state.completedSteps.includes(state.currentStep)) {
          state.completedSteps.push(state.currentStep);
        }
        state.currentStep = (state.currentStep + 1) as BookingStep;
      }
    },
    
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep = (state.currentStep - 1) as BookingStep;
      }
    },
    
    completeStep: (state, action: PayloadAction<BookingStep>) => {
      if (!state.completedSteps.includes(action.payload)) {
        state.completedSteps.push(action.payload);
      }
    },
    
    // Form data management
    updateFormData: (state, action: PayloadAction<Partial<BookingFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
      state.isFormDirty = true;
    },
    
    resetFormData: (state) => {
      state.formData = {};
      state.currentStep = 1;
      state.completedSteps = [];
      state.isFormDirty = false;
    },
    
    setFormDirty: (state, action: PayloadAction<boolean>) => {
      state.isFormDirty = action.payload;
    },
    
    // Car and date selection
    setSelectedCar: (state, action: PayloadAction<string | null>) => {
      state.selectedCarId = action.payload;
      if (action.payload) {
        state.formData.carId = action.payload;
      }
    },
    
    setSelectedDates: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.selectedDates = action.payload;
      state.formData.startDate = action.payload.startDate;
      state.formData.endDate = action.payload.endDate;
    },
    
    clearSelectedDates: (state) => {
      state.selectedDates = {
        startDate: null,
        endDate: null,
      };
    },
    
    // Filter management
    setFilters: (state, action: PayloadAction<Partial<BookingState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
    
    // Reset all
    resetBookingState: () => initialState,
  },
});

export const {
  setCurrentStep,
  nextStep,
  previousStep,
  completeStep,
  updateFormData,
  resetFormData,
  setFormDirty,
  setSelectedCar,
  setSelectedDates,
  clearSelectedDates,
  setFilters,
  resetFilters,
  setPage,
  resetBookingState,
} = bookingSlice.actions;

export default bookingSlice.reducer;

// Selectors
export const selectCurrentStep = (state: { booking: BookingState }) => state.booking.currentStep;
export const selectFormData = (state: { booking: BookingState }) => state.booking.formData;
export const selectCompletedSteps = (state: { booking: BookingState }) => state.booking.completedSteps;
export const selectIsFormDirty = (state: { booking: BookingState }) => state.booking.isFormDirty;
export const selectSelectedCarId = (state: { booking: BookingState }) => state.booking.selectedCarId;
export const selectSelectedDates = (state: { booking: BookingState }) => state.booking.selectedDates;
export const selectFilters = (state: { booking: BookingState }) => state.booking.filters;