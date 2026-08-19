import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().min(1, "請輸入電子郵件").email("請輸入有效的電子郵件"),
  password: z.string().min(8, "密碼至少需要 8 個字元"),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1, "請輸入電子郵件").email("請輸入有效的電子郵件"),
  password: z.string().min(1, "請輸入密碼"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "請輸入電子郵件").email("請輸入有效的電子郵件"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "密碼至少需要 8 個字元"),
});
