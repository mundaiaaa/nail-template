"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireShop } from "@/lib/shop";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/storage";
import { themeColorSchema, stickerPositionSchema } from "@/lib/validation/appearance";
import type { ShopPage } from "@/generated/prisma/enums";

export interface AppearanceActionState {
  error?: string;
}

function hasFile(file: FormDataEntryValue | null): file is File {
  return file instanceof File && file.size > 0;
}

export async function updateBrandingAction(
  _prevState: AppearanceActionState,
  formData: FormData
): Promise<AppearanceActionState> {
  const { shop } = await requireShop();

  const themeColor = formData.get("themeColor") as string;
  const parsedColor = themeColorSchema.safeParse(themeColor);
  if (!parsedColor.success) {
    return { error: parsedColor.error.issues[0]?.message ?? "顏色格式錯誤" };
  }

  let logoKey = shop.logoKey;
  const logoFile = formData.get("logo");
  if (hasFile(logoFile)) {
    try {
      logoKey = await saveUploadedFile(shop.id, "logo", logoFile);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "圖片上傳失敗" };
    }
    if (shop.logoKey) await deleteUploadedFile(shop.logoKey);
  }

  await db.shop.update({ where: { id: shop.id }, data: { themeColor: parsedColor.data, logoKey } });
  revalidatePath("/admin/shop/appearance");
  return {};
}

export async function uploadFontAction(
  _prevState: AppearanceActionState,
  formData: FormData
): Promise<AppearanceActionState> {
  const { shop } = await requireShop();

  const fontFile = formData.get("font");
  if (!hasFile(fontFile)) {
    return { error: "請選擇字型檔案" };
  }

  let fontKey: string;
  try {
    fontKey = await saveUploadedFile(shop.id, "font", fontFile);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "字型上傳失敗" };
  }
  if (shop.fontKey) await deleteUploadedFile(shop.fontKey);

  await db.shop.update({ where: { id: shop.id }, data: { fontKey, fontName: fontFile.name } });
  revalidatePath("/admin/shop/appearance");
  return {};
}

export async function removeFontAction() {
  const { shop } = await requireShop();
  if (shop.fontKey) await deleteUploadedFile(shop.fontKey);
  await db.shop.update({ where: { id: shop.id }, data: { fontKey: null, fontName: null } });
  revalidatePath("/admin/shop/appearance");
}

export async function updatePageBackgroundAction(
  _prevState: AppearanceActionState,
  formData: FormData
): Promise<AppearanceActionState> {
  const { shop } = await requireShop();
  const page = formData.get("page") as ShopPage;
  const backgroundColor = (formData.get("backgroundColor") as string) || null;

  const existing = await db.pageBackground.findUnique({ where: { shopId_page: { shopId: shop.id, page } } });

  let backgroundImageKey = existing?.backgroundImageKey ?? null;
  const imageFile = formData.get("backgroundImage");
  if (hasFile(imageFile)) {
    try {
      backgroundImageKey = await saveUploadedFile(shop.id, "background", imageFile);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "圖片上傳失敗" };
    }
    if (existing?.backgroundImageKey) await deleteUploadedFile(existing.backgroundImageKey);
  }
  if (formData.get("clearImage") === "on") {
    if (existing?.backgroundImageKey) await deleteUploadedFile(existing.backgroundImageKey);
    backgroundImageKey = null;
  }

  await db.pageBackground.upsert({
    where: { shopId_page: { shopId: shop.id, page } },
    create: { shopId: shop.id, page, backgroundColor, backgroundImageKey },
    update: { backgroundColor, backgroundImageKey },
  });

  revalidatePath("/admin/shop/appearance");
  return {};
}

export async function createStickerAction(
  _prevState: AppearanceActionState,
  formData: FormData
): Promise<AppearanceActionState> {
  const { shop } = await requireShop();
  const page = formData.get("page") as ShopPage;
  const imageFile = formData.get("image");
  if (!hasFile(imageFile)) return { error: "請選擇圖片檔案" };

  let imageKey: string;
  try {
    imageKey = await saveUploadedFile(shop.id, "sticker", imageFile);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "圖片上傳失敗" };
  }

  await db.pageDecoration.create({
    data: { shopId: shop.id, page, imageKey, xPct: 35, yPct: 35, widthPct: 30, heightPct: 30, zIndex: 1 },
  });
  revalidatePath("/admin/shop/appearance");
  return {};
}

export async function updateStickerPositionAction(stickerId: string, position: {
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
}) {
  const { shop } = await requireShop();
  const parsed = stickerPositionSchema.safeParse(position);
  if (!parsed.success) return;

  await db.pageDecoration.updateMany({
    where: { id: stickerId, shopId: shop.id },
    data: parsed.data,
  });
  revalidatePath("/admin/shop/appearance");
}

export async function deleteStickerAction(formData: FormData) {
  const { shop } = await requireShop();
  const stickerId = formData.get("stickerId") as string;

  const sticker = await db.pageDecoration.findFirst({ where: { id: stickerId, shopId: shop.id } });
  if (sticker) {
    await deleteUploadedFile(sticker.imageKey);
    await db.pageDecoration.delete({ where: { id: sticker.id } });
  }
  revalidatePath("/admin/shop/appearance");
}
