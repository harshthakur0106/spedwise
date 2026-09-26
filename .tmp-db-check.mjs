import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

console.log('URL set?', !!process.env.DATABASE_URL);

const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`;
console.log(JSON.stringify(tables, null, 2));

try {
  const res = await sql`SELECT * FROM monthly_plans LIMIT 1;`;
  console.log('monthly_plans sample:', JSON.stringify(res, null, 2));
} catch (e) {
  console.error('monthly_plans error:', e.message);
}
