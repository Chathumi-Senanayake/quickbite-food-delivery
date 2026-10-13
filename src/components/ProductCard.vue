<script setup lang="ts">
import { useCart } from '../composables/useCart'
import type { Product } from '../types'
import { formatLKR } from '../utils/currency'

const props = defineProps<{
  product: Product
}>()

const { addToCart } = useCart()

// Calculate the discounted price for display
const displayPrice = props.product.discount 
  ? props.product.price * (1 - props.product.discount / 100) 
  : props.product.price
</script>

<template>
  <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 group relative flex flex-col h-full">
    <router-link :to="'/recipe/' + product.id" class="cursor-pointer flex flex-col flex-grow">
      <div class="h-48 overflow-hidden relative w-full">
        <img 
          :src="product.thumbnail" 
          :alt="product.title" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div v-if="product.discount" class="absolute top-3 left-3 bg-orange-500 text-black font-black px-2 py-1 rounded-lg text-xs z-10">
          -{{ product.discount }}%
        </div>
      </div>

      <div class="p-5 flex flex-col flex-grow space-y-2">
        <h3 class="text-zinc-900 dark:text-white font-bold truncate text-lg group-hover:text-orange-500 transition-colors">{{ product.title }}</h3>
        
        <p class="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-2 leading-relaxed flex-grow">
          {{ product.description }}
        </p>
      </div>
    </router-link>

    <div class="px-5 pb-5 pt-0 flex flex-col space-y-2">
      <div class="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
        <div class="flex flex-col">
          <span class="text-orange-500 font-black text-xl">{{ formatLKR(displayPrice) }}</span>
          <span v-if="product.discount" class="text-zinc-400 dark:text-zinc-500 line-through text-xs">{{ formatLKR(product.price) }}</span>
        </div>
        
        <button 
          @click.stop="addToCart(product)"
          class="bg-zinc-100 hover:bg-orange-500 text-zinc-800 hover:text-black dark:bg-zinc-800 dark:hover:bg-orange-500 dark:text-white dark:hover:text-black p-2.5 rounded-xl transition-all active:scale-90 shadow-lg cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
