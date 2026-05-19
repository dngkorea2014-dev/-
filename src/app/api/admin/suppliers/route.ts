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
  const supplier = await prisma.supplier.create({
    data: {
      name: body.name,
      nameEn: body.nameEn || undefined,
      address: body.address || undefined,
      city: body.city || undefined,
      contactName: body.contactName || undefined,
      contactEmail: body.contactEmail || undefined,
      contactPhone: body.contactPhone || undefined,
    },
  });
  return NextResponse.json(supplier);
}
