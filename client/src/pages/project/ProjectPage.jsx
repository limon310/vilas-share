import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  MapPin,
  Layers3,
  Wallet,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { apiRequest } from "../../services/api";

const initialForm = {
  name: "",
  location: "",
  description: "",
  totalShares: "1000",
  pricePerShare: "50000",
  status: "planning",
};

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 2,
});

function SummaryCard({ icon: Icon, label, value, description }) {
  return (
    <div className="surface-card flex min-w-0 items-start gap-4 p-4 sm:p-5">
      <div className="rounded-xl bg-primary/10 p-3 text-primary">
        <Icon size={22} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm opacity-65">{label}</p>
        <p className="mt-1 break-words text-xl font-bold tracking-tight sm:text-2xl">
          {value}
        </p>
        <p className="mt-1 text-xs opacity-60">{description}</p>
      </div>
    </div>
  );
}

function FormField({ label, children, hint }) {
  return (
    <label className="form-control w-full gap-2">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="text-xs opacity-60">{hint}</span>}
    </label>
  );
}

export default function ProjectPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [hasProject, setHasProject] = useState(false);

  const token = localStorage.getItem("vilasshare-token");

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("vilasshare-user") || "null");
    } catch {
      return null;
    }
  }, []);

  const isAdmin = currentUser?.role === "admin";

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await apiRequest("/project", { token });
      const project = response.data;

      if (!project) {
        setHasProject(false);
        setForm(initialForm);
        return;
      }

      setHasProject(true);
      setForm({
        name: project.name || "",
        location: project.location || "",
        description: project.description || "",
        totalShares: String(project.totalShares ?? 1000),
        pricePerShare: String(project.pricePerShare ?? 50000),
        status: project.status || "planning",
      });
    } catch (err) {
      setError(err.message || "Failed to load project information.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setNotice("");
  };

  const totalShares = Number(form.totalShares);
  const pricePerShare = Number(form.pricePerShare);

  const isValidShareCount =
    form.totalShares.trim() !== "" &&
    Number.isSafeInteger(totalShares) &&
    totalShares >= 1;

  const isValidSharePrice =
    form.pricePerShare.trim() !== "" &&
    Number.isFinite(pricePerShare) &&
    pricePerShare >= 0.01;

  const totalProjectValue =
    isValidShareCount && isValidSharePrice
      ? totalShares * pricePerShare
      : 0;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      setError("Only administrators can update project configuration.");
      return;
    }

    if (!isValidShareCount || !isValidSharePrice) {
      setError("Enter a valid total share count and price per share.");
      return;
    }

    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Project name must contain at least 2 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await apiRequest("/project", {
        method: "PUT",
        token,
        body: {
          name: form.name.trim(),
          location: form.location.trim(),
          description: form.description.trim(),
          totalShares,
          pricePerShare,
          status: form.status,
        },
      });

      const project = response.data;

      setHasProject(true);
      setForm({
        name: project.name,
        location: project.location || "",
        description: project.description || "",
        totalShares: String(project.totalShares),
        pricePerShare: String(project.pricePerShare),
        status: project.status,
      });

      setNotice(response.message || "Project configuration saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save project configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container space-y-6">
        <div className="skeleton h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-primary">
            <Building2 size={17} />
            <span className="font-semibold">Project Management</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Project Configuration
          </h1>

          <p className="section-description mt-2 max-w-2xl">
            Manage project information, share limits, pricing and project status
            from one place.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-base-300 px-3 py-2 text-sm sm:self-auto">
          <ShieldCheck size={17} className="text-primary" />
          <span>{isAdmin ? "Administrator" : "Read-only access"}</span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-error/30 bg-error/10 p-4 text-sm"
        >
          <AlertCircle className="mt-0.5 shrink-0 text-error" size={19} />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm"
        >
          <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={19} />
          <span>{notice}</span>
        </div>
      )}

      {!hasProject && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
          No project configuration has been saved yet.
          {isAdmin
            ? " Complete the form below and save to initialize the main project."
            : " Ask an administrator to configure the main project."}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          icon={Layers3}
          label="Total Shares"
          value={
            isValidShareCount
              ? totalShares.toLocaleString("en-BD")
              : "—"
          }
          description="Maximum shares configured for this project"
        />

        <SummaryCard
          icon={Wallet}
          label="Price Per Share"
          value={
            isValidSharePrice
              ? currencyFormatter.format(pricePerShare)
              : "—"
          }
          description="Configured price for one share"
        />

        <SummaryCard
          icon={Building2}
          label="Total Project Value"
          value={
            isValidShareCount && isValidSharePrice
              ? currencyFormatter.format(totalProjectValue)
              : "—"
          }
          description="Total shares × price per share"
        />
      </div>

      {/* Configuration form */}
      <form onSubmit={handleSubmit} className="surface-card overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-base-300 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold">Project Details</h2>
            <p className="section-description mt-1">
              {isAdmin
                ? "Update the information and save your changes."
                : "You can view the configuration but cannot edit it."}
            </p>
          </div>

          <span
            className={`badge ${
              form.status === "active"
                ? "badge-success"
                : form.status === "completed"
                  ? "badge-neutral"
                  : "badge-warning"
            }`}
          >
            {form.status}
          </span>
        </div>

        <div className="space-y-7 p-5 sm:p-6">
          {/* Basic information */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText size={19} className="text-primary" />
              <h3 className="font-bold">Basic Information</h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Project Name *">
                <input
                  className="input input-bordered w-full"
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="Enter project name"
                  minLength={2}
                  maxLength={120}
                  required
                  disabled={!isAdmin || saving}
                />
              </FormField>

              <FormField label="Project Location">
                <div className="relative">
                  <MapPin
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                  />
                  <input
                    className="input input-bordered w-full pl-10"
                    name="location"
                    value={form.location}
                    onChange={updateField}
                    placeholder="e.g. Uttara, Dhaka"
                    maxLength={200}
                    disabled={!isAdmin || saving}
                  />
                </div>
              </FormField>
            </div>

            <FormField label="Description">
              <textarea
                className="textarea textarea-bordered min-h-28 w-full"
                name="description"
                value={form.description}
                onChange={updateField}
                placeholder="Describe the project..."
                maxLength={2000}
                disabled={!isAdmin || saving}
              />
            </FormField>
          </section>

          <div className="border-t border-base-300" />

          {/* Share configuration */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers3 size={19} className="text-primary" />
              <h3 className="font-bold">Share Configuration</h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                label="Total Shares *"
                hint="Must be a whole number greater than zero."
              >
                <input
                  className="input input-bordered w-full"
                  type="number"
                  name="totalShares"
                  value={form.totalShares}
                  onChange={updateField}
                  min="1"
                  step="1"
                  required
                  disabled={!isAdmin || saving}
                />
              </FormField>

              <FormField
                label="Price Per Share (BDT) *"
                hint="Minimum price: ৳0.01."
              >
                <input
                  className="input input-bordered w-full"
                  type="number"
                  name="pricePerShare"
                  value={form.pricePerShare}
                  onChange={updateField}
                  min="0.01"
                  step="0.01"
                  required
                  disabled={!isAdmin || saving}
                />
              </FormField>
            </div>

            <div className="muted-surface rounded-xl p-4 sm:p-5">
              <p className="text-sm opacity-70">Calculated Project Value</p>
              <p className="mt-2 break-words text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                {isValidShareCount && isValidSharePrice
                  ? currencyFormatter.format(totalProjectValue)
                  : "Enter valid share values"}
              </p>
              <p className="mt-2 text-xs opacity-60">
                {isValidShareCount && isValidSharePrice
                  ? `${totalShares.toLocaleString("en-BD")} shares × ${currencyFormatter.format(pricePerShare)}`
                  : "The total is calculated automatically."}
              </p>
            </div>
          </section>

          <div className="border-t border-base-300" />

          {/* Project status */}
          <section className="space-y-4">
            <h3 className="font-bold">Project Status</h3>

            <FormField label="Current Status">
              <select
                className="select select-bordered w-full"
                name="status"
                value={form.status}
                onChange={updateField}
                disabled={!isAdmin || saving}
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </FormField>

            <p className="text-xs opacity-60">
              Changing the project status does not automatically change
              shareholder records or payments.
            </p>
          </section>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-base-300 bg-base-200/50 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={loadProject}
            disabled={loading || saving}
          >
            <RefreshCw size={17} />
            Reload
          </button>

          {isAdmin && (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || loading}
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Configuration
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}