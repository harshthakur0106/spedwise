import Link from "next/link";
import { ArrowLeftRight, BarChart3, LayoutDashboard, Settings, WalletCards } from "lucide-react";

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budget", label: "Budget Planner", icon: WalletCards },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children, active }: { children: React.ReactNode; active: string }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-7xl gap-6 p-4 md:p-6">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:block">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-bold text-emerald-700">
              S
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Finance</p>
              <h1 className="text-xl font-semibold">SpendWise</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {navigation.map(({ href, label, icon: Icon }) => {
              const isActive = active === href || (href === "/" && active === "dashboard");

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="mb-6 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Monthly finances</p>
                <h2 className="text-2xl font-semibold text-slate-900">SpendWise</h2>
              </div>
              <div className="flex gap-2 md:hidden">
                {navigation.slice(0, 4).map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
