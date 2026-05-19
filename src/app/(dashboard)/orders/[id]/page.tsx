import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, FileText, Package } from "lucide-react";
import OrderStatusUpdater from "@/components/OrderStatusUpdater";

const STATUS_COLORS: Record<string, string> = {
  QUOTE: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PRODUCTION: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      supplier: true,
      buyer: true,
      items: { include: { product: true } },
      documents: true,
    },
  });
  if (!order) notFound();

  const totalBoxes = order.items.reduce((s, it) => s + (it.boxes || 0), 0);
  const totalNetWeight = order.items.reduce((s, it) => s + (it.netWeight || 0), 0);
  const totalGrossWeight = order.items.reduce((s, it) => s + (it.grossWeight || 0), 0);
  const totalCbm = order.items.reduce((s, it) => s + (it.cbm || 0), 0);

  return (
    <div className="p-6 max-w-4xl">
      <Link href="/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-5">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-mono">{order.orderNo}</h1>
          <p className="text-gray-500 text-sm">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}`}>
            {order.status}
          </span>
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Supplier</h3>
          <p className="font-medium text-gray-900">{order.supplier.name}</p>
          {order.supplier.city && <p className="text-sm text-gray-500">{order.supplier.city}, China</p>}
          {order.supplier.contactEmail && <p className="text-sm text-gray-500">{order.supplier.contactEmail}</p>}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Shipping & Payment</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Incoterms:</span><span className="font-medium">{order.shippingTerms || "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment:</span><span className="font-medium">{order.paymentTerms || "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Port of Loading:</span><span className="font-medium">{order.portOfLoading || "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Port of Discharge:</span><span className="font-medium">{order.portOfDischarge || "—"}</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Package size={16} /> Order Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 text-gray-500 font-medium">Description</th>
              <th className="text-left px-4 py-2 text-gray-500 font-medium">HS Code</th>
              <th className="text-right px-4 py-2 text-gray-500 font-medium">Qty</th>
              <th className="text-right px-4 py-2 text-gray-500 font-medium">Unit Price</th>
              <th className="text-right px-4 py-2 text-gray-500 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-gray-800">{item.description || item.product.name}</td>
                <td className="px-4 py-3 font-mono text-gray-500 text-xs">{item.hsCode || "—"}</td>
                <td className="px-4 py-3 text-right text-gray-700">{item.quantity} {item.unit}</td>
                <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(item.unitPrice, order.currency)}</td>
                <td className="px-4 py-3 text-right font-semibold text-indigo-700">{formatCurrency(item.totalPrice, order.currency)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t border-gray-200">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-700">Total</td>
              <td className="px-4 py-3 text-right font-bold text-indigo-700 text-base">{formatCurrency(order.totalAmount, order.currency)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Boxes", value: totalBoxes + " ctns" },
          { label: "Net Weight", value: totalNetWeight.toFixed(2) + " KG" },
          { label: "Gross Weight", value: totalGrossWeight.toFixed(2) + " KG" },
          { label: "Total CBM", value: totalCbm.toFixed(3) + " m³" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="font-bold text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <FileText size={16} /> Export Documents
        </h2>
        <div className="flex gap-3">
          <Link
            href={`/documents/invoice/${order.id}`}
            className="flex items-center gap-2 bg-indigo-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <FileText size={16} /> Commercial Invoice
          </Link>
          <Link
            href={`/documents/packing-list/${order.id}`}
            className="flex items-center gap-2 border border-indigo-600 text-indigo-600 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-indigo-50 transition-colors"
          >
            <Package size={16} /> Packing List
          </Link>
        </div>
      </div>
    </div>
  );
}
