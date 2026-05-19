import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(search ? { OR: [{ name: { contains: search } }, { nameEn: { contains: search } }] } : {}),
      ...(category ? { category: { name: category } } : {}),
    },
    include: { supplier: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}
