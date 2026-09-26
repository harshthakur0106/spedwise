const fs = require('fs');
const { Client } = require('pg');

const envText = fs.readFileSync('.env.local', 'utf8');
let databaseUrl = '';
for (const line of envText.split(/\r?\n/)) {
  const match = line.match(/^\s*DATABASE_URL=(.*)\s*$/);
  if (match) {
    databaseUrl = match[1].replace(/^"|"$/g, '');
    break;
  }
}

if (!databaseUrl) {
  throw new Error('DATABASE_URL not found in .env.local');
}

const client = new Client({ connectionString: databaseUrl });

(async () => {
  await client.connect();
  const sql = fs.readFileSync('drizzle/001_init.sql', 'utf8');
  const statements = sql.split(';').map((s) => s.trim()).filter(Boolean);

  for (const statement of statements) {
    await client.query(statement);
    console.log('Applied:', statement.split(/\s+/).slice(0, 3).join(' '));
  }

  const result = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
  console.log('tables:', result.rows);
  await client.end();
})();
