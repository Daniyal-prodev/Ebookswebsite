export type CartItemLS = { id: string; qty: number };

const KEY = "cart";

export function readCart(): CartItemLS[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItemLS[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItemLS[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToCart(id: string, qty = 1) {
  const items = readCart();
  const idx = items.findIndex(i => i.id === id);
  if (idx >= 0) items[idx].qty += qty;
  else items.push({ id, qty });
  writeCart(items);
}

export function removeFromCart(id: string) {
  writeCart(readCart().filter(i => i.id !== id));
}

export function setQty(id: string, qty: number) {
  if (qty <= 0) return removeFromCart(id);
  const items = readCart();
  const idx = items.findIndex(i => i.id === id);
  if (idx >= 0) {
    items[idx].qty = qty;
    writeCart(items);
  }
}

export function clearCart() {
  writeCart([]);
}
