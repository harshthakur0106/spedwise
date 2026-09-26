import { and, eq } from "drizzle-orm";
import { getDb } from "./index";
import { budgetAllocations, categories, monthlyPlans, transactions } from "./schema";

export const DEFAULT_CATEGORY_NAMES = [
  "Food",
  "Travel",
  "Shopping",
  "Education",
  "Bills",
  "Entertainment",
  "Health",
  "Personal",
  "Savings",
  "Other",
];

export type DbCategory = typeof categories.$inferSelect;
export type DbPlan = typeof monthlyPlans.$inferSelect;
export type DbTransaction = typeof transactions.$inferSelect;

const DEFAULT_MONTHLY_SALARY = 65000;
const DEFAULT_BUDGET_ALLOCATION_SEED = [
  { name: "Food", plannedAmount: 12000 },
  { name: "Travel", plannedAmount: 7000 },
  { name: "Shopping", plannedAmount: 10000 },
  { name: "Education", plannedAmount: 6000 },
  { name: "Bills", plannedAmount: 18000 },
  { name: "Entertainment", plannedAmount: 5000 },
  { name: "Health", plannedAmount: 5000 },
  { name: "Personal", plannedAmount: 3500 },
  { name: "Savings", plannedAmount: 15000 },
  { name: "Other", plannedAmount: 3000 },
] as const;

const DEFAULT_TRANSACTION_SEED = [
  { type: "expense", description: "Groceries", amount: 5200, categoryName: "Food", paymentMethod: "Card", day: 4 },
  { type: "expense", description: "Electricity bill", amount: 6800, categoryName: "Bills", paymentMethod: "UPI", day: 7 },
  { type: "expense", description: "Weekend travel", amount: 4200, categoryName: "Travel", paymentMethod: "Card", day: 13 },
  { type: "income", description: "Freelance project", amount: 8500, categoryName: null, paymentMethod: "Bank Transfer", day: 18 },
] as const;

export async function ensureDefaultCategories() {
  const db = getDb();
  const existing = await db.select().from(categories);

  if (existing.length === 0) {
    await db.insert(categories).values(
      DEFAULT_CATEGORY_NAMES.map((name) => ({
        name,
      })),
    );
  }

  return db.select().from(categories);
}

export async function getMonthlyPlanByKey(month: number, year: number) {
  const db = getDb();
  const [plan] = await db
    .select()
    .from(monthlyPlans)
    .where(and(eq(monthlyPlans.month, month), eq(monthlyPlans.year, year)))
    .limit(1);

  return plan ?? null;
}

export async function getOrCreateMonthlyPlan(month: number, year: number, salary = 0) {
  const db = getDb();
  const existing = await getMonthlyPlanByKey(month, year);

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(monthlyPlans)
    .values({
      month,
      year,
      salary: String(salary),
    })
    .returning();

  return created;
}

export async function ensureDefaultMonthlyData(month: number, year: number) {
  const db = getDb();
  const categories = await ensureDefaultCategories();
  const plan = await getOrCreateMonthlyPlan(month, year, DEFAULT_MONTHLY_SALARY);

  const existingAllocations = await db
    .select()
    .from(budgetAllocations)
    .where(eq(budgetAllocations.monthlyPlanId, plan.id));

  if (existingAllocations.length === 0) {
    const categoryMap = new Map(categories.map((category) => [category.name, category]));
    const values = DEFAULT_BUDGET_ALLOCATION_SEED.map((entry) => {
      const category = categoryMap.get(entry.name);
      if (!category) {
        return null;
      }
      return {
        monthlyPlanId: plan.id,
        categoryId: category.id,
        plannedAmount: String(entry.plannedAmount),
      };
    }).filter((entry): entry is { monthlyPlanId: number; categoryId: number; plannedAmount: string } => entry !== null);

    if (values.length > 0) {
      await db.insert(budgetAllocations).values(values);
    }
  }

  const existingTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.monthlyPlanId, plan.id));

  if (existingTransactions.length === 0) {
    const categoryMap = new Map(categories.map((category) => [category.name, category]));

    const values = DEFAULT_TRANSACTION_SEED.map((entry) => ({
      monthlyPlanId: plan.id,
      categoryId: entry.categoryName ? categoryMap.get(entry.categoryName)?.id ?? null : null,
      type: entry.type,
      amount: String(entry.amount),
      description: entry.description,
      date: new Date(year, month - 1, entry.day),
      paymentMethod: entry.paymentMethod,
      notes: entry.type === "income" ? "Seeded monthly entry" : "Seeded sample expense",
    }));

    if (values.length > 0) {
      await db.insert(transactions).values(values);
    }
  }

  const allocations = await db
    .select()
    .from(budgetAllocations)
    .where(eq(budgetAllocations.monthlyPlanId, plan.id));

  return {
    plan,
    categories,
    allocations,
  };
}

export async function getMonthlyPlanWithAllocations(month: number, year: number) {
  const seed = await ensureDefaultMonthlyData(month, year);
  const db = getDb();
  const allocations = await db
    .select()
    .from(budgetAllocations)
    .where(eq(budgetAllocations.monthlyPlanId, seed.plan.id));

  const entries = allocations.map((allocation) => {
    const category = seed.categories.find((entry) => entry.id === allocation.categoryId);
    return {
      ...allocation,
      name: category?.name ?? "Unknown",
    };
  });

  return {
    plan: seed.plan,
    allocations: entries,
    categories: seed.categories,
  };
}

