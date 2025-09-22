import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status } = body || {};

    if (!orderId || typeof status !== 'string') {
      return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 });
    }

    // This is a mock endpoint. In a real app you'd update the DB here.
    // We'll return the updated order payload to simulate success.
    const updated = { id: orderId, status, updatedAt: new Date().toISOString() };

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
