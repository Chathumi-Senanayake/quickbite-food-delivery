<script setup lang="ts">
defineProps<{ orderId: string }>()
defineEmits(['go-home', 'track'])
</script>

<template>
  <div class="fixed inset-0 z-[60] bg-black flex items-center justify-center p-6">
    <div class="max-w-md w-full text-center space-y-8">
      <div class="relative inline-block">
        <div class="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="white" class="w-12 h-12">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <div class="absolute -top-2 -right-2 text-orange-400 animate-ping">✨</div>
      </div>

      <div class="space-y-2">
        <h1 class="text-3xl font-black text-white">Order Placed Successfully!</h1>
        <p class="text-zinc-400">Thank you! Order <span class="text-white font-bold">#{{ orderId }}</span> has been placed.</p>
      </div>

      <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-1">
        <p class="text-zinc-500 text-xs uppercase font-bold tracking-widest">Estimated Delivery Time</p>
        <p class="text-2xl font-bold text-orange-500">A few minutes</p>
        <p class="text-zinc-500 text-sm">Follow your rider live on the map. We'll notify you at every step.</p>
      </div>

      <div class="flex flex-col gap-3">
        <button
          @click="$emit('track')"
          class="w-full bg-orange-500 text-black font-bold py-4 rounded-2xl hover:bg-orange-400 transition cursor-pointer"
        >
          Track Order
        </button>
        <button 
          @click="$emit('go-home')"
          class="w-full bg-transparent border border-zinc-700 text-white font-bold py-4 rounded-2xl hover:bg-zinc-800 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  </div>
</template>