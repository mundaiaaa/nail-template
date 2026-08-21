import Link from "next/link";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { todayDateStringInTaiwan, dayOfWeekForDateString, WEEKDAY_LABELS_ZH } from "@/lib/days";
import { ScheduleGrid } from "./schedule-grid";

function addDaysToDateString(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDateZh(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return new Intl.DateTimeFormat("zh-TW", { timeZone: "UTC", month: "long", day: "numeric" }).format(d);
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ branchId?: string; date?: string }>;
}) {
  const { shop } = await requireShop();
  const { branchId: rawBranchId, date: rawDate } = await searchParams;

  const branches = await db.branch.findMany({ where: { shopId: shop.id }, orderBy: { createdAt: "asc" } });
  const date = rawDate ?? todayDateStringInTaiwan();
  const branch = branches.find((b) => b.id === rawBranchId) ?? branches[0];

  if (!branch) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">行事曆</h1>
        <p className="text-sm text-muted-foreground">請先建立分店後再查看班表</p>
      </div>
    );
  }

  const [businessHours, technicians, bookings] = await Promise.all([
    db.businessHour.findUnique({
      where: { branchId_dayOfWeek: { branchId: branch.id, dayOfWeek: dayOfWeekForDateString(date) } },
    }),
    db.technician.findMany({
      where: { branchId: branch.id },
      include: { workingHours: true, timeOff: true },
      orderBy: { createdAt: "asc" },
    }),
    db.booking.findMany({
      where: {
        branchId: branch.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        startTime: { gte: new Date(`${date}T00:00:00+08:00`), lt: new Date(`${addDaysToDateString(date, 1)}T00:00:00+08:00`) },
      },
      include: { customer: true, technician: true, services: { include: { service: true } } },
    }),
  ]);

  const dayOfWeek = dayOfWeekForDateString(date);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">行事曆</h1>
          <p className="text-sm text-muted-foreground">
            {formatDateZh(date)}（{WEEKDAY_LABELS_ZH[dayOfWeek]}）· {branch.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/calendar?branchId=${branch.id}&date=${addDaysToDateString(date, -1)}`}>
            <Button variant="outline" size="sm">
              ← 前一天
            </Button>
          </Link>
          <Link href={`/admin/calendar?branchId=${branch.id}&date=${todayDateStringInTaiwan()}`}>
            <Button variant="outline" size="sm">
              今天
            </Button>
          </Link>
          <Link href={`/admin/calendar?branchId=${branch.id}&date=${addDaysToDateString(date, 1)}`}>
            <Button variant="outline" size="sm">
              後一天 →
            </Button>
          </Link>
        </div>
      </div>

      {branches.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {branches.map((b) => (
            <Link key={b.id} href={`/admin/calendar?branchId=${b.id}&date=${date}`}>
              <Button variant={b.id === branch.id ? "default" : "outline"} size="sm">
                {b.name}
              </Button>
            </Link>
          ))}
        </div>
      )}

      {!businessHours || businessHours.isClosed || !businessHours.openTime || !businessHours.closeTime ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">此分店這天公休</CardContent>
        </Card>
      ) : technicians.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">此分店尚無美甲師</CardContent>
        </Card>
      ) : (
        <ScheduleGrid
          date={date}
          dayOfWeek={dayOfWeek}
          openTime={businessHours.openTime}
          closeTime={businessHours.closeTime}
          technicians={technicians}
          bookings={bookings}
        />
      )}
    </div>
  );
}
