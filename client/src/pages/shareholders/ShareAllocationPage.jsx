
// import { useCallback, useEffect, useState } from "react";
// import {
//   ArrowDownCircle,
//   ArrowUpCircle,
//   RefreshCw,
//   Search,
//   Users,
//   Wallet,
// } from "lucide-react";
// import {
//   createShareAllocation,
//   getProject,
//   getShareAllocations,
//   getShareholders,
// } from "../../services/shareAllocationService";

// const money = (amount) =>
//   new Intl.NumberFormat("en-BD", {
//     style: "currency",
//     currency: "BDT",
//     maximumFractionDigits: 2,
//   }).format(Number(amount || 0));

// function getErrorMessage(error) {
//   return error?.message || "Something went wrong. Please try again.";
// }

// export default function ShareAllocationPage() {
//   const [project, setProject] = useState(null);
//   const [shareholders, setShareholders] = useState([]);
//   const [allocations, setAllocations] = useState([]);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 10,
//     total: 0,
//     totalPages: 0,
//   });

//   const [shareholderId, setShareholderId] = useState("");
//   const [quantity, setQuantity] = useState("1");
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");

//   const token = localStorage.getItem("vilasshare-token");
//   const user = JSON.parse(
//     localStorage.getItem("vilasshare-user") || "null"
//   );
//   const isAdmin = user?.role === "admin";

//   const loadData = useCallback(async () => {
//     setLoading(true);
//     setError("");

//     try {
//       const [projectResponse, shareholderResponse, allocationResponse] =
//         await Promise.all([
//           getProject(),
//           getShareholders(),
//           getShareAllocations(page, 10),
//         ]);

//       setProject(projectResponse.data ?? null);

//       const shareholderData = shareholderResponse.data;
//       setShareholders(
//         Array.isArray(shareholderData)
//           ? shareholderData
//           : shareholderData?.data || []
//       );

//       setAllocations(allocationResponse.data || []);
//       setPagination(
//         allocationResponse.pagination || {
//           page,
//           limit: 10,
//           total: 0,
//           totalPages: 0,
//         }
//       );
//     } catch (err) {
//       setError(getErrorMessage(err));
//     } finally {
//       setLoading(false);
//     }
//   }, [page]);

//   useEffect(() => {
//     loadData();
//   }, [loadData]);

//   const availableShares = Math.max(
//     0,
//     Number(project?.totalShares || 0) -
//       Number(project?.allocatedShares || 0)
//   );

//   const parsedQuantity = Number(quantity);
//   const validQuantity =
//     Number.isSafeInteger(parsedQuantity) && parsedQuantity > 0;

//   const estimatedTotal =
//     validQuantity && project?.pricePerShare
//       ? parsedQuantity * Number(project.pricePerShare)
//       : 0;

//   const filteredAllocations = allocations.filter((allocation) => {
//     const shareholder = allocation.shareholder || {};
//     const query = search.trim().toLowerCase();

//     return (
//       !query ||
//       shareholder.fullName?.toLowerCase().includes(query) ||
//       shareholder.shareholderCode?.toLowerCase().includes(query) ||
//       shareholder.phone?.toLowerCase().includes(query)
//     );
//   });

//   async function handleSubmit(event) {
//     event.preventDefault();
//     setError("");
//     setNotice("");

//     if (!isAdmin) {
//       setError("Only administrators can allocate shares.");
//       return;
//     }

//     if (!shareholderId) {
//       setError("Please select a shareholder.");
//       return;
//     }

//     if (!validQuantity) {
//       setError("Quantity must be a positive whole number.");
//       return;
//     }

//     if (parsedQuantity > availableShares) {
//       setError(`Only ${availableShares} shares are available.`);
//       return;
//     }

//     setSaving(true);

//     try {
//       await createShareAllocation({
//         shareholderId,
//         quantity: parsedQuantity,
//       });

//       setNotice("Shares allocated successfully.");
//       setShareholderId("");
//       setQuantity("1");

