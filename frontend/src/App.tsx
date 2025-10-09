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

// Profile Sayfaları
import ProfilePage from './features/profile/pages/Profile';
import EditProfilePage from './features/profile/pages/EditProfile';

// Car Sayfaları
import CarsPage from './features/cars/pages/CarList';
import CarDetailPage from './features/cars/pages/CarDetail';
import CarComparePage from './features/cars/pages/CarComparePage';

// Booking Sayfaları
import BookingList from './features/booking/pages/BookingList';
import BookingDetail from './features/booking/pages/BookingDetail';
import CreateBooking from './features/booking/pages/CreateBooking';

// Admin Layout
import AdminLayout from './features/admin/layout/AdminLayout';

// Admin Sayfaları
import AdminDashboard from './features/admin/pages/AdminDashboard';
import UserManagementPage from './features/admin/pages/UserManagement';
import CarManagementPage from './features/admin/pages/CarManagement';
import NewCarPage from './features/admin/pages/NewCarPage';
import EditCarPage from './features/admin/pages/EditCarPage';
import AdminBookingManagement from './features/admin/pages/AdminBookingManagement';
import AdminBookingDetail from './features/admin/pages/AdminBookingDetail';

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
              <Route path="cars/compare" element={<CarComparePage />} />
              
              {/* Sadece Giriş Yapmış Kullanıcıların Erişebileceği Rotalar */}
              <Route element={<ProtectedRoute />}>
                <Route path="profile" element={<ProfilePage />} />
                <Route path="profile/edit" element={<EditProfilePage />} />
                <Route path="/bookings" element={<BookingList />} />
                <Route path="/bookings/:id" element={<BookingDetail />} />
                <Route path="/booking/create/:carId" element={<CreateBooking />} />
              </Route>
              
              {/* Bulunamayan Sayfalar İçin */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Sadece Admin Yetkisine Sahip Kullanıcıların Erişebileceği Rotalar */}
            <Route path="admin" element={<AdminLayout />}>
              <Route element={<AdminRoute />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                
                {/* Araç Yönetimi Rotaları */}
                <Route path="cars" element={<CarManagementPage />} />
                <Route path="cars/new" element={<NewCarPage />} />
                <Route path="cars/edit/:id" element={<EditCarPage />} />
                
                {/* Kullanıcı Yönetimi */}
                <Route path="users" element={<UserManagementPage />} />
                
                {/* Rezervasyon Yönetimi */}
                <Route path="/admin/bookings" element={<AdminBookingManagement />} />
                <Route path="/admin/bookings/:id" element={<AdminBookingDetail />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </PersistGate>
    </Provider>
  );
}

export default App;