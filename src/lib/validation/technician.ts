import { z } from "zod";

export const technicianSchema = z.object({
  name: z.string().trim().min(1, "請輸入美甲師姓名").max(50, "姓名最多 50 個字元"),
  specialties: z
    .string()
    .max(200)
    .transform((raw) =>
      raw
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean)
    ),
});

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "時間格式錯誤");

export const workingHourSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    isOff: z.boolean(),
    startTime: z.union([timeSchema, z.literal("")]),
    endTime: z.union([timeSchema, z.literal("")]),
  })
  .refine((v) => v.isOff || (v.startTime && v.endTime && v.startTime < v.endTime), {
    message: "上班時間須早於下班時間",
  });

export const workingHoursSchema = z.array(workingHourSchema).length(7);

export const timeOffSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式錯誤"),
});
