import { NextResponse } from 'next/server';

const mockPayouts = [
  { id: 'p_1', date: '2025-08-01', amount: 1200, currency: 'USD', status: 'paid', method: 'Bank Transfer' },
  { id: 'p_2', date: '2025-07-15', amount: 800, currency: 'USD', status: 'paid', method: 'PayPal' },
  { id: 'p_3', date: '2025-07-01', amount: 1500, currency: 'USD', status: 'failed', method: 'Bank Transfer' },
  { id: 'p_4', date: '2025-06-18', amount: 950, currency: 'USD', status: 'paid', method: 'Payoneer' },
];

export async function GET() {
  return NextResponse.json({ items: mockPayouts });
}
