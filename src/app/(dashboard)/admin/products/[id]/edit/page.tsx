import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../../ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, suppliers, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  const initial = {
    id: product.id,
    name: product.name,
    nameEn: product.nameEn ?? "",
    supplierId: product.supplierId,
    categoryId: product.categoryId ?? "",
    price: String(product.price),
    moq: String(product.moq),
    unit: product.unit,
    hsCode: product.hsCode ?? "",
    leadDays: product.leadDays ? String(product.leadDays) : "",
    description: product.description ?? "",
    specs: product.specs ?? "",
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/admin/products" className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-5">
        <ArrowLeft size={16} /> Back to Products
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ProductForm suppliers={suppliers} categories={categories} initial={initial} mode="edit" />
      </div>
    </div>
  );
}
