
import { useCallback, useEffect, useState, useRef } from "react";
import {
    Banknote,
    CheckCircle2,
    Clock3,
    Wallet,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Plus,
    Check,
    X,
} from "lucide-react";
import {
    getPayments,
    createManualPayment,
    reviewPayment,
    getPaymentSummary,
    searchPaymentShareholders,
    initiateGatewayPayment,
} from "../../services/paymentService";

const initialForm = {
    shareholderId: "",
    amount: "",
    paymentMethod: "bkash",
    transactionReference: "",
    notes: "",
};

const statusStyles = {
    pending: "badge-warning",
    verified: "badge-success",
    rejected: "badge-error",
    failed: "badge-ghost",
};

function getPaymentStatusClass(status) {
    const classes = {
        verified: "badge-success",
        pending: "badge-warning",
        rejected: "badge-error",
        failed: "badge-error",
    };

    return classes[status] || "badge-ghost";
}

const money = (value) =>
    new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

const dateFormat = (value) =>
    value
        ? new Date(value).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "—";

function SummaryCard({ title, value, icon: Icon, description }) {
    return (
        <div className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-base-content/65">{title}</p>
                    <span className="rounded-xl bg-primary/10 p-2 text-primary">
                        <Icon size={20} />
                    </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{value}</h2>
                <p className="text-xs text-base-content/55">{description}</p>
            </div>
        </div>
    );
}

