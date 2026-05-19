import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate, generateDocNo } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PrintButton from "@/components/PrintButton";

export default async function PackingListPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      supplier: true,
      buyer: true,
      items: { include: { product: true } },
    },
  });
  if (!order) notFound();

  let doc = await prisma.document.findFirst({
    where: { orderId, type: "PACKING_LIST" },
  });
  if (!doc) {
    doc = await prisma.document.create({
      data: {
        orderId,
        type: "PACKING_LIST",
        docNo: generateDocNo("PKL"),
        data: "{}",
      },
    });
  }

  const today = formatDate(new Date());
  const totalBoxes = order.items.reduce((s, it) => s + (it.boxes || 0), 0);
  const totalNetWeight = order.items.reduce((s, it) => s + (it.netWeight || 0), 0);
  const totalGrossWeight = order.items.reduce((s, it) => s + (it.grossWeight || 0), 0);
  const totalCbm = order.items.reduce((s, it) => s + (it.cbm || 0), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5 print:hidden">
        <Link href={`/orders/${orderId}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
          <ArrowLeft size={16} /> Back to Order
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-3xl mx-auto print:border-0">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-wide">PACKING LIST</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Packing List No.</p>
            <p className="font-mono font-bold text-indigo-700 text-lg">{doc.docNo}</p>
            <p className="text-sm text-gray-500 mt-1">Date: {today}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Shipper / Exporter</p>
            <p className="font-semibold text-gray-900">{order.supplier.name}</p>
            {order.supplier.address && <p className="text-sm text-gray-600">{order.supplier.address}</p>}
            {order.supplier.city && <p className="text-sm text-gray-600">{order.supplier.city}, China</p>}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Consignee / Buyer</p>
            <p className="font-semibold text-gray-900">{order.buyer.company || order.buyer.name}</p>
            {order.buyer.country && <p className="text-sm text-gray-600">{order.buyer.country}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg text-sm">
          <div><span className="text-gray-500">Invoice No.:</span> <span className="font-medium font-mono">{order.orderNo}</span></div>
          <div><span className="text-gray-500">Shipping Terms:</span> <span className="font-medium">{order.shippingTerms || "—"}</span></div>
          <div><span className="text-gray-500">Port of Loading:</span> <span className="font-medium">{order.portOfLoading || "—"}</span></div>
          <div><span className="text-gray-500">Port of Discharge:</span> <span className="font-medium">{order.portOfDischarge || "—"}</span></div>
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="text-left py-2 font-semibold text-gray-700">Description</th>
              <th className="text-right py-2 font-semibold text-gray-700">Qty</th>
              <th className="text-right py-2 font-semibold text-gray-700">Boxes</th>
              <th className="text-right py-2 font-semibold text-gray-700">N.W. (KG)</th>
              <th className="text-right py-2 font-semibold text-gray-700">G.W. (KG)</th>
              <th className="text-right py-2 font-semibold text-gray-700">CBM</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-2.5 text-gray-800">{item.description || item.product.name}</td>
                <td className="py-2.5 text-right">{item.quantity} {item.unit}</td>
                <td className="py-2.5 text-right">{item.boxes || 0}</td>
                <td className="py-2.5 text-right">{(item.netWeight || 0).toFixed(2)}</td>
                <td className="py-2.5 text-right">{(item.grossWeight || 0).toFixed(2)}</td>
                <td className="py-2.5 text-right">{(item.cbm || 0).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-800 font-bold">
              <td className="pt-3 text-gray-800">TOTAL</td>
              <td className="pt-3 text-right text-gray-800">—</td>
              <td className="pt-3 text-right">{totalBoxes} ctns</td>
              <td className="pt-3 text-right">{totalNetWeight.toFixed(2)}</td>
              <td className="pt-3 text-right">{totalGrossWeight.toFixed(2)}</td>
              <td className="pt-3 text-right">{totalCbm.toFixed(3)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-10 grid grid-cols-2 gap-8 pt-8 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-400 mb-6">Authorized Signature</p>
            <div className="border-b border-gray-300 mb-1"></div>
            <p className="text-xs text-gray-500">{order.supplier.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-6">Date</p>
            <div className="border-b border-gray-300 mb-1"></div>
            <p className="text-xs text-gray-500">{today}</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:border-0 { border: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}
