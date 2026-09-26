"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getMonthName(month: number) {
  return new Date(2024, month - 1, 1).toLocaleString("en-IN", { month: "long" });
}

export function MonthPicker() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const month = Number(params.get("month") || new Date().getMonth() + 1);
  const year = Number(params.get("year") || new Date().getFullYear());

  const updateMonth = (nextMonth: number, nextYear: number) => {
    const search = new URLSearchParams(params.toString());
    search.set("month", String(nextMonth));
    search.set("year", String(nextYear));
    router.push(`${pathname}?${search.toString()}`);
  };

  const prevMonth = month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year };
  const nextMonth = month === 12 ? { month: 1, year: year + 1 } : { month: month + 1, year };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <button
        type="button"
        onClick={() => updateMonth(prevMonth.month, prevMonth.year)}
        className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
        aria-label="Previous month"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Selected period</p>
        <h3 className="text-lg font-semibold text-slate-900">
          {getMonthName(month)} {year}
        </h3>
      </div>

      <button
        type="button"
        onClick={() => updateMonth(nextMonth.month, nextMonth.year)}
        className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
        aria-label="Next month"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
