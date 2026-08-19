"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { branchInfoSchema, businessHoursSchema } from "@/lib/validation/branch";
import { ALL_WEEKDAYS } from "@/lib/days";

export interface BranchActionState {
  error?: string;
}

const DEFAULT_HOURS = ALL_WEEKDAYS.map((dayOfWeek) => ({
  dayOfWeek,
  isClosed: dayOfWeek === 0,
  openTime: dayOfWeek === 0 ? null : "10:00",
  closeTime: dayOfWeek === 0 ? null : "19:00",
}));

export async function createBranchAction(
  _prevState: BranchActionState,
  formData: FormData
): Promise<BranchActionState> {
  const { shop } = await requireShop();

  const parsed = branchInfoSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    assignmentMode: formData.get("assignmentMode") || "CUSTOMER_CHOICE",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }

  const branch = await db.branch.create({
    data: {
      shopId: shop.id,
      ...parsed.data,
      businessHours: { createMany: { data: DEFAULT_HOURS } },
    },
  });

  redirect(`/admin/branches/${branch.id}`);
}

export async function updateBranchInfoAction(
  _prevState: BranchActionState,
  formData: FormData
): Promise<BranchActionState> {
  const { shop } = await requireShop();
  const branchId = formData.get("branchId") as string;

  const branch = await db.branch.findFirst({ where: { id: branchId, shopId: shop.id } });
  if (!branch) return { error: "找不到此分店" };

  const parsed = branchInfoSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    assignmentMode: formData.get("assignmentMode"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }

  await db.branch.update({ where: { id: branchId }, data: parsed.data });
  revalidatePath(`/admin/branches/${branchId}`);
  return {};
}

export async function updateBusinessHoursAction(
  _prevState: BranchActionState,
  formData: FormData
): Promise<BranchActionState> {
  const { shop } = await requireShop();
  const branchId = formData.get("branchId") as string;

  const branch = await db.branch.findFirst({ where: { id: branchId, shopId: shop.id } });
  if (!branch) return { error: "找不到此分店" };

  const hours = ALL_WEEKDAYS.map((dayOfWeek) => ({
    dayOfWeek,
    isClosed: formData.get(`isClosed_${dayOfWeek}`) === "on",
    openTime: (formData.get(`openTime_${dayOfWeek}`) as string) || "",
    closeTime: (formData.get(`closeTime_${dayOfWeek}`) as string) || "",
  }));

  const parsed = businessHoursSchema.safeParse(hours);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "營業時間格式有誤" };
  }

  await db.$transaction(
    parsed.data.map((h) =>
      db.businessHour.update({
        where: { branchId_dayOfWeek: { branchId, dayOfWeek: h.dayOfWeek } },
        data: {
          isClosed: h.isClosed,
          openTime: h.isClosed ? null : h.openTime,
          closeTime: h.isClosed ? null : h.closeTime,
        },
      })
    )
  );

  revalidatePath(`/admin/branches/${branchId}`);
  return {};
}

export async function deleteBranchAction(formData: FormData) {
  const { shop } = await requireShop();
  const branchId = formData.get("branchId") as string;

  const branch = await db.branch.findFirst({ where: { id: branchId, shopId: shop.id } });
  if (!branch) redirect("/admin/branches");

  await db.branch.delete({ where: { id: branchId } });
  revalidatePath("/admin/branches");
  redirect("/admin/branches");
}
