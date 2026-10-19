
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarDays,
  Wallet,
  Receipt,
  Bell,
  Building2,
  UserCog,
  X,
  Wallet2,
  ReceiptText,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Shareholders", path: "/shareholders", icon: Users },
  { label: "Payments", path: "/payments", icon: CreditCard },
  // { label: "Shareholder Ledger",path: "/payments/shareholder-ledger",icon: ReceiptText },
  { label: "Installments", path: "/installments", icon: CalendarDays },
  { label: "Rental Income", path: "/rental-income", icon: Wallet },
  { label: "Expenses", path: "/expenses", icon: Receipt },
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Project Details", path: "/project-details", icon: Building2 },
  { label: "Directors", path: "/directors", icon: UserCog },
  { label: "Share Allocation",path: "/allocations",icon: Wallet2 },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-base-300 bg-base-100 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-base-300 px-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-content">
              <Building2 size={22} />
            </span>
            <div>
              <p className="font-bold tracking-tight">VilasShare</p>
              <p className="text-xs opacity-55">Management Portal</p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.16em] opacity-45">
            Workspace
          </p>

          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-content"
                    : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                }`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-base-300 p-4">
          <div className="rounded-xl bg-base-200 p-3">
            <p className="text-sm font-semibold">VilasShare</p>
            <p className="mt-1 text-xs opacity-55">
              Share & finance workspace
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
