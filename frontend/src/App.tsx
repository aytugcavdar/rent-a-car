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
                {/* <Route path="login" element={<LoginPage />} /> */}
                {/* <Route path="register" element={<RegisterPage />} /> */}
              </Route>

              {/* Sadece Giriş Yapmış Kullanıcıların Erişebileceği Rotalar */}
              <Route element={<ProtectedRoute />}>
                {/* <Route path="profile" element={<ProfilePage />} /> */}
                {/* <Route path="bookings" element={<BookingsPage />} /> */}
              </Route>

              {/* Sadece Admin Yetkisine Sahip Kullanıcıların Erişebileceği Rotalar */}
              <Route element={<AdminRoute />}>
                {/* <Route path="admin/dashboard" element={<AdminDashboard />} /> */}
              </Route>

              {/* Diğer Sayfalar */}
              {/* <Route path="cars" element={<CarsPage />} /> */}
              {/* <Route path="cars/:id" element={<CarDetailPage />} /> */}

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