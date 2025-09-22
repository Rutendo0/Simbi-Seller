"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

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

export default function EditProductModal({
  open,
  product,
  onOpenChange,
  onSave,
  onDelete,
}: {
  open: boolean;
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Product) => void;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = useState<Product | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  useEffect(() => {
    if (product) {
      // shallow clone
      setForm({ ...product, images: product.images ? [...product.images] : [] });
    } else {
      setForm(null);
    }
    setNewFiles([]);
  }, [product]);

  if (!form) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="p-4">No product selected</div>
        </DialogContent>
      </Dialog>
    );
  }

  function updateField<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setNewFiles((prev) => [...prev, ...Array.from(files)]);
  }

  function removeImage(idx: number) {
    setForm((f) => {
      if (!f) return f;
      const images = [...(f.images || [])];
      images.splice(idx, 1);
      return { ...f, images };
    });
  }

  function removeNewFile(idx: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSave() {
    if (!form) return;
    // Convert newFiles to blob URLs and append
    const fileUrls = newFiles.map((f) => URL.createObjectURL(f));
    const updated: Product = { ...form, images: [...(form.images || []), ...fileUrls] };
    onSave(updated);
    toast({ title: "Saved", description: "Product updated locally." });
    onOpenChange(false);
  }

  function handleDelete() {
    if (!form) return;
    if (!confirm("Delete this product? This cannot be undone in mock mode.")) return;
    onDelete(form.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Product Name</label>
              <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} />

              <label className="text-sm font-medium mt-2">SKU</label>
              <Input value={form.sku || ""} onChange={(e) => updateField("sku", e.target.value)} />

              <div className="grid grid-cols-3 gap-2 mt-2">
                <Input value={String(form.price)} onChange={(e) => updateField("price", Number(e.target.value))} />
                <Input value={String(form.stock)} onChange={(e) => updateField("stock", Number(e.target.value))} />
                <select value={form.condition || "New"} onChange={(e) => updateField("condition", e.target.value)} className="input">
                  <option>New</option>
                  <option>Used</option>
                  <option>Refurbished</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-2 mt-2">
                <Input placeholder="Brand" value={form.brand || ''} onChange={(e)=>updateField('brand', e.target.value)} />
                <div className="flex items-center gap-2">
                  <select value={form.partType || ''} onChange={(e)=>updateField('partType', e.target.value)} className="input">
                    <option value="">Part type</option>
                    <option value="original">Original Equipment</option>
                    <option value="aftermarket">Aftermarket</option>
                    <option value="performance">Performance</option>
                    <option value="special">Special Offer</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.specialOffer} onChange={(e)=>updateField('specialOffer', e.target.checked as any)} /> Special offer</label>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="Make" value={form.make || ''} onChange={(e)=>updateField('make', e.target.value)} />
                  <Input placeholder="Model" value={form.model || ''} onChange={(e)=>updateField('model', e.target.value)} />
                  <Input placeholder="Year" value={form.year || ''} onChange={(e)=>updateField('year', e.target.value)} />
                </div>
              </div>

              <label className="text-sm font-medium mt-2">Description</label>
              <textarea value={form.description || ""} onChange={(e) => updateField("description", e.target.value)} className="w-full p-2 rounded-md border" rows={4} />
            </div>

            <div>
              <label className="text-sm font-medium">Images</label>
              <div className="space-y-2">
                {(form.images || []).map((img, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {String(img).startsWith("blob:") || String(img).startsWith("http") ? (
                      <img src={img} alt={`img-${i}`} className="h-16 w-16 object-cover rounded" />
                    ) : (
                      <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">No preview</div>
                    )}
                    <div className="flex-1 text-sm">{String(img)}</div>
                    <Button variant="outline" onClick={() => removeImage(i)}>Remove</Button>
                  </div>
                ))}

                {newFiles.map((f, i) => (
                  <div key={`new-${i}`} className="flex items-center gap-2">
                    <img src={URL.createObjectURL(f)} alt={f.name} className="h-16 w-16 object-cover rounded" />
                    <div className="flex-1 text-sm">{f.name}</div>
                    <Button variant="outline" onClick={() => removeNewFile(i)}>Remove</Button>
                  </div>
                ))}

                <input type="file" accept="image/*" multiple onChange={onFiles} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
          <div>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
