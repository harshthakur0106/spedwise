"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PlanForm({
  currentMonth,
  currentYear,
  currentSalary,
  hasExistingPlan,
}: {
  currentMonth: number;
  currentYear: number;
  currentSalary: number;
  hasExistingPlan: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    month: String(currentMonth),
    year: String(currentYear),
    salary: String(currentSalary || 0),
    copyPrevious: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onChange = (key: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: Number(form.month),
          year: Number(form.year),
          salary: Number(form.salary),
          copyPrevious: Boolean(form.copyPrevious),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Unable to create plan.");
      }

      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create plan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">Create monthly plan</h3>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {hasExistingPlan ? "Plan exists" : "Blank plan"}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Month</span>
          <select
            value={form.month}
            onChange={(event) => onChange("month", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500"
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
              <option key={month} value={String(month)}>
                {month}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Year</span>
          <input
            type="number"
            min="2024"
            step="1"
            value={form.year}
            onChange={(event) => onChange("year", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Salary</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.salary}
            onChange={(event) => onChange("salary", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.copyPrevious}
          onChange={(event) => onChange("copyPrevious", event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        Copy previous month allocations
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Creating..." : hasExistingPlan ? "Create another plan" : "Create plan"}
      </button>
    </form>
  );
}
