
import mongoose from "mongoose";
import Shareholder from "../models/Shareholder.js";
import { generateShareholderCode } from "../services/shareholder.service.js";
import {
  createShareholderSchema,
  updateShareholderSchema,
  shareholderListSchema,
} from "../validators/shareholder.validator.js";

function publicShareholder(doc) {
  const item = doc.toObject ? doc.toObject() : doc;

  const {
    nationalId,
    __v,
    ...safeItem
  } = item;

  return safeItem;
}

function validationError(res, result) {
  return res.status(400).json({
    success: false,
    message: "Please check the submitted data",
    errors: result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  });
}

export async function listShareholders(req, res, next) {
  try {
    const result = shareholderListSchema.safeParse(req.query);
    if (!result.success) return validationError(res, result);

    const { search, status, page, limit } = result.data;
    const filter = {};

    if (status !== "all") filter.status = status;

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");

      filter.$or = [
        { shareholderCode: regex },
        { fullName: regex },
        { phone: regex },
        { email: regex },
      ];
    }

    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Shareholder.find(filter)
        .select("-nationalId -__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Shareholder.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getShareholder(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shareholder ID",
      });
    }

    const shareholder = await Shareholder.findById(req.params.id)
      .select("-nationalId -__v")
      .lean();

    if (!shareholder) {
      return res.status(404).json({
        success: false,
        message: "Shareholder not found",
      });
    }

    return res.json({ success: true, data: shareholder });
  } catch (error) {
    next(error);
  }
}

export async function createShareholder(req, res, next) {
  try {
    const result = createShareholderSchema.safeParse(req.body);
    if (!result.success) return validationError(res, result);

    const shareholderCode = await generateShareholderCode();

    const shareholder = await Shareholder.create({
      ...result.data,
      shareholderCode,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Shareholder created successfully",
      data: publicShareholder(shareholder),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateShareholder(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shareholder ID",
      });
    }

    const result = updateShareholderSchema.safeParse(req.body);
    if (!result.success) return validationError(res, result);

    if (Object.keys(result.data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update fields provided",
      });
    }

    const shareholder = await Shareholder.findByIdAndUpdate(
      req.params.id,
      { $set: result.data },
      {
        new: true,
        runValidators: true,
      }
    ).select("-nationalId -__v");

    if (!shareholder) {
      return res.status(404).json({
        success: false,
        message: "Shareholder not found",
      });
    }

    return res.json({
      success: true,
      message: "Shareholder updated successfully",
      data: publicShareholder(shareholder),
    });
  } catch (error) {
    next(error);
  }
}
