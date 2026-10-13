# QuickBite SPA - Food Ordering & Delivery App

A food ordering and delivery single page application built with **Vue 3**, **TypeScript** and **Tailwind CSS**. Customers can browse dishes, order with a map-based delivery location, and follow their order live on a map from the kitchen to their door.

Menu data comes from the [DummyJSON](https://dummyjson.com) recipes API, with prices in Sri Lankan Rupees (LKR).

## Features

### Ordering
- Browse and search dishes, with offers and discounts
- Recipe detail pages
- Cart with quantity controls (saved in the browser)
- Checkout with Cash on Delivery or Card payment
- Login (DummyJSON auth) / register, profile editing and order history
- Light and dark theme

### Maps & Delivery Location
- Interactive map at checkout. Tap the map or drag the 🏠 pin to set the drop-off point
- **Address search** (limited to Sri Lanka)
- **Use my location** button (browser GPS)
- Address, city and postal code are filled in automatically from the pin
- Road route from the kitchen is drawn on the map
- **Distance-based delivery fee** (Rs.150 + Rs.40 per km)
- Delivery area limit of 15 km

### Live Order Tracking
- Tracking page for each order (`/track/:orderId`)
- 6-step status timeline: Placed → Confirmed → Preparing → Picked Up → On the Way → Delivered
- 🛵 Rider moves along the real road route on the map, with *Follow rider* / *Show full route* controls
- ETA countdown, estimated arrival time and trip progress bar
- Rider details (name, rating, vehicle, plate) with a call button
- Cancel an order before cooking starts
- Rate an order with stars after delivery
- Floating **Live order** widget on every page
- In-app pop-ups and browser notifications when the status changes

> **Note:** Order tracking is a **simulation** for demo purposes. When an order is placed, a timetable for every stage is created, and the app shows the stage and rider position that match the current time. Times are sped up so a full delivery takes about 3-6 minutes. A real system would need a backend, a restaurant app and a rider app sending GPS updates.

## Tech Stack
- Vue 3 (Composition API, `<script setup>`)
- TypeScript
- Vue Router
- Tailwind CSS v4
- Vite
- [Leaflet](https://leafletjs.com) for maps

### Free external services (no API keys needed)
| Service | Used for |
|---|---|
| [DummyJSON](https://dummyjson.com) | Menu items and login |
| [OpenStreetMap](https://www.openstreetmap.org) tiles | Map images |
| [OSRM](https://project-osrm.org) | Road routes and distances |
| [Nominatim](https://nominatim.org) | Address search and pin → address lookup |

## Installation & Setup
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the local development server.
4. Open `http://localhost:5173` in your browser.

To create a production build, run `npm run build`.

## How to Test Tracking
1. Add items to the cart and click **Checkout Now**.
2. Fill in your name and phone, then set the delivery location on the map.
3. Click **Place Order**, then **Track Order**.
4. Watch the status change and the rider move to your location.

## Project Structure
```
src/
├── components/
│   ├── HomeView.vue            # Menu listing and search
│   ├── ProductCard.vue
│   ├── RecipeDetailView.vue
│   ├── OffersPage.vue
│   ├── CartDrawer.vue
│   ├── CheckoutPage.vue        # Delivery details, map location, payment
│   ├── LocationPicker.vue      # Checkout map (search, GPS, draggable pin)
│   ├── OrderSuccess.vue
│   ├── TrackOrderView.vue      # Live tracking page
│   ├── TrackingMap.vue         # Map with route, kitchen, home and rider
│   ├── ActiveOrderBanner.vue   # Floating live order widget + notifications
│   ├── ProfileView.vue         # Profile and order history
│   ├── LoginModal.vue
│   └── NavBar.vue
├── composables/
│   ├── useAuth.ts
│   ├── useCart.ts              # Cart and order history
│   ├── useOrderTracking.ts     # Tracking stages, timing and rider position
│   ├── useProducts.ts
│   └── useTheme.ts
├── utils/
│   ├── geo.ts                  # Kitchen location, routing, geocoding, distances
│   ├── leaflet.ts              # Map tiles and marker icons
│   ├── pricing.ts              # Delivery fee and discount
│   └── currency.ts             # LKR formatting
├── types/index.ts
├── router.ts
└── main.ts
```

## Configuration
| What | Where |
|---|---|
| Kitchen location, delivery radius | `src/utils/geo.ts` |
| Delivery fee and discount | `src/utils/pricing.ts` |
| Tracking speed (stage times, travel time) | `src/composables/useOrderTracking.ts` |
| Rider list | `src/composables/useOrderTracking.ts` |

## Data Storage
There is no backend. The cart, orders, login and theme are saved in the browser's `localStorage`, so they are kept per browser and device.
