const fs = require('fs');
const path = '.env.local';
const text = fs.readFileSync(path, 'utf8');
for (const line of text.split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
  if (match) {
    process.env[match[1]] = match[2].replace(/^"|"$/g, '');
  }
}
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
console.log('URL set?', !!process.env.DATABASE_URL);
(async () => {
  try {
    const dbInfo = await sql`SELECT current_database(), current_schema(), current_user;`;
    console.log('dbInfo', JSON.stringify(dbInfo, null, 2));

    await sql.unsafe('CREATE TABLE IF NOT EXISTS test_temp (id integer primary key, name text);');
    console.log('create test_temp done');

    const tables = await sql`SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`;
    console.log('pg_tables', JSON.stringify(tables, null, 2));

    const sample = await sql`SELECT * FROM test_temp LIMIT 1;`;
    console.log('test_temp sample:', JSON.stringify(sample, null, 2));
  } catch (e) {
    console.error('DB_ERR', e.message);
    console.error(e.stack);
    process.exit(1);
  }
})();
