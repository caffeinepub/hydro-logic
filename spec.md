# Hydro Logic

## Current State
- Backend: fixed prices in frontend code (₹9 for 500ml, ₹12 for 1000ml)
- Admin panel: has Orders and Messages tabs only
- Home page: PRODUCTS array has hardcoded price strings

## Requested Changes (Diff)

### Add
- Backend: `PriceConfig` type with fields: `price500ml`, `price1000ml`, `discount500ml` (optional), `discount1000ml` (optional), `offerLabel500ml` (optional), `offerLabel1000ml` (optional)
- Backend: `getPrices()` public query — returns current prices (no auth)
- Backend: `updatePrices(config)` shared — admin only, updates price config
- Admin panel: "Price Management" tab with form to update prices and discounts
- Home page: fetch prices from backend dynamically, show discounted price with strikethrough original when discount is set

### Modify
- Admin panel: add third tab "Prices" for price management
- Home page: PRODUCTS prices replaced with dynamic data from backend

### Remove
- Nothing removed

## Implementation Plan
1. Add PriceConfig state and getPrices/updatePrices functions to main.mo
2. Update backend.d.ts with new types and functions
3. Add useGetPrices and useUpdatePrices hooks in useQueries.ts
4. Update Admin.tsx to add Price Management tab
5. Update Home.tsx to fetch and display dynamic prices with discount support
