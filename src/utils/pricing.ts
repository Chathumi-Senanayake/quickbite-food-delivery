// Delivery is priced by road distance from the kitchen.
export const DELIVERY_BASE_FEE = 150
export const DELIVERY_FEE_PER_KM = 40

// Flat promo discount applied to every order.
export const ORDER_DISCOUNT = 5

export function deliveryFeeFor(distanceKm: number): number {
  return Math.round(DELIVERY_BASE_FEE + DELIVERY_FEE_PER_KM * Math.max(0, distanceKm))
}

export function orderTotal(subtotal: number, deliveryFee: number): number {
  return Math.max(0, Number((subtotal + deliveryFee - ORDER_DISCOUNT).toFixed(2)))
}
