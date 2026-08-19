"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";

async function requireOwnedBooking(bookingId: string) {
  const { shop } = await requireShop();
  const booking = await db.booking.findFirst({ where: { id: bookingId, branch: { shopId: shop.id } } });
  if (!booking) throw new Error("找不到此預約");
  return booking;
}

export async function acceptBookingAction(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const booking = await requireOwnedBooking(bookingId);
  await db.booking.update({ where: { id: booking.id }, data: { status: "CONFIRMED" } });
  revalidatePath("/admin/bookings");
}

export async function rejectBookingAction(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const booking = await requireOwnedBooking(bookingId);
  await db.booking.update({ where: { id: booking.id }, data: { status: "REJECTED" } });
  revalidatePath("/admin/bookings");
}
