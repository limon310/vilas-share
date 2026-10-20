
import { useEffect, useState } from "react";
import { CalendarDays, X } from "lucide-react";

const initialForm = {
  shareholderId: "",
  installmentNumber: "1",
  amount: "",
  dueDate: "",
  description: "",
};

export default function CreateInstallmentModal({
  open,
  onClose,
  onSubmit,
  shareholders = [],
  loading = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setErrors({});
    }
  }, [open]);

  if (!open) return null;

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};

    if (!form.shareholderId) {
      nextErrors.shareholderId = "Please select a shareholder.";
    }

    const installmentNumber = Number(form.installmentNumber);
    if (
      !Number.isInteger(installmentNumber) ||
      installmentNumber < 1 ||
      installmentNumber > 120
    ) {
      nextErrors.installmentNumber =
        "Enter an installment number from 1 to 120.";
    }

    const amount = Number(form.amount);
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      Math.round(amount * 100) / 100 !== amount
    ) {
      nextErrors.amount = "Enter a valid amount with up to 2 decimals.";
    }

    if (!form.dueDate || Number.isNaN(Date.parse(form.dueDate))) {
      nextErrors.dueDate = "Please select a valid due date.";
    }

    if (form.description.trim().length > 300) {
      nextErrors.description = "Maximum 300 characters.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      await onSubmit({
        shareholderId: form.shareholderId,
        installmentNumber,
        amount,
        dueDate: form.dueDate,
        description: form.description.trim(),
      });
    } catch {
      // Parent component handles API errors and notifications.
    }
  }

  return (
    <div
      className="modal modal-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="installment-modal-title"
    >
      <div className="modal-box max-w-xl rounded-2xl p-0">
        <div className="flex items-center justify-between border-b border-base-300 px-6 py-5">
          <div>
            <h2
              id="installment-modal-title"
              className="text-xl font-bold"
            >
              Create Installment
            </h2>
            <p className="mt-1 text-sm text-base-content/60">
              Schedule a shareholder payment.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost btn-circle btn-sm"
            aria-label="Close modal"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label
              htmlFor="shareholderId"
              className="label font-medium"
            >
              Shareholder <span className="text-error">*</span>
            </label>

            <select
              id="shareholderId"
              name="shareholderId"
              value={form.shareholderId}
              onChange={handleChange}
              className="select select-bordered w-full"
              disabled={loading}
            >
              <option value="">Select a shareholder</option>

              {shareholders.map((shareholder) => (
                <option
                  key={shareholder._id}
                  value={shareholder._id}
                >
                  {shareholder.fullName}
                  {shareholder.shareholderCode
                    ? ` (${shareholder.shareholderCode})`
                    : ""}
                </option>
              ))}
            </select>

            {errors.shareholderId && (
              <p className="mt-1 text-sm text-error">
                {errors.shareholderId}
              </p>
            )}

            {shareholders.length === 0 && (
              <p className="mt-1 text-sm text-base-content/60">
                No shareholders available. Check the shareholder list API.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="installmentNumber"
                className="label font-medium"
              >
                Installment No. <span className="text-error">*</span>
              </label>

              <input
                id="installmentNumber"
                name="installmentNumber"
                type="number"
                min="1"
                max="120"
                step="1"
                value={form.installmentNumber}
                onChange={handleChange}
                className="input input-bordered w-full"
                disabled={loading}
              />

              {errors.installmentNumber && (
                <p className="mt-1 text-sm text-error">
                  {errors.installmentNumber}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="amount" className="label font-medium">
                Amount (৳) <span className="text-error">*</span>
              </label>

              <input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                placeholder="e.g. 10000"
                className="input input-bordered w-full"
                disabled={loading}
              />

              {errors.amount && (
                <p className="mt-1 text-sm text-error">
                  {errors.amount}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="dueDate" className="label font-medium">
              Due Date <span className="text-error">*</span>
            </label>

            <div className="relative">
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={handleChange}
                className="input input-bordered w-full"
                disabled={loading}
              />
              <CalendarDays
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50"
              />
            </div>

            {errors.dueDate && (
              <p className="mt-1 text-sm text-error">
                {errors.dueDate}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="label font-medium"
            >
              Description <span className="text-base-content/50">(Optional)</span>
            </label>

            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={300}
              rows={3}
              placeholder="Add a note about this installment..."
              className="textarea textarea-bordered w-full"
              disabled={loading}
            />

            <div className="mt-1 flex justify-between gap-3">
              {errors.description ? (
                <p className="text-sm text-error">{errors.description}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-base-content/50">
                {form.description.length}/300
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-base-300 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || shareholders.length === 0}
            >
              {loading && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {loading ? "Creating..." : "Create Installment"}
            </button>
          </div>
        </form>
      </div>

      <button
        type="button"
        className="modal-backdrop"
        onClick={onClose}
        disabled={loading}
        aria-label="Close modal"
      />
    </div>
  );
}
