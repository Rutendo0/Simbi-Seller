"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FixedSizeList as List } from "react-window";
import { formatDateWithTime } from "@/lib/date";

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700";
    case "processing":
      return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700";
    case "shipped":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700";
    case "pending":
      return "bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700";
    case "canceled":
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700";
    default:
      return "bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
  }
};

export function RecentOrdersTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("date");
  const [orderDir, setOrderDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit), q, sort, order: orderDir });
    fetch(`/api/sales?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [page, limit, q, sort, orderDir]);

  async function updateOrderStatus(orderId: string, newStatus: string) {
    // optimistic update
    setItems((prev) => prev.map((it) => (it.id === orderId ? { ...it, status: newStatus } : it)));
    try {
      const res = await fetch('/api/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        // revert if failed
        setItems((prev) => prev.map((it) => (it.id === orderId ? { ...it, status: it.status } : it)));
        console.error('Failed to update order status', json);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const Row = ({ index, style }: { index: number; style: any }) => {
    const order = items[index];
    if (!order) return <div style={style} />;
    return (
      <div style={style} className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors ${index % 2 ? "bg-white/30 dark:bg-slate-800/30" : "bg-emerald-50/20 dark:bg-emerald-900/5"}`}>
        <div className="col-span-2">
          <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            #{order.id}
          </div>
        </div>
        <div className="col-span-2">
          <div className="font-medium text-slate-700 dark:text-slate-200 text-sm truncate" title={order.customer || "No customer"}>
            {order.customer || "—"}
          </div>
        </div>
        <div className="col-span-3">
          <div className="text-sm text-slate-600 dark:text-slate-300 truncate" title={(order.items || []).map((it: any) => it.productId).join(", ")}>
            {(order.items || []).length > 0 ? `${order.items.length} item${order.items.length > 1 ? 's' : ''}` : "No items"}
          </div>
        </div>
        <div className="col-span-1">
          <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
            ${order.total}
          </div>
        </div>
        <div className="col-span-2">
          <select
            aria-label={`Change status for ${order.id}`}
            value={order.status}
            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
            className={`w-full px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${getStatusColor(order.status)}`}
          >
            <option value="pending">⏳ Pending</option>
            <option value="processing">⚙️ Processing</option>
            <option value="shipped">📦 Shipped</option>
            <option value="completed">✅ Completed</option>
            <option value="canceled">❌ Canceled</option>
          </select>
        </div>
        <div className="col-span-2">
          <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            {formatDateWithTime(order.createdAt)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
      <div className="p-6 border-b border-emerald-200/30 dark:border-emerald-800/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Recent Orders</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Latest customer orders and their status</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Input
                placeholder="Search orders..."
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                className="w-64 bg-white/80 dark:bg-slate-700/80 border-emerald-200 dark:border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-white/80 dark:bg-slate-700/80 border border-emerald-200 dark:border-emerald-700 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="date">Sort by Date</option>
              <option value="total">Sort by Amount</option>
            </select>
            <select
              value={orderDir}
              onChange={(e) => { setOrderDir(e.target.value as any); setPage(1); }}
              className="px-3 py-2 bg-white/80 dark:bg-slate-700/80 border border-emerald-200 dark:border-emerald-700 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              className="bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-hidden">
          <div className="w-full">
            {/* Enhanced Table Header */}
            <div className="grid grid-cols-12 gap-4 font-semibold text-slate-700 dark:text-slate-200 p-4 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 mb-2">
              <div className="col-span-2 flex items-center gap-2">
                <span>Order ID</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span>Customer</span>
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <span>Products</span>
              </div>
              <div className="col-span-1 flex items-center gap-2">
                <span>Amount</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span>Status</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span>Date</span>
              </div>
            </div>

            <List height={400} itemCount={items.length} itemSize={64} width={'100%'}>
              {Row}
            </List>

            {/* Enhanced Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-200/30 dark:border-slate-700/30">
              <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                Showing {items.length} of {total} orders
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Page</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{page}</span>
                </div>
                <Button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={items.length < limit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Next
                </Button>
                <select
                  value={String(limit)}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
