"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatUSD } from "@/lib/currency";

export function TopProductsDonut({ data }: { data?: any[] }) {
  const chartData =
    data ?? [
      { name: 'Brake Pads', value: 18720 },
      { name: 'Oil Filters', value: 14200 },
      { name: 'Air Filters', value: 12800 },
      { name: 'Spark Plugs', value: 11900 },
      { name: 'Headlights', value: 19600 },
    ];

  const COLORS = [
    '#10B981', // emerald-500
    '#059669', // emerald-600
    '#047857', // emerald-700
    '#065F46', // emerald-800
    '#064E3B', // emerald-900
    '#0F766E', // teal-600
    '#0D9488', // teal-700
    '#0891B2', // cyan-600
  ];

  const total = chartData.reduce((s, c) => s + (c.value || 0), 0);

  return (
    <Card className="shadow-card animate-fade-in bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          Top Selling Products
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
          Revenue contribution by product
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6">
          <div className="w-full max-w-[320px] h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  stroke="transparent"
                  label={({ percent }) => (percent && percent > 0.05 ? `${Math.round(percent * 100)}%` : null)}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [formatUSD(Number(value)), name]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Enhanced center label */}
            <div className="-mt-[8rem] flex flex-col items-center pointer-events-none">
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-emerald-200/50 dark:border-emerald-700/50">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Top Product</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{chartData[0]?.name}</div>
                <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">{formatUSD(chartData[0]?.value || 0)}</div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[320px]">
            <div className="bg-emerald-50/50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-700/50">
              <div className="grid grid-cols-1 gap-3">
                {chartData.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-4 rounded-full shadow-sm border-2 border-white dark:border-slate-800"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{formatUSD(c.value)}</span>
                      </div>
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {total ? `${Math.round(((c.value || 0) / total) * 100)}%` : '0%'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
