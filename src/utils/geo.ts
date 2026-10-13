import type { LatLng } from '../types'

// The kitchen every order is dispatched from (Kollupitiya, Colombo 03).
export const RESTAURANT = {
  name: 'QuickBite Kitchen - Colombo 03',
  location: [6.9147, 79.8528] as LatLng,
}

// Default drop-off pin shown before the customer picks a location.
export const DEFAULT_DESTINATION: LatLng = [6.8941, 79.8566]

// Orders further than this (by road) are rejected at checkout.
export const MAX_DELIVERY_KM = 15

/** Great-circle distance between two points in kilometres. */
export function haversineKm([lat1, lng1]: LatLng, [lat2, lng2]: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Total length of a polyline in kilometres. */
export function pathLengthKm(path: LatLng[]): number {
  let total = 0
  for (let i = 1; i < path.length; i++) total += haversineKm(path[i - 1], path[i])
  return total
}

/** Point at `fraction` (0..1) of the way along a polyline, measured by distance. */
export function pointAlongPath(path: LatLng[], fraction: number): LatLng {
  if (path.length === 0) return RESTAURANT.location
  if (fraction <= 0 || path.length === 1) return path[0]
  if (fraction >= 1) return path[path.length - 1]

  let remaining = pathLengthKm(path) * fraction
  for (let i = 1; i < path.length; i++) {
    const segment = haversineKm(path[i - 1], path[i])
    if (remaining <= segment) {
      const t = segment === 0 ? 0 : remaining / segment
      const [lat1, lng1] = path[i - 1]
      const [lat2, lng2] = path[i]
      return [lat1 + (lat2 - lat1) * t, lng1 + (lng2 - lng1) * t]
    }
    remaining -= segment
  }
  return path[path.length - 1]
}

async function fetchJson(url: string, timeoutMs = 6000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`Request failed: ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

export interface RouteResult {
  path: LatLng[];
  distanceKm: number;
  // false when the routing service was unreachable and a straight line was used
  isRoadRoute: boolean;
}

/** Driving route between two points via the public OSRM server, with a straight-line fallback. */
export async function fetchRoute(from: LatLng, to: LatLng): Promise<RouteResult> {
  try {
    const coords = `${from[1]},${from[0]};${to[1]},${to[0]}`
    const data = await fetchJson(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,
    )
    const route = data.routes?.[0]
    if (!route) throw new Error('No route found')
    return {
      path: route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as LatLng),
      distanceKm: route.distance / 1000,
      isRoadRoute: true,
    }
  } catch {
    // Roads are rarely straight; 1.3x is a common road-to-crow-flies ratio.
    return { path: [from, to], distanceKm: haversineKm(from, to) * 1.3, isRoadRoute: false }
  }
}

export interface GeocodedAddress {
  addressLine: string;
  city: string;
  postalCode: string;
  displayName: string;
}

function toGeocodedAddress(result: any): GeocodedAddress {
  const a = result.address || {}
  const street = [a.house_number, a.road].filter(Boolean).join(' ')
  return {
    addressLine: [street, a.suburb || a.neighbourhood].filter(Boolean).join(', ') || result.display_name,
    city: a.city || a.town || a.village || a.county || '',
    postalCode: a.postcode || '',
    displayName: result.display_name,
  }
}

/** Street address for a coordinate, via OpenStreetMap Nominatim. Returns null on failure. */
export async function reverseGeocode([lat, lng]: LatLng): Promise<GeocodedAddress | null> {
  try {
    const data = await fetchJson(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`,
    )
    return data.error ? null : toGeocodedAddress(data)
  } catch {
    return null
  }
}

export interface SearchResult extends GeocodedAddress {
  location: LatLng;
}

/** Address search limited to Sri Lanka. */
export async function searchAddress(query: string): Promise<SearchResult[]> {
  try {
    const data = await fetchJson(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=lk&limit=5&q=${encodeURIComponent(query)}`,
    )
    return data.map((r: any) => ({
      ...toGeocodedAddress(r),
      location: [Number(r.lat), Number(r.lon)] as LatLng,
    }))
  } catch {
    return []
  }
}
