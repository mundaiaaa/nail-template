"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { shopSettingsSchema } from "@/lib/validation/shop-settings";

export interface ShopSettingsState {
  error?: string;
}

export async function updateShopSettingsAction(
  _prevState: ShopSettingsState,
  formData: FormData
): Promise<ShopSettingsState> {
  const { shop } = await requireShop();

  const parsed = shopSettingsSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    published: formData.get("published") === "on",
    cancellationEnabled: formData.get("cancellationEnabled") === "on",
    cancellationMinNoticeHrs: formData.get("cancellationMinNoticeHrs") || "24",
    depositRequired: formData.get("depositRequired") === "on",
    depositAmount: formData.get("depositAmount") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }

  if (parsed.data.slug !== shop.slug) {
    const existing = await db.shop.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) return { error: "此網址代稱已被使用" };
  }

  await db.shop.update({
    where: { id: shop.id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      published: parsed.data.published,
      cancellationEnabled: parsed.data.cancellationEnabled,
      cancellationMinNoticeHrs: parsed.data.cancellationMinNoticeHrs,
      depositRequired: parsed.data.depositRequired,
      depositAmount: parsed.data.depositRequired ? (parsed.data.depositAmount ?? null) : null,
    },
  });

  revalidatePath("/admin/shop");
  revalidatePath("/admin");
  return {};
}
