import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SupplierForm from "../SupplierForm";

export default function NewSupplierPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/admin/suppliers" className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-5">
        <ArrowLeft size={16} /> Back to Suppliers
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Supplier</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SupplierForm mode="new" />
      </div>
    </div>
  );
}
