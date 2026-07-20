'use strict';

/**
 * Simple migration runner – applies SQL files from this directory in order.
 * Usage:  node migrations/migrate.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// ─── Migration filename helpers ───────────────────────────────────────────────

/**
 * Parse a migration filename into its sortable components.
 *
 * Accepted format:  NNN[a-z]_description.sql
 * Examples:
 *   001_initial_schema.sql   → { num: 1,  suffix: '',  filename: '001_initial_schema.sql' }
 *   020_creator_referrals.sql→ { num: 20, suffix: '',  filename: '020_creator_referrals.sql' }
 *   020a_live_commerce.sql   → { num: 20, suffix: 'a', filename: '020a_live_commerce.sql' }
 *   007b_suppliers_import.sql→ { num: 7,  suffix: 'b', filename: '007b_suppliers_import.sql' }
 *
 * Returns null for filenames that do not match the expected pattern.
 */
function parseMigrationName(filename) {
  const match = /^(\d+)([a-z]?)_.*\.sql$/.exec(filename);
  if (!match) return null;
  return {
    num: parseInt(match[1], 10),
    suffix: match[2],
    filename,
  };
}

/**
 * Sort an array of SQL migration filenames deterministically.
 *
 * Order: numeric prefix ASC → alphabetic suffix ASC ('' < 'a' < 'b') → filename ASC.
 * Files that do not match the migration naming convention are skipped with a warning.
 *
 * @param {string[]} files  Raw list of filenames (basenames only)
 * @returns {string[]}      Sorted, valid migration filenames
 */
function sortMigrationFiles(files) {
  const parsed = [];
  for (const f of files) {
    const p = parseMigrationName(f);
    if (!p) {
      console.warn(`[migrate] skipping non-migration file: ${f}`);
      continue;
    }
    parsed.push(p);
  }

  parsed.sort((a, b) => {
    if (a.num !== b.num) return a.num - b.num;
    if (a.suffix !== b.suffix) return a.suffix < b.suffix ? -1 : 1;
    // Defensive guard for duplicate inputs supplied by tests or future callers.
    if (a.filename === b.filename) return 0;
    return a.filename < b.filename ? -1 : 1;
  });

  return parsed.map((p) => p.filename);
}

// ─── Runner ────────────────────────────────────────────────────────────────────

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    // Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const applied = await client.query('SELECT filename FROM _migrations ORDER BY filename');
    const appliedSet = new Set(applied.rows.map((r) => r.filename));

    const migrationsDir = __dirname;
    const files = sortMigrationFiles(
      fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'))
    );

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`[skip] ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      console.log(`[apply] ${file}`);

      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');

      console.log(`[done]  ${file}`);
    }

    console.log('All migrations complete.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  run();
}

module.exports = { parseMigrationName, sortMigrationFiles };
