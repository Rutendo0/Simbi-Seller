import { NextResponse } from 'next/server';
import mockOrders from '@/data/mockOrders.json';

function sumOrdersInRange(orders:any[], start:Date, end:Date) {
  return orders.reduce((s, o) => {
    const d = new Date(o.createdAt);
    if (d >= start && d <= end) return s + (o.total || 0);
    return s;
  }, 0);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    // return summary: daily (today), weekly (last 7 days), monthly (current month)
    const now = new Date();

    // daily (today)
    const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const daily = sumOrdersInRange(mockOrders as any[], startDay, endDay);

    // weekly (last 7 days)
    const startWeek = new Date(now);
    startWeek.setDate(now.getDate() - 6);
    startWeek.setHours(0,0,0,0);
    const weekly = sumOrdersInRange(mockOrders as any[], startWeek, endDay);

    // monthly (current month)
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const monthly = sumOrdersInRange(mockOrders as any[], startMonth, endDay);

    // timeseries last 30 days
    const days = 30;
    const series:any[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const s = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0,0,0);
      const e = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23,59,59);
      const total = sumOrdersInRange(mockOrders as any[], s, e);
      series.push({ date: s.toISOString().slice(0,10), total });
    }

    return NextResponse.json({ daily, weekly, monthly, series });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
