import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function checkAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  return role === "ADMIN";
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      nameEn: body.nameEn || undefined,
      supplierId: body.supplierId,
      categoryId: body.categoryId || undefined,
      price: body.price,
      moq: body.moq ?? 1,
      unit: body.unit ?? "BOX",
      hsCode: body.hsCode || undefined,
      leadDays: body.leadDays || undefined,
      description: body.description || undefined,
      specs: body.specs || undefined,
    },
  });
  return NextResponse.json(product);
}
