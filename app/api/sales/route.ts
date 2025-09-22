import { NextResponse } from 'next/server';
import mockOrders from '@/data/mockOrders.json';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '20');
    const sort = url.searchParams.get('sort') || 'date';
    const order = url.searchParams.get('order') || 'desc';
    const q = (url.searchParams.get('q') || '').toLowerCase();

    let items = (mockOrders as any[]).slice();

    if (q) {
      items = items.filter((o) => o.id.toLowerCase().includes(q) || (o.items || []).some((it:any) => String(it.productId).toLowerCase().includes(q)));
    }

    items.sort((a:any,b:any)=>{
      if (sort === 'date') {
        const da = new Date(a.createdAt).getTime();
        const db = new Date(b.createdAt).getTime();
        return order === 'asc' ? da - db : db - da;
      }
      if (sort === 'total') {
        return order === 'asc' ? (a.total - b.total) : (b.total - a.total);
      }
      return 0;
    });

    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return NextResponse.json({ total, page, limit, items: paged });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
