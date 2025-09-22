"use client";

import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import masterParts from "@/data/masterParts.json";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AddProductModal({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [condition, setCondition] = useState("New");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [brand, setBrand] = useState("");
  const [partType, setPartType] = useState<'original'|'aftermarket'|'performance'|'special' | ''>('');
  const [specialOffer, setSpecialOffer] = useState(false);
  const [compatMake, setCompatMake] = useState("");
  const [compatModel, setCompatModel] = useState("");
  const [compatYear, setCompatYear] = useState("");

  const results = useMemo(() => {
    if (!query) return masterParts;
    return masterParts.filter((p: any) => p.name.toLowerCase().includes(query.toLowerCase()) || p.make.toLowerCase().includes(query.toLowerCase()) || p.model.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  function onSelect(part: any) {
    setSelected(part);
  }

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setImages((prev) => [...prev, ...Array.from(files)]);
  }

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Enhanced validation with detailed feedback
    if (!selected) {
      toast({
        title: "⚠️ Master Part Required",
        description: "Please search and select a part from the master database before proceeding.",
        variant: "destructive"
      });
      return;
    }

    if (!price || price.trim() === "") {
      toast({
        title: "💰 Price Required",
        description: "Please enter a valid price for the product.",
        variant: "destructive"
      });
      return;
    }

    if (!stock || stock.trim() === "") {
      toast({
        title: "📦 Stock Level Required",
        description: "Please specify the available stock quantity.",
        variant: "destructive"
      });
      return;
    }

    // Validate price format
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: "💰 Invalid Price",
        description: "Please enter a valid price greater than 0.",
        variant: "destructive"
      });
      return;
    }

    // Validate stock format
    const stockNum = Number(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      toast({
        title: "📦 Invalid Stock",
        description: "Please enter a valid stock quantity (0 or greater).",
        variant: "destructive"
      });
      return;
    }

    // Validate images
    if (images.length === 0) {
      toast({
        title: "📸 Product Images Required",
        description: "Please upload at least one product image.",
        variant: "destructive"
      });
      return;
    }

    // Success feedback
    toast({
      title: "✅ Product Added Successfully!",
      description: `${selected.name} has been added to your inventory.`,
      variant: "default"
    });

    // Mock submit: store in localStorage
    const stored = JSON.parse(localStorage.getItem("simbi_products") || "[]");
    const newProduct = {
      id: `P-${Date.now()}`,
      masterId: selected.id,
      name: selected.name,
      sku: selected.sku,
      price: Number(price),
      stock: Number(stock),
      condition,
      brand,
      partType: partType || undefined,
      specialOffer,
      make: compatMake || selected.make || undefined,
      model: compatModel || selected.model || undefined,
      year: compatYear || selected.year || undefined,
      description,
      images: images.map((f) => f.name),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("simbi_products", JSON.stringify([newProduct, ...stored]));

    toast({ title: "Product added", description: `${newProduct.name} was added to your local inventory (mock).` });
    onOpenChange(false);
    // reset
    setSelected(null);
    setPrice("");
    setStock("");
    setCondition("New");
    setBrand("");
    setPartType('');
    setSpecialOffer(false);
    setCompatMake("");
    setCompatModel("");
    setCompatYear("");
    setDescription("");
    setImages([]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30 -m-6 mb-6 p-6 rounded-t-lg border-b border-emerald-200/50 dark:border-emerald-800/50">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            Add New Product
          </DialogTitle>
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            Search from master parts database and add to your inventory
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Enhanced Master Parts Search Section */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 block flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Master Parts Database
                </label>
                <div className="relative">
                  <Input
                    placeholder="Search by name, make, or model..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-white/80 dark:bg-slate-700/80 border-emerald-200 dark:border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pl-10"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <div className="mt-4 max-h-48 overflow-y-auto space-y-2">
                  {results.slice(0, 10).map((r: any) => (
                    <div
                      key={r.id}
                      className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 ${
                        selected?.id === r.id
                          ? "border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 shadow-md"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-700"
                      }`}
                      onClick={() => onSelect(r)}
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{r.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        <span className="font-medium">{r.make}</span> • <span className="font-medium">{r.model}</span> • <span className="font-medium">{r.year}</span>
                      </div>
                      {r.sku && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                          SKU: {r.sku}
                        </div>
                      )}
                    </div>
                  ))}
                  {results.length > 10 && (
                    <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-2">
                      And {results.length - 10} more results...
                    </div>
                  )}
                  {query && results.length === 0 && (
                    <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">
                      No parts found matching "{query}"
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 block flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Selected Part
                </label>
                <div className={`p-4 h-full rounded-lg border-2 transition-all duration-200 ${
                  selected
                    ? "border-emerald-300 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/20"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
                }`}>
                  {selected ? (
                    <div className="space-y-2">
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-lg">{selected.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{selected.make}</span>
                          <span className="text-slate-400">•</span>
                          <span className="font-medium">{selected.model}</span>
                          <span className="text-slate-400">•</span>
                          <span className="font-medium">{selected.year}</span>
                        </div>
                      </div>
                      {selected.sku && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                          SKU: {selected.sku}
                        </div>
                      )}
                      <div className="pt-2 border-t border-emerald-200 dark:border-emerald-700">
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Ready to configure
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                      <svg className="w-8 h-8 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm font-medium">No part selected</div>
                      <div className="text-xs mt-1">Search and select a part above</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Basic Information Section */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Price (USD)
                </label>
                <Input
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
                  step="0.01"
                  className="bg-white/80 dark:bg-slate-700/80 border-emerald-200 dark:border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21h6m-6-4h6" />
                  </svg>
                  Stock Level
                </label>
                <Input
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  type="number"
                  className="bg-white/80 dark:bg-slate-700/80 border-emerald-200 dark:border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-white/80 dark:bg-slate-700/80 border border-emerald-200 dark:border-emerald-700 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="New">🆕 New</option>
                  <option value="Used">🔄 Used</option>
                  <option value="Refurbished">🔧 Refurbished</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Product Details Section */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Product Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block">Brand</label>
                <Input
                  placeholder="Enter brand name"
                  value={brand}
                  onChange={(e)=>setBrand(e.target.value)}
                  className="bg-white/80 dark:bg-slate-700/80 border-emerald-200 dark:border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block">Part Type</label>
                <select
                  value={partType}
                  onChange={(e)=>setPartType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/80 dark:bg-slate-700/80 border border-emerald-200 dark:border-emerald-700 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select part type</option>
                  <option value="original">🏭 Original Equipment</option>
                  <option value="aftermarket">🔧 Aftermarket</option>
                  <option value="performance">⚡ Performance</option>
                  <option value="special">⭐ Special</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block">Special Offer</label>
                <div className="flex items-center gap-3 p-3 bg-white/80 dark:bg-slate-700/80 border border-emerald-200 dark:border-emerald-700 rounded-lg">
                  <input
                    id="specialOffer"
                    type="checkbox"
                    checked={specialOffer}
                    onChange={(e)=>setSpecialOffer(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 bg-white border-emerald-300 rounded focus:ring-emerald-500 focus:ring-2"
                  />
                  <label htmlFor="specialOffer" className="text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
                    Mark as special offer
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Compatibility Section */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Vehicle Compatibility
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block">Make</label>
                <Input
                  placeholder="e.g., Toyota"
                  value={compatMake}
                  onChange={(e)=>setCompatMake(e.target.value)}
                  className="bg-white/80 dark:bg-slate-700/80 border-emerald-200 dark:border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block">Model</label>
                <Input
                  placeholder="e.g., Corolla"
                  value={compatModel}
                  onChange={(e)=>setCompatModel(e.target.value)}
                  className="bg-white/80 dark:bg-slate-700/80 border-emerald-200 dark:border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block">Year</label>
                <Input
                  placeholder="e.g., 2020"
                  value={compatYear}
                  onChange={(e)=>setCompatYear(e.target.value)}
                  className="bg-white/80 dark:bg-slate-700/80 border-emerald-200 dark:border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Enhanced Description Section */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Product Description
            </h3>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 block">Additional Details</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description, specifications, or any additional information..."
                className="w-full p-4 bg-white/80 dark:bg-slate-700/80 border border-emerald-200 dark:border-emerald-700 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                rows={4}
              />
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {description.length}/500 characters
              </div>
            </div>
          </div>

          {/* Enhanced Image Upload Section */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Product Images
            </h3>

            {/* Upload Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative border-2 border-dashed border-emerald-300 dark:border-emerald-600 rounded-xl p-6 text-center hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all duration-300 group">
                <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" id="imageUpload" />
                <label htmlFor="imageUpload" className="cursor-pointer block">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50 transition-colors">
                    <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Upload Main Image</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PNG, JPG, JPEG up to 10MB</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">Click to browse</p>
                </label>
              </div>
              <div className="relative border-2 border-dashed border-emerald-300 dark:border-emerald-600 rounded-xl p-6 text-center hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all duration-300 group">
                <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" id="imageUpload2" />
                <label htmlFor="imageUpload2" className="cursor-pointer block">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50 transition-colors">
                    <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Add More Images</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PNG, JPG, JPEG up to 10MB</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">Click to browse</p>
                </label>
              </div>
            </div>

            {/* Enhanced Image Preview Section */}
            {images.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Uploaded Images ({images.length})
                  </p>
                  <button
                    onClick={() => setImages([])}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {images.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-700">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                      </div>
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110"
                        title="Remove image"
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center justify-end gap-3 pt-6 border-t border-emerald-200/50 dark:border-emerald-800/50">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-6 py-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-8 py-2 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
