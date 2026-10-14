import { load, save, nextId } from "./storage.js";

export function getProducts() {
  return load("products");
}

export function getProduct(id) {
  return getProducts().find((p) => p.id === id);
}

export function addProduct({ name, price, stock }) {
  name = String(name ?? "").trim();
  price = Number(price);
  stock = Number(stock);

  if (!name) throw new Error("Name is required");
  if (!(price >= 0)) throw new Error("Price must be 0 or more");
  if (!Number.isInteger(stock) || stock < 0) throw new Error("Stock must be a whole number, 0 or more");

  const products = getProducts();
  if (products.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
    throw new Error(`"${name}" already exists`);
  }

  const product = { id: nextId(products), name, price, stock };
  products.push(product);
  save("products", products);
  return product;
}

export function updateProduct(id, changes) {
  const products = getProducts();
  const product = products.find((p) => p.id === id);
  if (!product) throw new Error("Product not found");

  const updated = { ...product, ...changes };
  if (!updated.name.trim()) throw new Error("Name is required");
  if (!(Number(updated.price) >= 0)) throw new Error("Price must be 0 or more");
  if (!Number.isInteger(Number(updated.stock)) || updated.stock < 0) {
    throw new Error("Stock must be a whole number, 0 or more");
  }

  Object.assign(product, updated, {
    price: Number(updated.price),
    stock: Number(updated.stock),
  });
  save("products", products);
  return product;
}

export function deleteProduct(id) {
  const products = getProducts();
  const remaining = products.filter((p) => p.id !== id);
  if (remaining.length === products.length) throw new Error("Product not found");
  save("products", remaining);
}

// Used by sales.js: change stock by a positive or negative amount.
export function adjustStock(id, delta) {
  const product = getProduct(id);
  if (!product) throw new Error("Product not found");
  if (product.stock + delta < 0) throw new Error(`Not enough stock for "${product.name}"`);
  return updateProduct(id, { stock: product.stock + delta });
}