export default function PaymentManagementPage() {
    const [payments, setPayments] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [filter, setFilter] = useState("all");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [summary, setSummary] = useState(null);
    const [shareholderSearch, setShareholderSearch] = useState("");
    const [shareholderOptions, setShareholderOptions] = useState([]);
    const [selectedShareholder, setSelectedShareholder] = useState(null);
    const [shareholderLoading, setShareholderLoading] = useState(false);
    const [gatewayLoading, setGatewayLoading] = useState(false);
    const [gatewayError, setGatewayError] = useState("");

    useEffect(() => {
        if (!modalOpen) return;

        let cancelled = false;

        const timer = setTimeout(async () => {
            setShareholderLoading(true);

            try {
                const result = await searchPaymentShareholders(shareholderSearch);

                if (!cancelled) {
                    setShareholderOptions(result.data || []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Failed to search shareholders.");
                }
            } finally {
                if (!cancelled) {
                    setShareholderLoading(false);
                }
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [modalOpen, shareholderSearch]);


    const loadPayments = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            //   const result = await getPayments({
            //     page: pagination.page,
            //     limit: pagination.limit,
            //     status: filter,
            //     search,
            //   });

            //   setPayments(result.data || []);
            //   setPagination((current) => ({
            //     ...current,
            //     ...(result.pagination || {}),
            //   }));
            const [result, summaryResult] = await Promise.all([
                getPayments({
                    page: pagination.page,
                    limit: pagination.limit,
                    status: filter,
                    search,
                }),
                getPaymentSummary(),
            ]);

            setPayments(result.data || []);
            setSummary(summaryResult.data);
            setPagination((current) => ({
                ...current,
                ...(result.pagination || {}),
            }));

        } catch (err) {
            setError(err.message || "Failed to load payments.");
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, filter, search]);

    useEffect(() => {
        loadPayments();
    }, [loadPayments]);

    const handleSearch = (event) => {
        event.preventDefault();
        setPagination((current) => ({ ...current, page: 1 }));
        setSearch(searchInput.trim());
    };

    const handleFilterChange = (value) => {
        setFilter(value);
        setPagination((current) => ({ ...current, page: 1 }));
    };

    const handleReview = async (paymentId, status) => {
        const action = status === "verified" ? "verify" : "reject";

        if (!window.confirm(`Are you sure you want to ${action} this payment?`)) {
            return;
        }

        setBusyId(paymentId);
        setError("");
        setNotice("");

        try {
            await reviewPayment(paymentId, status);
            setNotice(`Payment ${status} successfully.`);
            await loadPayments();
        } catch (err) {
            setError(err.message || "Failed to update payment.");
        } finally {
            setBusyId("");
        }
    };

    async function handleGatewayCheckout() {
        if (!form.shareholderId) {
            setGatewayError("Please select a shareholder.");
            return;
        }

        const amount = Number(form.amount);

        if (!Number.isFinite(amount) || amount < 10) {
            setGatewayError("Minimum gateway payment is BDT 10.");
            return;
        }

        try {
            setGatewayLoading(true);
            setGatewayError("");

            const result = await initiateGatewayPayment({
                shareholderId: form.shareholderId,
                amount,
            });

            const { gatewayUrl } = result.data || {};

            if (!gatewayUrl) {
                throw new Error("Gateway checkout URL was not returned.");
            }

            window.location.assign(gatewayUrl);
        } catch (error) {
            setGatewayError(
                error.message || "Unable to start gateway checkout."
            );
        } finally {
            setGatewayLoading(false);
        }
    }

    const handleCreatePayment = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        setNotice("");

        try {
            await createManualPayment({
                shareholderId: form.shareholderId.trim(),
                amount: Number(form.amount),
                paymentMethod: form.paymentMethod,
                transactionReference: form.transactionReference.trim(),
                notes: form.notes.trim(),
            });

            setModalOpen(false);
            setForm(initialForm);
            setFilter("pending");
            setSearch("");
            setSearchInput("");
            setPagination((current) => ({ ...current, page: 1 }));
            setNotice("Payment recorded and awaiting verification.");
        } catch (err) {
            setError(err.message || "Failed to record payment.");
        } finally {
            setSubmitting(false);
        }
    };

    const changePage = (nextPage) => {
        setPagination((current) => ({ ...current, page: nextPage }));
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        Payment Management
                    </h1>
                    <p className="mt-1 text-sm text-base-content/60">
                        Record payments and manage payment verification.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                        setError("");
                        setModalOpen(true);
                    }}
                >
                    <Plus size={18} />
                    Record Payment
                </button>
            </div>

            {error && (
                <div role="alert" className="alert alert-error">
                    <X size={18} />
                    <span>{error}</span>
                    <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => setError("")}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {notice && (
                <div role="status" className="alert alert-success">
                    <CheckCircle2 size={18} />
                    <span>{notice}</span>
                    <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => setNotice("")}
                    >
                        Dismiss
                    </button>
                </div>
            )}
            {/* summary card */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Total Allocated"
                    value={money(summary?.totalAllocatedAmount)}
                    icon={Wallet}
                    description="Total allocated amount"
                />

                <SummaryCard
                    title="Verified Payments"
                    value={money(summary?.verifiedAmount)}
                    icon={CheckCircle2}
                    description={`${summary?.verifiedCount ?? 0} verified records`}
                />

                <SummaryCard
                    title="Pending Payments"
                    value={money(summary?.pendingAmount)}
                    icon={Clock3}
                    description={`${summary?.pendingCount ?? 0} pending records`}
                />

                <SummaryCard
                    title="Outstanding"
                    value={money(summary?.outstandingAmount)}
                    icon={Banknote}
                    description="Remaining uncommitted balance"
                />
            </div>

            <div className="card border border-base-300 bg-base-100 shadow-sm">
                <div className="card-body gap-4 p-4 md:p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <form
                            onSubmit={handleSearch}
                            className="flex w-full gap-2 lg:max-w-md"
                        >
                            <label className="input input-bordered flex flex-1 items-center gap-2">
                                <Search size={17} className="text-base-content/50" />
                                <input
                                    value={searchInput}
                                    onChange={(event) => setSearchInput(event.target.value)}
                                    placeholder="Search shareholder or reference..."
                                    aria-label="Search payments"
                                    className="min-w-0"
                                />
                            </label>
                            <button className="btn btn-primary" type="submit">
                                Search
                            </button>
                        </form>

                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                className="select select-bordered select-sm"
                                value={filter}
                                onChange={(event) => handleFilterChange(event.target.value)}
                                aria-label="Filter by payment status"
                            >
                                <option value="all">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                                <option value="failed">Failed</option>
                            </select>

                            <button
                                type="button"
                                className="btn btn-sm btn-ghost"
                                onClick={loadPayments}
                                disabled={loading}
                            >
                                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                                Refresh
                            </button>
                        </div>
                    </div>
                    {/* table */}
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Shareholder</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Reference</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center">
                                            <span className="loading loading-spinner loading-md" />
                                            <p className="mt-2 text-sm text-base-content/60">
                                                Loading payments...
                                            </p>
                                        </td>
                                    </tr>
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-12 text-center text-base-content/60"
                                        >
                                            No payments found.
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment._id}>
                                            <td>
                                                <div className="font-medium">
                                                    {payment.shareholder?.fullName || "Unknown"}
                                                </div>
                                                <div className="text-xs text-base-content/55">
                                                    {payment.shareholder?.shareholderCode || "—"}
                                                </div>
                                            </td>
                                            <td className="font-semibold">
                                                {money(payment.amount)}
                                            </td>
                                            {/* <td className="capitalize">
                                                {payment.paymentMethod?.replaceAll("_", " ")}
                                            </td> */}
                                            <td>
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium">
                                                        {payment.paymentMethod === "sslcommerz"
                                                            ? "SSLCommerz"
                                                            : payment.paymentMethod.replace("_", " ")}
                                                    </span>

                                                    <span className="badge badge-ghost badge-sm">
                                                        {payment.paymentType === "gateway" ? "Online" : "Manual"}
                                                    </span>
                                                </div>
                                            </td>
                                            {/* <td className="max-w-44 truncate">
                                                {payment.transactionReference || "—"}
                                            </td> */}
                                            <td>
                                                <span className="font-mono text-sm">
                                                    {payment.gatewayTransactionId ||
                                                        payment.transactionReference ||
                                                        "—"}
                                                </span>

                                                {payment.gatewayValidationId && (
                                                    <p className="mt-1 text-xs text-base-content/60">
                                                        Validation: {payment.gatewayValidationId}
                                                    </p>
                                                )}
                                            </td>
                                            <td>{dateFormat(payment.paidAt)}</td>
                                            <td>
                                                <span
                                                    className={`badge ${statusStyles[payment.status] || "badge-ghost"}`}
                                                >
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td>
                                                {/* {payment.status === "pending" ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            title="Verify payment"
                                                            aria-label="Verify payment"
                                                            className="btn btn-square btn-sm btn-success btn-outline"
                                                            disabled={busyId === payment._id}
                                                            onClick={() =>
                                                                handleReview(payment._id, "verified")
                                                            }
                                                        >
                                                            {busyId === payment._id ? (
                                                                <span className="loading loading-spinner loading-xs" />
                                                            ) : (
                                                                <Check size={16} />
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            title="Reject payment"
                                                            aria-label="Reject payment"
                                                            className="btn btn-square btn-sm btn-error btn-outline"
                                                            disabled={busyId === payment._id}
                                                            onClick={() =>
                                                                handleReview(payment._id, "rejected")
                                                            }
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-base-content/50">
                                                        Reviewed
                                                    </span>
                                                )} */}
                                                {payment.status === "pending" &&
                                                    payment.paymentType === "manual" && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                className="btn btn-success btn-sm"
                                                                onClick={() => handleReview(payment._id, "verified")}
                                                            >
                                                                Verify
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="btn btn-error btn-sm"
                                                                onClick={() => handleReview(payment._id, "rejected")}
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* pagination */}
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <p className="text-sm text-base-content/60">
                            {pagination.total === 0
                                ? "No records"
                                : `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
                                    pagination.page * pagination.limit,
                                    pagination.total
                                )} of ${pagination.total} payments`}
                        </p>

                        <div className="join">
                            <button
                                type="button"
                                className="btn btn-sm join-item"
                                disabled={loading || pagination.page <= 1}
                                onClick={() => changePage(pagination.page - 1)}
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                            <button type="button" className="btn btn-sm join-item no-animation">
                                Page {pagination.page} / {Math.max(1, pagination.totalPages)}
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm join-item"
                                disabled={
                                    loading ||
                                    pagination.page >= pagination.totalPages
                                }
                                onClick={() => changePage(pagination.page + 1)}
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {modalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-xl">
                        <h2 className="text-xl font-bold">Record Manual Payment</h2>
                        <p className="mt-1 text-sm text-base-content/60">
                            New records remain pending until verified by an admin.
                        </p>

                        <form onSubmit={handleCreatePayment} className="mt-5 space-y-4">
                            <div className="form-control">
                                <label className="label" htmlFor="shareholderSearch">
                                    <span className="label-text">Select Shareholder</span>
                                </label>

                                {selectedShareholder ? (
                                    <div className="flex items-center justify-between gap-3 rounded-xl border border-base-300 p-3">
                                        <div>
                                            <p className="font-semibold">
                                                {selectedShareholder.fullName}
                                            </p>
                                            <p className="text-sm text-base-content/60">
                                                {selectedShareholder.shareholderCode}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-ghost"
                                            onClick={() => {
                                                setSelectedShareholder(null);
                                                setForm((current) => ({
                                                    ...current,
                                                    shareholderId: "",
                                                }));
                                            }}
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            id="shareholderSearch"
                                            className="input input-bordered w-full"
                                            value={shareholderSearch}
                                            onChange={(event) => setShareholderSearch(event.target.value)}
                                            placeholder="Search by name or shareholder code..."
                                            autoComplete="off"
                                        />

                                        <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-base-300">
                                            {shareholderLoading ? (
                                                <p className="p-3 text-sm">Searching...</p>
                                            ) : shareholderOptions.length > 0 ? (
                                                shareholderOptions.map((shareholder) => (
                                                    <button
                                                        key={shareholder._id}
                                                        type="button"
                                                        className="flex w-full flex-col items-start border-b border-base-200 p-3 text-left last:border-b-0 hover:bg-base-200"
                                                        onClick={() => {
                                                            setSelectedShareholder(shareholder);
                                                            setForm((current) => ({
                                                                ...current,
                                                                shareholderId: shareholder._id,
                                                            }));
                                                            setShareholderSearch("");
                                                            setShareholderOptions([]);
                                                        }}
                                                    >
                                                        <span className="font-medium">
                                                            {shareholder.fullName}
                                                        </span>
                                                        <span className="text-xs text-base-content/60">
                                                            {shareholder.shareholderCode}
                                                        </span>
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="p-3 text-sm text-base-content/60">
                                                    No shareholders found.
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>


                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="form-control">
                                    <label className="label" htmlFor="amount">
                                        <span className="label-text">Amount (BDT)</span>
                                    </label>
                                    <input
                                        id="amount"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        className="input input-bordered w-full"
                                        value={form.amount}
                                        onChange={(event) =>
                                            setForm({ ...form, amount: event.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label" htmlFor="paymentMethod">
                                        <span className="label-text">Payment Method</span>
                                    </label>
                                    <select
                                        id="paymentMethod"
                                        className="select select-bordered w-full"
                                        value={form.paymentMethod}
                                        onChange={(event) =>
                                            setForm({ ...form, paymentMethod: event.target.value })
                                        }
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="bkash">bKash</option>
                                        <option value="nagad">Nagad</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label" htmlFor="transactionReference">
                                    <span className="label-text">Transaction Reference</span>
                                </label>
                                <input
                                    id="transactionReference"
                                    className="input input-bordered w-full"
                                    value={form.transactionReference}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            transactionReference: event.target.value,
                                        })
                                    }
                                    maxLength={100}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label" htmlFor="notes">
                                    <span className="label-text">Notes</span>
                                </label>
                                <textarea
                                    id="notes"
                                    className="textarea textarea-bordered w-full"
                                    value={form.notes}
                                    onChange={(event) =>
                                        setForm({ ...form, notes: event.target.value })
                                    }
                                    maxLength={500}
                                    rows={3}
                                />
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    disabled={submitting}
                                    onClick={() => setModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <span className="loading loading-spinner loading-sm" />
                                    ) : (
                                        <Plus size={17} />
                                    )}
                                    Save Payment
                                </button>
                            </div>

                            <div className="mt-4 space-y-3">
                                {gatewayError && (
                                    <p className="text-sm text-error" role="alert">
                                        {gatewayError}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-outline btn-primary w-full"
                                    onClick={handleGatewayCheckout}
                                    disabled={gatewayLoading}
                                >
                                    {gatewayLoading ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm" />
                                            Connecting to SSLCommerz...
                                        </>
                                    ) : (
                                        "Pay Online with SSLCommerz"
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                    <button
                        type="button"
                        className="modal-backdrop"
                        aria-label="Close payment modal"
                        onClick={() => setModalOpen(false)}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}
