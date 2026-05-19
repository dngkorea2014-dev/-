import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function createTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "name" TEXT,
      "password" TEXT,
      "role" TEXT NOT NULL DEFAULT 'BUYER',
      "company" TEXT,
      "country" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Supplier" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "nameEn" TEXT,
      "address" TEXT,
      "city" TEXT,
      "contactName" TEXT,
      "contactEmail" TEXT,
      "contactPhone" TEXT,
      "certifications" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Category" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT NOT NULL,
      "supplierId" TEXT NOT NULL,
      "categoryId" TEXT,
      "name" TEXT NOT NULL,
      "nameEn" TEXT,
      "sku" TEXT,
      "description" TEXT,
      "hsCode" TEXT,
      "unit" TEXT NOT NULL DEFAULT 'PCS',
      "price" DOUBLE PRECISION NOT NULL,
      "moq" INTEGER NOT NULL DEFAULT 1,
      "leadDays" INTEGER,
      "origin" TEXT NOT NULL DEFAULT 'China',
      "imageUrl" TEXT,
      "specs" TEXT,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT NOT NULL,
      "orderNo" TEXT NOT NULL,
      "buyerId" TEXT NOT NULL,
      "supplierId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'QUOTE',
      "paymentTerms" TEXT,
      "shippingTerms" TEXT,
      "portOfLoading" TEXT,
      "portOfDischarge" TEXT,
      "notes" TEXT,
      "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "currency" TEXT NOT NULL DEFAULT 'USD',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNo_key" ON "Order"("orderNo")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "OrderItem" (
      "id" TEXT NOT NULL,
      "orderId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "description" TEXT,
      "hsCode" TEXT,
      "quantity" DOUBLE PRECISION NOT NULL,
      "unit" TEXT NOT NULL DEFAULT 'PCS',
      "unitPrice" DOUBLE PRECISION NOT NULL,
      "totalPrice" DOUBLE PRECISION NOT NULL,
      "boxes" INTEGER,
      "netWeight" DOUBLE PRECISION,
      "grossWeight" DOUBLE PRECISION,
      "cbm" DOUBLE PRECISION,
      CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Document" (
      "id" TEXT NOT NULL,
      "orderId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "docNo" TEXT NOT NULL,
      "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "data" TEXT NOT NULL,
      CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Document_docNo_key" ON "Document"("docNo")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Favorite" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_userId_productId_key" ON "Favorite"("userId", "productId")`);

  // Foreign keys (IF NOT EXISTS not supported for constraints, use DO $$ ... $$)
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "Product" ADD CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "Order" ADD CONSTRAINT "Order_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "Document" ADD CONSTRAINT "Document_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
}