export async function getDashboardData(month: number, year: number) {
  const db = getDb();
  const seed = await ensureDefaultMonthlyData(month, year);
  const plan = seed.plan;
  const allocations = await db
    .select()
    .from(budgetAllocations)
    .where(eq(budgetAllocations.monthlyPlanId, plan.id));
  const categoryList = await ensureDefaultCategories();
  const allTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.monthlyPlanId, plan.id));

  const totalPlanned = allocations.reduce(
    (sum, allocation) => sum + Number(allocation.plannedAmount || 0),
    0,
  );

  const totalIncome = Number(plan.salary || 0) + allTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const totalExpenses = allTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const remainingBalance = totalIncome - totalExpenses;
  const savings = totalIncome - totalExpenses;
  const unallocatedBudget = Number(plan.salary || 0) - totalPlanned;

  const categoryBreakdown = categoryList.map((category) => {
    const expenseTotal = allTransactions
      .filter(
        (transaction) =>
          transaction.type === "expense" && transaction.categoryId === category.id,
      )
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    const plannedAmount = allocations.find((entry) => entry.categoryId === category.id)
      ? Number(
          allocations.find((entry) => entry.categoryId === category.id)?.plannedAmount || 0,
        )
      : 0;

    const remaining = plannedAmount - expenseTotal;
    const progress = plannedAmount > 0 ? Math.min((expenseTotal / plannedAmount) * 100, 100) : 0;

    return {
      categoryId: category.id,
      name: category.name,
      plannedAmount,
      spentAmount: expenseTotal,
      remaining,
      progress,
      hasPlan: plannedAmount > 0,
    };
  });

  const recentTransactions = [...allTransactions]
    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
    .slice(0, 5)
    .map((transaction) => {
      const category = categoryList.find((entry) => entry.id === transaction.categoryId);
      return {
        ...transaction,
        categoryName: category?.name ?? "Uncategorized",
      };
    });

  return {
    plan,
    totalIncome,
    totalExpenses,
    remainingBalance,
    savings,
    totalPlanned,
    unallocatedBudget,
    categoryBreakdown,
    recentTransactions,
    defaultCategories: categoryList,
  };
}

export async function getAnalyticsData(month: number, year: number) {
  const db = getDb();
  const plan = await getOrCreateMonthlyPlan(month, year, 0);
  const categoryList = await ensureDefaultCategories();
  const transactionsForMonth = await db
    .select()
    .from(transactions)
    .where(eq(transactions.monthlyPlanId, plan.id));

  const expenses = transactionsForMonth.filter((transaction) => transaction.type === "expense");
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const categoryTotals = categoryList.map((category) => {
    const spent = expenses
      .filter((transaction) => transaction.categoryId === category.id)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      name: category.name,
      value: spent,
    };
  });

  const highestSpendingCategory = [...categoryTotals].sort((a, b) => b.value - a.value)[0] ?? {
    name: "N/A",
    value: 0,
  };
  const lowestSpendingCategory = [...categoryTotals].sort((a, b) => a.value - b.value)[0] ?? {
    name: "N/A",
    value: 0,
  };

  const dayCount = new Date(year, month, 0).getDate();
  const averageDailySpending = dayCount > 0 ? totalExpenses / dayCount : 0;

  const allocations = await db
    .select()
    .from(budgetAllocations)
    .where(eq(budgetAllocations.monthlyPlanId, plan.id));
  const plannedAmount = allocations.reduce((sum, item) => sum + Number(item.plannedAmount || 0), 0);

  const previousMonth = month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year };
  const previousPlan = await getMonthlyPlanByKey(previousMonth.month, previousMonth.year);
  let previousTotal = 0;

  if (previousPlan) {
    const previousExpenses = await db
      .select()
      .from(transactions)
      .where(eq(transactions.monthlyPlanId, previousPlan.id));
    previousTotal = previousExpenses
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }

  const months = [
    { name: "Actual", value: totalExpenses },
    { name: "Planned", value: plannedAmount },
  ];

  const totalIncome = Number(plan.salary || 0) + transactionsForMonth
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return {
    totalExpenses,
    highestSpendingCategory,
    lowestSpendingCategory,
    averageDailySpending,
    plannedVsActual: months,
    monthOverMonth: {
      current: totalExpenses,
      previous: previousTotal,
      delta: totalExpenses - previousTotal,
    },
    categoryTotals,
    estimatedMonthEnd: totalExpenses + (averageDailySpending * Math.max(0, new Date().getDate() - 1)),
    totalIncome,
    plannedAmount,
    savings: totalIncome - totalExpenses,
  };
}

export async function upsertAllocation(planId: number, categoryId: number, plannedAmount: number) {
  const db = getDb();
  const existing = await db
    .select()
    .from(budgetAllocations)
    .where(
      and(
        eq(budgetAllocations.monthlyPlanId, planId),
        eq(budgetAllocations.categoryId, categoryId),
      ),
    )
    .limit(1);

  if (existing[0]) {
    const [updated] = await db
      .update(budgetAllocations)
      .set({ plannedAmount: String(plannedAmount), updatedAt: new Date() })
      .where(eq(budgetAllocations.id, existing[0].id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(budgetAllocations)
    .values({
      monthlyPlanId: planId,
      categoryId,
      plannedAmount: String(plannedAmount),
    })
    .returning();

  return created;
}
