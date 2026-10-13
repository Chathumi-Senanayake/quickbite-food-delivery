<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import type { LatLng } from '../types'
import { useTheme } from '../composables/useTheme'
import { createTileLayer, homeIcon, restaurantIcon, riderIcon } from '../utils/leaflet'

const props = defineProps<{
  restaurant: LatLng
  restaurantName: string
  destination: LatLng
  route: LatLng[]
  riderPosition: LatLng | null
}>()

const { isDark } = useTheme()

const mapEl = ref<HTMLDivElement | null>(null)
const followRider = ref(false)
let map: L.Map | null = null
let tiles: L.TileLayer | null = null
let rider: L.Marker | null = null

const fitAll = () => {
  if (!map) return
  followRider.value = false
  const points = [props.restaurant, props.destination, ...props.route]
  map.fitBounds(L.latLngBounds(points), { padding: [48, 48] })
}

const toggleFollow = () => {
  followRider.value = !followRider.value
  if (followRider.value && props.riderPosition) map?.setView(props.riderPosition, 16)
}

const updateRider = (position: LatLng | null) => {
  if (!map) return
  if (!position) {
    rider?.remove()
    rider = null
    return
  }
  if (rider) {
    rider.setLatLng(position)
  } else {
    rider = L.marker(position, { icon: riderIcon(), zIndexOffset: 1000 }).bindTooltip('Your rider').addTo(map)
  }
  if (followRider.value) map.panTo(position, { animate: true })
}

onMounted(() => {
  map = L.map(mapEl.value!)
  tiles = createTileLayer(isDark.value).addTo(map)

  const route = props.route.length > 1 ? props.route : [props.restaurant, props.destination]
  // Casing + line gives the route some contrast on both light and dark tiles
  L.polyline(route, { color: '#7c2d12', weight: 9, opacity: 0.35 }).addTo(map)
  L.polyline(route, { color: '#f97316', weight: 5 }).addTo(map)

  L.marker(props.restaurant, { icon: restaurantIcon() }).bindTooltip(props.restaurantName).addTo(map)
  L.marker(props.destination, { icon: homeIcon() }).bindTooltip('Delivery location').addTo(map)

  updateRider(props.riderPosition)
  fitAll()
  // Stop following when the user pans the map themselves
  map.on('dragstart', () => (followRider.value = false))
})

watch(() => props.riderPosition, updateRider)

watch(isDark, (dark) => {
  if (!map) return
  tiles?.remove()
  tiles = createTileLayer(dark).addTo(map)
})

onBeforeUnmount(() => map?.remove())
</script>

<template>
  <div class="relative h-full w-full">
    <div ref="mapEl" class="h-full w-full"></div>
    <div class="absolute top-3 right-3 z-10 flex flex-col gap-2">
      <button
        @click="fitAll"
        class="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-orange-500"
      >
        Show full route
      </button>
      <button
        v-if="riderPosition"
        @click="toggleFollow"
        class="text-xs font-bold px-3 py-2 rounded-xl shadow-lg border cursor-pointer"
        :class="followRider
          ? 'bg-orange-500 text-black border-orange-500'
          : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white border-zinc-200 dark:border-zinc-800 hover:border-orange-500'"
      >
        {{ followRider ? 'Following rider' : 'Follow rider' }}
      </button>
    </div>
  </div>
</template>
