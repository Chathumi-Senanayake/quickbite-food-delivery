import { ref } from 'vue'
import type { Product } from '../types'

export const useProducts = () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchProducts = async (searchQuery: string = '') => {
    loading.value = true
    error.value = null
    try {
      const url = searchQuery 
        ? `https://dummyjson.com/recipes/search?q=${encodeURIComponent(searchQuery)}`
        : 'https://dummyjson.com/recipes?limit=30'
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch recipes')
      const data = await response.json()
      
      products.value = data.recipes.map((item: any) => {
        // Keep recipe prices in the requested Sri Lankan rupee range.
        const cookingTime = item.prepTimeMinutes + item.cookTimeMinutes
        const price = Math.min(1000, Math.max(500, 500 + cookingTime * 5))
        // Apply discount to some recipes
        const discount = item.id % 3 === 0 ? 15 : item.id % 5 === 0 ? 25 : 0
        
        return {
          ...item,
          title: item.name, // fallback for components using .title
          thumbnail: item.image, // fallback for components using .thumbnail
          description: `Authentic ${item.cuisine} cuisine, rated ${item.rating} stars. Prep time: ${item.prepTimeMinutes} mins.`,
          price,
          discount
        }
      })
    } catch (err) {
      error.value = "Failed to load recipes."
    } finally {
      loading.value = false
    }
  }

  return { products, loading, error, fetchProducts }
}
