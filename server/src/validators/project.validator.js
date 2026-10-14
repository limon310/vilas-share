import { z } from "zod";

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  location: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(2000).optional().default(""),
  totalShares: z.coerce.number().int().min(1),
  pricePerShare: z.coerce.number().finite().min(0.01),
  status: z.enum(["planning", "active", "completed"]),
});