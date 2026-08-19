"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth/customer-session";
import { canCancelBooking } from "@/lib/booking/cancellation";

export async function cancelBookingAction(formData: FormData) {
  const slug = formData.get("slug") as string;
  const bookingId = formData.get("bookingId") as string;

  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop) return;

  const customer = await getCurrentCustomer(shop.id);
  if (!customer) return;

  const booking = await db.booking.findFirst({ where: { id: bookingId, customerId: customer.id } });
  if (!booking) return;

  if (!canCancelBooking(shop, booking)) return;

  await db.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });
  revalidatePath(`/s/${slug}/account`);
}
