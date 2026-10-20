
import { useCallback, useEffect, useState } from "react";
import {
  CalendarClock,
  CircleDollarSign,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import { getInstallments } from "../../services/installmentService";

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

        <button
          type="button"
          className="btn btn-outline"
          onClick={loadInstallments}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-sm" onClick={loadInstallments}>
            Retry
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
                          className={`badge ${
                            statusStyles[item.status] || "badge-ghost"
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
    </div>
  );
}
