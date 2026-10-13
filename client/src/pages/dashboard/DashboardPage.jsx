
import {
  Users,
  Wallet,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Clock3,
} from "lucide-react";

const stats = [
  {
    label: "Total Shareholders",
    value: "—",
    note: "Awaiting database data",
    icon: Users,
  },
  {
    label: "Total Shares Sold",
    value: "—",
    note: "Awaiting allocations",
    icon: TrendingUp,
  },
  {
    label: "Total Collection",
    value: "৳ —",
    note: "Verified payments only",
    icon: Wallet,
  },
  {
    label: "Outstanding Balance",
    value: "৳ —",
    note: "Calculated from dues",
    icon: CreditCard,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-primary">
            OVERVIEW
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm opacity-60">
            Monitor your share records and financial operations.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-base-300 bg-base-100 px-3 py-2 text-sm">
          <Clock3 size={16} className="text-primary" />
          <span>Live data will appear after setup</span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon }) => (
          <article
            key={label}
            className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm opacity-60">{label}</p>
                <p className="mt-3 text-2xl font-bold tracking-tight">
                  {value}
                </p>
              </div>

              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon size={21} />
              </span>
            </div>

            <p className="mt-4 text-xs opacity-55">{note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <article className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6 xl:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold">Financial Overview</h2>
              <p className="mt-1 text-sm opacity-55">
                Collection and outstanding amounts
              </p>
            </div>
            <span className="rounded-lg bg-base-200 p-2 text-primary">
              <TrendingUp size={20} />
            </span>
          </div>

          <div className="mt-6 grid min-h-52 place-items-center rounded-xl border border-dashed border-base-300 bg-base-200/50 p-6 text-center">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-base-200">
                <Wallet size={22} className="opacity-65" />
              </span>
              <p className="mt-3 font-medium">Financial report not available yet</p>
              <p className="mt-1 max-w-sm text-sm opacity-55">
                This chart will use verified payment and allocation records
                once the backend modules are connected.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6">
          <h2 className="font-bold">Quick Actions</h2>
          <p className="mt-1 text-sm opacity-55">
            Common management tasks
          </p>

          <div className="mt-5 space-y-3">
            {[
              ["Shareholders", "/shareholders"],
              ["Record a Payment", "/payments"],
              ["Review Installments", "/installments"],
              ["Manage Expenses", "/expenses"],
            ].map(([label, path]) => (
              <a
                key={path}
                href={path}
                className="flex items-center justify-between rounded-xl border border-base-300 p-3 text-sm font-medium transition hover:border-primary hover:bg-base-200"
              >
                {label}
                <ArrowUpRight size={17} className="opacity-60" />
              </a>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
