import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { FileText } from "lucide-react";

export default async function DocumentsPage() {
  const session = await auth();
  const orders = await prisma.order.findMany({
    where: { buyerId: session!.user!.id },
    include: { supplier: true, documents: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="text-indigo-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-900">Export Documents</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-30" />
          <p>No orders yet. Create an order to generate documents.</p>
          <Link href="/orders/new" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">
            Create Order
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div>
                <p className="font-mono font-semibold text-gray-900">{order.orderNo}</p>
                <p className="text-sm text-gray-500">{order.supplier.name} · {formatDate(order.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/documents/invoice/${order.id}`}
                  className="flex items-center gap-1.5 bg-indigo-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-indigo-700"
                >
                  <FileText size={14} /> Invoice
                </Link>
                <Link
                  href={`/documents/packing-list/${order.id}`}
                  className="flex items-center gap-1.5 border border-indigo-300 text-indigo-600 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-indigo-50"
                >
                  <FileText size={14} /> Packing List
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
