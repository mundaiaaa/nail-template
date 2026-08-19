import { z } from "zod";

export const themeColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "請輸入有效的色碼（例如：#d6336c）");

export const SHOP_PAGES = [
  { value: "LANDING", label: "首頁" },
  { value: "BRANCH_SELECT", label: "選擇分店" },
  { value: "SERVICE_SELECT", label: "選擇服務" },
  { value: "TECHNICIAN_SELECT", label: "選擇美甲師" },
  { value: "SLOT_SELECT", label: "選擇時段" },
  { value: "CONFIRM", label: "確認預約" },
  { value: "ACCOUNT", label: "會員專區" },
] as const;

export const backgroundSchema = z.object({
  page: z.enum(SHOP_PAGES.map((p) => p.value) as [string, ...string[]]),
  backgroundColor: z.union([z.string().regex(/^#[0-9a-fA-F]{6}$/), z.literal("")]).optional(),
});

export const stickerPositionSchema = z.object({
  xPct: z.number().min(-50).max(150),
  yPct: z.number().min(-50).max(150),
  widthPct: z.number().min(1).max(150),
  heightPct: z.number().min(1).max(150),
});
