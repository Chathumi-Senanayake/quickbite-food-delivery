<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useCart } from '../composables/useCart'
import { getTrackingState, stageLabel, useOrderTracking } from '../composables/useOrderTracking'
import { formatLKR } from '../utils/currency'

const router = useRouter()
const { user, isLoggedIn, logout, updateProfile } = useAuth()
const { orders } = useCart()
const { now } = useOrderTracking()

const statusClass = (stage: string) =>
  stage === 'cancelled' ? 'bg-red-500/10 text-red-600 dark:text-red-400'
    : stage === 'delivered' ? 'bg-green-500/10 text-green-600 dark:text-green-400'
    : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 animate-pulse'

// Edit profile form state
const email = ref(user.value?.email || '')
const firstName = ref(user.value?.firstName || '')
const lastName = ref(user.value?.lastName || '')
const phone = ref(user.value?.phone || '')
const address = ref(user.value?.address || '')
const city = ref(user.value?.city || '')
const postalCode = ref(user.value?.postalCode || '')

const showSuccessAlert = ref(false)

const handleSave = () => {
  updateProfile({
    email: email.value,
    firstName: firstName.value,
    lastName: lastName.value,
    phone: phone.value,
    address: address.value,
    city: city.value,
    postalCode: postalCode.value
  })
  showSuccessAlert.value = true
  setTimeout(() => {
    showSuccessAlert.value = false
  }, 3000)
}