//       await loadData();
//     } catch (err) {
//       setError(getErrorMessage(err));
//     } finally {
//       setSaving(false);
//     }
//   }

//   return (
//     <div className="space-y-6 p-4 sm:p-6">
//       <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
//         <div>
//           <p className="text-sm font-medium text-primary">
//             SHARE MANAGEMENT
//           </p>
//           <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
//             Share Allocation
//           </h1>
//           <p className="mt-1 text-sm text-base-content/60">
//             Allocate project shares and review allocation history.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={loadData}
//           disabled={loading}
//           className="btn btn-outline gap-2 self-start"
//         >
//           <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
//           Refresh
//         </button>
//       </div>

//       {error && (
//         <div role="alert" className="alert alert-error">
//           <span>{error}</span>
//         </div>
//       )}

//       {notice && (
//         <div role="status" className="alert alert-success">
//           <span>{notice}</span>
//         </div>
//       )}

//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
//         <div className="card border border-base-300 bg-base-100 shadow-sm">
//           <div className="card-body flex-row items-center gap-4 p-5">
//             <div className="rounded-xl bg-primary/10 p-3 text-primary">
//               <Users size={23} />
//             </div>
//             <div>
//               <p className="text-sm text-base-content/60">Total Shares</p>
//               <p className="text-2xl font-bold">
//                 {Number(project?.totalShares || 0).toLocaleString()}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="card border border-base-300 bg-base-100 shadow-sm">
//           <div className="card-body flex-row items-center gap-4 p-5">
//             <div className="rounded-xl bg-success/10 p-3 text-success">
//               <ArrowUpCircle size={23} />
//             </div>
//             <div>
//               <p className="text-sm text-base-content/60">Allocated Shares</p>
//               <p className="text-2xl font-bold">
//                 {Number(project?.allocatedShares || 0).toLocaleString()}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="card border border-base-300 bg-base-100 shadow-sm">
//           <div className="card-body flex-row items-center gap-4 p-5">
//             <div className="rounded-xl bg-warning/10 p-3 text-warning">
//               <ArrowDownCircle size={23} />
//             </div>
//             <div>
//               <p className="text-sm text-base-content/60">Available Shares</p>
//               <p className="text-2xl font-bold">
//                 {availableShares.toLocaleString()}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {isAdmin && (
//         <section className="card border border-base-300 bg-base-100 shadow-sm">
//           <div className="card-body gap-5">
//             <div>
//               <h2 className="text-lg font-bold">Allocate New Shares</h2>
//               <p className="mt-1 text-sm text-base-content/60">
//                 Select an active shareholder and enter the number of shares.
//               </p>
//             </div>

//             {project?.status !== "active" && (
//               <div className="alert alert-warning">
//                 <span>
//                   The project must be active before shares can be allocated.
//                   Current status: {project?.status || "not configured"}.
//                 </span>
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-5">
//               <div className="grid gap-5 md:grid-cols-2">
//                 <label className="form-control w-full">
//                   <span className="label-text mb-2 font-medium">
//                     Shareholder
//                   </span>
//                   <select
//                     className="select select-bordered w-full"
//                     value={shareholderId}
//                     onChange={(event) => setShareholderId(event.target.value)}
//                     required
//                   >
//                     <option value="">Select a shareholder</option>
//                     {shareholders.map((shareholder) => (
//                       <option
//                         key={shareholder._id}
//                         value={shareholder._id}
//                       >
//                         {shareholder.shareholderCode} — {shareholder.fullName}
//                       </option>
//                     ))}
//                   </select>
//                 </label>

//                 <label className="form-control w-full">
//                   <span className="label-text mb-2 font-medium">
//                     Number of Shares
//                   </span>
//                   <input
//                     type="number"
//                     className="input input-bordered w-full"
//                     min="1"
//                     max={availableShares}
//                     step="1"
//                     value={quantity}
//                     onChange={(event) => setQuantity(event.target.value)}
//                     required
//                   />
//                 </label>
//               </div>

