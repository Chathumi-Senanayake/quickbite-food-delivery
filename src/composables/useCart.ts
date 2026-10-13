import { ref, computed, watch } from 'vue'
import type { CartItem, Product, OrderRecord } from '../types'

// Global state for the cart with localStorage persistence
const cart = ref<CartItem[]>(JSON.parse(localStorage.getItem('quickbite_cart') || '[]'))

watch(cart, (newCart) => {
  localStorage.setItem('quickbite_cart', JSON.stringify(newCart))
}, { deep: true })

// Global state for order history records
const orders = ref<OrderRecord[]>(JSON.parse(localStorage.getItem('quickbite_orders') || '[]'))

watch(orders, (newOrders) => {
  localStorage.setItem('quickbite_orders', JSON.stringify(newOrders))
}, { deep: true })

export const useCart = () => {
  const addToCart = (product: Product) => {
    const existingItem = cart.value.find(item => item.id === product.id)
    
    const actualPrice = product.discount 
      ? product.price * (1 - product.discount / 100) 
      : product.price

    if (existingItem) {
      existingItem.quantity++
    } else {
      cart.value.push({
        ...product,
        price: actualPrice,
        quantity: 1
      })
    }
  }

  const cartCount = computed(() => {
    return cart.value.reduce((total, item) => total + item.quantity, 0)
  })

  const cartTotal = computed(() => {
    const total = cart.value.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    return total.toFixed(2)
  })

  const removeFromCart = (id: number) => {
    const index = cart.value.findIndex(item => item.id === id)
    if (index > -1) {
      if (cart.value[index].quantity > 1) {
        cart.value[index].quantity--
      } else {
        cart.value.splice(index, 1)
      }
    }
  }

  const clearCart = () => {
    cart.value = []
  }

  const addOrderRecord = (record: OrderRecord) => {
    orders.value.unshift(record)
  }

  return { 
    cart, 
    cartTotal, 
    cartCount,
    orders,
    addToCart, 
    removeFromCart, 
    clearCart,
    addOrderRecord
  }
}