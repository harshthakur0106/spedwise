"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

type TransactionRow = {
  id: number;
  monthlyPlanId: number;
  categoryId: number | null;
  type: string;
  amount: string;
  description: string;
  date: Date;
  paymentMethod: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function TransactionTable({ rows }: { rows: TransactionRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Delete this transaction?");
    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to delete transaction.");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to delete transaction.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="pb-3 pr-4 font-medium">Description</th>
            <th className="pb-3 pr-4 font-medium">Category</th>
            <th className="pb-3 pr-4 font-medium">Date</th>
            <th className="pb-3 pr-4 font-medium">Method</th>
            <th className="pb-3 pr-4 font-medium text-right">Amount</th>
            <th className="pb-3 pr-4 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-5 text-center text-slate-500">
                No transactions recorded for this month.
              </td>
            </tr>
          ) : (
            rows.map((transaction) => (
              <tr key={transaction.id} className="border-b border-slate-100 align-top">
                <td className="py-3 pr-4 font-medium text-slate-800">{transaction.description}</td>
                <td className="py-3 pr-4 text-slate-600">{transaction.type}</td>
                <td className="py-3 pr-4 text-slate-600">{new Date(transaction.date).toLocaleDateString("en-IN")}</td>
                <td className="py-3 pr-4 text-slate-600">{transaction.paymentMethod}</td>
                <td className={`py-3 pr-4 text-right font-semibold ${transaction.type === "income" ? "text-emerald-600" : "text-slate-800"}`}>
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="py-3 pr-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(transaction.id)}
                    disabled={deletingId === transaction.id}
                    className="rounded-xl border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === transaction.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
