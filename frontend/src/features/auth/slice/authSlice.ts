import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface User {
  _id: string
  name: string
  surname: string
  email: string
  role: 'customer' | 'admin'
  phone: string
  avatarUrl?: string
  isEmailVerified: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    },
    
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
    },
    
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const { setCredentials, logout, updateUser, setLoading } = authSlice.actions
export default authSlice.reducer