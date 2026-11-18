const CART_KEY = 'novacart_capstone_v1';

class CartStore {
  constructor() {
    this.items = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    this.listeners = [];
  }

  subscribe(fn) {
    this.listeners.push(fn);
  }

  notify() {
    localStorage.setItem(CART_KEY, JSON.stringify(this.items));
    this.listeners.forEach((fn) => fn(this.items));
  }

  addItem(product) {
    const existing = this.items.find((item) => item.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ ...product, qty: 1 });
    }
    this.notify();
  }

  updateQty(id, delta) {
    this.items = this.items
      .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
      .filter((item) => item.qty > 0);
    this.notify();
  }

  removeItem(id) {
    this.items = this.items.filter((item) => item.id !== id);
    this.notify();
  }

  clear() {
    this.items = [];
    this.notify();
  }

  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }
}

export const cartStore = new CartStore();