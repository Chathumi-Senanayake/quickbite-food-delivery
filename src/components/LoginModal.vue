<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits(['close'])

const { login, register, loading, error } = useAuth()

const mode = ref<'login' | 'register'>('login')
const username = ref('emilys')
const email = ref('')
const password = ref('emilyspass')

const handleSubmit = async () => {
  if (!username.value || !password.value || (mode.value === 'register' && !email.value)) return
  const success = mode.value === 'login'
    ? await login(username.value, password.value)
    : await register(username.value, email.value, password.value)
  if (success) emit('close')
}

const switchMode = (nextMode: 'login' | 'register') => {
  mode.value = nextMode
  error.value = null
  if (nextMode === 'register') {
    username.value = ''
    password.value = ''
  } else {
    username.value = 'emilys'
    password.value = 'emilyspass'
    email.value = ''
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <!-- Modal Box -->
    <div class="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3rem shadow-2xl p-8 text-left transition-all duration-300">
      
      <button 
        @click="$emit('close')" 
        class="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-2xl font-bold cursor-pointer"
      >
        &times;
      </button>

      <div class="mb-8">
        <h2 class="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{{ mode === 'login' ? 'Welcome Back' : 'Create Account' }}</h2>
        <p class="text-zinc-500 text-sm mt-1">{{ mode === 'login' ? 'Sign in to your QuickBite account.' : 'Join QuickBite and save your favorite meals.' }}</p>

        <div class="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1" role="tablist" aria-label="Authentication options">
          <button type="button" @click="switchMode('login')" :class="mode === 'login' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'" class="rounded-lg px-3 py-2 text-sm font-bold transition-colors">Sign In</button>
          <button type="button" @click="switchMode('register')" :class="mode === 'register' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'" class="rounded-lg px-3 py-2 text-sm font-bold transition-colors">Register</button>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Error Alert -->
        <div v-if="error" class="bg-red-500/10 border border-red-500/20 text-red-550 dark:text-red-400 p-4 rounded-2xl text-sm font-semibold">
          {{ error }}
        </div>

        <div>
          <label class="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2 font-mono">Username</label>
          <input 
            v-model="username"
            type="text" 
            placeholder="e.g. emilys"
            class="input-style shadow-sm"
            required
          />
        </div>

        <div v-if="mode === 'register'">
          <label class="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2 font-mono">Email</label>
          <input v-model="email" type="email" placeholder="you@example.com" class="input-style shadow-sm" required />
        </div>

        <div>
          <label class="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2 font-mono">Password</label>
          <input 
            v-model="password"
            type="password" 
            placeholder="••••••••"
            class="input-style shadow-sm"
            required
          />
        </div>

        <!-- Help Info -->
        <div class="bg-orange-500/5 border border-orange-550/15 rounded-2xl p-4 text-xs text-orange-650 dark:text-orange-400 leading-relaxed font-semibold">
          💡 Pre-filled credentials belong to Emily, a valid account inside <strong>DummyJSON API</strong>. Click login directly to simulate.
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 text-black font-black py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/10 cursor-pointer"
        >
          <span v-if="loading" class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
          <span v-else>{{ mode === 'login' ? 'Sign In' : 'Create Account' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
