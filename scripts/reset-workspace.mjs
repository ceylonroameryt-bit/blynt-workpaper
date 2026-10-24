// Wipes the persisted workspace so the app starts fresh from the built-in seed
// (test users, no clients). Usage: DATABASE_URL=... npm run reset-workspace -- --yes
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Without it the app keeps state in memory; restart the dev server instead.');
  process.exit(1);
}
if (!process.argv.includes('--yes')) {
  console.error('This deletes all saved workspace data and attachment files. Re-run with --yes to confirm.');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query('BEGIN');
  const { rows } = await client.query(
    `SELECT to_regclass('workspace_state') IS NOT NULL AS ws, to_regclass('attachment_files') IS NOT NULL AS files`
  );
  const ws = rows[0].ws ? await client.query(`DELETE FROM workspace_state WHERE id = 'default'`) : { rowCount: 0 };
  const files = rows[0].files ? await client.query('DELETE FROM attachment_files') : { rowCount: 0 };
  await client.query('COMMIT');
  console.log(`Workspace reset: ${ws.rowCount} workspace row(s), ${files.rowCount} attachment file(s) removed.`);
  console.log('Reload the app (clear the tab) to load the fresh seed with the test users.');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  await client.end();
}
