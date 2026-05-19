import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import ProductCard from "@/components/ProductCard";
import { Package } from "lucide-react";

interface SearchParams {
  search?: string;
  category?: string;
}

export default async function SourcingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { search, category } = await searchParams;
  const session = await auth();

  const [products, categories, favorites] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { nameEn: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {}),
        ...(category ? { category: { name: category } } : {}),
      },
      include: { supplier: true, category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    session
      ? prisma.favorite.findMany({
          where: { userId: session.user.id },
          select: { productId: true },
        })
      : [],
  ]);

  const favoriteIds = new Set(favorites.map((f) => f.productId));

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Package className="text-indigo-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-900">Product Sourcing</h1>
        <span className="ml-auto text-sm text-gray-500">{products.length} products</span>
      </div>

      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search products..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          name="category"
          defaultValue={category}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700"
        >
          Search
        </button>
        {(search || category) && (
          <a
            href="/sourcing"
            className="border border-gray-300 text-gray-600 rounded-lg px-4 py-2 text-sm hover:bg-gray-50"
          >
            Clear
          </a>
        )}
      </form>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-3 opacity-30" />
          <p>No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={favoriteIds.has(product.id)}
              userId={session?.user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
