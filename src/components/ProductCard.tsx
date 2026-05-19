"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  nameEn?: string | null;
  price: number;
  moq: number;
  unit: string;
  origin: string;
  imageUrl?: string | null;
  supplier: { name: string };
  category?: { name: string } | null;
}

export default function ProductCard({
  product,
  isFavorite: initFav,
  userId,
}: {
  product: Product;
  isFavorite: boolean;
  userId?: string;
}) {
  const [fav, setFav] = useState(initFav);
  const [loading, setLoading] = useState(false);

  async function toggleFav(e: React.MouseEvent) {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    await fetch("/api/favorites", {
      method: fav ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
    setFav(!fav);
    setLoading(false);
  }

  return (
    <Link href={`/sourcing/${product.id}`} className="block">
      <div className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all overflow-hidden group">
        <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-4xl opacity-20">📦</div>
          )}
          {product.category && (
            <span className="absolute top-2 left-2 bg-white text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full border border-indigo-100">
              {product.category.name}
            </span>
          )}
          {userId && (
            <button
              onClick={toggleFav}
              disabled={loading}
              className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
            >
              <Heart
                size={16}
                className={fav ? "fill-red-500 text-red-500" : "text-gray-400"}
              />
            </button>
          )}
        </div>

        <div className="p-3">
          <p className="text-xs text-gray-400 mb-0.5 truncate">{product.supplier.name}</p>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-indigo-700 font-bold">
                {formatCurrency(product.price)}
              </span>
              <span className="text-gray-400 text-xs">/{product.unit}</span>
            </div>
            <div className="text-xs text-gray-500 text-right">
              MOQ: {product.moq}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Origin: {product.origin}</p>
        </div>
      </div>
    </Link>
  );
}
