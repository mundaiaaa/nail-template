import Link from "next/link";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { acceptBookingAction, rejectBookingAction } from "./actions";
import type { BookingStatus } from "@/generated/prisma/enums";

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "待確認",
  CONFIRMED: "已確認",
  REJECTED: "已婉拒",
  CANCELLED: "已取消",
};

const STATUS_VARIANTS: Record<BookingStatus, "secondary" | "default" | "outline"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  REJECTED: "outline",
  CANCELLED: "outline",
};

const FILTERS: { value: BookingStatus | "ALL"; label: string }[] = [
  { value: "PENDING", label: "待確認" },
  { value: "CONFIRMED", label: "已確認" },
  { value: "REJECTED", label: "已婉拒" },
  { value: "CANCELLED", label: "已取消" },
  { value: "ALL", label: "全部" },
];

function formatDateTimeTaipei(d: Date): string {
  return new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { shop } = await requireShop();
  const { status } = await searchParams;
  const activeFilter = (status as BookingStatus | "ALL") ?? "PENDING";

  const bookings = await db.booking.findMany({
    where: {
      branch: { shopId: shop.id },
      ...(activeFilter === "ALL" ? {} : { status: activeFilter }),
    },
    include: { branch: true, service: true, technician: true, customer: true },
    orderBy: { startTime: activeFilter === "PENDING" ? "asc" : "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">預約管理</h1>
        <p className="text-sm text-muted-foreground">確認或婉拒顧客的預約請求</p>
      </div>

      <div className="flex gap-1 border-b">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/admin/bookings?status=${f.value}`}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              activeFilter === f.value
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground">沒有符合條件的預約</p>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{booking.service.name}</CardTitle>
                <Badge variant={STATUS_VARIANTS[booking.status]}>{STATUS_LABELS[booking.status]}</Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  {booking.branch.name} · {formatDateTimeTaipei(booking.startTime)}
                  {booking.technician ? ` · ${booking.technician.name}` : ""}
                </p>
                <p className="text-sm">
                  預約人：{booking.customer?.name ?? booking.guestName}（
                  {booking.customer?.phone ?? booking.guestPhone}）
                  {booking.customer && <span className="text-muted-foreground"> · 會員</span>}
                  {!booking.customer && <span className="text-muted-foreground"> · 訪客</span>}
                </p>
                {booking.depositRequired && (
                  <p className="text-xs text-muted-foreground">
                    需訂金 · {booking.depositStatus === "PAID" ? "已付款" : "待付款"}
                  </p>
                )}
                {booking.status === "PENDING" && (
                  <div className="flex gap-2 pt-2">
                    <form action={acceptBookingAction}>
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <Button type="submit" size="sm">
                        確認預約
                      </Button>
                    </form>
                    <form action={rejectBookingAction}>
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <Button type="submit" size="sm" variant="outline">
                        婉拒
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
