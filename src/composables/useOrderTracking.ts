import { ref, computed } from 'vue'
import type { LatLng, OrderRecord, OrderSchedule, OrderStage, Rider } from '../types'
import { RESTAURANT, pointAlongPath } from '../utils/geo'
import { useCart } from './useCart'

export const STAGES: { key: Exclude<OrderStage, 'cancelled'>; label: string; description: string; icon: string }[] = [
  { key: 'placed', label: 'Order Placed', description: 'We have received your order', icon: '🧾' },
  { key: 'confirmed', label: 'Confirmed', description: 'The kitchen accepted your order', icon: '✅' },
  { key: 'preparing', label: 'Preparing', description: 'Our chefs are cooking your food', icon: '👨‍🍳' },
  { key: 'picked_up', label: 'Picked Up', description: 'Your rider has collected the order', icon: '🛍️' },
  { key: 'on_the_way', label: 'On the Way', description: 'Your rider is heading to you', icon: '🛵' },
  { key: 'delivered', label: 'Delivered', description: 'Enjoy your meal!', icon: '🎉' },
]

// Orders can only be cancelled before the kitchen starts cooking.
const CANCELLABLE_STAGES: OrderStage[] = ['placed', 'confirmed']

// Stage offsets are compressed (seconds instead of minutes) so the whole
// lifecycle can be watched in a few minutes. Increase these for real-world timing.
const SECOND = 1000
const STAGE_OFFSETS = { confirmed: 15 * SECOND, preparing: 35 * SECOND, picked_up: 95 * SECOND, on_the_way: 105 * SECOND }
const TRAVEL_MS_PER_KM = 20 * SECOND
const MIN_TRAVEL_MS = 60 * SECOND
const MAX_TRAVEL_MS = 240 * SECOND

const RIDERS: Rider[] = [
  { name: 'Kasun Perera', phone: '+94 77 123 4567', vehicle: 'Honda Dio', plate: 'WP BHK-4521', rating: 4.9, image: 'https://api.dicebear.com/9.x/personas/svg?seed=Kasun' },
  { name: 'Nimal Silva', phone: '+94 71 987 6543', vehicle: 'TVS Ntorq', plate: 'WP BGZ-1180', rating: 4.8, image: 'https://api.dicebear.com/9.x/personas/svg?seed=Nimal' },
  { name: 'Tharindu Fernando', phone: '+94 76 555 0192', vehicle: 'Bajaj Pulsar', plate: 'WP BIA-7734', rating: 4.7, image: 'https://api.dicebear.com/9.x/personas/svg?seed=Tharindu' },
  { name: 'Ishara Jayasinghe', phone: '+94 70 246 8135', vehicle: 'Yamaha Ray ZR', plate: 'WP BKM-3309', rating: 5.0, image: 'https://api.dicebear.com/9.x/personas/svg?seed=Ishara' },
]

export const pickRider = (): Rider => RIDERS[Math.floor(Math.random() * RIDERS.length)]

export function buildSchedule(placedAt: number, distanceKm: number): OrderSchedule {
  const travel = Math.min(MAX_TRAVEL_MS, Math.max(MIN_TRAVEL_MS, distanceKm * TRAVEL_MS_PER_KM))
  const onTheWay = placedAt + STAGE_OFFSETS.on_the_way
  return {
    placed: placedAt,
    confirmed: placedAt + STAGE_OFFSETS.confirmed,
    preparing: placedAt + STAGE_OFFSETS.preparing,
    picked_up: placedAt + STAGE_OFFSETS.picked_up,
    on_the_way: onTheWay,
    delivered: onTheWay + travel,
  }
}

// One shared clock drives every tracking view.
const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | undefined
const startClock = () => {
  if (!ticker) ticker = setInterval(() => (now.value = Date.now()), 1000)
}

export interface TrackingState {
  stage: OrderStage;
  stageIndex: number;
  isTrackable: boolean;
  isActive: boolean;
  canCancel: boolean;
  riderPosition: LatLng | null;
  secondsRemaining: number;
  // Fraction of the rider's trip completed (0..1)
  tripProgress: number;
}

export function getTrackingState(order: OrderRecord, at: number): TrackingState {
  const { schedule } = order
  // Orders placed before tracking existed have no schedule; treat them as finished.
  if (!schedule || !order.destination) {
    return { stage: 'delivered', stageIndex: STAGES.length - 1, isTrackable: false, isActive: false, canCancel: false, riderPosition: null, secondsRemaining: 0, tripProgress: 1 }
  }

  if (order.cancelledAt) {
    return { stage: 'cancelled', stageIndex: -1, isTrackable: true, isActive: false, canCancel: false, riderPosition: null, secondsRemaining: 0, tripProgress: 0 }
  }

  let stageIndex = 0
  STAGES.forEach((s, i) => { if (at >= schedule[s.key]) stageIndex = i })
  const stage = STAGES[stageIndex].key

  const tripDuration = schedule.delivered - schedule.on_the_way
  const tripProgress = Math.min(1, Math.max(0, (at - schedule.on_the_way) / tripDuration))
  const path = order.route?.length ? order.route : [order.restaurant?.location ?? RESTAURANT.location, order.destination]

  return {
    stage,
    stageIndex,
    isTrackable: true,
    isActive: stage !== 'delivered',
    canCancel: CANCELLABLE_STAGES.includes(stage),
    // Only show the rider on the map while they're carrying the order
    riderPosition: stage === 'picked_up' || stage === 'on_the_way' ? pointAlongPath(path, tripProgress) : null,
    secondsRemaining: Math.max(0, Math.ceil((schedule.delivered - at) / 1000)),
    tripProgress,
  }
}

export function stageLabel(stage: OrderStage): string {
  return stage === 'cancelled' ? 'Cancelled' : STAGES.find(s => s.key === stage)!.label
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const useOrderTracking = () => {
  startClock()
  const { orders } = useCart()

  const activeOrders = computed(() =>
    orders.value.filter(order => getTrackingState(order, now.value).isActive),
  )

  const findOrder = (orderId: string) => orders.value.find(o => o.orderId === orderId)

  const cancelOrder = (orderId: string) => {
    const order = findOrder(orderId)
    if (order && getTrackingState(order, Date.now()).canCancel) {
      order.cancelledAt = Date.now()
      order.status = 'Cancelled'
    }
  }

  const rateOrder = (orderId: string, rating: number) => {
    const order = findOrder(orderId)
    if (order) order.rating = rating
  }

  return { now, activeOrders, findOrder, cancelOrder, rateOrder }
}
