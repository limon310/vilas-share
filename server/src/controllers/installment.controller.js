import {
  createInstallmentSchema,
} from "../validators/installment.validator.js";

import {
  createInstallment,
  getInstallments,
} from "../services/installment.service.js";

export async function createInstallmentController(req, res, next) {
  try {
    const validation = createInstallmentSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const installment = await createInstallment({
      ...validation.data,
      userId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Installment created successfully.",
      data: installment,
    });
  } catch (error) {
    next(error);
  }
}

export async function getInstallmentsController(req, res, next) {
  try {
    const result = await getInstallments({
      page: req.query.page,
      limit: req.query.limit,
      shareholderId: req.query.shareholderId,
    });

    return res.status(200).json({
      success: true,
      data: result.installments,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}