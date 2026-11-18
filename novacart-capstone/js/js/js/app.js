import { PRODUCTS } from './data.js';
import { cartStore } from './store.js';
import { ClientRouter } from './router.js';

const appView = document.getElementById('app-view');
const navCartCount = document.getElementById('nav-cart-count');
const toastEl = document.getElementById('toast');

let catalogFilter = { category: 'All', search: '' };
let toastTimer = null;

function formatINR(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2400);
}

function updateCartBadge() {
  navCartCount.textContent = cartStore.getTotalCount();
}

cartStore.subscribe(() => {
  updateCartBadge();
  if ((window.location.hash || '#home').startsWith('#cart')) {
    renderCartView();
  }
});

// ==========================================================================
// Views
// ==========================================================================
function renderHomeView() {
  const featured = PRODUCTS.slice(0, 3);
  appView.innerHTML = `
    <section class="hero-banner">
      <div>
        <span class="pill">Capstone E-Commerce SPA</span>
        <h1>Upgrade Your Developer Desk Setup</h1>
        <p class="lead">Curated mechanical keyboards, ergonomic peripherals, and studio audio engineered for everyday productivity.</p>
        <div class="hero-actions">
          <a href="#catalog" class="btn btn-primary">Browse Full Catalog</a>
          <a href="#cart" class="btn btn-secondary">View Cart (${cartStore.getTotalCount()})</a>
        </div>
      </div>
      <div class="feature-cards">
        <div class="mini-card"><strong>SPA Routing</strong><span>Zero-reload client navigation</span></div>
        <div class="mini-card"><strong>ES6 Modules</strong><span>Clean separation of concerns</span></div>
        <div class="mini-card"><strong>SVG Assets</strong><span>Instant zero-latency visuals</span></div>
        <div class="mini-card"><strong>LocalStorage</strong><span>Persistent shopping cart</span></div>
      </div>
    </section>

    <section>
      <h2>Featured Gear</h2>
      <div class="product-grid">
        ${featured.map(renderProductCard).join('')}
      </div>
    </section>
  `;
}

