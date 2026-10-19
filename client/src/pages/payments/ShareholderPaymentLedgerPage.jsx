
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowDownLeft,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";

import {
  getShareholderPaymentLedger,
  searchPaymentShareholders,
} from "../../services/paymentService";

const formatMoney = (amount = 0) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const statusClass = {
  verified: "badge-success",
  pending: "badge-warning",
  rejected: "badge-error",
  failed: "badge-error",
};

export default function ShareholderPaymentLedgerPage() {
  const [search, setSearch] = useState("");
  const [shareholders, setShareholders] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [ledger, setLedger] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadShareholders() {
      if (search.trim().length < 2) {
        setShareholders([]);
        return;
      }

      setLoadingSearch(true);

      try {
        const result = await searchPaymentShareholders(search.trim());

        if (!cancelled) {
          setShareholders(result.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not search shareholders.");
        }
      } finally {
        if (!cancelled) setLoadingSearch(false);
      }
    }

    const timer = setTimeout(loadShareholders, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  async function loadLedger(shareholderId) {
    if (!shareholderId) return;

    setSelectedId(shareholderId);
    setLoadingLedger(true);
    setError("");
    setLedger(null);

    try {
      const result = await getShareholderPaymentLedger(shareholderId);
      setLedger(result.data);
    } catch (err) {
      setError(err.message || "Could not load payment ledger.");
    } finally {
      setLoadingLedger(false);
    }
  }

  const summary = ledger?.summary;
  const history = ledger?.history || [];

  const cards = [
    {
      label: "Allocated Amount",
      value: formatMoney(summary?.allocatedAmount),
      icon: Wallet,
      color: "text-primary",
    },
    {
      label: "Verified Payments",
      value: formatMoney(summary?.verifiedAmount),
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "Pending Payments",
      value: formatMoney(summary?.pendingAmount),
      icon: Clock3,
      color: "text-warning",
    },
    {
      label: "Outstanding Balance",
      value: formatMoney(summary?.outstandingAmount),
      icon: ArrowDownLeft,
      color: "text-error",
    },
  ];

  return (
    <main className="space-y-6 p-4 md:p-6">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">
          Shareholder Payment Ledger
        </h1>
        <p className="mt-1 text-sm text-base-content/60">
          View share allocation, payment status, and transaction history.
        </p>
      </header>

      <section className="card border border-base-300 bg-base-100">
        <div className="card-body gap-4">
          <label className="font-semibold" htmlFor="shareholder-search">
            Find Shareholder
          </label>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
            />
            <input
              id="shareholder-search"
              className="input input-bordered w-full pl-10"
              placeholder="Search by name or shareholder code..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {loadingSearch && (
            <p className="text-sm text-base-content/60">Searching...</p>
          )}

          {shareholders.length > 0 && (
            <div className="max-h-60 overflow-y-auto rounded-box border border-base-300">
              {shareholders.map((shareholder) => (
                <button
                  key={shareholder._id}
                  type="button"
                  onClick={() => {
                    setSearch(
                      `${shareholder.fullName} (${shareholder.shareholderCode})`
                    );
                    setShareholders([]);
                    loadLedger(shareholder._id);
                  }}
                  className={`flex w-full items-center justify-between gap-3 border-b border-base-200 p-3 text-left last:border-b-0 hover:bg-base-200 ${
                    selectedId === shareholder._id ? "bg-base-200" : ""
                  }`}
                >
                  <span className="font-medium">{shareholder.fullName}</span>
                  <span className="badge badge-ghost">
                    {shareholder.shareholderCode}
                  </span>
                </button>
              ))}
            </div>
          )}

          {search.trim().length >= 2 &&
            !loadingSearch &&
            shareholders.length === 0 &&
            !selectedId && (
              <p className="text-sm text-base-content/60">
                No matching shareholders found.
              </p>
            )}
        </div>
      </section>

      {error && (
        <div role="alert" className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setError("")}
          >
            Dismiss
          </button>
        </div>
      )}

      {loadingLedger && (
        <div className="flex items-center justify-center gap-2 py-12">
          <span className="loading loading-spinner loading-md" />
          <span>Loading payment ledger...</span>
        </div>
      )}

      {summary && !loadingLedger && (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label, value, icon: Icon, color }) => (
              <article
                key={label}
                className="card border border-base-300 bg-base-100"
              >
                <div className="card-body gap-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-base-content/60">{label}</p>
                    <Icon size={20} className={color} />
                  </div>
                  <p className="break-words text-xl font-bold md:text-2xl">
                    {value}
                  </p>
                </div>
              </article>
            ))}
          </section>

          <section className="card border border-base-300 bg-base-100">
            <div className="card-body">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {ledger.shareholder.fullName}
                  </h2>
                  <p className="text-sm text-base-content/60">
                    Shareholder Code: {ledger.shareholder.shareholderCode}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="badge badge-outline">
                    Total Shares: {summary.totalShares}
                  </span>
                  <span className="badge badge-outline">
                    Verified: {summary.verifiedCount}
                  </span>
                  <span className="badge badge-outline">
                    Pending: {summary.pendingCount}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="card border border-base-300 bg-base-100">
            <div className="card-body p-0">
              <div className="flex items-center justify-between gap-3 p-5">
                <h2 className="text-lg font-bold">Payment History</h2>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  disabled={loadingLedger}
                  onClick={() => loadLedger(selectedId)}
                >
                  <RefreshCw size={15} />
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Type</th>
                      <th>Transaction Reference</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((payment) => (
                      <tr key={payment._id}>
                        <td className="whitespace-nowrap">
                          {formatDate(payment.paidAt || payment.createdAt)}
                        </td>
                        <td className="whitespace-nowrap font-semibold">
                          {formatMoney(payment.amount)}
                        </td>
                        <td className="capitalize">
                          {(payment.paymentMethod || "—").replaceAll("_", " ")}
                        </td>
                        <td className="capitalize">
                          {payment.paymentType || "manual"}
                        </td>
                        <td className="max-w-56 break-all font-mono text-xs">
                          {payment.gatewayTransactionId ||
                            payment.transactionReference ||
                            "—"}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              statusClass[payment.status] || "badge-ghost"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {history.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-10 text-center">
                          No payment history found for this shareholder.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}

      {!ledger && !loadingLedger && !error && (
        <div className="rounded-box border border-dashed border-base-300 p-10 text-center text-base-content/60">
          Search and select a shareholder to view their payment ledger.
        </div>
      )}
    </main>
  );
}
