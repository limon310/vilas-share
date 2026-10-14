import Project from "../models/Project.js";
import { updateProjectSchema } from "../validators/project.validator.js";

export async function getProject(req, res, next) {
  try {
    const project = await Project.findOne({ projectKey: "main" }).lean();

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req, res, next) {
  try {
    const result = updateProjectSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Please check the project information.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const project = await Project.findOneAndUpdate(
      { projectKey: "main" },
      {
        $set: {
          ...result.data,
          updatedBy: req.user._id,
        },
        $setOnInsert: {
          projectKey: "main",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Project configuration saved successfully.",
      data: project,
    });
  } catch (error) {
    next(error);
  }
}