"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createCustomerSession, getCurrentCustomer } from "@/lib/auth/customer-session";
import { createBookingRequest, SlotUnavailableError } from "@/lib/booking/create-booking";
import { identitySchema } from "@/lib/validation/booking-confirm";
import { parseServiceIds } from "@/lib/booking/query";

export interface ConfirmBookingState {
  error?: string;
}

export async function confirmBookingAction(
  _prevState: ConfirmBookingState,
  formData: FormData
): Promise<ConfirmBookingState> {
  const slug = formData.get("slug") as string;
  const branchId = formData.get("branchId") as string;
  const serviceIds = parseServiceIds(formData.get("serviceIds") as string);
  const date = formData.get("date") as string;
  const timeIso = formData.get("time") as string;
  const technicianId = (formData.get("technicianId") as string) || undefined;
  const rescheduleFrom = (formData.get("rescheduleFrom") as string) || undefined;
  const depositAcknowledged = formData.get("depositAcknowledged") === "on";

  const shop = await db.shop.findUnique({ where: { slug } });
  if (!shop || !shop.published) return { error: "找不到此商店" };

  const branch = await db.branch.findFirst({ where: { id: branchId, shopId: shop.id } });
  const services = await db.service.findMany({ where: { id: { in: serviceIds }, branchId } });
  if (!branch || serviceIds.length === 0 || services.length !== serviceIds.length) {
    return { error: "找不到此服務項目" };
  }

  if (shop.depositRequired && !depositAcknowledged) {
    return { error: "請先確認訂金說明後再送出預約" };
  }

  const identityParsed = identitySchema.safeParse({
    identityMode: formData.get("identityMode"),
    guestName: formData.get("guestName"),
    guestPhone: formData.get("guestPhone"),
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  if (!identityParsed.success) {
    return { error: identityParsed.error.issues[0]?.message ?? "請完整填寫預約人資料" };
  }
  const identity = identityParsed.data;

  let customerId: string | undefined;
  let guestName: string | undefined;
  let guestPhone: string | undefined;

  if (identity.identityMode === "guest") {
    guestName = identity.guestName;
    guestPhone = identity.guestPhone;
  } else if (identity.identityMode === "member") {
    const customer = await getCurrentCustomer(shop.id);
    if (!customer) return { error: "登入已逾期，請重新登入" };
    customerId = customer.id;
  } else if (identity.identityMode === "login") {
    const customer = await db.customer.findUnique({
      where: { shopId_email: { shopId: shop.id, email: identity.email } },
    });
    if (!customer || !(await verifyPassword(identity.password, customer.passwordHash))) {
      return { error: "電子郵件或密碼錯誤" };
    }
    await createCustomerSession(customer.id);
    customerId = customer.id;
  } else {
    const existing = await db.customer.findUnique({
      where: { shopId_email: { shopId: shop.id, email: identity.email } },
    });
    if (existing) return { error: "此電子郵件已被註冊，請改用登入" };
    const passwordHash = await hashPassword(identity.password);
    const customer = await db.customer.create({
      data: { shopId: shop.id, name: identity.name, phone: identity.phone, email: identity.email, passwordHash },
    });
    await createCustomerSession(customer.id);
    customerId = customer.id;
  }

  let booking;
  try {
    booking = await createBookingRequest({
      branchId,
      serviceIds,
      date,
      startTime: new Date(timeIso),
      technicianId,
      customerId,
      guestName,
      guestPhone,
      depositRequired: shop.depositRequired,
    });
  } catch (err) {
    if (err instanceof SlotUnavailableError) return { error: err.message };
    throw err;
  }

  if (rescheduleFrom && customerId) {
    await db.booking.updateMany({
      where: { id: rescheduleFrom, customerId, status: { in: ["PENDING", "CONFIRMED"] } },
      data: { status: "CANCELLED" },
    });
  }

  redirect(`/s/${slug}/book/done?bookingId=${booking.id}`);
}
