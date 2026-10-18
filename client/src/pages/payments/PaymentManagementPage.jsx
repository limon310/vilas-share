
import { useCallback, useEffect, useState } from "react";
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

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getPayments({
        page: pagination.page,
        limit: pagination.limit,
        status: filter,
        search,
      });

      setPayments(result.data || []);
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Allocated"
          value="—"
          icon={Wallet}
          description="Shareholder payment obligations"
        />
        <SummaryCard
          title="Verified Payments"
          value={money(
            payments
              .filter((payment) => payment.status === "verified")
              .reduce((sum, payment) => sum + payment.amount, 0)
          )}
          icon={CheckCircle2}
          description="Verified on this page only"
        />
        <SummaryCard
          title="Pending Payments"
          value={money(
            payments
              .filter((payment) => payment.status === "pending")
              .reduce((sum, payment) => sum + payment.amount, 0)
          )}
          icon={Clock3}
          description="Pending on this page only"
        />
        <SummaryCard
          title="Outstanding"
          value="—"
          icon={Banknote}
          description="Requires a server-side summary endpoint"
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
                      <td className="capitalize">
                        {payment.paymentMethod?.replaceAll("_", " ")}
                      </td>
                      <td className="max-w-44 truncate">
                        {payment.transactionReference || "—"}
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
                        {payment.status === "pending" ? (
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
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
                <label className="label" htmlFor="shareholderId">
                  <span className="label-text">Shareholder Object ID</span>
                </label>
                <input
                  id="shareholderId"
                  className="input input-bordered w-full"
                  value={form.shareholderId}
                  onChange={(event) =>
                    setForm({ ...form, shareholderId: event.target.value })
                  }
                  placeholder="MongoDB shareholder _id"
                  required
                  pattern="[a-fA-F0-9]{24}"
                  title="Enter a valid 24-character MongoDB ObjectId"
                />
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
