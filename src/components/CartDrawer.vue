<script setup lang="ts">
import { useCart } from '../composables/useCart'
import { formatLKR } from '../utils/currency'
import { DELIVERY_BASE_FEE, ORDER_DISCOUNT, orderTotal } from '../utils/pricing'

defineProps<{ isOpen: boolean }>()

// FIXED: Added 'order-complete' to the emit list
const emit = defineEmits(['close', 'order-complete'])

const { cart, cartTotal, addToCart, removeFromCart } = useCart()

const handleCheckout = () => {
  if (cart.value.length === 0) return
  
  // Close the drawer
  emit('close')
  
  // Trigger the success screen in App.vue
  emit('order-complete')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <div class="absolute inset-y-0 right-0 w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      
      <div class="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">Your Order</h2>
        <button @click="$emit('close')" class="text-zinc-400 hover:text-zinc-655 dark:hover:text-white text-3xl cursor-pointer">&times;</button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <div v-if="cart.length === 0" class="text-center text-zinc-500 py-10 font-bold">
          Your cart is empty!
        </div>
        
        <div v-for="item in cart" :key="item.id" class="flex items-center space-x-4 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all">
          <img :src="item.thumbnail" class="w-16 h-16 object-cover rounded-lg" />
          
          <div class="flex-1">
            <h4 class="text-zinc-900 dark:text-white font-semibold text-sm">{{ item.title }}</h4>
            <p class="text-orange-500 font-bold">{{ formatLKR(item.price * item.quantity) }}</p>
          </div>

          <div class="flex items-center bg-zinc-205 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-300 dark:border-zinc-700 transition-all">
            <button 
              @click="removeFromCart(item.id)"
              class="w-7 h-7 flex items-center justify-center text-zinc-800 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-850 rounded-md transition cursor-pointer"
            >
              -
            </button>
            
            <span class="px-3 text-zinc-805 dark:text-white font-bold text-sm">{{ item.quantity }}</span>
            
            <button 
              @click="addToCart(item)"
              class="w-7 h-7 flex items-center justify-center text-zinc-800 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-850 rounded-md transition cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div class="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 space-y-3 transition-colors duration-300">
            <h3 class="text-zinc-450 dark:text-zinc-400 uppercase text-xs font-bold tracking-widest mb-4">Order Summary</h3>

            <div class="flex justify-between text-sm text-zinc-600 dark:text-zinc-300">
                <span>Subtotal</span>
                <span>{{ formatLKR(cartTotal) }}</span>
            </div>

            <div class="flex justify-between text-sm text-zinc-600 dark:text-zinc-300">
                <span>Delivery Fee <span class="text-xs text-zinc-400">(by distance)</span></span>
                <span>from {{ formatLKR(DELIVERY_BASE_FEE) }}</span>
            </div>

            <div class="flex justify-between text-sm text-orange-500">
                <span>Discount (QUICK20)</span>
                <span>-{{ formatLKR(ORDER_DISCOUNT) }}</span>
            </div>

            <div class="flex justify-between text-zinc-900 dark:text-white text-2xl font-black pt-2 border-t border-zinc-200 dark:border-zinc-800 mt-2">
                <span>Est. Total</span>
                <span>{{ formatLKR(orderTotal(parseFloat(cartTotal), DELIVERY_BASE_FEE)) }}</span>
            </div>

            <button 
                @click="handleCheckout"
                class="w-full bg-red-650 hover:bg-red-700 text-white font-extrabold py-4 rounded-2xl transition-all active:scale-95 mt-4 cursor-pointer"
            >
                Checkout Now
            </button>
        </div>
    </div>
  </div>
</template>
