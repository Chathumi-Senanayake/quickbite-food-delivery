<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import type { LatLng } from '../types'
import { useTheme } from '../composables/useTheme'
import { RESTAURANT, reverseGeocode, searchAddress, type GeocodedAddress, type SearchResult } from '../utils/geo'
import { createTileLayer, homeIcon, restaurantIcon } from '../utils/leaflet'

const props = defineProps<{ modelValue: LatLng; route?: LatLng[] }>()
const emit = defineEmits<{
  'update:modelValue': [value: LatLng]
  address: [value: GeocodedAddress]
}>()

const { isDark } = useTheme()

const mapEl = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let tiles: L.TileLayer | null = null
let pin: L.Marker | null = null
let routeLine: L.Polyline | null = null

const locating = ref(false)
const locateError = ref('')
const query = ref('')
const results = ref<SearchResult[]>([])
const searching = ref(false)

const setLocation = async (location: LatLng, knownAddress?: GeocodedAddress) => {
  emit('update:modelValue', location)
  const address = knownAddress ?? await reverseGeocode(location)
  if (address) emit('address', address)
}

const useMyLocation = () => {
  locateError.value = ''
  if (!navigator.geolocation) {
    locateError.value = 'Location is not supported by this browser.'
    return
  }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      locating.value = false
      const location: LatLng = [coords.latitude, coords.longitude]
      map?.setView(location, 16)
      setLocation(location)
    },
    () => {
      locating.value = false
      locateError.value = 'Could not get your location. Drop the pin manually instead.'
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(query, (q) => {
  clearTimeout(searchTimer)
  if (q.trim().length < 3) {
    results.value = []
    return
  }
  // Nominatim's usage policy asks for at most one request per second.
  searchTimer = setTimeout(async () => {
    searching.value = true
    results.value = await searchAddress(q.trim())
    searching.value = false
  }, 600)
})

const chooseResult = (result: SearchResult) => {
  query.value = ''
  results.value = []
  map?.setView(result.location, 16)
  setLocation(result.location, result)
}

onMounted(() => {
  map = L.map(mapEl.value!, { zoomControl: true }).setView(props.modelValue, 14)
  tiles = createTileLayer(isDark.value).addTo(map)

  L.marker(RESTAURANT.location, { icon: restaurantIcon() })
    .bindTooltip(RESTAURANT.name)
    .addTo(map)

  pin = L.marker(props.modelValue, { icon: homeIcon(), draggable: true }).addTo(map)
  pin.on('dragend', () => {
    const { lat, lng } = pin!.getLatLng()
    setLocation([lat, lng])
  })
  map.on('click', (e: L.LeafletMouseEvent) => setLocation([e.latlng.lat, e.latlng.lng]))
})

watch(() => props.modelValue, (location) => pin?.setLatLng(location))

watch(() => props.route, (route) => {
  routeLine?.remove()
  routeLine = null
  if (map && route && route.length > 1) {
    routeLine = L.polyline(route, { color: '#f97316', weight: 5, opacity: 0.8 }).addTo(map)
  }
})

watch(isDark, (dark) => {
  if (!map) return
  tiles?.remove()
  tiles = createTileLayer(dark).addTo(map)
})

onBeforeUnmount(() => {
  clearTimeout(searchTimer)
  map?.remove()
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <input
          v-model="query"
          type="text"
          placeholder="Search for your address..."
          class="input-style shadow-sm !py-3"
        />
        <ul
          v-if="results.length || searching"
          class="absolute z-10 left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden text-left"
        >
          <li v-if="searching" class="px-4 py-3 text-sm text-zinc-500">Searching...</li>
          <li
            v-for="result in results"
            :key="result.displayName"
            @click="chooseResult(result)"
            class="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-orange-500/10 cursor-pointer border-t first:border-t-0 border-zinc-100 dark:border-zinc-800"
          >
            {{ result.displayName }}
          </li>
        </ul>
      </div>
      <button
        type="button"
        @click="useMyLocation"
        :disabled="locating"
        class="px-4 py-3 rounded-xl border border-orange-500/40 text-orange-500 font-bold text-sm hover:bg-orange-500/10 transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
      >
        {{ locating ? 'Locating...' : '📍 Use my location' }}
      </button>
    </div>

    <p v-if="locateError" class="text-xs text-red-500 text-left">{{ locateError }}</p>

    <div ref="mapEl" class="h-72 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"></div>
    <p class="text-xs text-zinc-500 text-left">Tap the map or drag the 🏠 pin to set your exact drop-off point.</p>
  </div>
</template>
