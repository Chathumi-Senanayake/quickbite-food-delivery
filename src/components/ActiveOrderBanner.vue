<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCart } from '../composables/useCart'
import { STAGES, formatCountdown, getTrackingState, stageLabel, useOrderTracking } from '../composables/useOrderTracking'
import type { OrderStage } from '../types'

const route = useRoute()
const router = useRouter()
const { orders } = useCart()
const { now, activeOrders } = useOrderTracking()

// Most recent in-progress order (orders are stored newest first)
const current = computed(() => activeOrders.value[0])
const tracking = computed(() => current.value ? getTrackingState(current.value, now.value) : null)
const isOnTrackPage = computed(() => route.path.startsWith('/track/'))

// --- Status-change notifications ---
const toast = ref<{ orderId: string; title: string; body: string } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | undefined

const notify = (orderId: string, stage: OrderStage) => {
  const meta = STAGES.find(s => s.key === stage)
  const title = `Order #${orderId}: ${stageLabel(stage)}`
  const body = meta?.description ?? ''

  toast.value = { orderId, title, body }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), 5000)

  // Also notify via the OS when the tab is in the background
  if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
    new Notification(title, { body, icon: `${import.meta.env.BASE_URL}favicon.svg` })
  }
}

// Remember each order's last seen stage so we only announce real transitions
const lastSeen = new Map<string, OrderStage>()
watch(now, (at) => {
  for (const order of orders.value) {
    const { stage, isTrackable } = getTrackingState(order, at)
    if (!isTrackable) continue
    const previous = lastSeen.get(order.orderId)
    lastSeen.set(order.orderId, stage)
    if (previous && previous !== stage && stage !== 'cancelled') notify(order.orderId, stage)
  }
}, { immediate: true })

const openToast = () => {
  if (toast.value) router.push(`/track/${toast.value.orderId}`)
  toast.value = null
}
</script>

<template>
  <div class="fixed bottom-4 right-4 left-4 sm:left-auto z-30 flex flex-col items-end gap-3 pointer-events-none">
    <Transition name="fade">
      <div
        v-if="toast"
        @click="openToast"
        class="pointer-events-auto w-full sm:w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 text-left cursor-pointer"
      >
        <p class="font-black text-sm text-zinc-900 dark:text-white">{{ toast.title }}</p>
        <p class="text-xs text-zinc-500">{{ toast.body }}</p>
      </div>
    </Transition>

    <button
      v-if="current && tracking && !isOnTrackPage"
      @click="router.push(`/track/${current.orderId}`)"
      class="pointer-events-auto w-full sm:w-80 bg-orange-500 hover:bg-orange-400 text-black rounded-2xl shadow-2xl shadow-orange-500/20 p-4 flex items-center gap-3 text-left cursor-pointer transition-colors"
    >
      <span class="text-2xl animate-bounce">{{ STAGES[tracking.stageIndex].icon }}</span>
      <span class="flex-1">
        <span class="block text-[10px] uppercase font-black tracking-widest opacity-70">Live order #{{ current.orderId }}</span>
        <span class="block font-black">{{ stageLabel(tracking.stage) }}</span>
      </span>
      <span class="text-right">
        <span class="block text-[10px] font-bold opacity-70">ETA</span>
        <span class="block font-black tabular-nums">{{ formatCountdown(tracking.secondsRemaining) }}</span>
      </span>
      <span v-if="activeOrders.length > 1" class="bg-black text-orange-500 text-[10px] font-black px-2 py-1 rounded-full">
        +{{ activeOrders.length - 1 }}
      </span>
    </button>
  </div>
</template>
