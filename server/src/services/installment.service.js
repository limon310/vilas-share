
import mongoose from "mongoose";

import Installment from "../models/Installment.js";
import Shareholder from "../models/Shareholder.js";
import Project from "../models/Project.js";
import Payment from "../models/Payment.js";

function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

export async function createInstallment({
    shareholderId,
    installmentNumber,
    amount,
    dueDate,
    description = "",
    userId,
}) {
    if (!mongoose.isValidObjectId(shareholderId)) {
        throw createError("Invalid shareholder ID.", 400);
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw createError("Invalid admin ID.", 400);
    }

    const project = await Project.findOne({
        projectKey: "main",
        status: "active",
    }).lean();

    if (!project) {
        throw createError("Active project not found.", 404);
    }

    const shareholder = await Shareholder.findOne({
        _id: shareholderId,
        status: "active",
    }).lean();

    if (!shareholder) {
        throw createError("Active shareholder not found.", 404);
    }

    const existingInstallment = await Installment.exists({
        shareholder: shareholder._id,
        project: project._id,
        installmentNumber,
    });

    if (existingInstallment) {
        throw createError(
            "This installment number already exists for this shareholder.",
            409
        );
    }

    try {
        return await Installment.create({
            shareholder: shareholder._id,
            project: project._id,
            installmentNumber,
            amount,
            dueDate,
            description,
            createdBy: userId,
        });
    } catch (error) {
        // The unique database index also protects against concurrent requests.
        if (error.code === 11000) {
            throw createError(
                "This installment number already exists for this shareholder.",
                409
            );
        }

        throw error;
    }
}

export async function getInstallments({
    page = 1,
    limit = 10,
    shareholderId,
} = {}) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));

    const filter = {};

    if (shareholderId) {
        if (!mongoose.isValidObjectId(shareholderId)) {
            throw createError("Invalid shareholder ID.", 400);
        }

        filter.shareholder = shareholderId;
    }

    const project = await Project.findOne({
        projectKey: "main",
    })
        .select("_id projectKey")
        .lean();

    if (!project) {
        throw createError("Project not found.", 404);
    }

    filter.project = project._id;

    const [installments, total] = await Promise.all([
        Installment.find(filter)
            .populate("shareholder", "fullName shareholderCode")
            .populate("createdBy", "name email")
            .sort({ dueDate: 1, installmentNumber: 1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit)
            .lean(),

        Installment.countDocuments(filter),
    ]);

    const installmentIds = installments.map(
        (installment) => installment._id
    );

    const paymentSummary = installmentIds.length
        ? await Payment.aggregate([
            {
                $match: {
                    installment: { $in: installmentIds },
                    project: project._id,
                    status: { $in: ["verified", "pending"] },
                },
            },
            {
                $group: {
                    _id: {
                        installment: "$installment",
                        status: "$status",
                    },
                    totalAmount: { $sum: "$amount" },
                },
            },
        ])
        : [];

    const summaryMap = new Map();

    for (const item of paymentSummary) {
        const installmentId = String(item._id.installment);

        if (!summaryMap.has(installmentId)) {
            summaryMap.set(installmentId, {
                paidAmount: 0,
                pendingAmount: 0,
            });
        }

        const summary = summaryMap.get(installmentId);

        if (item._id.status === "verified") {
            summary.paidAmount = item.totalAmount;
        }

        if (item._id.status === "pending") {
            summary.pendingAmount = item.totalAmount;
        }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const enrichedInstallments = installments.map((installment) => {
        const summary = summaryMap.get(String(installment._id)) || {
            paidAmount: 0,
            pendingAmount: 0,
        };

        const paidAmount = Math.round(summary.paidAmount * 100) / 100;
        const pendingAmount =
            Math.round(summary.pendingAmount * 100) / 100;

        const remainingAmount = Math.max(
            0,
            Math.round((installment.amount - paidAmount) * 100) / 100
        );

        const dueDate = new Date(installment.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        let status;

        if (remainingAmount === 0) {
            status = "paid";
        } else if (paidAmount > 0) {
            status = "partially_paid";
        } else if (dueDate < today) {
            status = "overdue";
        } else if (dueDate.getTime() === today.getTime()) {
            status = "due";
        } else {
            status = "upcoming";
        }

        return {
            ...installment,
            paidAmount,
            pendingAmount,
            remainingAmount,
            status,
        };
    });

    return {
        installments: enrichedInstallments,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit),
        },
    };
}
