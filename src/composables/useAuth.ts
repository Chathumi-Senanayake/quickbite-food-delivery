import { ref, computed } from 'vue'
import type { User } from '../types'

const token = ref<string | null>(localStorage.getItem('quickbite_token'))
const user = ref<User | null>(
  localStorage.getItem('quickbite_user') 
    ? JSON.parse(localStorage.getItem('quickbite_user')!) 
    : null
)
const loading = ref(false)
const error = ref<string | null>(null)

export const useAuth = () => {
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  const login = async (usernameInput: string, passwordInput: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('https://dummyjson.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
          expiresInMins: 60, // optional
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Invalid username or password')
      }

      const data = await response.json()
      
      // Save auth details
      token.value = data.token
      localStorage.setItem('quickbite_token', data.token)

      // Initialize default editable fields if not already existing
      const loggedUser: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        image: data.image,
        phone: '+1 (555) 019-2834',
        address: '123 Food Street, Delicious City',
        city: 'Gourmet Ville',
        postalCode: '90210'
      }

      user.value = loggedUser
      localStorage.setItem('quickbite_user', JSON.stringify(loggedUser))
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to authenticate.'
      return false
    } finally {
      loading.value = false
    }
  }

  const register = async (usernameInput: string, emailInput: string, passwordInput: string) => {
    loading.value = true
    error.value = null
    try {
      if (passwordInput.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }

      const registeredUser: User = {
        id: Date.now(),
        username: usernameInput,
        email: emailInput,
        firstName: usernameInput,
        lastName: '',
        gender: '',
        image: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(usernameInput)}`,
        phone: '',
        address: '',
        city: '',
        postalCode: ''
      }

      token.value = `quickbite_${Date.now()}`
      user.value = registeredUser
      localStorage.setItem('quickbite_token', token.value)
      localStorage.setItem('quickbite_user', JSON.stringify(registeredUser))
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to create your account.'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('quickbite_token')
    localStorage.removeItem('quickbite_user')
  }

  const updateProfile = (updatedDetails: Partial<User>) => {
    if (!user.value) return
    user.value = {
      ...user.value,
      ...updatedDetails
    }
    localStorage.setItem('quickbite_user', JSON.stringify(user.value))
  }

  return {
    isLoggedIn,
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile
  }
}