export async function GET() {
  try {
    // Create tables if they don't exist
    await createTables();

    // Check if already seeded
    const existing = await prisma.user.count();
    if (existing > 0) return NextResponse.json({ message: "Already seeded" });

    await prisma.user.createMany({
      data: [
        { email: "buyer@demo.com", name: "Demo Buyer", password: "demo1234", role: "BUYER", company: "Global Imports Co.", country: "USA" },
        { email: "admin@demo.com", name: "Admin", password: "admin1234", role: "ADMIN" },
      ],
    });

    const cats = await Promise.all([
      prisma.category.create({ data: { name: "Electronics" } }),
      prisma.category.create({ data: { name: "Textiles" } }),
      prisma.category.create({ data: { name: "Hardware" } }),
      prisma.category.create({ data: { name: "Plastics" } }),
      prisma.category.create({ data: { name: "Furniture" } }),
      prisma.category.create({ data: { name: "Food & Snacks" } }),
    ]);
    const [electronics, textiles, hardware, plastics, furniture, food] = cats;

    const suppA = await prisma.supplier.create({ data: { name: "Shenzhen TechCore Electronics Co., Ltd.", address: "Building A, Longhua Industrial Park", city: "Shenzhen", contactEmail: "sales@techcore.cn" } });
    const suppB = await prisma.supplier.create({ data: { name: "Guangzhou Textile & Apparel Co., Ltd.", address: "No. 88 Haizhu Road", city: "Guangzhou", contactEmail: "export@gztextile.cn" } });
    const suppC = await prisma.supplier.create({ data: { name: "Ningbo Hardware Manufacturing Co., Ltd.", address: "Cixi Economic Development Zone", city: "Ningbo", contactEmail: "sales@nbhardware.cn" } });
    const suppD = await prisma.supplier.create({ data: { name: "Foshan Modern Furniture Factory", address: "Lecong Furniture Market, Zone B", city: "Foshan", contactEmail: "info@fsfurniture.cn" } });
    const suppDNG = await prisma.supplier.create({ data: { name: "DNG INTERNATIONAL CO.,LTD", city: "Seoul", contactEmail: "export@dng-intl.com" } });

    const products = [
      { name: "Wireless Bluetooth Earbuds TWS", supplierId: suppA.id, categoryId: electronics.id, price: 8.50, moq: 100, unit: "PCS", hsCode: "8518.30.00", leadDays: 15, description: "True wireless stereo earbuds, Bluetooth 5.3" },
      { name: "USB-C 65W Fast Charger Adapter", supplierId: suppA.id, categoryId: electronics.id, price: 4.20, moq: 200, unit: "PCS", hsCode: "8504.40.00", leadDays: 10 },
      { name: "Smart LED Strip Light 5M RGB", supplierId: suppA.id, categoryId: electronics.id, price: 6.80, moq: 50, unit: "SET", hsCode: "9405.40.00", leadDays: 12 },
      { name: "Power Bank 20000mAh Fast Charge", supplierId: suppA.id, categoryId: electronics.id, price: 12.50, moq: 100, unit: "PCS", leadDays: 18 },
      { name: "100% Cotton T-Shirt Unisex", supplierId: suppB.id, categoryId: textiles.id, price: 2.80, moq: 300, unit: "PCS", hsCode: "6109.10.00", leadDays: 20 },
      { name: "Polyester Sports Shorts", supplierId: suppB.id, categoryId: textiles.id, price: 3.50, moq: 200, unit: "PCS", leadDays: 20 },
      { name: "Fleece Hooded Jacket", supplierId: suppB.id, categoryId: textiles.id, price: 9.90, moq: 100, unit: "PCS", hsCode: "6110.30.00", leadDays: 25 },
      { name: "Stainless Steel M8 Bolt Set", supplierId: suppC.id, categoryId: hardware.id, price: 0.08, moq: 5000, unit: "PCS", hsCode: "7318.15.00", leadDays: 7 },
      { name: "Heavy Duty Padlock 60mm", supplierId: suppC.id, categoryId: hardware.id, price: 3.20, moq: 200, unit: "PCS", leadDays: 10 },
      { name: "Adjustable Wrench 12 inch", supplierId: suppC.id, categoryId: hardware.id, price: 4.50, moq: 100, unit: "PCS", leadDays: 8 },
      { name: "Wooden Dining Chair Solid Oak", supplierId: suppD.id, categoryId: furniture.id, price: 45.00, moq: 20, unit: "PCS", hsCode: "9401.61.00", leadDays: 30 },
      { name: "Plastic Storage Container 50L", supplierId: suppC.id, categoryId: plastics.id, price: 5.80, moq: 100, unit: "PCS", leadDays: 10 },
      { name: "JEJU APPLE MANGO CANDY", supplierId: suppDNG.id, categoryId: food.id, price: 1.60, moq: 1, unit: "BOX", hsCode: "1704.90.00", origin: "Korea", specs: '{"netWeight":15,"grossWeight":17.5,"cbm":0.04582,"boxQty":30}' },
      { name: "GRAPE CANDY", supplierId: suppDNG.id, categoryId: food.id, price: 1.60, moq: 1, unit: "BOX", hsCode: "1704.90.00", origin: "Korea", specs: '{"netWeight":15,"grossWeight":16,"cbm":0.04582,"boxQty":30}' },
      { name: "LYCHEE CANDY", supplierId: suppDNG.id, categoryId: food.id, price: 1.60, moq: 1, unit: "BOX", hsCode: "1704.90.00", origin: "Korea", specs: '{"netWeight":15,"grossWeight":16,"cbm":0.04582,"boxQty":30}' },
      { name: "HONEY SWEET POTATO CHIPS", supplierId: suppDNG.id, categoryId: food.id, price: 1.30, moq: 1, unit: "BOX", hsCode: "2005.20.00", origin: "Korea", specs: '{"netWeight":3.2,"grossWeight":4.14,"cbm":0.03825,"boxQty":10}' },
      { name: "Sweet Glutinous Rice Crisp", supplierId: suppDNG.id, categoryId: food.id, price: 1.80, moq: 1, unit: "BOX", hsCode: "1905.90.00", origin: "Korea", specs: '{"netWeight":6.912,"grossWeight":8.55,"cbm":0.05658,"boxQty":16}' },
      { name: "Little Fried Dough Twists", supplierId: suppDNG.id, categoryId: food.id, price: 1.80, moq: 1, unit: "BOX", hsCode: "1905.90.00", origin: "Korea", specs: '{"netWeight":8.16,"grossWeight":10,"cbm":0.07737,"boxQty":16}' },
      { name: "JEJU APPLE MANGO MOCHI", supplierId: suppDNG.id, categoryId: food.id, price: 1.50, moq: 1, unit: "BOX", hsCode: "1901.90.00", origin: "Korea", specs: '{"netWeight":3.6,"grossWeight":5,"cbm":0.03008,"boxQty":24}' },
      { name: "FLY CHICKPEAS", supplierId: suppDNG.id, categoryId: food.id, price: 0.23, moq: 1, unit: "BOX", hsCode: "2106.90.00", origin: "Korea", specs: '{"netWeight":7.5,"grossWeight":9.05,"cbm":0.03888,"boxQty":150}' },
    ];

    for (const p of products) {
      await prisma.product.create({ data: p });
    }

    return NextResponse.json({ message: "Seeded successfully", products: products.length });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
