"use client";

import { useEffect, useMemo, useState } from "react";
import { DollarSign, Package, ShoppingCart, TrendingUp, Users, Star } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { SalesChart } from "@/components/SalesChart";
import { SalesTrendsChart } from "@/components/SalesTrendsChart";
import { TopProductsDonut } from "@/components/TopProductsDonut";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AddProductModal from "@/components/AddProductModal";
import OnboardingWizard from "@/components/OnboardingWizard";
import { Button } from "@/components/ui/button";
import { computeKPIs, salesOverTime, topProducts, computeZimScore } from "@/lib/metrics";
import { formatUSD } from "@/lib/currency";
import SalesSummaryWidget from "@/components/SalesSummaryWidget";
import { useUser } from "@/hooks/useUser";

export function Dashboard() {
  const [addOpen, setAddOpen] = useState(false);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile, refreshProfile } = useUser();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load products
        const pRaw = localStorage.getItem("simbi_products");
        if (pRaw) {
          setProducts(JSON.parse(pRaw));
        } else {
          setProducts([]);
        }

        // Load orders
        const oRaw = localStorage.getItem("simbi_orders");
        if (oRaw) {
          setOrders(JSON.parse(oRaw));
        } else {
          try {
            const ordersModule = await import("@/data/mockOrders.json");
            const ordersData = ordersModule.default || ordersModule;
            setOrders(ordersData);
            localStorage.setItem("simbi_orders", JSON.stringify(ordersData));
          } catch (err) {
            setError("Failed to load orders data. Please refresh the page.");
            console.error("Orders loading error:", err);
          }
        }
      } catch (err) {
        setError("Failed to load dashboard data. Please refresh the page.");
        console.error("Dashboard data loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const kpis = useMemo(() => computeKPIs(products, orders), [products, orders]);
  const salesData = useMemo(() => salesOverTime(orders, range), [orders, range]);
  const top = useMemo(() => {
    const t = topProducts(orders, 5);
    // map ids to names using products
    return t.map((tItem) => ({ name: products.find((p) => p.id === tItem.id)?.name || tItem.id, sold: tItem.qty, revenue: tItem.revenue }));
  }, [orders, products]);

  const zim = useMemo(() => computeZimScore(products, orders), [products, orders]);

  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30 -m-6 mb-6 p-6 rounded-t-lg border-b border-emerald-200/50 dark:border-emerald-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Loading your dashboard...</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-emerald-200/50 dark:bg-emerald-700/50 rounded w-1/2"></div>
                    <div className="h-8 bg-emerald-200/50 dark:bg-emerald-700/50 rounded w-3/4"></div>
                    <div className="h-3 bg-emerald-200/50 dark:bg-emerald-700/50 rounded w-1/3"></div>
                  </div>
                  <div className="h-14 w-14 bg-emerald-200/50 dark:bg-emerald-700/50 rounded-xl ml-4"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg animate-pulse">
              <div className="h-32 bg-emerald-200/50 dark:bg-emerald-700/50 rounded-xl"></div>
            </div>
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg animate-pulse">
              <div className="h-24 bg-emerald-200/50 dark:bg-emerald-700/50 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 -m-6 mb-6 p-6 rounded-t-lg border-b border-red-200/50 dark:border-red-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-800 dark:text-red-200">Dashboard Error</h1>
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
            Refresh Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30 -m-6 mb-6 p-6 rounded-t-lg border-b border-emerald-200/50 dark:border-emerald-800/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
              </div>
              {profile?.storeName ? `${profile.storeName} Dashboard` : 'Dashboard'}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 font-medium mt-2">
              Welcome back, <span className="font-semibold text-emerald-700 dark:text-emerald-300">{profile?.businessOwnerName || user?.email?.split('@')[0] || 'Seller'}</span>!
              {profile?.storeName && ` Here's your ${profile.storeName} performance overview.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 rounded-lg p-2 border border-emerald-200 dark:border-emerald-700">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Time Range:</label>
              <div className="flex gap-1">
                <Button
                  variant={range === 7 ? "default" : "ghost"}
                  size="sm"
                  onClick={()=>{ setRange(7); }}
                  className={range === 7 ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg" : "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/20"}
                >
                  7d
                </Button>
                <Button
                  variant={range === 30 ? "default" : "ghost"}
                  size="sm"
                  onClick={()=>{ setRange(30); }}
                  className={range === 30 ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg" : "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/20"}
                >
                  30d
                </Button>
                <Button
                  variant={range === 90 ? "default" : "ghost"}
                  size="sm"
                  onClick={()=>{ setRange(90); }}
                  className={range === 90 ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg" : "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/20"}
                >
                  90d
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  refreshProfile();
                  // Could add toast notification here
                }}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Top row: Revenue Metrics + Balance */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-start">
        <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <MetricCard title="Total Revenue" value={formatUSD(kpis.totalRevenue)} change={{ value: "", type: "neutral" }} icon={DollarSign} />
          <MetricCard title="Today's Sales" value={formatUSD(kpis.todaysSales)} change={{ value: "", type: "neutral" }} icon={ShoppingCart} />
          <MetricCard title="Average Order Value" value={formatUSD(Math.round(kpis.aov))} change={{ value: "", type: "neutral" }} icon={Package} />
          <MetricCard title="Unfulfilled Orders" value={`${kpis.unfulfilledOrders}`} change={{ value: "", type: "neutral" }} icon={Star} />
        </div>

        <div className="xl:col-span-5">
          <Card className="shadow-card bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-700/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Available Balance</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-800 dark:text-emerald-200">{formatUSD(Math.round(kpis.totalRevenue * 0.1))}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Ready for withdrawal</p>
                </div>
                <div className="flex flex-col items-stretch sm:items-end gap-2">
                  <button className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white font-semibold px-4 sm:px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Withdraw</span>
                    <span className="sm:hidden">Withdraw Funds</span>
                  </button>
                  <button className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium text-center sm:text-right">
                    View transaction history
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sales Summary Widget - moved below balance */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-start">
        <div className="xl:col-span-12">
          <SalesSummaryWidget />
        </div>
      </div>

      {/* Enhanced Charts Grid: Improved Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        <div className="xl:col-span-8 space-y-4 sm:space-y-6">
          <Card className="shadow-card bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  Sales Performance
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
                  Sales and order trends over time
                </p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2 border border-emerald-200/50 dark:border-emerald-700/50">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{kpis.productViews} views</span>
              </div>
            </CardHeader>
            <CardContent>
              <SalesChart data={salesData.map((d) => ({ date: d.date, sales: d.sales }))} />
            </CardContent>
          </Card>

          <SalesTrendsChart data={salesData.map((d) => ({ date: d.date, sales: d.sales }))} />
        </div>

        <div className="xl:col-span-4 space-y-4 sm:space-y-6">
          <TopProductsDonut data={top} />

          <Card className="shadow-card bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50 hover:shadow-md transition-all duration-200">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mx-auto mb-2 sm:mb-3">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-blue-800 dark:text-blue-200">{kpis.totalOrders}</div>
                  <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-300 font-medium">Total Orders</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50 hover:shadow-md transition-all duration-200">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg w-fit mx-auto mb-2 sm:mb-3">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-800 dark:text-emerald-200">{products.length}</div>
                  <div className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-300 font-medium">Active Products</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50 hover:shadow-md transition-all duration-200">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-fit mx-auto mb-2 sm:mb-3">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-purple-800 dark:text-purple-200">{formatUSD(Math.round((kpis.totalRevenue || 0) / (products.length || 1)))}</div>
                  <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-300 font-medium">Avg Revenue/Product</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50 hover:shadow-md transition-all duration-200">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg w-fit mx-auto mb-2 sm:mb-3">
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-orange-800 dark:text-orange-200">{lowStockCount}</div>
                  <div className="text-xs sm:text-sm text-orange-600 dark:text-orange-300 font-medium">Low Stock Items</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Performance Metrics (Zim-Score) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="shadow-card animate-fade-in xl:col-span-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Zim-Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg ${
                zim.score >= 80 ? 'bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-800 dark:text-emerald-200' :
                zim.score >= 60 ? 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-200' :
                'bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-800 dark:text-red-200'
              }`}>
                {zim.score}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Score Breakdown</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Completeness</span>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{zim.completeness}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full" style={{width: `${zim.completeness}%`}}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Timeliness</span>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{zim.timeliness}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" style={{width: `${zim.timeliness}%`}}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Stock Availability</span>
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{zim.stockAvailability}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: `${zim.stockAvailability}%`}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200/50 dark:border-emerald-700/50">
              <p className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Tips to Improve</p>
              <ul className="space-y-1">
                {zim.tips.length === 0 ? (
                  <li className="text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    You're doing great! No improvement tips needed.
                  </li>
                ) : (
                  zim.tips.map((t, i) => (
                    <li key={i} className="text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                      <span className="text-emerald-500 dark:text-emerald-400 mt-0.5">•</span>
                      {t}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card animate-fade-in xl:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="font-semibold text-blue-800 dark:text-blue-200">Sales Trend</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {kpis.totalRevenue > 50000 ? "Excellent sales performance this period!" :
                   kpis.totalRevenue > 25000 ? "Good sales momentum. Keep it up!" :
                   "Consider promotional activities to boost sales."}
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-lg border border-emerald-200/50 dark:border-emerald-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21h6m-6-4h6" />
                    </svg>
                  </div>
                  <span className="font-semibold text-emerald-800 dark:text-emerald-200">Inventory</span>
                </div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {lowStockCount === 0 ? "All products are well-stocked!" :
                   lowStockCount < 5 ? `${lowStockCount} products need restocking soon.` :
                   `Attention: ${lowStockCount} products are running low on stock.`}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-4 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-purple-800 dark:text-purple-200">Top Product</span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {top.length > 0 ? `"${top[0]?.name}" is your best seller. Consider expanding this product line.` :
                   "Add more products to see performance insights."}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-lg border border-orange-200/50 dark:border-orange-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded">
                    <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <span className="font-semibold text-orange-800 dark:text-orange-200">Revenue Goal</span>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {kpis.totalRevenue > 100000 ? "Congratulations! You've exceeded your revenue goals!" :
                   kpis.totalRevenue > 50000 ? "You're on track to meet your goals. Keep pushing!" :
                   "Focus on increasing sales volume and average order value."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddProductModal open={addOpen} onOpenChange={setAddOpen} />
      <OnboardingWizard open={onboardOpen} onOpenChange={setOnboardOpen} />
    </div>
  );
}
