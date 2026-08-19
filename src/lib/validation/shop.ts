import { z } from "zod";

const RESERVED_SLUGS = new Set([
  "www",
  "app",
  "admin",
  "api",
  "s",
  "login",
  "register",
  "onboarding",
  "verify-email",
  "forgot-password",
  "reset-password",
  "dev",
  "static",
  "assets",
]);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "網址代稱至少需要 3 個字元")
  .max(30, "網址代稱最多 30 個字元")
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "只能使用小寫英文字母、數字與連字號（-），且不可開頭或結尾為連字號")
  .refine((slug) => !RESERVED_SLUGS.has(slug), "此網址代稱為系統保留字，請換一個");

export const shopNameSchema = z.string().trim().min(1, "請輸入店家名稱").max(50, "店家名稱最多 50 個字元");

export const createShopSchema = z.object({
  slug: slugSchema,
  name: shopNameSchema,
});