//               <div className="grid gap-3 rounded-xl bg-base-200/70 p-4 sm:grid-cols-3">
//                 <div>
//                   <p className="text-sm text-base-content/60">
//                     Price per Share
//                   </p>
//                   <p className="mt-1 font-semibold">
//                     {money(project?.pricePerShare)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-base-content/60">
//                     Available Shares
//                   </p>
//                   <p className="mt-1 font-semibold">
//                     {availableShares.toLocaleString()}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-base-content/60">
//                     Estimated Total
//                   </p>
//                   <p className="mt-1 text-xl font-bold text-primary">
//                     {money(estimatedTotal)}
//                   </p>
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 className="btn btn-primary w-full sm:w-auto"
//                 disabled={
//                   saving ||
//                   loading ||
//                   project?.status !== "active" ||
//                   !validQuantity ||
//                   parsedQuantity > availableShares ||
//                   availableShares < 1
//                 }
//               >
//                 {saving && (
//                   <span className="loading loading-spinner loading-sm" />
//                 )}
//                 {saving ? "Allocating..." : "Allocate Shares"}
//               </button>
//             </form>
//           </div>
//         </section>
//       )}

//       <section className="card border border-base-300 bg-base-100 shadow-sm">
//         <div className="card-body gap-4 p-4 sm:p-6">
//           <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
//             <div>
//               <h2 className="text-lg font-bold">Allocation History</h2>
//               <p className="text-sm text-base-content/60">
//                 {pagination.total || 0} allocation record(s)
//               </p>
//             </div>

//             <label className="input input-bordered flex items-center gap-2">
//               <Search size={17} className="text-base-content/50" />
//               <input
//                 type="search"
//                 className="grow"
//                 placeholder="Search this page..."
//                 value={search}
//                 onChange={(event) => setSearch(event.target.value)}
//               />
//             </label>
//           </div>

//           {loading ? (
//             <div className="space-y-3 py-4">
//               {[1, 2, 3].map((item) => (
//                 <div
//                   key={item}
//                   className="h-14 animate-pulse rounded-lg bg-base-200"
//                 />
//               ))}
//             </div>
//           ) : filteredAllocations.length === 0 ? (
//             <div className="flex flex-col items-center gap-2 py-12 text-center">
//               <Wallet size={36} className="text-base-content/30" />
//               <p className="font-semibold">No allocation records found</p>
//               <p className="text-sm text-base-content/60">
//                 {search
//                   ? "Try another search term."
//                   : "New share allocations will appear here."}
//               </p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="table table-zebra">
//                 <thead>
//                   <tr>
//                     <th>Shareholder</th>
//                     <th>Quantity</th>
//                     <th>Price / Share</th>
//                     <th>Total Amount</th>
//                     <th>Allocated By</th>
//                     <th>Date</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredAllocations.map((allocation) => (
//                     <tr key={allocation._id}>
//                       <td>
//                         <p className="font-semibold">
//                           {allocation.shareholder?.fullName || "Unknown"}
//                         </p>
//                         <p className="text-xs text-base-content/60">
//                           {allocation.shareholder?.shareholderCode || "—"}
//                         </p>
//                       </td>
//                       <td className="font-semibold">
//                         {Number(allocation.quantity).toLocaleString()}
//                       </td>
//                       <td>{money(allocation.pricePerShare)}</td>
//                       <td className="font-semibold">
//                         {money(allocation.totalAmount)}
//                       </td>
//                       <td>
//                         {allocation.allocatedBy?.name || "—"}
//                       </td>
//                       <td>
//                         {allocation.createdAt
//                           ? new Date(allocation.createdAt).toLocaleDateString(
//                               "en-GB"
//                             )
//                           : "—"}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {!loading && pagination.totalPages > 1 && (
//             <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 pt-4">
//               <p className="text-sm text-base-content/60">
//                 Page {pagination.page} of {pagination.totalPages}
//               </p>
//               <div className="join">
//                 <button
//                   type="button"
//                   className="btn btn-sm join-item"
//                   disabled={page <= 1}
//                   onClick={() => setPage((current) => current - 1)}
//                 >
//                   Previous
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn-sm join-item"
//                   disabled={page >= pagination.totalPages}
//                   onClick={() => setPage((current) => current + 1)}
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import {
  getShareholders,
  getProject,
  getShareAllocations,
  createShareAllocation,
} from "../../services/shareAllocationService";

