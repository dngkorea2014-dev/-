import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, Users, ShoppingCart, Truck } from "lucide-react";

export default async function AdminPage() {
  const [productCount, supplierCount, orderCount, userCount] = await Promise.all([
    prisma.product.count(),
    prisma.supplier.count(),
    prisma.order.count(),
    prisma.user.count(),
  ]);

  const stats = [
    { label: "Products", value: productCount, href: "/admin/products", icon: Package, color: "bg-indigo-500" },
    { label: "Suppliers", value: supplierCount, href: "/admin/suppliers", icon: Truck, color: "bg-emerald-500" },
    { label: "Orders", value: orderCount, href: "/orders", icon: ShoppingCart, color: "bg-amber-500" },
    { label: "Users", value: userCount, href: "/admin/users", icon: Users, color: "bg-rose-500" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, href, icon: Icon, color }) => (
          <Link key={label} href={href} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/products" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-gray-900 mb-1">Product Management</h2>
          <p className="text-sm text-gray-500">Add, edit, and manage products in the catalog</p>
        </Link>
        <Link href="/admin/suppliers" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-gray-900 mb-1">Supplier Management</h2>
          <p className="text-sm text-gray-500">Manage supplier profiles and contact info</p>
        </Link>
      </div>
    </div>
  );
}
