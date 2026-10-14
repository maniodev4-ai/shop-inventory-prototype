const KEYS = {
  products: "shop.products",
  sales: "shop.sales",
};

// Read a list from the browser's storage. Returns [] if nothing is saved yet.
export function load(name) {
  const raw = localStorage.getItem(KEYS[name]);
  return raw ? JSON.parse(raw) : [];
}

// Write a whole list back to storage.
export function save(name, items) {
  localStorage.setItem(KEYS[name], JSON.stringify(items));
}

// Simple auto-increment ID: one more than the highest existing ID.
export function nextId(items) {
  return items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
}