const handleLogout = () => {
  logout()
  router.push('/')
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-12 text-zinc-900 dark:text-white transition-colors duration-300">
    <!-- Unauthenticated State -->
    <div v-if="!isLoggedIn" class="text-center py-32 bg-white dark:bg-zinc-900/30 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-xl mx-auto p-12">
      <h2 class="text-3xl font-black mb-4">Access Denied</h2>
      <p class="text-zinc-500 mb-8 leading-relaxed">Please log in via the user icon in the top navigation bar to access your profile and order history.</p>
      <button 
        @click="router.push('/')" 
        class="bg-orange-500 hover:bg-orange-600 text-black px-8 py-4 rounded-2xl font-black transition-all active:scale-95 text-sm cursor-pointer shadow-lg shadow-orange-500/10"
      >
        Return to Home
      </button>
    </div>

    <!-- Authenticated Profile view -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      
      <!-- Left Column: User Card & Profile Update Form -->
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3rem shadow-xl p-8 flex flex-col items-center text-center">
          <img :src="user?.image" :alt="user?.username" class="w-24 h-24 rounded-full border-4 border-orange-500 shadow-lg object-cover mb-4" />
          <h2 class="text-2xl font-black leading-tight">{{ user?.firstName }} {{ user?.lastName }}</h2>
          <span class="text-zinc-400 text-xs mt-1">@{{ user?.username }}</span>
          
          <button 
            @click="handleLogout"
            class="mt-6 w-full border border-red-500/30 hover:border-red-500 text-red-500 px-6 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer hover:bg-red-500/5"
          >
            Sign Out
          </button>
        </div>

        <!-- Profile Update Form -->
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3rem shadow-xl p-8 space-y-4">
          <h3 class="text-lg font-black text-left">Edit Details</h3>
          
          <div v-if="showSuccessAlert" class="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-4 rounded-2xl text-xs font-semibold">
            ✓ Profile saved successfully!
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-2 font-mono">First Name</label>
              <input v-model="firstName" type="text" class="input-style shadow-sm !p-3" />
            </div>
            <div>
              <label class="block text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-2 font-mono">Last Name</label>
              <input v-model="lastName" type="text" class="input-style shadow-sm !p-3" />
            </div>
          </div>

          <div>
            <label class="block text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-2 font-mono">Email</label>
            <input v-model="email" type="email" class="input-style shadow-sm !p-3" />
          </div>

          <div>
            <label class="block text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-2 font-mono">Phone</label>
            <input v-model="phone" type="text" class="input-style shadow-sm !p-3" />
          </div>

          <div>
            <label class="block text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-2 font-mono">Street Address</label>
            <input v-model="address" type="text" class="input-style shadow-sm !p-3" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-2 font-mono">City</label>
              <input v-model="city" type="text" class="input-style shadow-sm !p-3" />
            </div>
            <div>
              <label class="block text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-2 font-mono">Postal Code</label>
              <input v-model="postalCode" type="text" class="input-style shadow-sm !p-3" />
            </div>
          </div>

          <button 
            @click="handleSave"
            class="w-full bg-orange-500 hover:bg-orange-600 text-black font-black py-4 rounded-2xl transition-all active:scale-95 text-xs shadow-md shadow-orange-500/10 cursor-pointer mt-4"
          >
            Save Changes
          </button>
        </div>
      </div>

      <!-- Right Column: Order History list -->
      <div class="lg:col-span-2 space-y-6">
        <h2 class="text-3xl font-black text-left mb-6">Order History</h2>
        
        <div v-if="orders.length === 0" class="text-center py-20 bg-white dark:bg-zinc-900/30 rounded-3rem border border-zinc-200 dark:border-zinc-800 shadow-md">
          <p class="text-zinc-500 font-bold">You haven't placed any orders yet!</p>
          <button 
            @click="router.push('/')" 
            class="text-orange-500 hover:underline mt-4 uppercase text-xs tracking-widest font-black cursor-pointer"
          >
            Go Shopping
          </button>
        </div>

        <div v-else class="space-y-6">
          <div 
            v-for="order in orders" 
            :key="order.orderId" 
            class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3rem shadow-xl p-6 md:p-8 space-y-6 transition-all duration-300"
          >
            <!-- Order Header info -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-4">
              <div class="text-left">
                <span class="block text-zinc-400 text-[10px] uppercase font-bold tracking-wider font-mono">Order Number</span>
                <span class="text-zinc-900 dark:text-white font-black">#{{ order.orderId }}</span>
              </div>
              <div class="text-left sm:text-right">
                <span class="block text-zinc-400 text-[10px] uppercase font-bold tracking-wider font-mono">Date Placed</span>
                <span class="text-zinc-800 dark:text-zinc-300 font-semibold">{{ order.date }}</span>
              </div>
              <div class="text-left">
                <span class="block text-zinc-400 text-[10px] uppercase font-bold tracking-wider font-mono">Payment</span>
                <span class="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 px-3 py-1 rounded-full text-xs font-bold uppercase">{{ order.paymentMethod }}</span>
              </div>
              <div class="text-left sm:text-right">
                <span class="block text-zinc-400 text-[10px] uppercase font-bold tracking-wider font-mono">Status</span>
                <span
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                  :class="statusClass(getTrackingState(order, now).stage)"
                >{{ order.schedule ? stageLabel(getTrackingState(order, now).stage) : order.status }}</span>
              </div>
            </div>

            <!-- Items bought -->
            <div class="space-y-4">
              <div v-for="item in order.items" :key="item.id" class="flex items-center space-x-4">
                <img :src="item.thumbnail" class="w-12 h-12 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800" />
                <div class="flex-1 text-left">
                  <h4 class="text-zinc-900 dark:text-white font-semibold text-sm leading-tight">{{ item.title }}</h4>
                  <span class="text-zinc-400 text-xs">Qty: {{ item.quantity }}</span>
                </div>
                <div class="text-right text-orange-500 font-bold">{{ formatLKR(item.price * item.quantity) }}</div>
              </div>
            </div>

            <!-- Cost summaries and delivery -->
            <div class="flex flex-col sm:flex-row justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800 text-sm text-zinc-500 gap-4">
              <div class="text-left text-xs leading-relaxed max-w-sm">
                <span class="block text-[10px] uppercase font-bold tracking-wider font-mono text-zinc-400 mb-1">Delivered To</span>
                <p class="font-semibold text-zinc-800 dark:text-zinc-300">{{ order.address.fullName }}</p>
                <p>{{ order.address.addressLine }}, {{ order.address.city }}, {{ order.address.postalCode }}</p>
              </div>

              <div class="w-full sm:w-60 space-y-2 font-medium">
                <div class="flex justify-between">
                  <span>Subtotal</span>
                  <span>{{ formatLKR(order.subtotal) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Delivery</span>
                  <span>{{ formatLKR(order.deliveryFee) }}</span>
                </div>
                <div class="flex justify-between text-orange-500">
                  <span>Discount</span>
                  <span>-{{ formatLKR(order.discount) }}</span>
                </div>
                <div class="flex justify-between text-zinc-900 dark:text-white font-black text-lg pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span>Total Paid</span>
                  <span>{{ formatLKR(order.total) }}</span>
                </div>
                <button
                  v-if="order.schedule"
                  @click="router.push(`/track/${order.orderId}`)"
                  class="w-full mt-2 py-2.5 rounded-xl text-xs font-black cursor-pointer transition-colors"
                  :class="getTrackingState(order, now).isActive
                    ? 'bg-orange-500 hover:bg-orange-400 text-black'
                    : 'border border-zinc-200 dark:border-zinc-700 hover:border-orange-500 text-zinc-700 dark:text-zinc-300'"
                >
                  {{ getTrackingState(order, now).isActive ? '📍 Track Live' : 'View Details' }}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>
