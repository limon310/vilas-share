import { Navigate, Route, Routes, Link } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ShareholdersPage from "./pages/shareholders/ShareholdersPage";
import ProjectPage from "./pages/project/ProjectPage";
import ShareAllocationPage from "./pages/shareholders/ShareAllocationPage";

function ComingSoon({ title }) {
  return (
    <section className="rounded-2xl border border-base-300 bg-base-100 p-8 sm:p-12">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        VilasShare Workspace
      </p>
      <h1 className="mt-3 text-2xl font-bold">{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 opacity-60">
        This module is not implemented yet. We will connect it to the
        database and backend API in the next development steps.
      </p>
      <Link to="/" className="btn btn-primary btn-sm mt-6">
        Back to dashboard
      </Link>
    </section>
  );
}

function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-5xl font-bold">404</p>
        <h1 className="mt-3 text-xl font-semibold">Page not found</h1>
        <Link to="/" className="btn btn-primary mt-5">
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="shareholders" element={<ShareholdersPage />} />
          {/* <Route
            path="allocations"
            element={<ShareAllocationPage />}
          /> */}
          <Route
            path="allocations"
            element={<ShareAllocationPage />}
          />
          <Route
            path="payments"
            element={<ComingSoon title="Payments" />}
          />
          <Route
            path="installments"
            element={<ComingSoon title="Installments" />}
          />
          <Route
            path="rental-income"
            element={<ComingSoon title="Rental Income" />}
          />
          <Route
            path="expenses"
            element={<ComingSoon title="Expenses" />}
          />
          <Route
            path="notifications"
            element={<ComingSoon title="Notifications" />}
          />
          <Route path="project-details" element={<ProjectPage />} />
          <Route
            path="directors"
            element={<ComingSoon title="Directors" />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
