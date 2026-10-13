<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TrackingMap from './TrackingMap.vue'
import { STAGES, formatCountdown, getTrackingState, stageLabel, useOrderTracking } from '../composables/useOrderTracking'
import { RESTAURANT } from '../utils/geo'
import { formatLKR } from '../utils/currency'

const route = useRoute()
const router = useRouter()
const { now, findOrder, cancelOrder, rateOrder } = useOrderTracking()

const order = computed(() => findOrder(String(route.params.id)))
const tracking = computed(() => order.value ? getTrackingState(order.value, now.value) : null)

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const headline = computed(() => {
  const stage = tracking.value?.stage
  if (stage === 'cancelled') return 'Order cancelled'
  if (stage === 'delivered') return 'Order delivered!'
  return STAGES.find(s => s.key === stage)?.description ?? ''
})

const confirmingCancel = ref(false)
const handleCancel = () => {
  if (!order.value) return
  cancelOrder(order.value.orderId)
  confirmingCancel.value = false
}

const hoverRating = ref(0)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-zinc-900 dark:text-white">
    <!-- Order not found -->
    <div v-if="!order" class="text-center py-32 bg-white dark:bg-zinc-900/30 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 max-w-xl mx-auto p-12">
      <h2 class="text-3xl font-black mb-4">Order not found</h2>
      <p class="text-zinc-500 mb-8">We couldn't find order #{{ route.params.id }} on this device.</p>
      <button @click="router.push('/')" class="bg-orange-500 hover:bg-orange-600 text-black px-8 py-4 rounded-2xl font-black cursor-pointer">
        Return to Home
      </button>
    </div>

    <!-- Order placed before live tracking existed -->
    <div v-else-if="!tracking?.isTrackable" class="text-center py-32 bg-white dark:bg-zinc-900/30 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 max-w-xl mx-auto p-12">
      <h2 class="text-3xl font-black mb-4">Tracking unavailable</h2>
      <p class="text-zinc-500 mb-8">Order #{{ order.orderId }} was placed before live tracking was available.</p>
      <button @click="router.push('/profile')" class="bg-orange-500 hover:bg-orange-600 text-black px-8 py-4 rounded-2xl font-black cursor-pointer">
        View Order History
      </button>
    </div>

    <template v-else-if="tracking">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 text-left">
        <div>
          <button @click="router.back()" class="text-zinc-500 hover:text-orange-500 text-sm cursor-pointer mb-2">← Back</button>
          <h1 class="text-3xl font-black">Track Order <span class="text-orange-500">#{{ order.orderId }}</span></h1>
        </div>
        <span class="text-zinc-500 text-sm">Placed {{ order.date }}, {{ formatTime(order.placedAt!) }}</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Map -->
        <div class="lg:col-span-3 h-[420px] lg:h-[640px] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <TrackingMap
            :restaurant="order.restaurant?.location ?? RESTAURANT.location"
            :restaurant-name="order.restaurant?.name ?? RESTAURANT.name"
            :destination="order.destination!"
            :route="order.route ?? []"
            :rider-position="tracking.riderPosition"
          />
        </div>

        <!-- Status panel -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Headline + ETA -->
          <div
            class="rounded-3xl p-6 text-left border"
            :class="tracking.stage === 'cancelled'
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-orange-500 border-orange-500 text-black'"
          >
            <p class="text-xs uppercase font-black tracking-widest opacity-70">{{ stageLabel(tracking.stage) }}</p>
            <h2 class="text-2xl font-black mt-1">{{ headline }}</h2>
            <div v-if="tracking.isActive" class="flex items-end justify-between mt-4">
              <div>
                <p class="text-xs font-bold opacity-70">Arriving in</p>
                <p class="text-4xl font-black tabular-nums">{{ formatCountdown(tracking.secondsRemaining) }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs font-bold opacity-70">Estimated arrival</p>
                <p class="text-lg font-black">{{ formatTime(order.schedule!.delivered) }}</p>
              </div>
            </div>
            <div v-if="tracking.stage === 'on_the_way'" class="mt-4 h-2 bg-black/20 rounded-full overflow-hidden">
              <div class="h-full bg-black transition-all duration-1000" :style="{ width: `${tracking.tripProgress * 100}%` }"></div>
            </div>
            <p v-if="tracking.stage === 'delivered'" class="mt-2 font-semibold">Delivered at {{ formatTime(order.schedule!.delivered) }}</p>
            <p v-if="tracking.stage === 'cancelled'" class="mt-2 text-sm text-red-600 dark:text-red-400 font-semibold">
              Cancelled at {{ formatTime(order.cancelledAt!) }}. Any card payment will be refunded within 3-5 business days.
            </p>
          </div>

          <!-- Rider -->
          <div
            v-if="order.rider && tracking.stageIndex >= 1"
            class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 flex items-center gap-4"
          >
            <img :src="order.rider.image" :alt="order.rider.name" class="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-orange-500" />
            <div class="flex-1 text-left">
              <p class="text-xs text-zinc-500 font-bold">Your rider</p>
              <p class="font-black">{{ order.rider.name }} <span class="text-orange-500 text-sm">★ {{ order.rider.rating.toFixed(1) }}</span></p>
              <p class="text-xs text-zinc-500">{{ order.rider.vehicle }} · {{ order.rider.plate }}</p>
            </div>
            <a
              v-if="tracking.isActive"
              :href="`tel:${order.rider.phone.replace(/\s/g, '')}`"
              class="w-11 h-11 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center text-lg"
              title="Call rider"
            >📞</a>
          </div>

          <!-- Timeline -->
          <div v-if="tracking.stage !== 'cancelled'" class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
            <ol class="space-y-0">
              <li v-for="(stage, i) in STAGES" :key="stage.key" class="flex gap-4 text-left">
                <div class="flex flex-col items-center">
                  <div
                    class="w-9 h-9 rounded-full flex items-center justify-center text-base border-2 transition-all"
                    :class="i < tracking.stageIndex || !tracking.isActive
                      ? 'bg-orange-500 border-orange-500'
                      : i === tracking.stageIndex
                        ? 'bg-orange-500/15 border-orange-500 animate-pulse'
                        : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 grayscale opacity-50'"
                  >{{ stage.icon }}</div>
                  <div
                    v-if="i < STAGES.length - 1"
                    class="w-0.5 h-8"
                    :class="i < tracking.stageIndex ? 'bg-orange-500' : 'bg-zinc-200 dark:bg-zinc-800'"
                  ></div>
                </div>
                <div class="flex-1 flex justify-between pt-1.5">
                  <div>
                    <p class="font-bold text-sm" :class="i > tracking.stageIndex && 'text-zinc-400'">{{ stage.label }}</p>
                    <p v-if="i === tracking.stageIndex" class="text-xs text-zinc-500">{{ stage.description }}</p>
                  </div>
                  <span class="text-xs text-zinc-500 tabular-nums">
                    {{ i <= tracking.stageIndex ? formatTime(order.schedule![stage.key]) : '' }}
                  </span>
                </div>
              </li>
            </ol>
          </div>

          <!-- Rating -->
          <div v-if="tracking.stage === 'delivered'" class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 text-center">
            <p class="font-black mb-3">{{ order.rating ? 'Thanks for your feedback!' : 'How was your order?' }}</p>
            <div class="flex justify-center gap-1" @mouseleave="hoverRating = 0">
              <button
                v-for="star in 5"
                :key="star"
                @click="rateOrder(order.orderId, star)"
                @mouseenter="hoverRating = star"
                class="text-3xl cursor-pointer transition-transform hover:scale-110"
                :class="star <= (hoverRating || order.rating || 0) ? 'text-orange-500' : 'text-zinc-300 dark:text-zinc-700'"
              >★</button>
            </div>
          </div>

          <!-- Order details -->
          <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 text-left">
            <div>
              <p class="text-[10px] uppercase font-bold tracking-wider font-mono text-zinc-400 mb-1">Delivering to</p>
              <p class="font-semibold text-sm">{{ order.address.fullName }} · {{ order.address.phone }}</p>
              <p class="text-sm text-zinc-500">{{ order.address.addressLine }}, {{ order.address.city }}</p>
              <p v-if="order.distanceKm" class="text-xs text-zinc-500 mt-1">{{ order.distanceKm.toFixed(1) }} km from {{ order.restaurant?.name }}</p>
            </div>
            <div class="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div v-for="item in order.items" :key="item.id" class="flex justify-between text-sm">
                <span class="text-zinc-600 dark:text-zinc-300">{{ item.quantity }} × {{ item.title }}</span>
                <span class="font-semibold">{{ formatLKR(item.price * item.quantity) }}</span>
              </div>
              <div class="flex justify-between font-black pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span>Total ({{ order.paymentMethod }})</span>
                <span class="text-orange-500">{{ formatLKR(order.total) }}</span>
              </div>
            </div>

            <template v-if="tracking.canCancel">
              <button
                v-if="!confirmingCancel"
                @click="confirmingCancel = true"
                class="w-full border border-red-500/30 hover:border-red-500 text-red-500 py-3 rounded-2xl text-sm font-bold cursor-pointer hover:bg-red-500/5"
              >
                Cancel Order
              </button>
              <div v-else class="flex gap-2">
                <button @click="handleCancel" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl text-sm font-bold cursor-pointer">
                  Yes, cancel
                </button>
                <button @click="confirmingCancel = false" class="flex-1 border border-zinc-300 dark:border-zinc-700 py-3 rounded-2xl text-sm font-bold cursor-pointer">
                  Keep order
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
