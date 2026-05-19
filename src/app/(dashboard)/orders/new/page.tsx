import { prisma } from "@/lib/prisma";
import NewOrderForm from "@/components/NewOrderForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const { productId } = await searchParams;

  const [suppliers, products, preselectedProduct] = await Promise.all([
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { active: true },
      include: { supplier: true },
      orderBy: { name: "asc" },
    }),
    productId ? prisma.product.findUnique({ where: { id: productId }, include: { supplier: true } }) : null,
  ]);

  return (
    <div className="p-6 max-w-3xl">
      <Link href="/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-5">
        <ArrowLeft size={16} /> Back to Orders
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Order</h1>
      <NewOrderForm
        suppliers={suppliers}
        products={products}
        preselectedProduct={preselectedProduct}
      />
    </div>
  );
}
