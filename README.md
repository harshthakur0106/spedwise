# SpendWise

SpendWise is a personal finance and monthly budget planner built with Next.js, Tailwind CSS, Drizzle ORM, and Neon PostgreSQL. It is designed to run as a single Next.js app on Vercel without a separate backend service.

## Features

- Dashboard with monthly salary, income, expenses, monthly balance, and budget progress
- Budget planner with category allocation tracking
- Transactions page with add and list workflows
- Analytics page with spending breakdown and estimates
- Server-side database access only through the `DATABASE_URL` environment variable
- Vercel-ready structure for deployment

## Installation

1. Clone the repository.
2. Change into the project folder.
3. Install dependencies:

```bash
npm install
```

## Neon PostgreSQL Setup

1. Create a Neon project in the Neon console.
2. Copy the connection string for your database.
3. Create a local `.env.local` file from `.env.example`.

```bash
cp .env.example .env.local
```

4. Replace the placeholder values with your actual Neon database URL.

Example:

```env
DATABASE_URL=postgres://user:password@host:5432/database?sslmode=require
NEXT_PUBLIC_APP_NAME=SpendWise
```

> Never commit `.env.local` or expose the database URL in client-side code. The app reads it only on the server using `process.env.DATABASE_URL`.

## Database Migrations

Generate and run the Drizzle schema:

```bash
npm run db:generate
npm run db:migrate
```

If you are using Vercel, set the `DATABASE_URL` variable in the project environment in the Vercel dashboard before deploying.

## Local Development

Start the app:

```bash
npm run dev
```

Open the app in your browser:

```text
http://localhost:3000
```

## Vercel Deployment

1. Push the repository to GitHub.
2. Create a new Vercel project and import the repository.
3. In the Vercel project settings, add the environment variable:
   - `DATABASE_URL`
4. Make sure the project root is the repository root.
5. Deploy the project.

The app is configured to use server-side access to PostgreSQL and is compatible with Vercel serverless deployment.

## GitHub Setup

1. Create a new GitHub repository.
2. Commit the project files.
3. Push the repository to your GitHub account.
4. Connect the repository to Vercel.

## Notes

- The app intentionally shows a clear configuration error when `DATABASE_URL` is missing instead of silently falling back to mock data.
- Optional seed data can be added only in development, and no fake financial records are inserted automatically in production.
