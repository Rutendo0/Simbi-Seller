"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatUSD } from "@/lib/currency";
import {
  ArrowUpDown,
  RefreshCw,
  CreditCard,
  Banknote,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";

export default function PayoutsHistory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<'date'|'amount'>('date');
  const [dir, setDir] = useState<'asc'|'desc'>('desc');

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = () => {
    setLoading(true);
    fetch('/api/payouts')
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const sorted = [...items].sort((a:any,b:any)=>{
    if (sort === 'date') {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return dir === 'asc' ? da - db : db - da;
    }
    return dir === 'asc' ? a.amount - b.amount : b.amount - a.amount;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'completed': { variant: 'default' as const, icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
      'pending': { variant: 'secondary' as const, icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
      'failed': { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
      'processing': { variant: 'outline' as const, icon: RefreshCw, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
      'cancelled': { variant: 'outline' as const, icon: XCircle, color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-900/30' },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.bgColor} border-0`}>
        <Icon className={`h-3 w-3 ${config.color}`} />
        <span className="font-medium">{status}</span>
      </Badge>
    );
  };

  const getMethodIcon = (method: string) => {
    if (method.toLowerCase().includes('bank')) {
      return <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    }
    return <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header Controls */}
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Payout History</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Track your earnings and payment history</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={sort} onValueChange={(value: 'date'|'amount') => setSort(value)}>
              <SelectTrigger className="w-36 bg-white/80 dark:bg-slate-700/80 border-emerald-200 dark:border-emerald-700 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="amount">Sort by Amount</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dir} onValueChange={(value: 'asc'|'desc') => setDir(value)}>
              <SelectTrigger className="w-28 bg-white/80 dark:bg-slate-700/80 border-emerald-200 dark:border-emerald-700 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest</SelectItem>
                <SelectItem value="asc">Oldest</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPayouts}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Loading State */}
      {loading && (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Loading payout history...</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Empty State */}
      {!loading && items.length === 0 && (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
              <DollarSign className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">No Payouts Yet</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 text-center max-w-md leading-relaxed">
              Your payout history will appear here once you start receiving payments from sales. Keep up the great work!
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Payouts List */}
      {!loading && items.length > 0 && (
        <div className="space-y-4">
          {sorted.map((payout) => {
            const { date, time } = formatDate(payout.date);
            return (
              <div key={payout.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-700">
                      {getMethodIcon(payout.method)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-base text-slate-800 dark:text-slate-100">Payout #{payout.id.slice(-8)}</span>
                        {getStatusBadge(payout.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-medium">{date}</span>
                          <span className="text-slate-400">at</span>
                          <span className="font-medium">{time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-medium">{payout.method}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-emerald-600 dark:text-emerald-400 mb-1">
                      {formatUSD(payout.amount)}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {payout.status === 'completed' ? '✓ Paid' : '⏳ Pending'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enhanced Summary Stats */}
      {!loading && items.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50/80 via-green-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:via-green-950/40 dark:to-teal-950/40 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 border border-emerald-200/30 dark:border-emerald-800/30">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                {formatUSD(items.reduce((sum, p) => sum + p.amount, 0))}
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Total Earnings</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">All time payouts</div>
            </div>
            <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 border border-green-200/30 dark:border-green-800/30">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {items.filter(p => p.status === 'completed').length}
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Successful</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Completed payouts</div>
            </div>
            <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 border border-amber-200/30 dark:border-amber-800/30">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                {items.filter(p => p.status === 'pending').length}
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pending</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Awaiting payment</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
