<script setup lang="ts">
import { useRouter } from 'vue-router' 
import { useCart } from '../composables/useCart'
import { useTheme } from '../composables/useTheme'
import { useAuth } from '../composables/useAuth'

const router = useRouter() 
const { cartCount } = useCart()
const { isDark, toggleTheme } = useTheme()
const { user, isLoggedIn } = useAuth()

defineEmits(['open-cart', 'open-login'])

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <nav class="sticky top-0 z-40 w-full bg-white/80 border-b border-zinc-200 text-zinc-800 dark:bg-[#0b0b0b]/80 dark:border-zinc-950 dark:text-white backdrop-blur-md transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      
      <div class="flex items-center space-x-8">
        <div class="flex items-center space-x-2 cursor-pointer" @click="navigateTo('/')">
          <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span class="text-black font-black">Q</span>
          </div>
          <span class="text-xl font-bold tracking-tighter text-zinc-900 dark:text-white">QuickBite</span>
        </div>

        <div class="hidden md:flex items-center space-x-6">
          <button 
            @click="navigateTo('/')" 
            class="text-zinc-600 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-500 font-bold transition-colors text-sm cursor-pointer"
          >
            Home
          </button>
          
          <button 
            @click="navigateTo('/offers')" 
            class="flex items-center space-x-1 text-zinc-600 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-500 font-bold transition-colors text-sm cursor-pointer"
          >
            <span>Offers</span>
            <span class="bg-orange-500/10 text-orange-500 text-[10px] px-1.5 py-0.5 rounded-md border border-orange-500/20">HOT</span>
          </button>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <!-- Theme Toggle Button -->
        <button 
          @click="toggleTheme" 
          class="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-all cursor-pointer"
          title="Toggle Theme"
        >
          <!-- Moon Icon (shows in Light mode) -->
          <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
          </svg>
          <!-- Sun Icon (shows in Dark mode) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.58 1.58m12.42 12.42l1.58 1.58M3 12h2.25m13.5 0H21M6.78 17.22l-1.58 1.58m12.42-12.42l-1.58 1.58M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
          </svg>
        </button>

        <!-- Cart Button -->
        <button 
          @click="$emit('open-cart')" 
          class="relative p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-all cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
          <span v-if="cartCount > 0" class="absolute -top-0.5 -right-0.5 bg-orange-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white dark:border-black">
            {{ cartCount }}
          </span>
        </button>

        <!-- User Avatar / Profile link -->
        <img 
          v-if="isLoggedIn" 
          :src="user?.image" 
          :alt="user?.username" 
          class="w-8 h-8 rounded-full border-2 border-orange-500 object-cover cursor-pointer hover:scale-105 transition-transform" 
          @click="navigateTo('/profile')"
          title="View Profile"
        />
        <div 
          v-else 
          @click="$emit('open-login')" 
          class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          title="Sign In"
        >
          U
        </div>
      </div>
    </div>
  </nav>
</template>