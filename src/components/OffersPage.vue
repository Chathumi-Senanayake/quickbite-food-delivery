<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useProducts } from '../composables/useProducts'
import ProductCard from './ProductCard.vue'
// REMOVE the .ts extension here
import type { Product } from '../types/index' 

const { products, fetchProducts } = useProducts()

onMounted(() => {
  if (products.value.length === 0) {
    fetchProducts()
  }
})

const discountedItems = computed(() => {
  // We cast to Product[] to ensure TypeScript knows the array structure
  return (products.value as Product[]).filter(item => !!item.discount && item.discount > 0)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-8 py-12">
    <header class="mb-12 border-l-4 border-orange-500 pl-6">
      <h1 class="text-4xl font-black text-zinc-900 dark:text-white mb-2 italic tracking-tighter transition-colors duration-300">Flash Deals ⚡</h1>
      <p class="text-orange-500 font-bold uppercase tracking-widest text-xs">Save big on your favorites</p>
    </header>

    <div v-if="discountedItems.length === 0" class="text-zinc-500 text-center py-20 font-medium bg-zinc-100 dark:bg-zinc-900/20 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 transition-all duration-300">
      No active discounts right now. Check back soon!
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      <ProductCard 
        v-for="item in discountedItems" 
        :key="item.id" 
        :product="item" 
      />
    </div>
  </div>
</template>

<style scoped>
.max-w-7xl {
  min-height: 80vh;
}
</style>