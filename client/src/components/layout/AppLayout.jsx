
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base-200">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-72">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="page-container">
          <Outlet />
        </main>

        <footer className="px-5 pb-6 text-center text-xs opacity-50">
          VilasShare · Share Management System
        </footer>
      </div>
    </div>
  );
}
