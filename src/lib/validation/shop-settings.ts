import { z } from "zod";
import { slugSchema, shopNameSchema } from "@/lib/validation/shop";

export const shopSettingsSchema = z.object({
  name: shopNameSchema,
  slug: slugSchema,
  published: z.boolean(),
  cancellationEnabled: z.boolean(),
  cancellationMinNoticeHrs: z.coerce.number().int().min(1, "至少 1 小時").max(720, "最多 720 小時"),
  depositRequired: z.boolean(),
  depositAmount: z.coerce.number().int().min(0).max(1_000_000).optional(),
});
