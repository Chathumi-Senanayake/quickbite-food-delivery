<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './components/NavBar.vue'
import CartDrawer from './components/CartDrawer.vue'
import CheckoutPage from './components/CheckoutPage.vue'
import OrderSuccess from './components/OrderSuccess.vue'
import LoginModal from './components/LoginModal.vue'
import ActiveOrderBanner from './components/ActiveOrderBanner.vue'

const router = useRouter()

// --- State Management ---
const isCartOpen = ref(false)    // Controls the side drawer
const showCheckout = ref(false)  // Controls the full checkout form
const showSuccess = ref(false)   // Controls the final success screen
const showLogin = ref(false)     // Controls the login modal
const lastOrderId = ref('')      // Order shown on the success screen

const handleOrderPlaced = (orderId: string) => {
  lastOrderId.value = orderId
  showCheckout.value = false
  showSuccess.value = true
}

const trackLastOrder = () => {
  showSuccess.value = false
  router.push(`/track/${lastOrderId.value}`)
}
</script>

<template>
  <div class="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#0b0b0b] dark:text-white selection:bg-orange-500/30 transition-colors duration-300">
    <NavBar @open-cart="isCartOpen = true" @open-login="showLogin = true" /> 
    
    <main>
      <router-view />
    </main>

    <LoginModal v-if="showLogin" @close="showLogin = false" />

    <CheckoutPage 
      v-if="showCheckout" 
      @close="showCheckout = false" 
      @place-order="handleOrderPlaced" 
    />

    <OrderSuccess 
      v-if="showSuccess" 
      :order-id="lastOrderId"
      @go-home="showSuccess = false" 
      @track="trackLastOrder"
    />

    <ActiveOrderBanner />

    <CartDrawer 
      :isOpen="isCartOpen" 
      @close="isCartOpen = false" 
      @order-complete="showCheckout = true" 
    />
  </div>
</template>

<style>
/* Global smooth transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Ensure a clean scrollbar for the dark theme */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #0b0b0b;
}
::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #f97316;
}
</style>