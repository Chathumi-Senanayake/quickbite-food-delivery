import { ref } from 'vue'

const isDark = ref(localStorage.getItem('theme') !== 'light')

export const useTheme = () => {
  const updateDOM = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    updateDOM()
  }

  // Initialize DOM state
  updateDOM()

  return { isDark, toggleTheme }
}
