import { decimal, integer, pgTable, serial, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull().unique(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: uniqueIndex("categories_name_idx").on(table.name),
  }),
);

export const monthlyPlans = pgTable(
  "monthly_plans",
  {
    id: serial("id").primaryKey(),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    salary: decimal("salary", { precision: 12, scale: 2 }).notNull().default("0"),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    monthYearUnique: uniqueIndex("monthly_plans_month_year_unique").on(table.month, table.year),
  }),
);

export const budgetAllocations = pgTable(
  "budget_allocations",
  {
    id: serial("id").primaryKey(),
    monthlyPlanId: integer("monthlyPlanId")
      .notNull()
      .references(() => monthlyPlans.id, { onDelete: "cascade" }),
    categoryId: integer("categoryId")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    plannedAmount: decimal("plannedAmount", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniquePlanCategory: uniqueIndex("budget_allocations_monthly_plan_id_category_id_unique").on(
      table.monthlyPlanId,
      table.categoryId,
    ),
  }),
);

export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    monthlyPlanId: integer("monthlyPlanId")
      .notNull()
      .references(() => monthlyPlans.id, { onDelete: "cascade" }),
    categoryId: integer("categoryId").references(() => categories.id, { onDelete: "set null" }),
    type: varchar("type", { length: 16 }).notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    paymentMethod: varchar("paymentMethod", { length: 24 }).notNull().default("Other"),
    notes: varchar("notes", { length: 500 }),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    monthlyPlanIdx: uniqueIndex("transactions_monthly_plan_idx").on(table.monthlyPlanId),
    dateIdx: uniqueIndex("transactions_date_idx").on(table.date),
  }),
);
