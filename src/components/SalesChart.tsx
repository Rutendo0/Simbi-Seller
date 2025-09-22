"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatUSD } from "@/lib/currency";
import { formatDateShort, formatDateLong } from "@/lib/date";

export function SalesChart({ data }: { data?: any[] }) {
  const chartData = data ?? [
    { month: 'Jan', sales: 12800, orders: 145 },
    { month: 'Feb', sales: 15600, orders: 178 },
    { month: 'Mar', sales: 18900, orders: 203 },
    { month: 'Apr', sales: 16200, orders: 189 },
    { month: 'May', sales: 21400, orders: 245 },
    { month: 'Jun', sales: 24800, orders: 289 },
    { month: 'Jul', sales: 28600, orders: 321 },
    { month: 'Aug', sales: 25200, orders: 298 },
    { month: 'Sep', sales: 32100, orders: 365 },
    { month: 'Oct', sales: 29800, orders: 342 },
    { month: 'Nov', sales: 35400, orders: 398 },
    { month: 'Dec', sales: 42200, orders: 456 },
  ];

  return (
    <Card className="shadow-card animate-fade-in bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          Sales Performance
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
          Sales and order trends over time
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="currentColor" />
              <XAxis
                dataKey={"date"}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(t:any)=>formatDateShort(t)}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatUSD(Number(v))}
              />
              <Tooltip
                labelFormatter={(label:any)=>formatDateLong(label)}
                formatter={(value: any) => (typeof value === 'number' ? formatUSD(value) : value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(8px)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: '600' }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="url(#salesGradient)"
                strokeWidth={3}
                dot={{ fill: 'url(#salesDot)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'url(#salesActiveDot)', strokeWidth: 2, fill: 'white' }}
              />
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <radialGradient id="salesDot" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </radialGradient>
                <radialGradient id="salesActiveDot" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#047857" />
                </radialGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
