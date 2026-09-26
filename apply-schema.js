const fs = require('fs');

const text = fs.readFileSync('.env.local', 'utf8');
for (const line of text.split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
  if (match) {
    process.env[match[1]] = match[2].replace(/^"|"$/g, '');
  }
}

const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  const migrationSql = fs.readFileSync('drizzle/001_init.sql', 'utf8');
  const statements = migrationSql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql.unsafe(statement);
    console.log('Applied:', statement.split(/\s+/).slice(0, 3).join(' '));
  }

  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`;
  console.log('Tables:', JSON.stringify(tables, null, 2));
})();
