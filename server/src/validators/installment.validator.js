import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID.");

export const createInstallmentSchema = z.object({
  shareholderId: objectIdSchema,
  installmentNumber: z.coerce
    .number()
    .int()
    .min(1)
    .max(120),
  amount: z.coerce
    .number()
    .finite()
    .positive()
    .max(1_000_000_000)
    .refine(
      (value) => Math.round(value * 100) / 100 === value,
      "Amount can have at most two decimal places."
    ),
  dueDate: z.coerce.date(),
  description: z.string().trim().max(300).default(""),
});