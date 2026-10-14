import { z } from "zod";

export const createShareAllocationSchema = z.object({
  shareholderId: z.string().regex(/^[a-f\d]{24}$/i, {
    message: "Invalid shareholder ID.",
  }),
  quantity: z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
});