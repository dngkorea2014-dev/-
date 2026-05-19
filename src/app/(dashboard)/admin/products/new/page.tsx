import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  const [suppliers, categories] = await Promise.all([
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/admin/products" className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-5">
        <ArrowLeft size={16} /> Back to Products
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Product</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ProductForm suppliers={suppliers} categories={categories} mode="new" />
      </div>
    </div>
  );
}