function renderProductCard(product) {
  return `
    <article class="product-card">
      <a href="#product/${product.id}" class="product-art" aria-label="View details for ${product.name}">
        ${product.svg}
      </a>
      <div class="product-body">
        <span class="product-cat">${product.category} • ★ ${product.rating}</span>
        <h3 class="product-title"><a href="#product/${product.id}">${product.name}</a></h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-footer">
          <span class="price">${formatINR(product.price)}</span>
          <button type="button" class="btn btn-primary btn-sm" data-add-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

function renderCatalogView() {
  const categories = ['All', ...new Set(PRODUCTS.map((p) => p.category))];
  const filtered = PRODUCTS.filter((p) => {
    const matchesCat = catalogFilter.category === 'All' || p.category === catalogFilter.category;
    const matchesQuery =
      p.name.toLowerCase().includes(catalogFilter.search.toLowerCase()) ||
      p.description.toLowerCase().includes(catalogFilter.search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  appView.innerHTML = `
    <h1>Product Catalog</h1>
    <p class="lead">Filter by category or search products in real time.</p>

    <div class="toolbar">
      <div class="filter-pills" role="group" aria-label="Filter by category">
        ${categories
          .map(
            (cat) => `
          <button type="button" class="filter-pill ${catalogFilter.category === cat ? 'active' : ''}" data-category="${cat}">
            ${cat}
          </button>`
          )
          .join('')}
      </div>
      <input type="search" id="catalog-search" class="search-input" placeholder="Search gear..." value="${catalogFilter.search}" aria-label="Search products">
    </div>

    ${
      filtered.length
        ? `<div class="product-grid">${filtered.map(renderProductCard).join('')}</div>`
        : `<p class="lead">No products matched your filter. Try resetting your search.</p>`
    }
  `;

  const searchInput = document.getElementById('catalog-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      catalogFilter.search = e.target.value;
      renderCatalogView();
      const refocused = document.getElementById('catalog-search');
      refocused.focus();
      refocused.setSelectionRange(refocused.value.length, refocused.value.length);
    });
  }
}

function renderProductDetailView(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    appView.innerHTML = `<h1>Product Not Found</h1><a href="#catalog" class="btn btn-primary">Back to Catalog</a>`;
    return;
  }

  appView.innerHTML = `
    <p style="margin-bottom: 1rem;"><a href="#catalog" style="color: var(--primary); font-weight: 600; text-decoration: none;">&larr; Back to Catalog</a></p>
    <div class="detail-card">
      <div class="detail-art">${product.svg}</div>
      <div>
        <span class="pill">${product.category} • ★ ${product.rating}</span>
        <h1>${product.name}</h1>
        <p class="lead">${product.description}</p>
        <p class="price" style="font-size: 1.75rem; margin-bottom: 1.25rem;">${formatINR(product.price)}</p>
        <div class="hero-actions">
          <button type="button" class="btn btn-primary" data-add-id="${product.id}">Add to Shopping Cart</button>
          <a href="#cart" class="btn btn-secondary">Go to Cart</a>
        </div>
      </div>
    </div>
  `;
}

function renderCartView() {
  const items = cartStore.items;
  if (items.length === 0) {
    appView.innerHTML = `
      <h1>Your Cart is Empty</h1>
      <p class="lead">Looks like you haven't added any desk gear yet.</p>
      <a href="#catalog" class="btn btn-primary">Explore Products</a>
    `;
    return;
  }

  const subtotal = cartStore.getSubtotal();
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  appView.innerHTML = `
    <h1>Shopping Cart</h1>
    <div class="cart-layout">
      <div class="cart-items">
        ${items
          .map(
            (item) => `
          <div class="cart-row">
            <div>
              <strong>${item.name}</strong>
              <p style="color: var(--muted); font-size: 0.9rem;">${formatINR(item.price)} each</p>
            </div>
            <div class="qty-controls">
              <button type="button" class="qty-btn" data-qty-id="${item.id}" data-delta="-1" aria-label="Decrease quantity">-</button>
              <span style="font-weight: 700; min-width: 24px; text-align: center;">${item.qty}</span>
              <button type="button" class="qty-btn" data-qty-id="${item.id}" data-delta="1" aria-label="Increase quantity">+</button>
              <button type="button" class="btn btn-secondary btn-sm" data-remove-id="${item.id}" style="margin-left: 0.5rem;">Remove</button>
            </div>
          </div>`
          )
          .join('')}
      </div>

      <aside class="summary-box">
        <h2>Order Summary</h2>
        <div class="summary-row"><span>Subtotal</span><span>${formatINR(subtotal)}</span></div>
        <div class="summary-row"><span>Estimated GST (18%)</span><span>${formatINR(gst)}</span></div>
        <div class="summary-row"><span>Shipping</span><span style="color: var(--success); font-weight: 700;">FREE</span></div>
        <div class="summary-total"><span>Total</span><span>${formatINR(total)}</span></div>
        <button type="button" id="checkout-btn" class="btn btn-primary" style="width: 100%;">Place Demo Order</button>
      </aside>
    </div>
  `;
}

// ==========================================================================
// Delegated Events & Router Initialization
// ==========================================================================
appView.addEventListener('click', (e) => {
  const addBtn = e.target.closest('[data-add-id]');
  if (addBtn) {
    const product = PRODUCTS.find((p) => p.id === addBtn.dataset.addId);
    if (product) {
      cartStore.addItem(product);
      showToast(`Added "${product.name}" to cart`);
    }
    return;
  }

  const catBtn = e.target.closest('[data-category]');
  if (catBtn) {
    catalogFilter.category = catBtn.dataset.category;
    renderCatalogView();
    return;
  }

  const qtyBtn = e.target.closest('[data-qty-id]');
  if (qtyBtn) {
    cartStore.updateQty(qtyBtn.dataset.qtyId, Number(qtyBtn.dataset.delta));
    return;
  }

  const removeBtn = e.target.closest('[data-remove-id]');
  if (removeBtn) {
    cartStore.removeItem(removeBtn.dataset.removeId);
    showToast('Item removed from cart');
    return;
  }

  if (e.target.id === 'checkout-btn') {
    cartStore.clear();
    showToast('Order placed successfully! Thank you for shopping.');
  }
});

const routes = {
  home: renderHomeView,
  catalog: renderCatalogView,
  product: renderProductDetailView,
  cart: renderCartView
};

new ClientRouter(routes, (routeName, handler, param) => {
  document.querySelectorAll('[data-route]').forEach((link) => {
    link.classList.toggle('active', link.dataset.route === routeName);
  });
  handler(param);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

updateCartBadge();