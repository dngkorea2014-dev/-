"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Supplier { id: string; name: string }
interface Category { id: string; name: string }

interface ProductFormData {
  name: string;
  nameEn: string;
  supplierId: string;
  categoryId: string;
  price: string;
  moq: string;
  unit: string;
  hsCode: string;
  leadDays: string;
  description: string;
  specs: string;
}

interface Props {
  suppliers: Supplier[];
  categories: Category[];
  initial?: Partial<ProductFormData> & { id?: string };
  mode: "new" | "edit";
}

const empty: ProductFormData = {
  name: "", nameEn: "", supplierId: "", categoryId: "",
  price: "", moq: "1", unit: "BOX", hsCode: "",
  leadDays: "", description: "", specs: "",
};

export default function ProductForm({ suppliers, categories, initial, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>({ ...empty, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof ProductFormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = mode === "new" ? "/api/admin/products" : `/api/admin/products/${initial?.id}`;
      const method = mode === "new" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          moq: parseInt(form.moq),
          leadDays: form.leadDays ? parseInt(form.leadDays) : undefined,
          categoryId: form.categoryId || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  const input = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const label = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Product Name *</label>
          <input required className={input} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. JEJU APPLE MANGO CANDY" />
        </div>
        <div>
          <label className={label}>English Name</label>
          <input className={input} value={form.nameEn} onChange={e => set("nameEn", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Supplier *</label>
          <select required className={input} value={form.supplierId} onChange={e => set("supplierId", e.target.value)}>
            <option value="">Select supplier…</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Category</label>
          <select className={input} value={form.categoryId} onChange={e => set("categoryId", e.target.value)}>
            <option value="">None</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={label}>Unit Price (USD) *</label>
          <input required type="number" step="0.01" min="0" className={input} value={form.price} onChange={e => set("price", e.target.value)} placeholder="1.60" />
        </div>
        <div>
          <label className={label}>MOQ</label>
          <input type="number" min="1" className={input} value={form.moq} onChange={e => set("moq", e.target.value)} />
        </div>
        <div>
          <label className={label}>Unit</label>
          <select className={input} value={form.unit} onChange={e => set("unit", e.target.value)}>
            <option>BOX</option>
            <option>PCS</option>
            <option>SET</option>
            <option>KG</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>HS Code</label>
          <input className={input} value={form.hsCode} onChange={e => set("hsCode", e.target.value)} placeholder="e.g. 1704.90.00" />
        </div>
        <div>
          <label className={label}>Lead Days</label>
          <input type="number" min="0" className={input} value={form.leadDays} onChange={e => set("leadDays", e.target.value)} />
        </div>
      </div>

      <div>
        <label className={label}>Description</label>
        <textarea rows={2} className={input} value={form.description} onChange={e => set("description", e.target.value)} />
      </div>

      <div>
        <label className={label}>Specs (JSON — weight, cbm, boxQty, etc.)</label>
        <textarea rows={3} className={`${input} font-mono text-xs`} value={form.specs} onChange={e => set("specs", e.target.value)} placeholder='{"netWeight":15,"grossWeight":17.5,"cbm":0.04582,"boxQty":30}' />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Saving…" : mode === "new" ? "Create Product" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
