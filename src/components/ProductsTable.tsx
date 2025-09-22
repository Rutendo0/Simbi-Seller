"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import AddProductModal from "@/components/AddProductModal";
import { formatUSD } from "@/lib/currency";
import EditProductModal from "@/components/EditProductModal";
import { formatDateLong, formatDateShort } from "@/lib/date";

type Product = {
  id: string;
  masterId?: string;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  condition?: string;
  brand?: string;
  partType?: string;
  specialOffer?: boolean;
  make?: string;
  model?: string;
  year?: string;
  description?: string;
  images?: string[];
  status?: "Live" | "Hidden" | "Draft";
  createdAt?: string;
};

function readProducts(): Product[] {
  try {
    const raw = localStorage.getItem("simbi_products");
    if (!raw) return [];
    return JSON.parse(raw) as Product[];
  } catch (e) {
    return [];
  }
}

function saveProducts(products: Product[]) {
  localStorage.setItem("simbi_products", JSON.stringify(products));
}

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock" | "createdAt">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [threshold, setThreshold] = useState<number>(10);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => {
    setProducts(readProducts());
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "simbi_products") setProducts(readProducts());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => p.status !== "Hidden");
    if (q) {
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q));
    }

    list = list.sort((a, b) => {
      const rev = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") return a.name.localeCompare(b.name) * rev;
      if (sortBy === "price") return (a.price - b.price) * rev;
      if (sortBy === "stock") return (a.stock - b.stock) * rev;
      if (sortBy === "createdAt") return (new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()) * rev;
      return 0;
    });

    return list;
  }, [products, query, sortBy, sortDir]);

  function toggleHide(id: string) {
    const updated = products.map((p) => (p.id === id ? { ...p, status: p.status === "Hidden" ? "Live" as const : "Hidden" as const } : p));
    setProducts(updated);
    saveProducts(updated);
    toast({ title: "Product visibility updated" });
  }

  function quickEdit(id: string, field: "price" | "stock", value: number) {
    const updated = products.map((p) => (p.id === id ? { ...p, [field]: value } : p));
    setProducts(updated);
    saveProducts(updated);
    toast({ title: "Product updated" });
  }

  function saveEdited(product: Product) {
    const updated = products.map((p) => (p.id === product.id ? product : p));
    setProducts(updated);
    saveProducts(updated);
    toast({ title: "Product saved" });
  }

  function deleteProduct(id: string) {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    saveProducts(updated);
    toast({ title: "Product deleted" });
  }

  function exportCSV() {
    const rows = products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, price: p.price, stock: p.stock, status: p.status }));
    const csv = [Object.keys(rows[0] || {}).join(","), ...rows.map((r) => Object.values(r).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Controls Section */}
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 sm:flex-initial">
              <Input
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full sm:w-80 bg-white/80 dark:bg-slate-700/80 border-emerald-200 dark:border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {query && (
                <button
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  onClick={() => setQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white/80 dark:bg-slate-700/80 border border-emerald-200 dark:border-emerald-700 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="createdAt">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="stock">Sort by Stock</option>
              </select>

              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as any)}
                className="px-3 py-2 bg-white/80 dark:bg-slate-700/80 border border-emerald-200 dark:border-emerald-700 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={String(threshold)}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-20 bg-white/80 dark:bg-slate-700/80 border-emerald-200 dark:border-emerald-700 rounded-lg"
                  placeholder="10"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Low stock alert</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Button>
            <Button
              variant="outline"
              onClick={exportCSV}
              className="bg-white/80 dark:bg-slate-800/80 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full table-auto min-w-[900px]">
            <thead className="bg-emerald-50/50 dark:bg-emerald-900/20 text-left text-sm">
              <tr>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200 border-b border-emerald-200/30 dark:border-emerald-800/30">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Image
                  </div>
                </th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200 border-b border-emerald-200/30 dark:border-emerald-800/30">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Product Details
                  </div>
                </th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200 border-b border-emerald-200/30 dark:border-emerald-800/30">SKU</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200 border-b border-emerald-200/30 dark:border-emerald-800/30">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Price
                  </div>
                </th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200 border-b border-emerald-200/30 dark:border-emerald-800/30">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21h6m-6-4h6" />
                    </svg>
                    Stock
                  </div>
                </th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200 border-b border-emerald-200/30 dark:border-emerald-800/30">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Status
                  </div>
                </th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-200 border-b border-emerald-200/30 dark:border-emerald-800/30">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">
                    <div className="py-8">
                      <div className="text-lg font-semibold mb-2">No products found</div>
                      <div className="text-sm text-muted-foreground mb-4">You don't have any products yet. Add your first product to start selling.</div>
                      <div className="flex items-center justify-center">
                        <Button onClick={() => setAddOpen(true)} className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white">
                          Add Product
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className={`border-t hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors ${p.stock <= threshold ? "bg-amber-50/50 dark:bg-amber-900/20" : ""}`}>
                  <td className="p-4">
                    {p.images && p.images.length > 0 && (String(p.images[0]).startsWith("blob:") || String(p.images[0]).startsWith("http") || String(p.images[0]).includes("/")) ? (
                      <img src={p.images[0]} alt={p.name} className="h-14 w-14 object-cover rounded-lg shadow-sm" />
                    ) : (
                      <div className="h-14 w-14 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1" title={p.name}>{p.name}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      {p.brand && <div className="font-medium">Brand: {p.brand}</div>}
                      {p.condition && <div>Condition: {p.condition}</div>}
                      {p.partType && <div>Type: {p.partType}</div>}
                      {p.specialOffer && (
                        <div className="inline-flex items-center px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-xs rounded-full font-medium">
                          ⭐ Special Offer
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Added: {p.createdAt ? formatDateLong(p.createdAt) : "-"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border">
                      {p.sku || "-"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                      {formatUSD(p.price)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={String(p.stock)}
                        onChange={(e) => quickEdit(p.id, "stock", Number(e.target.value))}
                        className="w-20 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-center font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      {p.stock <= threshold && (
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs rounded-full font-medium">
                          ⚠️ Low Stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      p.status === 'Live'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700'
                        : p.status === 'Hidden'
                        ? 'bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700'
                    }`}>
                      {p.status || "Live"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleHide(p.id)}
                        className="bg-white/80 dark:bg-slate-800/80 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                      >
                        {p.status === "Hidden" ? "👁️ Unhide" : "🙈 Hide"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => { navigator.clipboard?.writeText(p.id); toast({ title: "Copied ID" }); }}
                        className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        📋 Copy ID
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => { setEditing(p); setEditOpen(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => { if (confirm("Delete this product?")) deleteProduct(p.id); }}
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddProductModal open={addOpen} onOpenChange={setAddOpen} />
      <EditProductModal open={editOpen} product={editing} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditing(null); }} onSave={(prod: Product) => { saveEdited(prod); setEditOpen(false); setEditing(null); }} onDelete={(id: string) => { deleteProduct(id); setEditOpen(false); setEditing(null); }} />
    </div>
  );
}
