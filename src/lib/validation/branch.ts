import { z } from "zod";

export const branchInfoSchema = z.object({
  name: z.string().trim().min(1, "請輸入分店名稱").max(50, "分店名稱最多 50 個字元"),
  address: z.string().trim().min(1, "請輸入地址").max(200, "地址最多 200 個字元"),
  phone: z
    .string()
    .trim()
    .min(1, "請輸入電話")
    .max(20, "電話最多 20 個字元")
    .regex(/^[0-9+()#\-\s]+$/, "請輸入有效的電話號碼"),
  assignmentMode: z.enum(["CUSTOMER_CHOICE", "RANDOM", "SKILL_MATCH"]),
});

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "時間格式錯誤");

export const businessHourSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    isClosed: z.boolean(),
    openTime: z.union([timeSchema, z.literal("")]),
    closeTime: z.union([timeSchema, z.literal("")]),
  })
  .refine((v) => v.isClosed || (v.openTime && v.closeTime && v.openTime < v.closeTime), {
    message: "營業時間須早於休息時間",
  });

export const businessHoursSchema = z.array(businessHourSchema).length(7);
