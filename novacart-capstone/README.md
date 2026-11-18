# NovaCart — Modular E-Commerce SPA Capstone

A production-ready, Single-Page E-Commerce Product Catalog engineered with modular ES6 JavaScript, client-side hash routing, optimized inline SVG assets, and persistent shopping cart state.

## Architecture & Key Features
* **Modular ES6 Architecture:** Cleanly separated into `data.js` (catalog & inline SVG assets), `store.js` (reactive `localStorage` cart store), `router.js` (client-side SPA router), and `app.js` (view renderers & delegated event handlers).
* **Client-Side Routing:** Instant zero-reload navigation across `#home`, `#catalog`, `#product/:id`, and `#cart`.
* **Optimized Performance:** Zero external render-blocking libraries or heavy raster images—uses lightweight inline SVGs and native CSS Grid/Flexbox for instant page loads.