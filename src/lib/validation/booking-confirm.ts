import { z } from "zod";

export const guestIdentitySchema = z.object({
  identityMode: z.literal("guest"),
  guestName: z.string().trim().min(1, "請輸入姓名").max(50, "姓名最多 50 個字元"),
  guestPhone: z
    .string()
    .trim()
    .min(1, "請輸入電話")
    .regex(/^09\d{8}$/, "請輸入有效的台灣手機號碼（例如：0912345678）"),
});

export const loginIdentitySchema = z.object({
  identityMode: z.literal("login"),
  email: z.string().trim().min(1, "請輸入電子郵件").email("請輸入有效的電子郵件"),
  password: z.string().min(1, "請輸入密碼"),
});

export const registerIdentitySchema = z.object({
  identityMode: z.literal("register"),
  name: z.string().trim().min(1, "請輸入姓名").max(50, "姓名最多 50 個字元"),
  phone: z
    .string()
    .trim()
    .min(1, "請輸入電話")
    .regex(/^09\d{8}$/, "請輸入有效的台灣手機號碼（例如：0912345678）"),
  email: z.string().trim().min(1, "請輸入電子郵件").email("請輸入有效的電子郵件"),
  password: z.string().min(8, "密碼至少需要 8 個字元"),
});

export const memberIdentitySchema = z.object({
  identityMode: z.literal("member"),
});

export const identitySchema = z.discriminatedUnion("identityMode", [
  guestIdentitySchema,
  loginIdentitySchema,
  registerIdentitySchema,
  memberIdentitySchema,
]);
