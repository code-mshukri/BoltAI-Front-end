import React, { createContext, useContext, useReducer, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const AuthContext = createContext()

const initialState = {
  user: {
    id: 1,
    full_name: 'Development User',
    role: 'admin',
    email: 'dev@example.com',
    csrf_token: 'dev-token'
  },
  isAuthenticated: true, // Always authenticated in dev mode
  loading: false,
  error: null,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'SET_ROLE':
      return { 
        ...state, 
        user: { ...state.user, role: action.payload },
        isAuthenticated: true
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // For development - simulate role change
  const setRole = (role) => {
    dispatch({ 
      type: 'SET_ROLE', 
      payload: role 
    });
    
    // Store in localStorage for persistence
    const userData = { ...state.user, role };
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('auth_token', 'dev-token');
  }

  useEffect(() => {
    // For development, always set a default user
    const userData = {
      id: 1,
      full_name: 'Development User',
      role: 'admin',
      email: 'dev@example.com',
      csrf_token: 'dev-token'
    };
    
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('auth_token', 'dev-token');
    
    dispatch({ type: 'AUTH_SUCCESS', payload: userData });
  }, [])

  const login = async ({ email, password }) => {
    try {
      dispatch({ type: 'AUTH_START' })

      // In development mode, just simulate login
      const userData = {
        id: 1,
        full_name: 'Development User',
        role: 'admin',
        email: email || 'dev@example.com',
        csrf_token: 'dev-token'
      };

      localStorage.setItem('auth_token', 'dev-token');
      localStorage.setItem('user_data', JSON.stringify(userData));

      dispatch({ type: 'AUTH_SUCCESS', payload: userData });
      toast.success('تم تسجيل الدخول بنجاح!');
      return { success: true, user: userData };

    } catch (error) {
      console.error('Login Error:', error)
      const fallbackMessage = 'حدث خطأ في الاتصال بالخادم'
      dispatch({ type: 'AUTH_FAILURE', payload: fallbackMessage })
      toast.error(fallbackMessage)
      return { success: false, error: fallbackMessage }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      // In development mode, just simulate registration
      toast.success('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني')
      dispatch({ type: 'AUTH_FAILURE', payload: null })
      return { success: true }
      
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'خطأ في الاتصال بالخادم' })
      toast.error('حدث خطأ في إنشاء الحساب')
      return { success: false }
    }
  }

  const logout = () => {
    // In development mode, we'll keep the user logged in
    toast.info('تم تسجيل الخروج بنجاح (وضع التطوير)')
  }

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' })

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
        setRole
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}