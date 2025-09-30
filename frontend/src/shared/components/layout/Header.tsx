import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import type { RootState } from '../../../app/store'
import Container from './Container'

const Header = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const handleLogout = () => {
    // Logout işlemi (sonra authSlice'da implement edeceğiz)
    // dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white rounded-lg p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Rent-a-Car</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Ana Sayfa
            </Link>
            <Link to="/cars" className="text-gray-700 hover:text-blue-600 transition-colors">
              Araçlar
            </Link>
            {isAuthenticated && (
              <Link to="/bookings" className="text-gray-700 hover:text-blue-600 transition-colors">
                Rezervasyonlarım
              </Link>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span>{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>
                Ana Sayfa
              </Link>
              <Link to="/cars" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>
                Araçlar
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/bookings" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>
                    Rezervasyonlarım
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>
                    Profilim
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="text-left text-red-600 hover:text-red-700"
                  >
                    Çıkış Yap
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>
                    Giriş Yap
                  </Link>
                  <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
                    Kayıt Ol
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </Container>
    </header>
  )
}

export default Header