import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { canCancelBooking } from "@/lib/booking/cancellation";
import { cancelBookingAction } from "./booking-actions";
import type { Shop, Booking, Branch, Service, Technician } from "@/generated/prisma/client";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待確認",
  CONFIRMED: "已確認",
  REJECTED: "已婉拒",
  CANCELLED: "已取消",
};

const STATUS_VARIANTS: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  REJECTED: "outline",
  CANCELLED: "outline",
};

function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

type BookingWithRelations = Booking & { branch: Branch; service: Service; technician: Technician | null };

export function CustomerBookingsList({
  slug,
  shop,
  bookings,
}: {
  slug: string;
  shop: Shop;
  bookings: BookingWithRelations[];
}) {
  if (bookings.length === 0) {
    return <p className="text-sm text-muted-foreground">尚無預約紀錄</p>;
  }

  return (
    <div className="flex flex-col divide-y">
      {bookings.map((booking) => {
        const active = booking.status === "PENDING" || booking.status === "CONFIRMED";
        const cancellable = canCancelBooking(shop, booking);

        return (
          <div key={booking.id} className="flex flex-col gap-2 py-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{booking.service.name}</span>
              <Badge variant={STATUS_VARIANTS[booking.status]}>{STATUS_LABELS[booking.status]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {booking.branch.name} · {formatDateTime(booking.startTime)}
              {booking.technician ? ` · ${booking.technician.name}` : ""}
            </p>

            {active && (
              <div className="flex flex-wrap items-center gap-3">
                {cancellable ? (
                  <>
                    <Link
                      href={`/s/${slug}/book/${booking.branchId}/${booking.serviceId}?rescheduleFrom=${booking.id}`}
                      className="text-sm font-medium underline underline-offset-4"
                    >
                      改期
                    </Link>
                    <form action={cancelBookingAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <Button type="submit" variant="outline" size="sm">
                        取消預約
                      </Button>
                    </form>
                  </>
                ) : shop.cancellationEnabled ? (
                  <p className="text-xs text-muted-foreground">
                    已超過可取消/改期的時限（須於預約時間前 {shop.cancellationMinNoticeHrs} 小時），如需協助請聯繫分店：
                    {booking.branch.phone}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    如需取消或改期，請直接聯繫分店：{booking.branch.phone}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
