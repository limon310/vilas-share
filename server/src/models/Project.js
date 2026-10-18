import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        projectKey: {
            type: String,
            required: true,
            unique: true,
            default: "main",
            immutable: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 120,
        },
        location: {
            type: String,
            trim: true,
            maxlength: 200,
            default: "",
        },
        description: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: "",
        },
        totalShares: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: "Total shares must be a whole number.",
            },
        },
        pricePerShare: {
            type: Number,
            required: true,
            min: 0.01,
        },
        allocatedShares: {
            type: Number,
            default: 0,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "Allocated shares must be a whole number.",
            },
        },
        status: {
            type: String,
            enum: ["planning", "active", "completed"],
            default: "planning",
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// projectSchema.index({ projectKey: 1 }, { unique: true });

const Project = mongoose.model("Project", projectSchema);

export default Project;