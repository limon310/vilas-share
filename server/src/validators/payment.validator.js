
import { z } from "zod";

export const createPaymentSchema = z.object({
  shareholderId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid shareholder ID."),

  amount: z.coerce
    .number()
    .finite("Amount must be a valid number.")
    .positive("Amount must be greater than zero.")
    .max(1_000_000_000, "Amount exceeds the allowed limit.")
    .refine(
      (value) => Number.isSafeInteger(Math.round(value * 100)),
      "Amount is too large."
    )
    .refine(
      (value) => Math.round(value * 100) / 100 === value,
      "Amount can have at most two decimal places."
    ),

  paymentMethod: z.enum([
    "cash",
    "bank_transfer",
    "bkash",
    "nagad",
  ]),

  transactionReference: z
    .string()
    .trim()
    .max(100, "Reference must not exceed 100 characters.")
    .optional()
    .default(""),

  notes: z
    .string()
    .trim()
    .max(500, "Notes must not exceed 500 characters.")
    .optional()
    .default(""),

  paidAt: z.coerce
    .date()
    .optional(),
});
