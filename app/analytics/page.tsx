"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SalesChart } from "@/components/SalesChart";
import { TopProductsChart } from "@/components/TopProductsChart";
import TopProductsReport from "@/components/reports/TopProductsReport";
import SalesSummaryWidget from "@/components/SalesSummaryWidget";
import { salesOverTime } from "@/lib/metrics";
import { topNProductsByQuantity } from "@/lib/reports";

export default function Page() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load orders
        const oRaw = localStorage.getItem("simbi_orders");
        if (oRaw) {
          setOrders(JSON.parse(oRaw));
        } else {
          const ordersModule = await import("@/data/mockOrders.json");
          const ordersData = ordersModule.default || ordersModule;
          setOrders(ordersData);
          localStorage.setItem("simbi_orders", JSON.stringify(ordersData));
        }

        // Load products
        const pRaw = localStorage.getItem("simbi_products");
        if (pRaw) {
          setProducts(JSON.parse(pRaw));
        } else {
          // For now, set empty products array if none exist
          setProducts([]);
        }
      } catch (err) {
        setError("Failed to load analytics data. Please try refreshing the page.");
        console.error("Analytics data loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const salesData = useMemo(() => salesOverTime(orders, range), [orders, range]);

  const top = useMemo(() => topNProductsByQuantity(orders, 20), [orders]);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30 -m-6 mb-6 p-6 rounded-t-lg border-b border-emerald-200/50 dark:border-emerald-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-300 font-medium">Loading your sales data...</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg h-80 animate-pulse">
                <div className="h-full bg-gradient-to-br from-emerald-100/50 to-green-100/50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl"></div>
              </div>
            </div>
            <div className="xl:col-span-1">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg space-y-4 animate-pulse">
                <div className="h-6 bg-emerald-200/50 dark:bg-emerald-700/50 rounded w-1/2"></div>
                <div className="space-y-3">
                  <div className="h-16 bg-emerald-100/50 dark:bg-emerald-800/30 rounded-xl"></div>
                  <div className="h-16 bg-green-100/50 dark:bg-green-800/30 rounded-xl"></div>
                  <div className="h-16 bg-teal-100/50 dark:bg-teal-800/30 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg h-96 animate-pulse">
              <div className="h-full bg-gradient-to-br from-emerald-100/50 to-green-100/50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl"></div>
            </div>
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg animate-pulse">
              <div className="h-full bg-gradient-to-br from-emerald-100/50 to-green-100/50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 -m-6 mb-6 p-6 rounded-t-lg border-b border-red-200/50 dark:border-red-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-800 dark:text-red-200">Error Loading Analytics</h1>
                <p className="text-red-600 dark:text-red-300 font-medium">{error}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-red-200/50 dark:border-red-800/50 shadow-lg text-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Page
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30 -m-6 mb-6 p-6 rounded-t-lg border-b border-emerald-200/50 dark:border-emerald-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Analytics Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-300 font-medium mt-2">
                Sales trends, product performance and interactive analytics
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 rounded-lg p-2 border border-emerald-200 dark:border-emerald-700">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Time Range:</label>
                <select
                  aria-label="Select time range"
                  value={String(range)}
                  onChange={(e) => setRange(Number(e.target.value) as 7|30|90)}
                  className="bg-transparent border-none text-sm font-medium text-emerald-700 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-2 py-1"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>
              <button
                className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                onClick={() => {
                  const csvHeaders = ['rank','product','qty','value'];
                  const rows = top.byQty.map((r:any, i:number) => [String(i+1), (products.find((p:any)=>p.id===r.id)?.name||r.id), String(r.qty), String(r.revenue)]);
                  const csv = [csvHeaders, ...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = 'top-products-by-qty.csv'; a.click(); URL.revokeObjectURL(url);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Main Analytics Grid - Improved Responsive Design */}
        <div className="grid grid-cols-1 2xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="2xl:col-span-2 order-2 2xl:order-1">
            <SalesChart data={salesData.map((d) => ({ date: d.date, sales: d.sales }))} />
          </div>
          <div className="2xl:col-span-1 order-1 2xl:order-2">
            <SalesSummaryWidget />
          </div>
        </div>

        {/* Enhanced Products Analytics Section - Simplified Layout */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">Product Performance</h2>
          </div>
          <div className="overflow-hidden">
            <TopProductsChart data={top.byQty.map((t:any)=>({ name: products.find((p:any)=>p.id===t.id)?.name || t.id, sold: t.qty, revenue: t.revenue }))} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
