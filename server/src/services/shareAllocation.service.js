import mongoose from "mongoose";
import Project from "../models/Project.js";
import Shareholder from "../models/Shareholder.js";
import ShareAllocation from "../models/ShareAllocation.js";

function createServiceError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function createShareAllocation({
  shareholderId,
  quantity,
  userId,
}) {
  const session = await mongoose.startSession();
  let createdAllocation;

  try {
    await session.withTransaction(async () => {
      const project = await Project.findOne({
        projectKey: "main",
      }).session(session);

      if (!project) {
        throw createServiceError(
          "Project configuration has not been created.",
          404
        );
      }

      if (project.status !== "active") {
        throw createServiceError(
          "Share allocation requires an active project.",
          409
        );
      }

      const shareholder = await Shareholder.findOne({
        _id: shareholderId,
        status: "active",
      }).session(session);

      if (!shareholder) {
        throw createServiceError(
          "Active shareholder not found.",
          404
        );
      }

      if (quantity > project.totalShares) {
        throw createServiceError(
          "Requested quantity exceeds total project shares.",
          409
        );
      }

      // Atomic capacity check and counter update.
      // The condition remains safe even when allocatedShares is missing
      // from an older project document.
      const updatedProject = await Project.findOneAndUpdate(
        {
          _id: project._id,
          status: "active",
          $expr: {
            $lte: [
              {
                $add: [
                  { $ifNull: ["$allocatedShares", 0] },
                  quantity,
                ],
              },
              "$totalShares",
            ],
          },
        },
        {
          $inc: { allocatedShares: quantity },
        },
        {
          new: true,
          session,
          runValidators: true,
        }
      );

      if (!updatedProject) {
        throw createServiceError(
          "Not enough shares are available. Refresh and try again.",
          409
        );
      }

      const pricePerShare = project.pricePerShare;
      const totalAmount = Number(
        (quantity * pricePerShare).toFixed(2)
      );

      const allocation = new ShareAllocation({
        shareholder: shareholder._id,
        project: project._id,
        quantity,
        pricePerShare,
        totalAmount,
        allocatedBy: userId,
      });

      await allocation.save({ session });
      createdAllocation = allocation;
    });

    return createdAllocation;
  } finally {
    await session.endSession();
  }
}

export async function listShareAllocations({ page, limit }) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    ShareAllocation.find()
      .populate("shareholder", "shareholderCode fullName phone")
      .populate("allocatedBy", "name email")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    ShareAllocation.countDocuments(),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}