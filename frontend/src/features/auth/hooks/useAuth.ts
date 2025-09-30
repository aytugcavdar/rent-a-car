import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '../../../app/store'
import { logout as logoutAction } from '../slice/authSlice'
import { useLogoutMutation } from '../api/authApi'

/**
 * Authentication işlemleri için custom hook
 */
export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, token, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)
  
  const [logoutMutation] = useLogoutMutation()

  // Logout işlemi
  const logout = async () => {
    try {
      await logoutMutation().unwrap()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch(logoutAction())
      navigate('/login')
    }
  }

  // Admin kontrolü
  const isAdmin = user?.role === 'admin'

  // Email doğrulama kontrolü
  const isEmailVerified = user?.isEmailVerified || false

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isAdmin,
    isEmailVerified,
    logout,
  }
}