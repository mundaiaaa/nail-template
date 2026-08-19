import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().trim().min(1, "請輸入服務名稱").max(50, "服務名稱最多 50 個字元"),
  price: z.coerce.number().int("價格須為整數").min(0, "價格不可為負數").max(1_000_000, "價格數字過大"),
  durationMinutes: z.coerce
    .number()
    .int("時長須為整數")
    .min(5, "時長至少 5 分鐘")
    .max(480, "時長最多 480 分鐘"),
});
