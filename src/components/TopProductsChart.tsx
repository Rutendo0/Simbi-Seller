"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";

export function TopProductsChart({ data }: { data?: any[] }) {
  const chartData = data ?? [
    { name: 'Brake Pads', sold: 156, revenue: 18720 },
    { name: 'Oil Filters', sold: 142, revenue: 14200 },
    { name: 'Air Filters', sold: 128, revenue: 12800 },
    { name: 'Spark Plugs', sold: 119, revenue: 11900 },
    { name: 'Headlights', sold: 98, revenue: 19600 },
  ];

  return (
    <Card className="shadow-card animate-fade-in bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          Top Products
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
          Best selling products by quantity
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="currentColor" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                angle={-30}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value:any, name:any, props:any) => [value, name === 'sold' ? 'Units Sold' : name]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(8px)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: '600' }}
              />
              <Bar dataKey="sold" fill="url(#productsGradient)" radius={[6, 6, 0, 0]} barSize={18}>
                <LabelList
                  dataKey="sold"
                  position="top"
                  formatter={(v:any)=>String(v)}
                  style={{ fontSize: '12px', fontWeight: '600', fill: 'hsl(var(--foreground))' }}
                />
              </Bar>
              <defs>
                <linearGradient id="productsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
