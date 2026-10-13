<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCart } from '../composables/useCart'
import type { Product, Recipe } from '../types'
import { formatLKR } from '../utils/currency'

const route = useRoute()
const router = useRouter()
const { addToCart } = useCart()

const recipe = ref<Recipe | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Calculate simulated price & discount matching useProducts.ts
const displayPrices = computed(() => {
  if (!recipe.value) return { original: 0, final: 0 }
  const id = recipe.value.id
  const prep = recipe.value.prepTimeMinutes
  const cook = recipe.value.cookTimeMinutes
  const original = parseFloat(( (prep + cook) * 0.15 + 6.99 ).toFixed(2))
  const discount = id % 3 === 0 ? 15 : id % 5 === 0 ? 25 : 0
  const final = discount ? original * (1 - discount / 100) : original
  return { original, final, discount }
})

const fetchRecipeDetails = async () => {
  loading.value = true
  error.value = null
  try {
    const id = route.params.id
    const response = await fetch(`https://dummyjson.com/recipes/${id}`)
    if (!response.ok) throw new Error('Recipe not found')
    const data = await response.json()
    
    // Map properties to fit the strict Recipe interface
    recipe.value = {
      ...data,
      title: data.name,
      thumbnail: data.image,
      description: `Authentic ${data.cuisine} cuisine, rated ${data.rating} stars.`,
      price: parseFloat(((data.prepTimeMinutes + data.cookTimeMinutes) * 0.15 + 6.99).toFixed(2)),
      discount: data.id % 3 === 0 ? 15 : data.id % 5 === 0 ? 25 : 0
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load recipe details'
  } finally {
    loading.value = false
  }
}

const handleAddToCart = () => {
  if (!recipe.value) return
  // Map fields to Product shape for Cart compatibility
  const product: Product = {
    ...recipe.value,
    title: recipe.value.name,
    thumbnail: recipe.value.image,
    description: `Authentic ${recipe.value.cuisine} cuisine.`,
    price: displayPrices.value.original,
    discount: displayPrices.value.discount || undefined
  }
  addToCart(product)
}

onMounted(() => {
  fetchRecipeDetails()
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-12 text-white">
    <!-- Back Navigation -->
    <button 
      @click="router.back()" 
      class="flex items-center space-x-2 text-zinc-400 hover:text-orange-500 font-bold transition mb-8 cursor-pointer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
      </svg>
      <span>Back to Recipes</span>
    </button>

    <div v-if="loading" class="text-center py-32">
      <div class="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 text-zinc-400 font-bold uppercase tracking-widest text-xs">Loading Recipe Details...</p>
    </div>

    <div v-else-if="error" class="text-center py-32 bg-zinc-900/20 rounded-[2rem] border border-dashed border-red-500/50">
      <p class="text-red-500 text-xl font-bold">{{ error }}</p>
      <button @click="fetchRecipeDetails" class="text-orange-500 font-bold hover:underline mt-4 uppercase text-xs tracking-widest">
        Try Again
      </button>
    </div>

    <div v-else-if="recipe" class="grid grid-cols-1 md:grid-cols-2 gap-12 bg-zinc-900/40 p-8 md:p-12 rounded-[2.5rem] border border-zinc-800 backdrop-blur-md">
      <!-- Recipe Image & Fast Facts -->
      <div class="space-y-6">
        <div class="aspect-video md:aspect-square rounded-3xl overflow-hidden border border-zinc-800 relative">
          <img :src="recipe.image" :alt="recipe.name" class="w-full h-full object-cover" />
          <div v-if="displayPrices.discount" class="absolute top-4 left-4 bg-orange-500 text-black font-black px-3 py-1.5 rounded-xl text-sm shadow-lg">
            -{{ displayPrices.discount }}% OFF
          </div>
        </div>

        <!-- Recipe Fact Badges -->
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-zinc-900 border border-zinc-800/80 p-4 rounded-2xl text-center">
            <span class="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Prep Time</span>
            <span class="text-sm font-black text-white">{{ recipe.prepTimeMinutes }}m</span>
          </div>
          <div class="bg-zinc-900 border border-zinc-800/80 p-4 rounded-2xl text-center">
            <span class="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Cook Time</span>
            <span class="text-sm font-black text-white">{{ recipe.cookTimeMinutes }}m</span>
          </div>
          <div class="bg-zinc-900 border border-zinc-800/80 p-4 rounded-2xl text-center">
            <span class="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Servings</span>
            <span class="text-sm font-black text-white">{{ recipe.servings }}</span>
          </div>
        </div>
      </div>

      <!-- Detail Info -->
      <div class="flex flex-col h-full space-y-6">
        <div>
          <div class="flex items-center space-x-2 mb-3">
            <span class="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              {{ recipe.cuisine }}
            </span>
            <span class="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              {{ recipe.difficulty }}
            </span>
          </div>
          <h1 class="text-3xl md:text-4xl font-black tracking-tight leading-none mb-3">{{ recipe.name }}</h1>
          
          <div class="flex items-center space-x-2 text-yellow-500 font-bold">
            <span>⭐ {{ recipe.rating }}</span>
            <span class="text-zinc-500 text-xs font-normal">({{ recipe.reviewCount }} reviews)</span>
          </div>
        </div>

        <!-- Dynamic Pricing & Add to Cart -->
        <div class="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1 font-mono">Special Price</span>
            <div class="flex items-baseline space-x-2">
              <span class="text-orange-500 text-3xl font-black">{{ formatLKR(displayPrices.final) }}</span>
              <span v-if="displayPrices.discount" class="text-zinc-500 line-through text-sm">{{ formatLKR(displayPrices.original) }}</span>
            </div>
          </div>
          <button 
            @click="handleAddToCart"
            class="bg-orange-500 hover:bg-orange-600 text-black px-6 py-4 rounded-2xl font-black transition-all active:scale-95 flex items-center space-x-2 shadow-lg shadow-orange-500/15 text-sm cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Add to Cart</span>
          </button>
        </div>

        <!-- Tabs/Section: Ingredients -->
        <div class="space-y-3">
          <h3 class="text-lg font-black text-white border-b border-zinc-800 pb-2">Ingredients</h3>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-400 text-sm">
            <li v-for="ing in recipe.ingredients" :key="ing" class="flex items-center space-x-2">
              <span class="text-orange-500 text-lg">•</span>
              <span>{{ ing }}</span>
            </li>
          </ul>
        </div>

        <!-- Section: Instructions -->
        <div class="space-y-3">
          <h3 class="text-lg font-black text-white border-b border-zinc-800 pb-2">Instructions</h3>
          <ol class="space-y-3 text-zinc-400 text-sm">
            <li v-for="(step, idx) in recipe.instructions" :key="idx" class="flex items-start space-x-3">
              <span class="bg-zinc-800 text-zinc-300 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                {{ idx + 1 }}
              </span>
              <p class="leading-relaxed">{{ step }}</p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>
