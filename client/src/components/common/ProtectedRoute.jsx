
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("vilasshare-token");
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
