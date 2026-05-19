import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ShoppingCart, Plus } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  QUOTE: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PRODUCTION: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function OrdersPage() {
  const session = await auth();
  const orders = await prisma.order.findMany({
    where: { buyerId: session!.user!.id },
    include: { supplier: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingCart className="text-indigo-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <Link
          href="/orders/new"
          className="ml-auto flex items-center gap-1 bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700"
        >
          <Plus size={16} /> New Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
          <p className="mb-3">No orders yet</p>
          <Link href="/orders/new" className="text-indigo-600 text-sm hover:underline">
            Create your first order
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Order No.</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Supplier</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Items</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Total</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium text-indigo-700">{order.orderNo}</td>
                  <td className="px-4 py-3 text-gray-700">{order.supplier.name}</td>
                  <td className="px-4 py-3 text-gray-500">{order.items.length}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(order.totalAmount, order.currency)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/orders/${order.id}`} className="text-indigo-600 hover:underline text-xs">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
