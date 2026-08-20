import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAvailableSlots } from "@/lib/booking/slots";
import { sumDurationRange, formatDurationRange } from "@/lib/booking/duration";
import { parseServiceIds } from "@/lib/booking/query";
import { todayDateStringInTaiwan } from "@/lib/days";
import { cn } from "@/lib/utils";
import { PageDecorations } from "@/app/s/[slug]/page-decorations";

const DAYS_AHEAD = 21;
const WEEKDAY_SHORT_ZH = ["日", "一", "二", "三", "四", "五", "六"];

function addDaysToDateString(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatTimeTaipei(d: Date): string {
  return new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
}

export default async function SelectSlotPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; branchId: string }>;
  searchParams: Promise<{ serviceIds?: string; technicianId?: string; date?: string; rescheduleFrom?: string }>;
}) {
  const { slug, branchId } = await params;
  const { serviceIds: rawServiceIds, technicianId, date, rescheduleFrom } = await searchParams;
  const serviceIds = parseServiceIds(rawServiceIds);
  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop || !shop.published) notFound();

  if (serviceIds.length === 0) {
    redirect(`/s/${slug}/book/${branchId}`);
  }

  const branch = await db.branch.findFirst({ where: { id: branchId, shopId: shop.id } });
  const services = await db.service.findMany({ where: { id: { in: serviceIds }, branchId } });
  if (!branch || services.length !== serviceIds.length) notFound();

  const serviceIdsQs = `serviceIds=${rawServiceIds}`;

  if (branch.assignmentMode === "CUSTOMER_CHOICE" && !technicianId) {
    const qs = rescheduleFrom ? `&rescheduleFrom=${rescheduleFrom}` : "";
    redirect(`/s/${slug}/book/${branchId}/technician?${serviceIdsQs}${qs}`);
  }

  const selectedDate = date ?? todayDateStringInTaiwan();
  const startDate = todayDateStringInTaiwan();

  const slots = await getAvailableSlots({ branchId, serviceIds, date: selectedDate, technicianId });
  const duration = sumDurationRange(services);

  const techQs = technicianId ? `&technicianId=${technicianId}` : "";
  const rescheduleQs = rescheduleFrom ? `&rescheduleFrom=${rescheduleFrom}` : "";

  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <PageDecorations shopId={shop.id} page="SLOT_SELECT" />
      <div>
        <h1 className="text-xl font-semibold">選擇日期與時間</h1>
        <p className="text-sm text-muted-foreground">
          步驟 4 / 4 · {services.map((s) => s.name).join("、")}（預估 {formatDurationRange(duration.min, duration.max)}）
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: DAYS_AHEAD }, (_, i) => addDaysToDateString(startDate, i)).map((d) => {
          const dayOfWeek = new Date(`${d}T00:00:00Z`).getUTCDay();
          const dayNum = d.slice(8, 10);
          const active = d === selectedDate;
          return (
            <Link
              key={d}
              href={`/s/${slug}/book/${branchId}/slot?${serviceIdsQs}&date=${d}${techQs}${rescheduleQs}`}
              className={cn(
                "flex shrink-0 flex-col items-center rounded-lg border px-3 py-2 text-sm transition-colors",
                active ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "hover:border-foreground/30"
              )}
            >
              <span className="text-xs opacity-80">週{WEEKDAY_SHORT_ZH[dayOfWeek]}</span>
              <span className="font-medium">{dayNum}</span>
            </Link>
          );
        })}
      </div>

      {slots.length === 0 ? (
        <p className="text-sm text-muted-foreground">此日期沒有可預約的時段，請選擇其他日期</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map((slot) => (
            <Link
              key={slot.startTime.toISOString()}
              href={`/s/${slug}/book/${branchId}/confirm?${serviceIdsQs}&date=${selectedDate}&time=${encodeURIComponent(slot.startTime.toISOString())}${techQs}${rescheduleQs}`}
              className="rounded-lg border px-3 py-2 text-center text-sm transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              {formatTimeTaipei(slot.startTime)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
