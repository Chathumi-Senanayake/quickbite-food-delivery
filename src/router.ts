import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './components/HomeView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/offers', component: () => import('./components/OffersPage.vue') },
  { path: '/recipe/:id', component: () => import('./components/RecipeDetailView.vue') },
  { path: '/profile', component: () => import('./components/ProfileView.vue') },
  { path: '/track/:id', component: () => import('./components/TrackOrderView.vue') }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Start each new page at the top (but restore position on back/forward)
  scrollBehavior: (_to, _from, savedPosition) => savedPosition ?? { top: 0 }
})

export default router