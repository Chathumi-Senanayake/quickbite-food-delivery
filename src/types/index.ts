// src/types/index.ts

/**
 * Represents a single recipe from the DummyJSON API.
 */
export interface Recipe {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  caloriesPerServing: number;
  tags: string[];
  userId: number;
  image: string;
  rating: number;
  reviewCount: number;
  mealType: string[];
  // Extended fields for local simulation (pricing / discounts)
  price: number;
  discount?: number;
  // Component compatibility mappings
  title: string;
  thumbnail: string;
  description: string;
}

// Alias Product to Recipe to prevent type breakage in components
export type Product = Recipe;

/**
 * Standard API response structure for recipe list endpoint.
 */
export interface RecipeResponse {
  recipes: Recipe[];
  total: number;
  skip: number;
  limit: number;
}

export type ProductResponse = RecipeResponse;

/**
 * Represents an item currently inside the user's shopping cart.
 */
export interface CartItem extends Recipe {
  quantity: number;
}

/**
 * Represents authenticated User details.
 */
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token?: string;
  // Local editable fields
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  location?: LatLng;
}

/** [latitude, longitude] */
export type LatLng = [number, number];

export interface Rider {
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  rating: number;
  image: string;
}

export type OrderStage =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

/** Epoch-ms timestamp at which the order enters each stage. */
export type OrderSchedule = Record<Exclude<OrderStage, 'cancelled'>, number>;

/**
 * Represents a completed order in order history.
 */
export interface OrderRecord {
  orderId: string;
  date: string;
  items: {
    id: number;
    title: string;
    price: number;
    quantity: number;
    thumbnail: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: string;
  paymentMethod: string;
  address: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    postalCode: string;
  };
  // Tracking fields (absent on orders placed before tracking existed)
  placedAt?: number;
  schedule?: OrderSchedule;
  restaurant?: { name: string; location: LatLng };
  destination?: LatLng;
  route?: LatLng[];
  distanceKm?: number;
  rider?: Rider;
  cancelledAt?: number;
  rating?: number;
}