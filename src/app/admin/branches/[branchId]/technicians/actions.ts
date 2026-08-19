"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { technicianSchema, workingHoursSchema, timeOffSchema } from "@/lib/validation/technician";
import { ALL_WEEKDAYS } from "@/lib/days";

export interface TechnicianActionState {
  error?: string;
}

const DEFAULT_WORKING_HOURS = ALL_WEEKDAYS.map((dayOfWeek) => ({
  dayOfWeek,
  isOff: dayOfWeek === 0,
  startTime: dayOfWeek === 0 ? null : "10:00",
  endTime: dayOfWeek === 0 ? null : "19:00",
}));

async function requireBranch(branchId: string) {
  const { shop } = await requireShop();
  const branch = await db.branch.findFirst({ where: { id: branchId, shopId: shop.id } });
  if (!branch) throw new Error("找不到此分店");
  return branch;
}

export async function createTechnicianAction(
  _prevState: TechnicianActionState,
  formData: FormData
): Promise<TechnicianActionState> {
  const branchId = formData.get("branchId") as string;
  const branch = await requireBranch(branchId);

  const parsed = technicianSchema.safeParse({
    name: formData.get("name"),
    specialties: formData.get("specialties") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }

  await db.technician.create({
    data: {
      branchId: branch.id,
      name: parsed.data.name,
      specialties: parsed.data.specialties,
      workingHours: { createMany: { data: DEFAULT_WORKING_HOURS } },
    },
  });
  revalidatePath(`/admin/branches/${branch.id}/technicians`);
  return {};
}

export async function updateTechnicianAction(
  _prevState: TechnicianActionState,
  formData: FormData
): Promise<TechnicianActionState> {
  const branchId = formData.get("branchId") as string;
  const technicianId = formData.get("technicianId") as string;
  const branch = await requireBranch(branchId);

  const technician = await db.technician.findFirst({ where: { id: technicianId, branchId: branch.id } });
  if (!technician) return { error: "找不到此美甲師" };

  const parsed = technicianSchema.safeParse({
    name: formData.get("name"),
    specialties: formData.get("specialties") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }

  await db.technician.update({ where: { id: technicianId }, data: parsed.data });
  revalidatePath(`/admin/branches/${branch.id}/technicians`);
  revalidatePath(`/admin/branches/${branch.id}/technicians/${technicianId}`);
  return {};
}

export async function deleteTechnicianAction(formData: FormData) {
  const branchId = formData.get("branchId") as string;
  const technicianId = formData.get("technicianId") as string;
  const branch = await requireBranch(branchId);

  await db.technician.deleteMany({ where: { id: technicianId, branchId: branch.id } });
  revalidatePath(`/admin/branches/${branch.id}/technicians`);
  redirect(`/admin/branches/${branch.id}/technicians`);
}

export async function updateTechnicianWorkingHoursAction(
  _prevState: TechnicianActionState,
  formData: FormData
): Promise<TechnicianActionState> {
  const branchId = formData.get("branchId") as string;
  const technicianId = formData.get("technicianId") as string;
  const branch = await requireBranch(branchId);

  const technician = await db.technician.findFirst({ where: { id: technicianId, branchId: branch.id } });
  if (!technician) return { error: "找不到此美甲師" };

  const hours = ALL_WEEKDAYS.map((dayOfWeek) => ({
    dayOfWeek,
    isOff: formData.get(`isOff_${dayOfWeek}`) === "on",
    startTime: (formData.get(`startTime_${dayOfWeek}`) as string) || "",
    endTime: (formData.get(`endTime_${dayOfWeek}`) as string) || "",
  }));

  const parsed = workingHoursSchema.safeParse(hours);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "上班時間格式有誤" };
  }

  await db.$transaction(
    parsed.data.map((h) =>
      db.technicianWorkingHour.update({
        where: { technicianId_dayOfWeek: { technicianId, dayOfWeek: h.dayOfWeek } },
        data: {
          isOff: h.isOff,
          startTime: h.isOff ? null : h.startTime,
          endTime: h.isOff ? null : h.endTime,
        },
      })
    )
  );

  revalidatePath(`/admin/branches/${branch.id}/technicians/${technicianId}`);
  return {};
}

export async function addTimeOffAction(
  _prevState: TechnicianActionState,
  formData: FormData
): Promise<TechnicianActionState> {
  const branchId = formData.get("branchId") as string;
  const technicianId = formData.get("technicianId") as string;
  const branch = await requireBranch(branchId);

  const technician = await db.technician.findFirst({ where: { id: technicianId, branchId: branch.id } });
  if (!technician) return { error: "找不到此美甲師" };

  const parsed = timeOffSchema.safeParse({ date: formData.get("date") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "日期格式有誤" };
  }

  await db.technicianTimeOff
    .create({ data: { technicianId, date: new Date(`${parsed.data.date}T00:00:00Z`) } })
    .catch(() => {
      // Unique constraint on (technicianId, date) — silently ignore duplicates.
    });

  revalidatePath(`/admin/branches/${branch.id}/technicians/${technicianId}`);
  return {};
}

export async function removeTimeOffAction(formData: FormData) {
  const branchId = formData.get("branchId") as string;
  const technicianId = formData.get("technicianId") as string;
  const timeOffId = formData.get("timeOffId") as string;
  const branch = await requireBranch(branchId);

  await db.technicianTimeOff.deleteMany({ where: { id: timeOffId, technicianId } });
  revalidatePath(`/admin/branches/${branch.id}/technicians/${technicianId}`);
}
