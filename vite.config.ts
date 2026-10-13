import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  // Served from https://<user>.github.io/quickbite-food-delivery/ in production
  base: command === 'build' ? '/quickbite-food-delivery/' : '/',
}))
