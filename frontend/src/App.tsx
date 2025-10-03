// frontend/src/App.tsx
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';

import { persistor, store } from './app/store';

// Layout ve Sayfa Bileşenleri
import { AppLayout } from './shared/components/layout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Rota Koruma (Guard) Bileşenleri
import GuestRoute from './shared/components/guards/GuestRoute';
import ProtectedRoute from './shared/components/guards/ProtectedRoute';
import AdminRoute from './shared/components/guards/AdminRoute';

// Auth Sayfaları
import LoginPage from './features/auth/pages/Login';
import RegisterPage from './features/auth/pages/Register';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage';

// Car Sayfaları
import CarsPage from './features/cars/pages/CarList';
import CarDetailPage from './features/cars/pages/CarDetail';
import AdminLayout from './features/admin/layout/AdminLayout';

// Admin Sayfaları
import UserManagementPage from './features/admin/pages/UserManagement';
import CarManagementPage from './features/admin/pages/CarManagement';
import AdminDashboard from './features/admin/pages/AdminDashboard';
// import CarComparePage from './features/cars/pages/CarComparePage';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routes>
            {/* Ana Sayfa Düzeni (Header ve Footer içerir) */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />

              {/* Sadece Giriş Yapmamış Kullanıcıların Erişebileceği Rotalar */}
              <Route element={<GuestRoute />}>
                <Route path="login" element={<LoginPage />} /> 
                <Route path="register" element={<RegisterPage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />
              </Route>

              {/* Public Car Rotaları - Herkes erişebilir */}
              <Route path="cars" element={<CarsPage />} />
              <Route path="cars/:id" element={<CarDetailPage />} />

              {/* Sadece Giriş Yapmış Kullanıcıların Erişebileceği Rotalar */}
              <Route element={<ProtectedRoute />}>
                {/* <Route path="profile" element={<ProfilePage />} /> */}
                {/* <Route path="bookings" element={<BookingsPage />} /> */}
                {/* <Route path="bookings/new" element={<NewBookingPage />} /> */}
              </Route>

              {/* Sadece Admin Yetkisine Sahip Kullanıcıların Erişebileceği Rotalar */}
              <Route path="admin" element={<AdminLayout />}>
                <Route element={<AdminRoute />}>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="cars" element={<CarManagementPage />} /> {/* Senin menüne göre yolu güncelledim */}
                      <Route path="users" element={<UserManagementPage />} /> {/* Senin menüne göre yolu güncelledim */}
                      <Route path="bookings" element={<div>Rezervasyonlar Sayfası</div>} /> {/* Senin menüne göre yolu güncelledim */}
                </Route>
              </Route>

              {/* Bulunamayan Sayfalar İçin */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </PersistGate>
    </Provider>
  );
}

export default App;