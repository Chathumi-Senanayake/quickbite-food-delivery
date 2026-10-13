import L from 'leaflet'

// Standard OpenStreetMap tiles — free and keyless. Dark mode is produced by a
// CSS filter on the tile layer (see .qb-tiles-dark in style.css).
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

export function createTileLayer(isDark: boolean) {
  return L.tileLayer(TILE_URL, {
    attribution: ATTRIBUTION,
    maxZoom: 19,
    className: isDark ? 'qb-tiles-dark' : '',
  })
}

/**
 * Emoji map pin. Uses a divIcon so we don't depend on Leaflet's default
 * marker images, which don't resolve under Vite's asset pipeline.
 */
export function emojiIcon(emoji: string, color: string, className = '') {
  return L.divIcon({
    className: `qb-marker ${className}`,
    html: `<div class="qb-marker-pin" style="background:${color}"><span>${emoji}</span></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  })
}

export const restaurantIcon = () => emojiIcon('🍔', '#f97316')
export const homeIcon = () => emojiIcon('🏠', '#18181b')
export const riderIcon = () => emojiIcon('🛵', '#16a34a', 'qb-rider')
