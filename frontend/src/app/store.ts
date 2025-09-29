// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

// Feature API slices
import { authApi } from '../features/auth/api/authApi'
import { carsApi } from '../features/cars/api/carsApi'
import { bookingApi } from '../features/booking/api/bookingApi'

// Feature slices
import authSlice from '../features/auth/slices/authSlice'
import carsSlice from '../features/cars/slices/carsSlice'
import carFiltersSlice from '../features/cars/slices/carFiltersSlice'
import notificationsSlice from '../features/notifications/slices/notificationsSlice'

// Middleware
import { authMiddleware } from './middleware/authMiddleware'
import { socketMiddleware } from './middleware/socketMiddleware'

// Auth state'ini persist etmek için konfigürasyon
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated'] // Sadece bu alanları kaydet
}

const persistedAuthReducer = persistReducer(authPersistConfig, authSlice)

export const store = configureStore({
  reducer: {
    // Persisted reducers
    auth: persistedAuthReducer,
    
    // Regular reducers
    cars: carsSlice,
    carFilters: carFiltersSlice,
    notifications: notificationsSlice,
    
    // RTK Query API reducers
    [authApi.reducerPath]: authApi.reducer,
    [carsApi.reducerPath]: carsApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Redux Persist action'larını ignore et
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
    // RTK Query middleware'leri
    .concat(authApi.middleware)
    .concat(carsApi.middleware)
    .concat(bookingApi.middleware)
    // Custom middleware'ler
    .concat(authMiddleware)
    .concat(socketMiddleware),
    
  // Development ortamında Redux DevTools'u etkinleştir
  devTools: process.env.NODE_ENV !== 'production',
})

// Persist store
export const persistor = persistStore(store)

// TypeScript için type definitions
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Store'dan state tipi çıkar
export type AppGetState = typeof store.getState

// RTK Query hooks için dispatch tipi
export type AppThunk<ReturnType = void> = (
  dispatch: AppDispatch,
  getState: () => RootState
) => ReturnType