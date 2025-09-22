"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import YearComparisonChart from "@/components/reports/YearComparisonChart";
import BestSellerCard from "@/components/reports/BestSellerCard";
import TopProductsReport from "@/components/reports/TopProductsReport";
import LostSalesList from "@/components/reports/LostSalesList";
import { revenueByMonthForYear, revenueForPeriod, revenueByDayForMonth, topNProductsByQuantity, bestSeller, lostSales } from "@/lib/reports";

export default function Page() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]); // up to 4

  const [compareMode, setCompareMode] = useState<'yearly'|'month'>('yearly');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [chartType, setChartType] = useState<'line'|'bar'|'mixed'>('line');

  useEffect(() => {
    const oRaw = localStorage.getItem("simbi_orders");
    if (oRaw) setOrders(JSON.parse(oRaw));
    else import("@/data/mockOrders.json").then((m) => { setOrders(m.default || m); localStorage.setItem("simbi_orders", JSON.stringify(m.default||m)); });

    const pRaw = localStorage.getItem("simbi_products");
    setProducts(pRaw ? JSON.parse(pRaw) : []);
  }, []);

  useEffect(() => {
    const yrs = Array.from(new Set(orders.map((o) => new Date(o.createdAt).getFullYear()))).sort((a, b) => b - a);
    setAvailableYears(yrs);
    // Initialize selectedYears to up to 2 most recent years if none selected
    if (selectedYears.length === 0) {
      const init = yrs.slice(0, Math.min(4, yrs.length));
      setSelectedYears(init);
    }
  }, [orders]);

  const series = useMemo(() => {
    if (!selectedYears || selectedYears.length === 0) return [];
    if (compareMode === 'yearly') {
      return selectedYears.map((y) => ({ year: y, data: revenueByMonthForYear(orders, y) }));
    }
    if (compareMode === 'month') {
      // for selected month, produce daily series for each selected year
      return selectedYears.map((y) => ({ year: y, data: revenueByDayForMonth(orders, y, selectedMonth) }));
    }
    return [];
  }, [orders, selectedYears, compareMode, selectedMonth]);

  const best = useMemo(() => {
    const b = bestSeller(orders);
    const prod = products.find((p) => p.id === b?.id);
    return { product: prod, qty: b?.qty, revenue: b?.revenue };
  }, [orders, products]);

  const top = useMemo(() => topNProductsByQuantity(orders, 20), [orders]);
  const lost = useMemo(() => lostSales(orders), [orders]);


  function exportComparisonCSV() {
    if (!selectedYears || selectedYears.length === 0) return;
    if (compareMode === 'yearly') {
      const months = Array.from({ length: 12 }).map((_, i) => new Date(0, i).toLocaleString('en-US', { month: 'short' }));
      const headers = ['Month', ...selectedYears.map((y)=>String(y))];
      const rows = [headers.join(',')];
      for (let i = 0; i < 12; i++) {
        const month = months[i];
        const revs = selectedYears.map((y)=> revenueByMonthForYear(orders, y)[i]?.revenue ?? 0);
        rows.push([month, ...revs.map(String)].join(','));
      }
      const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `year_comparison_${selectedYears.join('_')}.csv`; a.click(); URL.revokeObjectURL(url);
      return;
    }

    if (compareMode === 'month') {
      const monthName = new Date(0, selectedMonth - 1).toLocaleString('en-US', { month: 'long' });
      const headers = ['Year','Month','Revenue'];
      const rows = [headers.join(',')];
      selectedYears.forEach((y)=>{
        const rev = revenueByMonthForYear(orders, y).find((m)=>m.month===selectedMonth)?.revenue ?? 0;
        rows.push([String(y), monthName, String(rev)].join(','));
      });
      const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `month_comparison_${monthName}_${selectedYears.join('_')}.csv`; a.click(); URL.revokeObjectURL(url);
      return;
    }
  }

  function exportTopProductsCSV() {
    const rows = [['Rank','ProductId','ProductName','Qty','Value'],''];
    top.byQty.forEach((r:any, i:number)=>{
      const prod = products.find((p:any)=>p.id===r.id);
      const name = prod?.name || r.id;
      rows.push([String(i+1), r.id, name, String(r.qty), String(r.revenue)].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'top_products.csv'; a.click(); URL.revokeObjectURL(url);
  }


  function printReport() {
    window.print();
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-2">
        {/* Professional Header Section */}
        <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30 rounded-2xl p-8 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent leading-tight">
                Analytics Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
                Comprehensive year-over-year comparisons and product performance insights
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={exportComparisonCSV}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-emerald-200 dark:border-emerald-700 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
              >
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium text-slate-700 dark:text-slate-200">Export Comparison</span>
              </button>
              <button
                onClick={exportTopProductsCSV}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-emerald-200 dark:border-emerald-700 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
              >
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium text-slate-700 dark:text-slate-200">Export Products</span>
              </button>
              <button
                onClick={printReport}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Report
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Enhanced Controls Section */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg mb-6">
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 min-w-[140px] flex-shrink-0">Select Years:</label>
                    <div className="flex flex-wrap gap-2">
                      {availableYears.map((y)=>{
                        const checked = selectedYears.includes(y);
                        const disabled = !checked && selectedYears.length >= 4;
                        return (
                          <label key={y} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                            checked
                              ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200 shadow-sm'
                              : disabled
                                ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-200 dark:hover:border-emerald-700'
                          }`}>
                            <input type="checkbox" checked={checked} disabled={disabled} onChange={(e)=>{
                              if (e.target.checked) setSelectedYears((s)=>[...s,y]); else setSelectedYears((s)=>s.filter((x)=>x!==y));
                            }} className="rounded border-emerald-300 dark:border-emerald-600 text-emerald-600 focus:ring-emerald-500" />
                            <span className="text-sm font-medium">{y}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 min-w-[100px] flex-shrink-0">Compare:</label>
                    <select value={compareMode} onChange={(e)=>setCompareMode(e.target.value as any)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                      <option value="yearly">Full Year (months)</option>
                      <option value="month">Month (daily)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 min-w-[100px] flex-shrink-0">Chart:</label>
                    <select value={chartType} onChange={(e)=>setChartType(e.target.value as any)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                      <option value="line">Line</option>
                      <option value="bar">Bar</option>
                    </select>
                  </div>
                </div>

                {compareMode === 'month' && (
                  <div className="flex items-center gap-3 pt-2 border-t border-emerald-200/30 dark:border-emerald-800/30">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 min-w-[100px] flex-shrink-0">Month:</label>
                    <select value={String(selectedMonth)} onChange={(e)=>setSelectedMonth(Number(e.target.value))}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                      {Array.from({length:12}).map((_,i)=> <option key={i+1} value={i+1}>{new Date(0,i).toLocaleString('en-US',{month:'long'})}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
            {/** determine per-series rendering: if chartType is not mixed, all series use chartType. If mixed, prefer 2023 as bar if present, otherwise first selected year as bar. */}
            <YearComparisonChart series={series} compareMode={compareMode} chartType={chartType} seriesRender={(() => {
              const map: Record<number,'bar'|'line'> = {};
              if (!series || series.length === 0) return map;
              if (chartType !== 'mixed') {
                series.forEach(s=> map[s.year] = chartType as 'bar'|'line');
                return map;
              }
              const years = series.map(s=>s.year);
              const barYear = years.includes(2023) ? 2023 : years[0];
              years.forEach(y=> map[y] = (y === barYear ? 'bar' : 'line'));
              return map;
            })()} />
          </div>
          <div className="space-y-6">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
              <BestSellerCard product={best.product} qty={best.qty} revenue={best.revenue} />
            </div>
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
              <LostSalesList orders={lost} />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
            <TopProductsReport dataByQty={top.byQty} dataByValue={top.byValue} productsMap={Object.fromEntries(products.map((p:any)=>[p.id,p]))} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
