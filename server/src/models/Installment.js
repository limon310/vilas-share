
import mongoose from "mongoose";

const installmentSchema = new mongoose.Schema(
    {
        shareholder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shareholder",
            required: true,
            immutable: true,
            index: true,
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            immutable: true,
            index: true,
        },

        installment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Installment",
            default: null,
            index: true,
        },

        installmentNumber: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: "Installment number must be an integer.",
            },
        },

        amount: {
            type: Number,
            required: true,
            min: 0.01,
            validate: {
                validator(value) {
                    return (
                        Number.isFinite(value) &&
                        Math.round(value * 100) / 100 === value
                    );
                },
                message: "Amount can have at most two decimal places.",
            },
        },

        dueDate: {
            type: Date,
            required: true,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 300,
            default: "",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            immutable: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

installmentSchema.index(
    { shareholder: 1, project: 1, installmentNumber: 1 },
    { unique: true }
);

installmentSchema.index({
    project: 1,
    dueDate: 1,
});

const Installment = mongoose.model("Installment", installmentSchema);

export default Installment;
