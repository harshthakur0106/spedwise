"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const paymentMethods = ["UPI", "Cash", "Card", "Bank Transfer", "Other"];

export function TransactionForm({ categories }: { categories: { id: number; name: string }[] }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    categoryId: categories[0]?.id ?? "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: "UPI",
    notes: "",
  });

  const onChange = (key: string, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!Number(form.amount) || Number(form.amount) <= 0) {
      nextErrors.amount = "Amount must be greater than zero.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required.";
    }

    if (!form.date) {
      nextErrors.date = "Date is required.";
    }

    if (form.type === "expense" && !form.categoryId) {
      nextErrors.categoryId = "Category is required for expenses.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          categoryId: form.type === "expense" ? Number(form.categoryId) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to create transaction.");
      }

      router.refresh();
      setForm({
        type: "expense",
        amount: "",
        categoryId: categories[0]?.id ?? "",
        description: "",
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: "UPI",
        notes: "",
      });
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Transaction type</span>
          <select
            value={form.type}
            onChange={(event) => onChange("type", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none ring-0 focus:border-emerald-500"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Amount</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(event) => onChange("amount", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500"
            placeholder="₹0.00"
          />
          {errors.amount && <span className="text-xs text-red-600">{errors.amount}</span>}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Category</span>
          <select
            value={form.categoryId}
            onChange={(event) => onChange("categoryId", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500"
            disabled={form.type !== "expense"}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <span className="text-xs text-red-600">{errors.categoryId}</span>}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Payment method</span>
          <select
            value={form.paymentMethod}
            onChange={(event) => onChange("paymentMethod", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500"
          >
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
          <span>Description</span>
          <input
            type="text"
            value={form.description}
            onChange={(event) => onChange("description", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500"
            placeholder="Groceries, salary, rent, etc."
          />
          {errors.description && <span className="text-xs text-red-600">{errors.description}</span>}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Date</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => onChange("date", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500"
          />
          {errors.date && <span className="text-xs text-red-600">{errors.date}</span>}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Notes</span>
          <input
            type="text"
            value={form.notes}
            onChange={(event) => onChange("notes", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500"
            placeholder="Optional notes"
          />
        </label>
      </div>

      {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Saving..." : "Add transaction"}
      </button>
    </form>
  );
}
