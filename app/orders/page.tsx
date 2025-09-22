"use client";

import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RecentOrdersTable } from "@/components/RecentOrdersTable";

export default function Page() {
  return (
    <DashboardLayout>
      <div className="space-y-8 p-2">
        {/* Professional Header Section */}
        <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30 rounded-2xl p-8 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent leading-tight">
                Orders Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
                Manage and review all orders for your store with real-time updates
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">📦</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">Orders</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <RecentOrdersTable />
      </div>
    </DashboardLayout>
  );
}
