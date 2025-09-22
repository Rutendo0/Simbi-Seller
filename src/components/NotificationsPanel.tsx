import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

type Notification = { id: string; title: string; body: string; createdAt: string; read?: boolean };

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export default function NotificationsPanel({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('simbi_notifications');
    if (raw) {
      setItems(JSON.parse(raw));
      return;
    }
    // seed with a few notifications based on recent orders if available
    const oRaw = localStorage.getItem('simbi_orders');
    let seeded: Notification[] = [];
    if (oRaw) {
      try {
        const orders = JSON.parse(oRaw);
        seeded = (orders || []).slice(0, 5).map((o: any, i: number) => ({
          id: `n_${o.id || i}`,
          title: `New order ${o.id || ''}`,
          body: `Order ${o.id || ''} of $${(o.total || 0).toFixed(2)} placed`,
          createdAt: o.createdAt || new Date().toISOString(),
          read: false,
        }));
      } catch (e) {
        seeded = [];
      }
    }
    // fallback static
    if (seeded.length === 0) {
      seeded = [
        { id: 'n_1', title: 'Welcome', body: 'Welcome to Simbi dashboard', createdAt: new Date().toISOString(), read: true },
      ];
    }
    localStorage.setItem('simbi_notifications', JSON.stringify(seeded));
    setItems(seeded);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function persist(next: Notification[]) {
    setItems(next);
    localStorage.setItem('simbi_notifications', JSON.stringify(next));
  }

  function markRead(id: string) {
    persist(items.map((i) => (i.id === id ? { ...i, read: true } : i)));
  }

  function markAllRead() {
    persist(items.map((i) => ({ ...i, read: true })));
  }

  function clearAll() {
    persist([]);
  }

  if (!visible) return null;

  return (
    <div className="absolute right-6 top-16 w-96 z-50">
      <div className="bg-card border rounded shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>
            <Button variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>
        <div className="max-h-72 overflow-auto space-y-2">
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No notifications</div>
          ) : (
            items.map((n) => (
              <div key={n.id} className={`p-2 rounded border ${n.read ? 'bg-muted/50' : 'bg-background'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold">{n.title}</div>
                    <div className="text-xs text-muted-foreground">{n.body}</div>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    <div>{timeAgo(n.createdAt)}</div>
                    {!n.read && <Button variant="secondary" size="icon" className="mt-1" onClick={() => markRead(n.id)}>✓</Button>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
