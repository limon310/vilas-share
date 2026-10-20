
import { useCallback, useEffect, useState } from "react";
import {
  CalendarClock,
  CircleDollarSign,
  ClipboardList,
  RefreshCw,
  Plus,
  Search,
  X,
  CheckCircle2,
} from "lucide-react";
import {
  getInstallments,
  createInstallment
} from "../../services/installmentService";

import { searchPaymentShareholders } from "../../services/paymentService";

const money = (amount = 0) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(amount);

const statusStyles = {
  upcoming: "badge-info",
  due: "badge-warning",
  partially_paid: "badge-warning",
  paid: "badge-success",
  overdue: "badge-error",
};

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-base-content/65">{title}</p>
          <span className="rounded-xl bg-primary/10 p-2 text-primary">
            <Icon size={20} />
          </span>
        </div>
        <h2 className="text-2xl font-bold">{value}</h2>
        <p className="text-xs text-base-content/55">{description}</p>
      </div>
    </div>
  );
}

export default function InstallmentManagementPage() {
  const [installments, setInstallments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  const [shareholderSearch, setShareholderSearch] = useState("");
  const [shareholderOptions, setShareholderOptions] = useState([]);
  const [selectedShareholder, setSelectedShareholder] = useState(null);
  const [shareholderLoading, setShareholderLoading] = useState(false);

  const [form, setForm] = useState({
    shareholderId: "",
    installmentNumber: "1",
    amount: "",
    dueDate: "",
    description: "",
  });

  const loadInstallments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getInstallments({
        page: pagination.page,
        limit: pagination.limit,
      });

      setInstallments(result.data || []);
      setPagination((current) => ({
        ...current,
        ...(result.pagination || {}),
      }));
    } catch (err) {
      setError(err.message || "Failed to load installments.");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    loadInstallments();
  }, [loadInstallments]);

  useEffect(() => {
    if (!modalOpen) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      setShareholderLoading(true);

      try {
        const result = await searchPaymentShareholders(
          shareholderSearch.trim()
        );

        if (!cancelled) {
          setShareholderOptions(result.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to search shareholders.");
          setShareholderOptions([]);
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

  const totalAmount = installments.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const hasPaymentSummary = installments.every(
    (item) =>
      typeof item.paidAmount === "number" &&
      typeof item.remainingAmount === "number"
  );

  const paidAmount = hasPaymentSummary
    ? installments.reduce(
      (sum, item) => sum + item.paidAmount,
      0
    )
    : null;

  const outstandingAmount = hasPaymentSummary
    ? installments.reduce(
      (sum, item) => sum + item.remainingAmount,
      0
    )
    : null;

  async function handleCreateInstallment(event) {
    event.preventDefault();

    if (!form.shareholderId) {
      setError("Please select a shareholder.");
      return;
    }

    const installmentNumber = Number(form.installmentNumber);
    const amount = Number(form.amount);

    if (
      !Number.isInteger(installmentNumber) ||
      installmentNumber < 1 ||
      installmentNumber > 120
    ) {
      setError("Installment number must be between 1 and 120.");
      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      Math.round(amount * 100) / 100 !== amount
    ) {
      setError("Enter a valid amount with up to 2 decimal places.");
      return;
    }

    if (!form.dueDate) {
      setError("Please select a due date.");
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      await createInstallment({
        shareholderId: form.shareholderId,
        installmentNumber,
        amount,
        dueDate: form.dueDate,
        description: form.description.trim(),
      });

      setModalOpen(false);
      setForm({
        shareholderId: "",
        installmentNumber: "1",
        amount: "",
        dueDate: "",
        description: "",
      });

      setSelectedShareholder(null);
      setShareholderSearch("");
      setShareholderOptions([]);

      setNotice("Installment created successfully.");

      // Refresh the list. If another page was selected, return to page 1.
      if (pagination.page === 1) {
        await loadInstallments();
      } else {
        setPagination((current) => ({ ...current, page: 1 }));
      }
    } catch (err) {
      setError(err.message || "Failed to create installment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Installment Management
          </h1>
          <p className="mt-1 text-sm text-base-content/60">
            Manage shareholder installment schedules and due dates.
          </p>
        </div>
        {/* 
        <button
          type="button"
          className="btn btn-outline"
          onClick={loadInstallments}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button> */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setError("");
              setNotice("");
              setModalOpen(true);
            }}
          >
            <Plus size={18} />
            Create Installment
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={loadInstallments}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-sm" onClick={loadInstallments}>
            Retry
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
        <StatCard
          title="Installments"
          value={pagination.total}
          icon={ClipboardList}
          description="Total scheduled installments"
        />
        <StatCard
          title="Scheduled Amount"
          value={money(totalAmount)}
          icon={CircleDollarSign}
          description="Amount on the current page"
        />
        <StatCard
          title="Verified Paid"
          value={paidAmount === null ? "—" : money(paidAmount)}
          icon={CircleDollarSign}
          description={
            paidAmount === null
              ? "Payment summary not available"
              : "Verified payments on the current page"
          }
        />
        <StatCard
          title="Outstanding"
          value={
            outstandingAmount === null
              ? "—"
              : money(outstandingAmount)
          }
          icon={CalendarClock}
          description={
            outstandingAmount === null
              ? "Payment summary not available"
              : "Remaining amount on the current page"
          }
        />
      </div>

      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <div className="flex flex-col gap-2 border-b border-base-300 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Installment Schedule</h2>
              <p className="text-sm text-base-content/60">
                {pagination.total} installment records
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              <div className="skeleton h-8 w-full" />
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
            </div>
          ) : installments.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList
                size={40}
                className="mx-auto mb-3 text-base-content/35"
              />
              <h3 className="font-semibold">No installments found</h3>
              <p className="mt-1 text-sm text-base-content/60">
                Create an installment to begin tracking payments.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Shareholder</th>
                    <th>Installment</th>
                    <th>Amount</th>
                    <th>Paid</th>
                    <th>Remaining</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {installments.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="font-medium">
                          {item.shareholder?.fullName || "Unknown"}
                        </div>
                        <div className="text-xs text-base-content/60">
                          {item.shareholder?.shareholderCode || "—"}
                        </div>
                      </td>
                      <td>#{item.installmentNumber}</td>
                      <td className="whitespace-nowrap">
                        {money(item.amount)}
                      </td>
                      <td className="whitespace-nowrap">
                        {typeof item.paidAmount === "number"
                          ? money(item.paidAmount)
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap">
                        {typeof item.remainingAmount === "number"
                          ? money(item.remainingAmount)
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap">
                        {new Date(item.dueDate).toLocaleDateString("en-GB")}
                      </td>
                      <td>
                        <span
                          className={`badge ${statusStyles[item.status] || "badge-ghost"
                            }`}
                        >
                          {(item.status || "unknown").replaceAll("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-base-300 p-4">
              <p className="text-sm text-base-content/60">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="join">
                <button
                  className="btn btn-sm join-item"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setPagination((current) => ({
                      ...current,
                      page: current.page - 1,
                    }))
                  }
                >
                  Previous
                </button>
                <button
                  className="btn btn-sm join-item"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPagination((current) => ({
                      ...current,
                      page: current.page + 1,
                    }))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* modal */}
      {modalOpen && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box max-w-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Create Installment</h2>
                <p className="mt-1 text-sm text-base-content/60">
                  Schedule a payment for a shareholder.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                disabled={submitting}
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInstallment} className="mt-5 space-y-4">
              <div>
                <label htmlFor="installmentShareholderSearch" className="label">
                  Shareholder
                </label>

                {selectedShareholder ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-base-300 p-3">
                    <div>
                      <p className="font-semibold">
                        {selectedShareholder.fullName}
                      </p>
                      <p className="text-sm text-base-content/60">
                        {selectedShareholder.shareholderCode || "—"}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      disabled={submitting}
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
                    <label className="input input-bordered flex items-center gap-2">
                      <Search size={16} className="text-base-content/50" />
                      <input
                        id="installmentShareholderSearch"
                        className="grow"
                        value={shareholderSearch}
                        onChange={(event) =>
                          setShareholderSearch(event.target.value)
                        }
                        placeholder="Search name or shareholder code..."
                        autoComplete="off"
                        disabled={submitting}
                      />
                    </label>

                    <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-base-300">
                      {shareholderLoading ? (
                        <p className="p-3 text-sm">Searching shareholders...</p>
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
                              {shareholder.shareholderCode || "—"}
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
                <div>
                  <label htmlFor="installmentNumber" className="label">
                    Installment Number
                  </label>
                  <input
                    id="installmentNumber"
                    type="number"
                    min="1"
                    max="120"
                    step="1"
                    className="input input-bordered w-full"
                    value={form.installmentNumber}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        installmentNumber: event.target.value,
                      }))
                    }
                    disabled={submitting}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="installmentAmount" className="label">
                    Amount (BDT)
                  </label>
                  <input
                    id="installmentAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="input input-bordered w-full"
                    value={form.amount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="installmentDueDate" className="label">
                  Due Date
                </label>
                <input
                  id="installmentDueDate"
                  type="date"
                  className="input input-bordered w-full"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dueDate: event.target.value,
                    }))
                  }
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label htmlFor="installmentDescription" className="label">
                  Description (Optional)
                </label>
                <textarea
                  id="installmentDescription"
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  maxLength={300}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  disabled={submitting}
                  placeholder="Add a note..."
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
                  disabled={submitting || !form.shareholderId}
                >
                  {submitting && (
                    <span className="loading loading-spinner loading-sm" />
                  )}
                  {submitting ? "Creating..." : "Create Installment"}
                </button>
              </div>
            </form>
          </div>

          <button
            type="button"
            className="modal-backdrop"
            aria-label="Close modal"
            disabled={submitting}
            onClick={() => setModalOpen(false)}
          >
            Close
          </button>
        </div>
      )}

    </div>
  );
}
