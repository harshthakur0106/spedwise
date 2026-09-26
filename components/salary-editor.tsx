"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export function SalaryEditor({
  planId,
  currentSalary,
}: {
  planId: number;
  currentSalary: number;
}) {
  const router = useRouter();
  const [salary, setSalary] = useState(String(currentSalary ?? 0));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    const amount = Number(salary);
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Salary must be a valid non-negative number.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salary: amount }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Unable to update salary.");
      }

      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to update salary.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-5 text-xl font-semibold text-slate-900">Salary management</h3>

      <div className="space-y-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Current monthly salary</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(Number(currentSalary ?? 0))}</p>
        </div>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Update salary</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={salary}
            onChange={(event) => setSalary(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Update salary"}
        </button>
      </div>
    </div>
  );
}
