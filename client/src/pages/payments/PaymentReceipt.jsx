
import { useEffect } from "react";
import { Printer, X } from "lucide-react";

export default function PaymentReceipt({ payment, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!payment) return null;

  const shareholder = payment.shareholder || {};
  const project = payment.project || {};

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-BD", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto my-6 max-w-2xl rounded-xl bg-base-100 p-6 shadow-xl print:my-0 print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        <div className="mb-6 flex justify-end gap-2 print:hidden">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            Print Receipt
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close receipt"
          >
            <X size={18} />
          </button>
        </div>

        <div className="receipt-content border border-base-300 p-6 sm:p-8">
          <header className="border-b border-base-300 pb-5 text-center">
            <h1 className="text-2xl font-bold">UTTARA VILAS</h1>
            <p className="mt-1 text-sm text-base-content/70">
              Share Management System
            </p>
            <h2 className="mt-5 text-xl font-semibold">
              PAYMENT RECEIPT
            </h2>
            <p className="mt-1 text-sm text-base-content/60">
              Official record of verified payment
            </p>
          </header>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-base-content/60">
                Receipt / Payment ID
              </p>
              <p className="mt-1 break-all font-mono text-sm">
                {payment._id}
              </p>
            </div>

            <div>
              <p className="text-xs text-base-content/60">
                Payment Date
              </p>
              <p className="mt-1 font-medium">
                {formatDate(payment.paidAt || payment.verifiedAt || payment.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-xs text-base-content/60">
                Shareholder
              </p>
              <p className="mt-1 font-medium">
                {shareholder.fullName || "—"}
              </p>
              <p className="text-sm text-base-content/70">
                {shareholder.shareholderCode || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-base-content/60">
                Project
              </p>
              <p className="mt-1 font-medium">
                {project.projectKey || "Main Project"}
              </p>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Share Payment</td>
                  <td className="text-right font-semibold">
                    {formatAmount(payment.amount)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th>Total Paid</th>
                  <th className="text-right text-lg">
                    {formatAmount(payment.amount)}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <p>
              <span className="text-base-content/60">Method: </span>
              <span className="font-medium">
                {payment.paymentMethod === "sslcommerz"
                  ? "SSLCommerz"
                  : (payment.paymentMethod || "—").replaceAll("_", " ")}
              </span>
            </p>

            <p>
              <span className="text-base-content/60">Status: </span>
              <span className="font-semibold uppercase text-success">
                {payment.status}
              </span>
            </p>

            <p className="break-all sm:col-span-2">
              <span className="text-base-content/60">
                Transaction Reference:{" "}
              </span>
              {payment.gatewayTransactionId ||
                payment.transactionReference ||
                "—"}
            </p>
          </div>

          <footer className="mt-10 border-t border-dashed border-base-300 pt-5 text-center text-xs text-base-content/60">
            This receipt confirms a recorded payment. Keep it for your records.
          </footer>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          .receipt-content,
          .receipt-content * {
            visibility: visible !important;
          }

          .receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
          }

          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
    </div>
  );
}
