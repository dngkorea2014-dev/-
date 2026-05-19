import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { generateOrderNo } from "@/lib/utils";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { supplierId, paymentTerms, shippingTerms, portOfLoading, portOfDischarge, notes, currency, items } = body;

  const totalAmount = items.reduce(
    (sum: number, it: { quantity: number; unitPrice: number }) => sum + it.quantity * it.unitPrice,
    0
  );

  const order = await prisma.order.create({
    data: {
      orderNo: generateOrderNo(),
      buyerId: session.user.id,
      supplierId,
      paymentTerms,
      shippingTerms,
      portOfLoading,
      portOfDischarge,
      notes,
      currency,
      totalAmount,
      items: {
        create: items.map((it: {
          productId: string;
          description?: string;
          hsCode?: string;
          quantity: number;
          unit: string;
          unitPrice: number;
          boxes?: number;
          netWeight?: number;
          grossWeight?: number;
          cbm?: number;
        }) => ({
          productId: it.productId,
          description: it.description,
          hsCode: it.hsCode,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: it.unitPrice,
          totalPrice: it.quantity * it.unitPrice,
          boxes: it.boxes || 0,
          netWeight: it.netWeight || 0,
          grossWeight: it.grossWeight || 0,
          cbm: it.cbm || 0,
        })),
      },
    },
  });

  return NextResponse.json(order, { status: 201 });
}
