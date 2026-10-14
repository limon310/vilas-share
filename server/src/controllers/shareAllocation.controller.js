import {
  createShareAllocationSchema,
} from "../validators/shareAllocation.validator.js";

import {
  createShareAllocation,
  listShareAllocations,
} from "../services/shareAllocation.service.js";

export async function getShareAllocations(req, res, next) {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters.",
      });
    }

    const result = await listShareAllocations({ page, limit });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function postShareAllocation(req, res, next) {
  try {
    const result = createShareAllocationSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid allocation information.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const allocation = await createShareAllocation({
      shareholderId: result.data.shareholderId,
      quantity: result.data.quantity,
      userId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Shares allocated successfully.",
      data: allocation,
    });
  } catch (error) {
    next(error);
  }
}