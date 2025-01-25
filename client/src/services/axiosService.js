import axios from 'axios'
import { toast } from 'react-toastify'
import store from '../store'
import { logout } from '../store/slices/authSlice'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token
    if (token) {
      config.headers['x-auth-token'] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          if (error.response.data.msg === 'Token is not valid') {
            store.dispatch(logout())
            toast.error('Session expired. Please login again.')
          }
          break
        case 403:
          toast.error('Access denied')
          break
        case 404:
          toast.error('Resource not found')
          break
        case 500:
          toast.error('Server error. Please try again later.')
          break
        default:
          toast.error(error.response.data.msg || 'Something went wrong')
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.')
    } else {
      toast.error('An error occurred. Please try again.')
    }
    return Promise.reject(error)
  }
)

export default axiosInstance 