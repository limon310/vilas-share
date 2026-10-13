
import { z } from "zod";

const optionalText = (max) =>
  z.string().trim().max(max).optional().default("");

export const createShareholderSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(25),
  email: z.union([
    z.literal(""),
    z.string().trim().email().max(254),
  ]).optional().default(""),
  address: optionalText(500),
  nationalId: optionalText(40),
  notes: optionalText(1000),
});

export const updateShareholderSchema = createShareholderSchema
  .partial()
  .extend({
    status: z.enum(["active", "inactive"]).optional(),
  });

export const shareholderListSchema = z.object({
  search: z.string().trim().max(100).optional().default(""),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});
