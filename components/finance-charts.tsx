"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

const chartColors = ["#10b981", "#34d399", "#fbbf24", "#fca5a5", "#60a5fa", "#a78bfa", "#f472b6", "#f59e0b"];

export function FinanceCharts({ categoryTotals, plannedVsActual, monthlyTrend }: {
  categoryTotals: { name: string; value: number }[];
  plannedVsActual: { name: string; value: number }[];
  monthlyTrend: { name: string; value: number }[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Category spending</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryTotals} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {categoryTotals.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => {
                  const numericValue = Number(value ?? 0);
                  return `₹${numericValue.toLocaleString("en-IN")}`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Monthly spending</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                formatter={(value) => {
                  const numericValue = Number(value ?? 0);
                  return `₹${numericValue.toLocaleString("en-IN")}`;
                }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Planned versus actual spending</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={plannedVsActual}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                formatter={(value) => {
                  const numericValue = Number(value ?? 0);
                  return `₹${numericValue.toLocaleString("en-IN")}`;
                }}
              />
              <Bar dataKey="value" fill="#16a34a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
