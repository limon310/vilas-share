
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Building2, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { apiRequest } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      localStorage.setItem("vilasshare-token", result.token);
      localStorage.setItem(
        "vilasshare-user",
        JSON.stringify(result.user)
      );

      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-base-200">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/login" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-content">
            <Building2 size={22} />
          </span>
          <span>
            <span className="block text-lg font-bold tracking-tight">
              VilasShare
            </span>
            <span className="block text-xs opacity-60">
              Share Management System
            </span>
          </span>
        </Link>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={toggleTheme}
        >
          {theme === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
        </button>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl items-center gap-10 px-5 py-10 md:grid-cols-2 md:px-8">
        <div className="hidden md:block">
          <span className="badge badge-outline mb-5">
            Shareholder & Finance Management
          </span>
          <h1 className="max-w-lg text-4xl font-bold leading-tight lg:text-5xl">
            Manage your investments with clarity.
          </h1>
          <p className="mt-5 max-w-md leading-7 opacity-65">
            Track shareholders, share allocations, installments,
            payments and financial reports from one workspace.
          </p>

          <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
            {[
              "Shareholder records",
              "Payment tracking",
              "Financial overview",
              "Secure access",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-base-300 bg-base-100 p-4 text-sm font-medium"
              >
                <span className="mr-2 text-primary">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-xl sm:p-9">
            <div className="mb-7">
              <h2 className="text-2xl font-bold">Welcome back</h2>
              <p className="mt-2 text-sm opacity-60">
                Sign in to access your workspace.
              </p>
            </div>

            {error && (
              <div role="alert" className="alert alert-error mb-5 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="form-control w-full gap-2">
                <span className="label-text font-medium">Email address</span>
                <span className="input input-bordered flex w-full items-center gap-3">
                  <Mail size={18} className="opacity-50" />
                  <input
                    className="grow"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </span>
              </label>

              <label className="form-control w-full gap-2">
                <span className="label-text font-medium">Password</span>
                <span className="input input-bordered flex w-full items-center gap-3">
                  <LockKeyhole size={18} className="opacity-50" />
                  <input
                    className="grow"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs leading-5 opacity-55">
              Authorized users only. Access is subject to your assigned role.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
