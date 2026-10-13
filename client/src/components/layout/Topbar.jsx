
import { useNavigate } from "react-router-dom";
import { Menu, Moon, Sun, LogOut, CircleUserRound } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("vilasshare-user") || "null");
  } catch {
    user = null;
  }

  function handleLogout() {
    localStorage.removeItem("vilasshare-token");
    localStorage.removeItem("vilasshare-user");
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-base-300 bg-base-100/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="btn btn-ghost btn-square btn-sm lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Management Workspace</p>
          <p className="hidden text-xs opacity-55 sm:block">
            Shareholder & financial operations
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-square btn-sm"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
        </button>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="grid size-9 place-items-center rounded-full bg-base-200">
            <CircleUserRound size={20} />
          </span>
          <div className="max-w-36">
            <p className="truncate text-sm font-semibold">
              {user?.name || "Account"}
            </p>
            <p className="text-xs capitalize opacity-55">
              {user?.role || "User"}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-square btn-sm"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
