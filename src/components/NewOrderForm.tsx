"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  hsCode?: string | null;
  supplierId: string;
  supplier: { name: string };
}

interface OrderItem {
  productId: string;
  description: string;
  hsCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  boxes: number;
  netWeight: number;
  grossWeight: number;
  cbm: number;
}

const INCOTERMS = ["FOB", "CIF", "EXW", "CFR", "DDP", "DAP", "FCA"];
const PAYMENT_TERMS = ["T/T 30% deposit", "T/T 100% before shipment", "L/C at sight", "D/P", "D/A"];

export default function NewOrderForm({
  suppliers,
  products,
  preselectedProduct,
}: {
  suppliers: Supplier[];
  products: Product[];
  preselectedProduct?: Product | null;
}) {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState(preselectedProduct?.supplierId || "");
  const [paymentTerms, setPaymentTerms] = useState("T/T 30% deposit");
  const [shippingTerms, setShippingTerms] = useState("FOB");
  const [portOfLoading, setPortOfLoading] = useState("Shanghai, China");
  const [portOfDischarge, setPortOfDischarge] = useState("");
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);

  const filteredProducts = products.filter((p) => !supplierId || p.supplierId === supplierId);

  const initItem = (p?: Product | null): OrderItem => ({
    productId: p?.id || "",
    description: p?.name || "",
    hsCode: p?.hsCode || "",
    quantity: p ? p.id ? 1 : 0 : 0,
    unit: p?.unit || "PCS",
    unitPrice: p?.price || 0,
    boxes: 0,
    netWeight: 0,
    grossWeight: 0,
    cbm: 0,
  });

  const [items, setItems] = useState<OrderItem[]>([initItem(preselectedProduct)]);

  function addItem() {
    setItems([...items, initItem()]);
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, field: keyof OrderItem, value: string | number) {
    const updated = [...items];
    (updated[i] as unknown as Record<string, unknown>)[field] = value;
    if (field === "productId") {
      const p = products.find((pr) => pr.id === value);
      if (p) {
        updated[i].description = p.name;
        updated[i].hsCode = p.hsCode || "";
        updated[i].unit = p.unit;
        updated[i].unitPrice = p.price;
        if (!supplierId) setSupplierId(p.supplierId);
      }
    }
    setItems(updated);
  }

  const total = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supplierId) return alert("Please select a supplier");
    if (items.length === 0 || items.some((it) => !it.productId)) return alert("Please select products for all items");
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierId, paymentTerms, shippingTerms, portOfLoading, portOfDischarge, notes, currency, items }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      router.push(`/orders/${data.id}`);
    } else {
      alert("Failed to create order");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Order Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
            <select
              value={supplierId}
              onChange={(e) => { setSupplierId(e.target.value); setItems([initItem()]); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select supplier...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>USD</option><option>EUR</option><option>CNY</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
            <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {PAYMENT_TERMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Terms (INCOTERMS)</label>
            <select value={shippingTerms} onChange={(e) => setShippingTerms(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {INCOTERMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Port of Loading</label>
            <input value={portOfLoading} onChange={(e) => setPortOfLoading(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Port of Discharge</label>
            <input value={portOfDischarge} onChange={(e) => setPortOfDischarge(e.target.value)} placeholder="e.g. Los Angeles, USA" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Order Items</h2>
          <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800">
            <Plus size={16} /> Add Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-medium text-gray-500">Item {i + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Product *</label>
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(i, "productId", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select product...</option>
                    {filteredProducts.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)}/{p.unit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">HS Code</label>
                  <input value={item.hsCode} onChange={(e) => updateItem(i, "hsCode", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                  <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                  <input value={item.unit} onChange={(e) => updateItem(i, "unit", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price ({currency})</label>
                  <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subtotal</label>
                  <p className="text-sm font-semibold text-indigo-700 py-2">{formatCurrency(item.quantity * item.unitPrice, currency)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Boxes (Ctns)</label>
                  <input type="number" min="0" value={item.boxes} onChange={(e) => updateItem(i, "boxes", parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Net Weight (KG)</label>
                  <input type="number" min="0" step="0.01" value={item.netWeight} onChange={(e) => updateItem(i, "netWeight", parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Gross Weight (KG)</label>
                  <input type="number" min="0" step="0.01" value={item.grossWeight} onChange={(e) => updateItem(i, "grossWeight", parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CBM</label>
                  <input type="number" min="0" step="0.001" value={item.cbm} onChange={(e) => updateItem(i, "cbm", parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t flex justify-end">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-2xl font-bold text-indigo-700">{formatCurrency(total, currency)}</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Creating Order..." : "Create Order"}
      </button>
    </form>
  );
}
