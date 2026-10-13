
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Eye,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
} from "lucide-react";
import { apiRequest } from "../../services/api";

const emptyForm = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function ShareholdersPage() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const token = localStorage.getItem("vilasshare-token");
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("vilasshare-user") || "null");
    } catch {
      return null;
    }
  })();

  const isAdmin = currentUser?.role === "admin";

  const loadShareholders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        search,
        status,
        page: String(page),
        limit: "10",
      });

      const result = await apiRequest(
        `/shareholders?${params.toString()}`,
        { token }
      );

      setRecords(result.data || []);
      setPagination(result.pagination || {
        page,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    } catch (err) {
      setError(err.message || "Unable to load shareholders.");
    } finally {
      setLoading(false);
    }
  }, [search, status, page, token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadShareholders();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadShareholders]);

  function openCreate() {
    setForm(emptyForm);
    setModal({ mode: "create" });
    setError("");
    setNotice("");
  }

  function openEdit(record) {
    setForm({
      fullName: record.fullName || "",
      phone: record.phone || "",
      email: record.email || "",
      address: record.address || "",
      notes: record.notes || "",
      status: record.status || "active",
    });
    setModal({ mode: "edit", record });
    setError("");
    setNotice("");
  }

  function openDetails(record) {
    setModal({ mode: "view", record });
    setError("");
  }

  function closeModal() {
    if (!saving) setModal(null);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const isEditing = modal.mode === "edit";
      const endpoint = isEditing
        ? `/shareholders/${modal.record._id}`
        : "/shareholders";

      const result = await apiRequest(endpoint, {
        method: isEditing ? "PATCH" : "POST",
        token,
        body: form,
      });

      setModal(null);
      setNotice(result.message || "Shareholder saved successfully.");
      await loadShareholders();
    } catch (err) {
      setError(err.message || "Unable to save shareholder.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(record) {
    const nextStatus = record.status === "active" ? "inactive" : "active";

    const confirmed = window.confirm(
      `Change ${record.fullName}'s status to ${nextStatus}?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const result = await apiRequest(`/shareholders/${record._id}`, {
        method: "PATCH",
        token,
        body: { status: nextStatus },
      });

      setNotice(result.message || "Status updated.");
      await loadShareholders();
    } catch (err) {
      setError(err.message || "Unable to update status.");
    }
  }

  const firstRecord = pagination.total === 0
    ? 0
    : (pagination.page - 1) * pagination.limit + 1;

  const lastRecord = Math.min(
    pagination.page * pagination.limit,
    pagination.total
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Shareholders
          </h1>
          <p className="mt-2 text-sm opacity-60">
            Manage shareholder profiles and contact information.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadShareholders}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          {isAdmin && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={openCreate}
            >
              <Plus size={18} />
              Add shareholder
            </button>
          )}
        </div>
      </section>

      {notice && (
        <div role="status" className="alert alert-success">
          <span>{notice}</span>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && !modal && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm opacity-60">Total records</p>
            <span className="rounded-xl bg-primary/10 p-3 text-primary">
              <Users size={21} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold">{pagination.total}</p>
          <p className="mt-1 text-xs opacity-50">
            Matching your current filters
          </p>
        </article>

        <article className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <p className="text-sm opacity-60">Current page</p>
          <p className="mt-3 text-3xl font-bold">
            {pagination.totalPages ? pagination.page : 0}
            <span className="ml-2 text-base font-medium opacity-40">
              / {pagination.totalPages}
            </span>
          </p>
          <p className="mt-1 text-xs opacity-50">Paginated results</p>
        </article>

        <article className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:col-span-2 xl:col-span-1">
          <p className="text-sm opacity-60">Access level</p>
          <p className="mt-3 text-2xl font-bold">
            {isAdmin ? "Administrator" : "Read only"}
          </p>
          <p className="mt-1 text-xs opacity-50">
            {isAdmin
              ? "You can create and update records"
              : "An administrator must modify records"}
          </p>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100">
        <div className="flex flex-col gap-3 border-b border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="font-bold">All shareholders</h2>
            <p className="mt-1 text-xs opacity-55">
              Search by name, shareholder ID, phone or email.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="input input-bordered flex min-w-0 items-center gap-2 sm:w-64">
              <Search size={17} className="shrink-0 opacity-45" />
              <input
                className="grow"
                type="search"
                placeholder="Search records..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </label>

            <select
              className="select select-bordered w-full sm:w-36"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Shareholder</th>
                <th>Contact</th>
                <th>Added</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={5}>
                      <div className="skeleton h-10 w-full" />
                    </td>
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="py-12 text-center">
                      <span className="mx-auto grid size-12 place-items-center rounded-full bg-base-200">
                        <Users size={22} className="opacity-50" />
                      </span>
                      <p className="mt-3 font-semibold">
                        No shareholders found
                      </p>
                      <p className="mt-1 text-sm opacity-55">
                        Try another search or add a new shareholder.
                      </p>
                      {isAdmin && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm mt-4"
                          onClick={openCreate}
                        >
                          <Plus size={16} />
                          Add shareholder
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record._id} className="hover">
                    <td>
                      <div className="flex min-w-52 items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {initials(record.fullName)}
                        </span>
                        <div>
                          <p className="font-semibold">{record.fullName}</p>
                          <p className="mt-1 text-xs opacity-55">
                            {record.shareholderCode}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <p className="whitespace-nowrap text-sm">
                        {record.phone}
                      </p>
                      <p className="mt-1 max-w-48 truncate text-xs opacity-55">
                        {record.email || "No email"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap text-sm opacity-70">
                      {formatDate(record.createdAt)}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          record.status === "active"
                            ? "badge-success"
                            : "badge-ghost"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td>
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="btn btn-ghost btn-square btn-sm"
                          title="View details"
                          aria-label={`View ${record.fullName}`}
                          onClick={() => openDetails(record)}
                        >
                          <Eye size={17} />
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              className="btn btn-ghost btn-square btn-sm"
                              title="Edit shareholder"
                              aria-label={`Edit ${record.fullName}`}
                              onClick={() => openEdit(record)}
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => changeStatus(record)}
                            >
                              {record.status === "active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-base-300 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs opacity-60">
            Showing {firstRecord}–{lastRecord} of {pagination.total} records
          </p>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={loading || page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span className="text-sm tabular-nums">
              {pagination.totalPages ? page : 0} / {pagination.totalPages}
            </span>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={loading || page >= pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {modal && (
        <div
          className="modal modal-open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shareholder-modal-title"
        >
          <div className="modal-box max-h-[90vh] max-w-2xl overflow-y-auto">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="shareholder-modal-title"
                  className="text-xl font-bold"
                >
                  {modal.mode === "create"
                    ? "Add shareholder"
                    : modal.mode === "edit"
                      ? "Edit shareholder"
                      : "Shareholder details"}
                </h2>
                <p className="mt-1 text-sm opacity-55">
                  {modal.mode === "view"
                    ? `ID: ${modal.record.shareholderCode}`
                    : "Enter the shareholder's contact information."}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-square btn-sm"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div role="alert" className="alert alert-error mb-5 text-sm">
                <span>{error}</span>
              </div>
            )}

            {modal.mode === "view" ? (
              <div className="space-y-4">
                {[
                  ["Full name", modal.record.fullName],
                  ["Shareholder ID", modal.record.shareholderCode],
                  ["Phone", modal.record.phone],
                  ["Email", modal.record.email || "—"],
                  ["Address", modal.record.address || "—"],
                  ["Status", modal.record.status],
                  ["Created", formatDate(modal.record.createdAt)],
                  ["Notes", modal.record.notes || "—"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="grid gap-1 border-b border-base-300 pb-3 sm:grid-cols-3"
                  >
                    <p className="text-sm opacity-55">{label}</p>
                    <p className="break-words text-sm font-medium sm:col-span-2">
                      {value}
                    </p>
                  </div>
                ))}

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => openEdit(modal.record)}
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="form-control gap-2">
                    <span className="label-text font-medium">
                      Full name *
                    </span>
                    <input
                      className="input input-bordered w-full"
                      name="fullName"
                      value={form.fullName}
                      onChange={updateField}
                      minLength={2}
                      maxLength={120}
                      required
                    />
                  </label>

                  <label className="form-control gap-2">
                    <span className="label-text font-medium">
                      Phone number *
                    </span>
                    <input
                      className="input input-bordered w-full"
                      name="phone"
                      value={form.phone}
                      onChange={updateField}
                      maxLength={25}
                      required
                    />
                  </label>

                  <label className="form-control gap-2 sm:col-span-2">
                    <span className="label-text font-medium">
                      Email address
                    </span>
                    <input
                      className="input input-bordered w-full"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={updateField}
                      maxLength={254}
                    />
                  </label>

                  <label className="form-control gap-2 sm:col-span-2">
                    <span className="label-text font-medium">Address</span>
                    <textarea
                      className="textarea textarea-bordered min-h-20 w-full"
                      name="address"
                      value={form.address}
                      onChange={updateField}
                      maxLength={500}
                    />
                  </label>

                  <label className="form-control gap-2 sm:col-span-2">
                    <span className="label-text font-medium">Notes</span>
                    <textarea
                      className="textarea textarea-bordered min-h-20 w-full"
                      name="notes"
                      value={form.notes}
                      onChange={updateField}
                      maxLength={1000}
                    />
                  </label>
                </div>

                {modal.mode === "edit" && (
                  <label className="form-control gap-2">
                    <span className="label-text font-medium">Status</span>
                    <select
                      className="select select-bordered w-full"
                      value={form.status || modal.record.status}
                      onChange={(event) => {
                        setForm((current) => ({
                          ...current,
                          status: event.target.value,
                        }));
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                )}

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving && (
                      <span className="loading loading-spinner loading-sm" />
                    )}
                    {saving
                      ? "Saving..."
                      : modal.mode === "create"
                        ? "Create shareholder"
                        : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <button
            type="button"
            className="modal-backdrop"
            aria-label="Close dialog"
            onClick={closeModal}
            disabled={saving}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
