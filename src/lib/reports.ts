import { Order } from "@/lib/metrics";

export function revenueByMonthForYear(orders: Order[], year: number) {
  const months = Array.from({ length: 12 }).map((_, i) => ({ month: i + 1, revenue: 0 }));
  orders.forEach((o) => {
    const d = new Date(o.createdAt);
    if (d.getFullYear() === year) {
      const m = d.getMonth();
      months[m].revenue += o.total || 0;
    }
  });
  return months; // [{month:1,revenue:...}, ...]
}

export function revenueForPeriod(orders: Order[], startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  return orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d >= start && d <= end;
  }).reduce((s, o) => s + (o.total || 0), 0);
}

export function revenueByDayForMonth(orders: Order[], year: number, month: number) {
  // month: 1-12
  const d = new Date(year, month - 1 + 1, 0); // last day of month
  const days = d.getDate();
  const res = Array.from({ length: days }).map((_, i) => ({ day: i + 1, revenue: 0 }));
  orders.forEach((o) => {
    const od = new Date(o.createdAt);
    if (od.getFullYear() === year && od.getMonth() === month - 1) {
      const day = od.getDate();
      res[day - 1].revenue += o.total || 0;
    }
  });
  return res; // [{day:1,revenue:...}, ...]
}

export function topNProductsByQuantity(orders: Order[], n = 20) {
  const map: Record<string, { qty: number; revenue: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      map[it.productId] = map[it.productId] || { qty: 0, revenue: 0 };
      map[it.productId].qty += it.quantity;
      map[it.productId].revenue += it.quantity * it.price;
    });
  });
  const arr = Object.entries(map).map(([id, v]) => ({ id, qty: v.qty, revenue: v.revenue }));
  const byQty = [...arr].sort((a, b) => b.qty - a.qty).slice(0, n);
  const byValue = [...arr].sort((a, b) => b.revenue - a.revenue).slice(0, n);
  return { byQty, byValue };
}

export function bestSeller(orders: Order[]) {
  const { byQty } = topNProductsByQuantity(orders, 1);
  return byQty.length ? byQty[0] : null;
}

export function lostSales(orders: Order[]) {
  // Treat Cancelled, Refunded as lost sales
  return orders.filter((o) => ["Cancelled", "Refunded"].includes(o.status));
}
