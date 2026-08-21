"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { serviceSchema } from "@/lib/validation/service";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/storage";

export interface ServiceActionState {
  error?: string;
}

async function requireBranch(branchId: string) {
  const { shop } = await requireShop();
  const branch = await db.branch.findFirst({ where: { id: branchId, shopId: shop.id } });
  if (!branch) throw new Error("找不到此分店");
  return branch;
}

function hasFile(file: FormDataEntryValue | null): file is File {
  return file instanceof File && file.size > 0;
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
    durationMinMinutes: formData.get("durationMinMinutes"),
    durationMaxMinutes: formData.get("durationMaxMinutes"),
    category: formData.get("category"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }

  let imageKey: string | undefined;
  const imageFile = formData.get("image");
  if (hasFile(imageFile)) {
    try {
      imageKey = await saveUploadedFile(branch.shopId, "service", imageFile);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "圖片上傳失敗" };
    }
  }

  await db.service.create({ data: { branchId: branch.id, ...parsed.data, imageKey } });
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
    durationMinMinutes: formData.get("durationMinMinutes"),
    durationMaxMinutes: formData.get("durationMaxMinutes"),
    category: formData.get("category"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }

  let imageKey = service.imageKey;
  const imageFile = formData.get("image");
  if (hasFile(imageFile)) {
    try {
      imageKey = await saveUploadedFile(branch.shopId, "service", imageFile);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "圖片上傳失敗" };
    }
    if (service.imageKey) await deleteUploadedFile(service.imageKey);
  } else if (formData.get("clearImage") === "on") {
    if (service.imageKey) await deleteUploadedFile(service.imageKey);
    imageKey = null;
  }

  await db.service.update({ where: { id: serviceId }, data: { ...parsed.data, imageKey } });
  revalidatePath(`/admin/branches/${branch.id}/services`);
  return {};
}

export async function deleteServiceAction(formData: FormData) {
  const branchId = formData.get("branchId") as string;
  const serviceId = formData.get("serviceId") as string;
  const branch = await requireBranch(branchId);

  const service = await db.service.findFirst({ where: { id: serviceId, branchId: branch.id } });
  if (service?.imageKey) await deleteUploadedFile(service.imageKey);

  await db.service.deleteMany({ where: { id: serviceId, branchId: branch.id } });
  revalidatePath(`/admin/branches/${branch.id}/services`);
}
