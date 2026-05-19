"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SupplierFormData {
  name: string;
  nameEn: string;
  address: string;
  city: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

const empty: SupplierFormData = {
  name: "", nameEn: "", address: "", city: "",
  contactName: "", contactEmail: "", contactPhone: "",
};

interface Props {
  mode: "new" | "edit";
  initial?: Partial<SupplierFormData> & { id?: string };
}

export default function SupplierForm({ mode, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<SupplierFormData>({ ...empty, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof SupplierFormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = mode === "new" ? "/api/admin/suppliers" : `/api/admin/suppliers/${initial?.id}`;
      const method = mode === "new" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push("/admin/suppliers");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div>
        <label className={label}>Company Name *</label>
        <input required className={input} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. DNG INTERNATIONAL CO.,LTD" />
      </div>
      <div>
        <label className={label}>English Name</label>
        <input className={input} value={form.nameEn} onChange={e => set("nameEn", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>City</label>
          <input className={input} value={form.city} onChange={e => set("city", e.target.value)} placeholder="e.g. Seoul" />
        </div>
        <div>
          <label className={label}>Address</label>
          <input className={input} value={form.address} onChange={e => set("address", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={label}>Contact Name</label>
          <input className={input} value={form.contactName} onChange={e => set("contactName", e.target.value)} />
        </div>
        <div>
          <label className={label}>Contact Email</label>
          <input type="email" className={input} value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} />
        </div>
        <div>
          <label className={label}>Contact Phone</label>
          <input className={input} value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Saving…" : mode === "new" ? "Create Supplier" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
