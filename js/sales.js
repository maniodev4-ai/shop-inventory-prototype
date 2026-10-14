import { load, save, nextId } from "./storage.js";
import { getProduct, adjustStock } from "./inventory.js";

export function getSales() {
  return load("sales");
}

// cart looks like: [{ productId: 1, quantity: 2 }, { productId: 3, quantity: 1 }]
export function makeSale(cart) {
  if (!Array.isArray(cart) || cart.length === 0) throw new Error("Cart is empty");

  // Merge duplicate products and validate quantities
  const wanted = new Map();
  for (const { productId, quantity } of cart) {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new Error("Quantity must be a whole number greater than 0");
    }
    wanted.set(productId, (wanted.get(productId) ?? 0) + qty);
  }

  // Pass 1: check everything BEFORE changing anything
  const lines = [];
  for (const [productId, quantity] of wanted) {
    const product = getProduct(productId);
    if (!product) throw new Error(`Product ${productId} not found`);
    if (product.stock < quantity) {
      throw new Error(`Not enough stock for "${product.name}" (have ${product.stock}, need ${quantity})`);
    }
    // Copy name and price into the sale so history never changes if the product is edited later
    lines.push({ productId, name: product.name, quantity, unitPrice: product.price });
  }

  // Pass 2: everything is valid, so reduce stock
  for (const line of lines) {
    adjustStock(line.productId, -line.quantity);
  }

  // Record the sale
  const sales = getSales();
  const sale = {
    id: nextId(sales),
    createdAt: new Date().toISOString(),
    items: lines,
    total: lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
  };
  sales.push(sale);
  save("sales", sales);
  return sale;
}

export function getRevenue() {
  return getSales().reduce((sum, s) => sum + s.total, 0);
}