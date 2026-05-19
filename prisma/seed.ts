import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.upsert({
    where: { email: "buyer@demo.com" },
    update: {},
    create: {
      email: "buyer@demo.com",
      name: "Demo Buyer",
      password: "demo1234",
      role: "BUYER",
      company: "Global Imports Co.",
      country: "USA",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      name: "Admin",
      password: "admin1234",
      role: "ADMIN",
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: "Electronics" }, update: {}, create: { name: "Electronics" } }),
    prisma.category.upsert({ where: { name: "Textiles" }, update: {}, create: { name: "Textiles" } }),
    prisma.category.upsert({ where: { name: "Hardware" }, update: {}, create: { name: "Hardware" } }),
    prisma.category.upsert({ where: { name: "Plastics" }, update: {}, create: { name: "Plastics" } }),
    prisma.category.upsert({ where: { name: "Furniture" }, update: {}, create: { name: "Furniture" } }),
    prisma.category.upsert({ where: { name: "Food & Snacks" }, update: {}, create: { name: "Food & Snacks" } }),
  ]);

  const [electronics, textiles, hardware, plastics, furniture, food] = categories;

  const suppA = await prisma.supplier.upsert({
    where: { id: "supplier-a" }, update: {},
    create: { id: "supplier-a", name: "Shenzhen TechCore Electronics Co., Ltd.", address: "Building A, Longhua Industrial Park", city: "Shenzhen", contactName: "Mr. Wang", contactEmail: "sales@techcore.cn", contactPhone: "+86-755-8888-0001" },
  });
  const suppB = await prisma.supplier.upsert({
    where: { id: "supplier-b" }, update: {},
    create: { id: "supplier-b", name: "Guangzhou Textile & Apparel Co., Ltd.", address: "No. 88 Haizhu Road", city: "Guangzhou", contactName: "Ms. Li", contactEmail: "export@gztextile.cn" },
  });
  const suppC = await prisma.supplier.upsert({
    where: { id: "supplier-c" }, update: {},
    create: { id: "supplier-c", name: "Ningbo Hardware Manufacturing Co., Ltd.", address: "Cixi Economic Development Zone", city: "Ningbo", contactName: "Mr. Chen", contactEmail: "sales@nbhardware.cn" },
  });
  const suppD = await prisma.supplier.upsert({
    where: { id: "supplier-d" }, update: {},
    create: { id: "supplier-d", name: "Foshan Modern Furniture Factory", address: "Lecong Furniture Market, Zone B", city: "Foshan", contactName: "Ms. Zhang", contactEmail: "info@fsfurniture.cn" },
  });

  const products = [
    { id: "prod-1", name: "Wireless Bluetooth Earbuds TWS", nameEn: "TWS Bluetooth Earbuds", supplierId: suppA.id, categoryId: electronics.id, price: 8.50, moq: 100, unit: "PCS", hsCode: "8518.30.00", leadDays: 15, description: "True wireless stereo earbuds, Bluetooth 5.3, 6h playback + 24h charging case" },
    { id: "prod-2", name: "USB-C 65W Fast Charger Adapter", nameEn: "65W USB-C Charger", supplierId: suppA.id, categoryId: electronics.id, price: 4.20, moq: 200, unit: "PCS", hsCode: "8504.40.00", leadDays: 10, description: "GaN technology, universal compatibility" },
    { id: "prod-3", name: "Smart LED Strip Light 5M RGB", nameEn: "RGB LED Strip 5M", supplierId: suppA.id, categoryId: electronics.id, price: 6.80, moq: 50, unit: "SET", hsCode: "9405.40.00", leadDays: 12, description: "App-controlled RGB, WiFi compatible" },
    { id: "prod-4", name: "Power Bank 20000mAh Fast Charge", nameEn: "20000mAh Power Bank", supplierId: suppA.id, categoryId: electronics.id, price: 12.50, moq: 100, unit: "PCS", hsCode: "8507.60.00", leadDays: 18 },
    { id: "prod-5", name: "100% Cotton T-Shirt Unisex", nameEn: "Cotton T-Shirt", supplierId: suppB.id, categoryId: textiles.id, price: 2.80, moq: 300, unit: "PCS", hsCode: "6109.10.00", leadDays: 20, description: "180gsm combed cotton, available S-XXL" },
    { id: "prod-6", name: "Polyester Sports Shorts", nameEn: "Sports Shorts", supplierId: suppB.id, categoryId: textiles.id, price: 3.50, moq: 200, unit: "PCS", hsCode: "6203.41.00", leadDays: 20 },
    { id: "prod-7", name: "Fleece Hooded Jacket", nameEn: "Fleece Hoodie", supplierId: suppB.id, categoryId: textiles.id, price: 9.90, moq: 100, unit: "PCS", hsCode: "6110.30.00", leadDays: 25, description: "300gsm polar fleece, full zip" },
    { id: "prod-8", name: "Stainless Steel M8 Bolt Set", nameEn: "SS M8 Bolt Set", supplierId: suppC.id, categoryId: hardware.id, price: 0.08, moq: 5000, unit: "PCS", hsCode: "7318.15.00", leadDays: 7 },
    { id: "prod-9", name: "Heavy Duty Padlock 60mm", nameEn: "Heavy Duty Padlock", supplierId: suppC.id, categoryId: hardware.id, price: 3.20, moq: 200, unit: "PCS", hsCode: "8301.20.00", leadDays: 10, description: "Zinc alloy body, hardened steel shackle" },
    { id: "prod-10", name: "Adjustable Wrench 12 inch", nameEn: "12 inch Adjustable Wrench", supplierId: suppC.id, categoryId: hardware.id, price: 4.50, moq: 100, unit: "PCS", hsCode: "8204.12.00", leadDays: 8 },
    { id: "prod-11", name: "Wooden Dining Chair Solid Oak", nameEn: "Solid Oak Dining Chair", supplierId: suppD.id, categoryId: furniture.id, price: 45.00, moq: 20, unit: "PCS", hsCode: "9401.61.00", leadDays: 30, description: "Solid oak frame, cushioned seat" },
    { id: "prod-12", name: "Plastic Storage Container 50L", nameEn: "50L Storage Container", supplierId: suppC.id, categoryId: plastics.id, price: 5.80, moq: 100, unit: "PCS", hsCode: "3923.10.00", leadDays: 10, description: "PP food-grade material, airtight lid" },
  ];

  for (const p of products) {
    await prisma.product.upsert({ where: { id: p.id }, update: {}, create: p });
  }

  // DNG INTERNATIONAL CO.,LTD — food & snacks exporter
  const suppDNG = await prisma.supplier.upsert({
    where: { id: "supplier-dng" }, update: {},
    create: {
      id: "supplier-dng",
      name: "DNG INTERNATIONAL CO.,LTD",
      nameEn: "DNG INTERNATIONAL CO.,LTD",
      city: "Seoul",
      contactEmail: "export@dng-intl.com",
    },
  });

  const dngProducts = [
    {
      id: "dng-01",
      name: "JEJU APPLE MANGO CANDY",
      description: "500g/bag, 30EA/box, Jeju apple mango flavored candy",
      price: 1.60,
      moq: 1,
      unit: "BOX",
      hsCode: "1704.90.00",
      specs: JSON.stringify({ netWeight: 15, grossWeight: 17.5, cbm: 0.04582, boxQty: 30, bagWeight: "500g", boxSize: "53×33×26.2cm" }),
    },
    {
      id: "dng-02",
      name: "GRAPE CANDY",
      description: "500g/bag, 30EA/box, grape flavored candy",
      price: 1.60,
      moq: 1,
      unit: "BOX",
      hsCode: "1704.90.00",
      specs: JSON.stringify({ netWeight: 15, grossWeight: 16, cbm: 0.04582, boxQty: 30, bagWeight: "500g", boxSize: "53×33×26.2cm" }),
    },
    {
      id: "dng-03",
      name: "LYCHEE CANDY",
      description: "500g/bag, 30EA/box, lychee flavored candy",
      price: 1.60,
      moq: 1,
      unit: "BOX",
      hsCode: "1704.90.00",
      specs: JSON.stringify({ netWeight: 15, grossWeight: 16, cbm: 0.04582, boxQty: 30, bagWeight: "500g", boxSize: "53×33×26.2cm" }),
    },
    {
      id: "dng-04",
      name: "HONEY SWEET POTATO CHIPS",
      description: "320g/bag, 10EA/box, honey glazed sweet potato chips",
      price: 1.30,
      moq: 1,
      unit: "BOX",
      hsCode: "2005.20.00",
      specs: JSON.stringify({ netWeight: 3.2, grossWeight: 4.14, cbm: 0.03825, boxQty: 10, bagWeight: "320g", boxSize: "50×30×25.5cm" }),
    },
    {
      id: "dng-05",
      name: "Sweet Glutinous Rice Crisp",
      description: "432g/bag, 16EA/box, sweet glutinous rice crispy snack",
      price: 1.80,
      moq: 1,
      unit: "BOX",
      hsCode: "1905.90.00",
      specs: JSON.stringify({ netWeight: 6.912, grossWeight: 8.55, cbm: 0.05658, boxQty: 16, bagWeight: "432g", boxSize: "37.5×35.5×42.5cm" }),
    },
    {
      id: "dng-06",
      name: "Little Fried Dough Twists",
      description: "510g/bag, 16EA/box, traditional fried dough twist snack",
      price: 1.80,
      moq: 1,
      unit: "BOX",
      hsCode: "1905.90.00",
      specs: JSON.stringify({ netWeight: 8.16, grossWeight: 10, cbm: 0.07737, boxQty: 16, bagWeight: "510g", boxSize: "51×41×37cm" }),
    },
    {
      id: "dng-07",
      name: "JEJU APPLE MANGO MOCHI",
      description: "150g(15g×10pc)/bag, 24EA/box, Jeju apple mango mochi",
      price: 1.50,
      moq: 1,
      unit: "BOX",
      hsCode: "1901.90.00",
      specs: JSON.stringify({ netWeight: 3.6, grossWeight: 5, cbm: 0.03008, boxQty: 24, bagWeight: "150g", boxSize: "47×32×20cm" }),
    },
    {
      id: "dng-08",
      name: "FLY CHICKPEAS",
      description: "50g/bag, 150EA/box, roasted seasoned chickpeas snack",
      price: 0.23,
      moq: 1,
      unit: "BOX",
      hsCode: "2106.90.00",
      specs: JSON.stringify({ netWeight: 7.5, grossWeight: 9.05, cbm: 0.03888, boxQty: 150, bagWeight: "50g", boxSize: "45×32×27cm" }),
    },
  ];

  for (const p of dngProducts) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, supplierId: suppDNG.id, categoryId: food.id, origin: "Korea" },
    });
  }

  console.log("Seed data created successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
