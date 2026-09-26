CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  "name" VARCHAR(120) NOT NULL UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monthly_plans (
  id SERIAL PRIMARY KEY,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS monthly_plans_month_year_unique
  ON monthly_plans (month, year);

CREATE TABLE IF NOT EXISTS budget_allocations (
  id SERIAL PRIMARY KEY,
  "monthlyPlanId" INTEGER NOT NULL REFERENCES monthly_plans(id) ON DELETE CASCADE,
  "categoryId" INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  "plannedAmount" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS budget_allocations_monthly_plan_id_category_id_unique
  ON budget_allocations ("monthlyPlanId", "categoryId");

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  "monthlyPlanId" INTEGER NOT NULL REFERENCES monthly_plans(id) ON DELETE CASCADE,
  "categoryId" INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  type VARCHAR(16) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  "paymentMethod" VARCHAR(24) NOT NULL DEFAULT 'Other',
  notes VARCHAR(500),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS transactions_monthly_plan_idx
  ON transactions ("monthlyPlanId");

CREATE INDEX IF NOT EXISTS transactions_date_idx
  ON transactions (date);
