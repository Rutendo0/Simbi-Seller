export type Product = {
  id: string;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  images?: string[];
  status?: string;
  createdAt?: string;
  views?: number;
};

export type OrderItem = { productId: string; quantity: number; price: number };
export type Order = { id: string; items: OrderItem[]; total: number; status: string; createdAt: string; fulfillmentHours?: number };

export function computeKPIs(products: Product[], orders: Order[]) {
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todaysSales = orders.filter((o) => o.createdAt.startsWith(today)).reduce((s, o) => s + (o.total || 0), 0);
  const totalOrders = orders.length;
  const aov = totalOrders === 0 ? 0 : totalRevenue / totalOrders;
  const productViews = products.reduce((s, p) => s + (p.views || 0), 0);
  const unfulfilledOrders = orders.filter((o) => o.status !== "Completed").length;

  return { totalRevenue, todaysSales, totalOrders, aov, productViews, unfulfilledOrders };
}

export function salesOverTime(orders: Order[], days = 30) {
  const now = new Date();
  const map: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - (days - 1 - i));
    const key = d.toISOString().slice(0, 10);
    map[key] = 0;
  }
  orders.forEach((o) => {
    const key = o.createdAt.slice(0, 10);
    if (map[key] !== undefined) map[key] += o.total || 0;
  });
  return Object.keys(map).map((k) => ({ date: k, sales: map[k] }));
}

export function topProducts(orders: Order[], topN = 5) {
  const counts: Record<string, { qty: number; revenue: number; name?: string }> = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      counts[it.productId] = counts[it.productId] || { qty: 0, revenue: 0 };
      counts[it.productId].qty += it.quantity;
      counts[it.productId].revenue += it.price * it.quantity;
    });
  });
  const arr = Object.entries(counts).map(([id, v]) => ({ id, qty: v.qty, revenue: v.revenue }));
  return arr.sort((a, b) => b.qty - a.qty).slice(0, topN);
}

export function computeZimScore(products: Product[], orders: Order[]) {
  // Completeness: percent of products with price, stock, images
  const total = products.length || 1;
  const completeCount = products.reduce((s, p) => s + ((p.price !== undefined && p.stock !== undefined && (p.images && p.images.length > 0)) ? 1 : 0), 0);
  const completeness = (completeCount / total) * 100;

  // Timeliness: percent of orders fulfilled within 24 hours
  const fulfilledCount = orders.filter((o) => (o.fulfillmentHours !== undefined ? o.fulfillmentHours <= 24 : false)).length;
  const timeliness = orders.length === 0 ? 100 : (fulfilledCount / orders.length) * 100;

  // Competitive pricing: naive heuristic - percentage of products priced (we can't compare) -> give neutral 70
  const pricing = 70;

  // Stock availability: percent of products not frequently out of stock (stock>0)
  const inStockCount = products.reduce((s, p) => s + (p.stock > 0 ? 1 : 0), 0);
  const stockAvailability = (inStockCount / total) * 100;

  // Weighted score
  const score = Math.round((completeness * 0.35 + timeliness * 0.25 + pricing * 0.2 + stockAvailability * 0.2));

  const tips: string[] = [];
  if (completeness < 80) tips.push("Add more product details and images to improve listing completeness.");
  if (timeliness < 80) tips.push("Fulfill orders faster — aim for under 24 hours.");
  if (stockAvailability < 70) tips.push("Restock top-selling items to avoid lost sales.");
  if (pricing > 85) tips.push("Consider reviewing prices to be more competitive.");

  return { score: Math.max(0, Math.min(100, score)), completeness: Math.round(completeness), timeliness: Math.round(timeliness), stockAvailability: Math.round(stockAvailability), tips };
}
