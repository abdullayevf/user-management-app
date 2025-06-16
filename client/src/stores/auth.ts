import { defineStore } from 'pinia'
import axios from 'axios'
import { router } from '@/router'
import { toast } from 'vue-sonner'
import { useRouter, useRoute } from 'vue-router'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Add axios interceptor to check user status
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.error === 'User is blocked') {
      const authStore = useAuthStore()
      authStore.logout()
      toast.error('Your account has been blocked. You cannot perform this action.')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

interface User {
  id: number
  name: string
  email: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  ready: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    ready: false,
    isLoading: false
  }),

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token
  },

  actions: {
    async login(email: string, password: string) {
      this.isLoading = true
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email,
          password
        })

        const { token, user } = response.data

        this.token = token
        this.user = user
        this.isAuthenticated = true
        localStorage.setItem('token', token)

        // Set default Authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        toast.success('Login successful!')
        router.push("/dashboard")

        return { success: true, message: response.data.message }
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to delete users'
        toast.error(errorMessage)
        console.error(error)
        return {
          success: false,
          message: error.response?.data?.error || 'Login failed'
        }
      } finally {
        this.isLoading = false
      }
    },

    async register(name: string, email: string, password: string) {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
          name,
          email,
          password
        })

        const { token, user } = response.data

        this.token = token
        this.user = user
        this.isAuthenticated = true
        toast.success('Signin successful!')
        router.push("/dashboard")

        localStorage.setItem('token', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        return { success: true, message: response.data.message }
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to delete users'
        toast.error(errorMessage)
        console.error(error)
        return {
          success: false,
          message: error.response?.data?.error || 'Login failed'
        }
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.isAuthenticated = false

      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']

      router.push('/login')
    },

    // Initialize auth state from localStorage
    async initializeAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          // Set the token and auth header
          this.token = token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

          // Fetch user data to restore complete auth state
          const response = await axios.get(`${API_BASE_URL}/auth/me`)
          this.user = response.data.user
          this.isAuthenticated = true
        } catch (error) {
          // If token is invalid or request fails, clear auth state
          this.token = null
          this.user = null
          this.isAuthenticated = false
          localStorage.removeItem('token')
          delete axios.defaults.headers.common['Authorization']
        }
      }
      this.ready = true
    },

    // Initialize Dashboard view

    async fetchUsers() {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/`)
        return response.data
      } catch (error: any) {
        if (error.response?.status === 403) {
          return {
            success: false,
            message: 'You are not authorized to view users'
          }
        }
        return {
          success: false,
          message: error.response?.data?.error || 'Failed to fetch users'
        }
      }
    }
  }
})