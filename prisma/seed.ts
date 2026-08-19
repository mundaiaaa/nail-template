import "dotenv/config";
import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth/password";

const DAY = (open: string | null, close: string | null) => ({ openTime: open, closeTime: close, isClosed: open === null });

async function main() {
  console.log("Seeding demo shop...");

  const existing = await db.user.findUnique({ where: { email: "demo@nailbook.tw" } });
  if (existing) {
    console.log("Demo owner already exists, deleting old demo data first...");
    await db.user.delete({ where: { id: existing.id } });
  }

  const owner = await db.user.create({
    data: {
      email: "demo@nailbook.tw",
      passwordHash: await hashPassword("demo12345"),
      emailVerified: true,
    },
  });

  const shop = await db.shop.create({
    data: {
      ownerId: owner.id,
      name: "示範美甲沙龍",
      slug: "demo",
      published: true,
      themeColor: "#d6336c",
      cancellationEnabled: true,
      cancellationMinNoticeHrs: 24,
      depositRequired: true,
      depositAmount: 200,
    },
  });

  const branchHours = (closedDay: number) =>
    Array.from({ length: 7 }, (_, dayOfWeek) => ({
      dayOfWeek,
      ...(dayOfWeek === closedDay ? DAY(null, null) : DAY("10:00", "20:00")),
    }));

  const techHours = (closedDay: number) =>
    Array.from({ length: 7 }, (_, dayOfWeek) => ({
      dayOfWeek,
      isOff: dayOfWeek === closedDay,
      startTime: dayOfWeek === closedDay ? null : "10:00",
      endTime: dayOfWeek === closedDay ? null : "20:00",
    }));

  const SERVICES = [
    { name: "卸甲", price: 300, durationMinutes: 30 },
    { name: "基礎保養", price: 500, durationMinutes: 45 },
    { name: "光療凝膠", price: 800, durationMinutes: 60 },
    { name: "手繪造型", price: 1200, durationMinutes: 90 },
  ];

  // Branch 1: customer picks their technician
  const branch1 = await db.branch.create({
    data: {
      shopId: shop.id,
      name: "台北信義店",
      address: "台北市信義區松高路1號",
      phone: "02-2345-6789",
      assignmentMode: "CUSTOMER_CHOICE",
      businessHours: { createMany: { data: branchHours(1) } }, // closed Mondays
      services: { createMany: { data: SERVICES } },
    },
  });
  const tech1a = await db.technician.create({
    data: {
      branchId: branch1.id,
      name: "小美",
      specialties: ["光療凝膠", "手繪造型"],
      workingHours: { createMany: { data: techHours(1) } },
    },
  });
  const tech1b = await db.technician.create({
    data: {
      branchId: branch1.id,
      name: "阿嘉",
      specialties: ["基礎保養", "卸甲"],
      workingHours: { createMany: { data: techHours(2) } }, // closed Tuesdays
    },
  });

  // Branch 2: system randomly assigns a technician
  const branch2 = await db.branch.create({
    data: {
      shopId: shop.id,
      name: "台中西屯店",
      address: "台中市西屯區台灣大道三段99號",
      phone: "04-2345-6789",
      assignmentMode: "RANDOM",
      businessHours: { createMany: { data: branchHours(1) } },
      services: { createMany: { data: SERVICES } },
    },
  });
  await db.technician.create({
    data: {
      branchId: branch2.id,
      name: "小雨",
      specialties: [],
      workingHours: { createMany: { data: techHours(1) } },
    },
  });
  await db.technician.create({
    data: {
      branchId: branch2.id,
      name: "凱文",
      specialties: [],
      workingHours: { createMany: { data: techHours(3) } },
    },
  });

  // Branch 3: system matches technician skill to service
  const branch3 = await db.branch.create({
    data: {
      shopId: shop.id,
      name: "高雄三多店",
      address: "高雄市苓雅區三多三路100號",
      phone: "07-2345-6789",
      assignmentMode: "SKILL_MATCH",
      businessHours: { createMany: { data: branchHours(1) } },
      services: { createMany: { data: SERVICES } },
    },
  });
  await db.technician.create({
    data: {
      branchId: branch3.id,
      name: "米雅",
      specialties: ["手繪造型", "光療凝膠"],
      workingHours: { createMany: { data: techHours(1) } },
    },
  });
  await db.technician.create({
    data: {
      branchId: branch3.id,
      name: "阿翔",
      specialties: ["基礎保養", "卸甲"],
      workingHours: { createMany: { data: techHours(4) } },
    },
  });

  // A technician time-off example
  const twoWeeksOut = new Date();
  twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);
  await db.technicianTimeOff.create({
    data: { technicianId: tech1a.id, date: twoWeeksOut },
  });

  // A demo registered customer
  const customer = await db.customer.create({
    data: {
      shopId: shop.id,
      name: "王小美",
      phone: "0912345678",
      email: "customer@example.com",
      passwordHash: await hashPassword("customer1234"),
    },
  });

  // Sample bookings across statuses, a few days out to stay clear of the
  // 24h cancellation window and any "today" edge cases.
  const gelService = await db.service.findFirstOrThrow({ where: { branchId: branch1.id, name: "光療凝膠" } });
  const careService = await db.service.findFirstOrThrow({ where: { branchId: branch1.id, name: "基礎保養" } });

  function atTaipeiTime(daysFromNow: number, hour: number, minute = 0): Date {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + daysFromNow);
    d.setUTCHours(hour - 8, minute, 0, 0); // Taipei is UTC+8
    return d;
  }

  await db.booking.create({
    data: {
      branchId: branch1.id,
      serviceId: gelService.id,
      technicianId: tech1a.id,
      customerId: customer.id,
      startTime: atTaipeiTime(3, 14),
      endTime: atTaipeiTime(3, 15),
      status: "PENDING",
      depositRequired: true,
      depositStatus: "PENDING",
    },
  });

  await db.booking.create({
    data: {
      branchId: branch1.id,
      serviceId: careService.id,
      technicianId: tech1b.id,
      guestName: "陳先生",
      guestPhone: "0922333444",
      startTime: atTaipeiTime(5, 11),
      endTime: atTaipeiTime(5, 11, 45),
      status: "CONFIRMED",
      depositRequired: true,
      depositStatus: "PENDING",
    },
  });

  await db.booking.create({
    data: {
      branchId: branch1.id,
      serviceId: gelService.id,
      technicianId: tech1a.id,
      guestName: "林小姐",
      guestPhone: "0933444555",
      startTime: atTaipeiTime(1, 16),
      endTime: atTaipeiTime(1, 17),
      status: "CANCELLED",
      depositRequired: true,
      depositStatus: "NOT_REQUIRED",
    },
  });

  console.log("Seed complete.");
  console.log("Owner login: demo@nailbook.tw / demo12345");
  console.log("Customer login (on the demo shop): customer@example.com / customer1234");
  console.log(`Storefront: http://localhost:3000/s/${shop.slug}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
