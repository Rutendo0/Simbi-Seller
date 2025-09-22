import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_PATH, 'payment_methods.json');

function ensure() {
  if (!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH);
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({ items: [] }, null, 2));
}

function read() {
  ensure();
  const raw = fs.readFileSync(FILE, 'utf-8');
  return JSON.parse(raw);
}

function write(obj: any) {
  ensure();
  fs.writeFileSync(FILE, JSON.stringify(obj, null, 2));
}

export async function GET() {
  const data = read();
  // return stored payment methods without exposing sensitive info
  const items = (data.items || []).map((m: any) => ({ id: m.id, provider: m.provider, last4: m.last4, createdAt: m.createdAt, type: m.type }));
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const body = await req.json();
  // expected: { provider, type, token, last4 }
  if (!body || !body.token || !body.last4 || !body.provider) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const data = read();
  const id = `pm_${Date.now()}`;
  const item = { id, provider: body.provider, type: body.type || 'bank', token: body.token, last4: body.last4, createdAt: new Date().toISOString() };
  data.items = data.items || [];
  data.items.push(item);
  write(data);
  return NextResponse.json({ item: { id: item.id, provider: item.provider, last4: item.last4, createdAt: item.createdAt, type: item.type } });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });
  const data = read();
  data.items = (data.items || []).filter((i: any) => i.id !== id);
  write(data);
  return NextResponse.json({ ok: true });
}