export default function ShareAllocationPage() {
  const [shareholders, setShareholders] = useState([]);
  const [project, setProject] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [shareholderId, setShareholderId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [shareholderRes, projectRes, allocationRes] =
          await Promise.all([
            getShareholders(),
            getProject(),
            getShareAllocations(1, 10),
          ]);

        setShareholders(shareholderRes.data || []);
        setProject(projectRes.data || null);
        setAllocations(allocationRes.data || []);
      } catch (err) {
        console.error("Share Allocation load error:", err);
        setError(err.message || "Failed to load page data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
        <span className="ml-3">Loading allocation data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3 p-6">
        <h1 className="text-2xl font-bold">Share Allocation</h1>
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
        <p className="text-sm text-base-content/60">
          Browser Console এবং Network tab-এ failed request পরীক্ষা করো।
        </p>
      </div>
    );
  }

  const totalShares = Number(project?.totalShares || 0);
  const allocatedShares = Number(project?.allocatedShares || 0);
  const availableShares = Math.max(totalShares - allocatedShares, 0);


  const isAdmin =
    JSON.parse(localStorage.getItem("vilasshare-user") || "null")
      ?.role === "admin";

  const activeShareholders = shareholders.filter(
    (shareholder) => shareholder.status === "active"
  );

  const pricePerShare = Number(project?.pricePerShare || 0);
  const parsedQuantity = Number(quantity);

  const estimatedAmount =
    Number.isSafeInteger(parsedQuantity) && parsedQuantity > 0
      ? Number((parsedQuantity * pricePerShare).toFixed(2))
      : 0;

  async function handleAllocation(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isAdmin) {
      setError("Only administrators can allocate shares.");
      return;
    }

    if (!shareholderId) {
      setError("Please select a shareholder.");
      return;
    }

    if (
      !Number.isSafeInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      setError("Enter a valid whole number of shares.");
      return;
    }

    if (project?.status !== "active") {
      setError("Project must be active before allocating shares.");
      return;
    }

    if (parsedQuantity > availableShares) {
      setError(`Only ${availableShares} shares are available.`);
      return;
    }

    try {
      setSubmitting(true);

      const response = await createShareAllocation({
        shareholderId,
        quantity: parsedQuantity,
      });

      setSuccess(response.message || "Shares allocated successfully.");
      setShareholderId("");
      setQuantity("1");

      const [projectRes, allocationRes] = await Promise.all([
        getProject(),
        getShareAllocations(1, 10),
      ]);

      setProject(projectRes.data || null);
      setAllocations(allocationRes.data || []);
    } catch (err) {
      setError(err.message || "Failed to allocate shares.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Share Allocation</h1>
        <p className="mt-1 text-base-content/60">
          Manage project shares and allocation records.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="stat rounded-box border border-base-300 bg-base-100">
          <div className="stat-title">Total Shares</div>
          <div className="stat-value text-primary">
            {totalShares.toLocaleString()}
          </div>
        </div>

        <div className="stat rounded-box border border-base-300 bg-base-100">
          <div className="stat-title">Allocated Shares</div>
          <div className="stat-value text-info">
            {allocatedShares.toLocaleString()}
          </div>
        </div>

        <div className="stat rounded-box border border-base-300 bg-base-100">
          <div className="stat-title">Available Shares</div>
          <div className="stat-value text-success">
            {availableShares.toLocaleString()}
          </div>
        </div>
      </div>


      {isAdmin && (
        <div className="rounded-box border border-base-300 bg-base-100 p-5">
          <h2 className="text-xl font-semibold">Allocate New Shares</h2>
          <p className="mt-1 text-sm text-base-content/60">
            Select a shareholder and enter the number of shares.
          </p>

          {success && (
            <div role="status" className="alert alert-success mt-4">
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div role="alert" className="alert alert-error mt-4">
              <span>{error}</span>
            </div>
          )}

          {project?.status !== "active" && (
            <div className="alert alert-warning mt-4">
              Project status must be active to allocate shares.
            </div>
          )}

          <form onSubmit={handleAllocation} className="mt-5 space-y-4">
            <label className="form-control w-full">
              <span className="label-text mb-2">Shareholder *</span>
              <select
                className="select select-bordered w-full"
                value={shareholderId}
                onChange={(event) => setShareholderId(event.target.value)}
                required
              >
                <option value="">Select a shareholder</option>
                {activeShareholders.map((shareholder) => (
                  <option key={shareholder._id} value={shareholder._id}>
                    {shareholder.shareholderCode} — {shareholder.fullName}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control w-full">
              <span className="label-text mb-2">Number of Shares *</span>
              <input
                className="input input-bordered w-full"
                type="number"
                min="1"
                max={availableShares}
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                required
              />
            </label>

            <div className="rounded-xl bg-base-200 p-4">
              <p className="text-sm text-base-content/60">Price per share</p>
              <p className="font-semibold">
                ৳{pricePerShare.toLocaleString("en-BD")}
              </p>

              <p className="mt-3 text-sm text-base-content/60">
                Estimated total amount
              </p>
              <p className="text-2xl font-bold text-primary">
                ৳{estimatedAmount.toLocaleString("en-BD")}
              </p>

              <p className="mt-2 text-xs text-base-content/60">
                Available shares: {availableShares.toLocaleString()}
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                submitting ||
                project?.status !== "active" ||
                availableShares < 1 ||
                activeShareholders.length === 0
              }
            >
              {submitting && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {submitting ? "Allocating..." : "Allocate Shares"}
            </button>
          </form>
        </div>
      )}

      <div className="rounded-box border border-base-300 bg-base-100 p-5">
        <h2 className="text-xl font-semibold">API Connection Test</h2>
        <div className="mt-4 space-y-2 text-sm">
          <p>Project: {project?.name || "Not configured"}</p>
          <p>Shareholders loaded: {shareholders.length}</p>
          <p>Allocation records loaded: {allocations.length}</p>
        </div>
      </div>


      {/* Share Allocation History */}
      <div className="rounded-box border border-base-300 bg-base-100">
        <div className="border-b border-base-300 p-5">
          <h2 className="text-xl font-semibold">
            Share Allocation History
          </h2>
          <p className="mt-1 text-sm text-base-content/60">
            View all recently allocated shares.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Shareholder</th>
                <th>Quantity</th>
                <th>Price / Share</th>
                <th>Total Amount</th>
                <th>Allocated By</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {allocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <p className="font-medium">No allocations found</p>
                    <p className="mt-1 text-sm text-base-content/60">
                      Allocated shares will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                allocations.map((allocation) => (
                  <tr key={allocation._id}>
                    <td>
                      <div className="font-medium">
                        {allocation.shareholder?.fullName || "Unknown"}
                      </div>
                      <div className="text-xs text-base-content/60">
                        {allocation.shareholder?.shareholderCode || "N/A"}
                      </div>
                    </td>

                    <td className="font-semibold">
                      {Number(allocation.quantity || 0).toLocaleString("en-BD")}
                    </td>

                    <td>
                      ৳
                      {Number(allocation.pricePerShare || 0).toLocaleString(
                        "en-BD",
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      )}
                    </td>

                    <td className="font-semibold">
                      ৳
                      {Number(allocation.totalAmount || 0).toLocaleString(
                        "en-BD",
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      )}
                    </td>

                    <td>
                      {allocation.allocatedBy?.name || "N/A"}
                    </td>

                    <td>
                      {allocation.createdAt
                        ? new Date(allocation.createdAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                        : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-base-300 px-5 py-3 text-sm text-base-content/60">
          Showing {allocations.length} allocation record(s)
        </div>
      </div>
    </div>
  );
}
