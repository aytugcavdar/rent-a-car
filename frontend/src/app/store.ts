import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

// Feature API slices
import { authApi } from '../features/auth/api/authApi'
import { carsApi } from '../features/cars/api/carsApi'

// Feature slices
import authReducer from '../features/auth/slice/authSlice'

// Auth state'ini persist etmek için konfigürasyon
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated']
}

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    [authApi.reducerPath]: authApi.reducer,
    [carsApi.reducerPath]: carsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
    .concat(authApi.middleware)
    .concat(carsApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)

// EXPORTS - Bu satırlar olmadan TypeScript çalışmaz
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch