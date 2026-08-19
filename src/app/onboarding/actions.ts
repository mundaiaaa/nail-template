"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/auth/session";
import { createShopSchema, slugSchema } from "@/lib/validation/shop";

export interface OnboardingActionState {
  error?: string;
}

export async function checkSlugAvailability(rawSlug: string): Promise<{ available: boolean; error?: string }> {
  const parsed = slugSchema.safeParse(rawSlug);
  if (!parsed.success) {
    return { available: false, error: parsed.error.issues[0]?.message };
  }
  const existing = await db.shop.findUnique({ where: { slug: parsed.data }, select: { id: true } });
  return { available: !existing };
}

export async function createShopAction(
  _prevState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  const user = await requireOwner();
  if (!user.emailVerified) redirect("/verify-email");

  const existingShop = await db.shop.findUnique({ where: { ownerId: user.id } });
  if (existingShop) redirect("/admin");

  const parsed = createShopSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入資料有誤" };
  }

  try {
    await db.shop.create({
      data: {
        ownerId: user.id,
        slug: parsed.data.slug,
        name: parsed.data.name,
        published: true,
      },
    });
  } catch {
    return { error: "此網址代稱剛被使用，請換一個" };
  }

  redirect("/admin");
}
