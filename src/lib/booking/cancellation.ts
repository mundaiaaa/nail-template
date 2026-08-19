import type { Booking } from "@/generated/prisma/client";
import type { PublicShop } from "@/lib/shop-context";

export function canCancelBooking(
  shop: Pick<PublicShop, "cancellationEnabled" | "cancellationMinNoticeHrs">,
  booking: Pick<Booking, "status" | "startTime">
): boolean {
  if (!shop.cancellationEnabled) return false;
  if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") return false;
  const cutoff = new Date(booking.startTime.getTime() - shop.cancellationMinNoticeHrs * 60 * 60 * 1000);
  return new Date() < cutoff;
}
