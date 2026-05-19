import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Package2 } from "lucide-react";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { supplier: true, category: true },
  });
  if (!product) notFound();

  return (
    <div className="p-6 max-w-3xl">
      <Link href="/sourcing" className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-5">
        <ArrowLeft size={16} /> Back to Sourcing
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <Package2 size={64} className="text-gray-300" />
          )}
        </div>

        <div className="p-6">
          {product.category && (
            <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full mb-2">
              {product.category.name}
            </span>
          )}
          <h1 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h1>
          {product.nameEn && <p className="text-gray-500 text-sm mb-3">{product.nameEn}</p>}

          <div className="grid grid-cols-2 gap-4 my-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-400">Unit Price</p>
              <p className="text-2xl font-bold text-indigo-700">{formatCurrency(product.price)}</p>
              <p className="text-xs text-gray-400">per {product.unit}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Min. Order Qty</p>
              <p className="text-xl font-bold text-gray-800">{product.moq} {product.unit}</p>
            </div>
            {product.leadDays && (
              <div>
                <p className="text-xs text-gray-400">Lead Time</p>
                <p className="text-sm font-medium">{product.leadDays} days</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400">Origin</p>
              <p className="text-sm font-medium">{product.origin}</p>
            </div>
            {product.hsCode && (
              <div>
                <p className="text-xs text-gray-400">HS Code</p>
                <p className="text-sm font-medium font-mono">{product.hsCode}</p>
              </div>
            )}
            {product.sku && (
              <div>
                <p className="text-xs text-gray-400">SKU</p>
                <p className="text-sm font-medium font-mono">{product.sku}</p>
              </div>
            )}
          </div>

          {product.description && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Supplier</h3>
            <p className="text-sm font-medium text-gray-900">{product.supplier.name}</p>
            {product.supplier.city && (
              <p className="text-xs text-gray-400">{product.supplier.city}, China</p>
            )}
          </div>

          <div className="mt-6">
            <Link
              href={`/orders/new?productId=${product.id}`}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white rounded-lg px-5 py-2.5 font-medium text-sm hover:bg-indigo-700 transition-colors"
            >
              Place Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
