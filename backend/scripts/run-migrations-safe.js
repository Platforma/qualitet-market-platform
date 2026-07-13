const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const migrationFile = path.join(__dirname, '..', 'migrations', 'migrate.js');

function runMigrationsSafe({
  fsImpl = fs,
  spawnSyncImpl = spawnSync,
  nodeBin = process.execPath,
  migrationFilePath = migrationFile,
} = {}) {
  if (!fsImpl.existsSync(migrationFilePath)) {
    console.log(`[startup] No migration file found at ${migrationFilePath}; skipping migrations.`);
    return { skipped: true };
  }

  console.log(`[startup] Running migrations: ${migrationFilePath}`);
  const result = spawnSyncImpl(nodeBin, [migrationFilePath], { stdio: 'inherit' });

  if (result.error) {
    const error = new Error(`Failed to spawn migration process: ${result.error.message}`);
    error.cause = result.error;
    throw error;
  }

  if (result.status !== 0) {
    const error = new Error(`Migration process exited with code ${result.status}`);
    error.exitCode = result.status || 1;
    throw error;
  }

  return { skipped: false, status: result.status };
}

if (require.main === module) {
  try {
    runMigrationsSafe();
  } catch (error) {
    console.error('[startup] Failed to run migrations:', error.message);
    process.exit(error.exitCode || 1);
  }
}

module.exports = { migrationFile, runMigrationsSafe };
