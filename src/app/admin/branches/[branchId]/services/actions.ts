"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { serviceSchema } from "@/lib/validation/service";

export interface ServiceActionState {
  error?: string;
}

async function requireBranch(branchId: string) {
  const { shop } = await requireShop();
  const branch = await db.branch.findFirst({ where: { id: branchId, shopId: shop.id } });
  if (!branch) throw new Error("找不到此分店");
  return branch;
}

export async function createServiceAction(
  _prevState: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const branchId = formData.get("branchId") as string;
  const branch = await requireBranch(branchId);

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    durationMinutes: formData.get("durationMinutes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }

  await db.service.create({ data: { branchId: branch.id, ...parsed.data } });
  revalidatePath(`/admin/branches/${branch.id}/services`);
  return {};
}

export async function updateServiceAction(
  _prevState: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const branchId = formData.get("branchId") as string;
  const serviceId = formData.get("serviceId") as string;
  const branch = await requireBranch(branchId);

  const service = await db.service.findFirst({ where: { id: serviceId, branchId: branch.id } });
  if (!service) return { error: "找不到此服務項目" };

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    durationMinutes: formData.get("durationMinutes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }

  await db.service.update({ where: { id: serviceId }, data: parsed.data });
  revalidatePath(`/admin/branches/${branch.id}/services`);
  return {};
}

export async function deleteServiceAction(formData: FormData) {
  const branchId = formData.get("branchId") as string;
  const serviceId = formData.get("serviceId") as string;
  const branch = await requireBranch(branchId);

  await db.service.deleteMany({ where: { id: serviceId, branchId: branch.id } });
  revalidatePath(`/admin/branches/${branch.id}/services`);
}
