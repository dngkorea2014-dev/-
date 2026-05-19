import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminSuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
        <Link
          href="/admin/suppliers/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus size={16} /> Add Supplier
        </Link>
      </div>

      <div className="grid gap-4">
        {suppliers.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">{s.name}</h2>
                {s.city && <p className="text-sm text-gray-500">{s.city}, China</p>}
                {s.address && <p className="text-xs text-gray-400 mt-0.5">{s.address}</p>}
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">
                  {s._count.products} products
                </span>
              </div>
            </div>
            {(s.contactName || s.contactEmail) && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500 flex gap-4">
                {s.contactName && <span>{s.contactName}</span>}
                {s.contactEmail && <span>{s.contactEmail}</span>}
                {s.contactPhone && <span>{s.contactPhone}</span>}
              </div>
            )}
          </div>
        ))}
        {suppliers.length === 0 && (
          <div className="text-center py-12 text-gray-400">No suppliers yet.</div>
        )}
      </div>
    </div>
  );
}
