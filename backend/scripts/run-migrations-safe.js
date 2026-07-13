const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const migrationFile = path.join(__dirname, '..', 'migrations', 'migrate.js');

if (fs.existsSync(migrationFile)) {
  console.log(`[startup] Running migrations: ${migrationFile}`);
  const result = spawnSync('node', [migrationFile], { stdio: 'inherit' });

  if (result.error) {
    console.error('[startup] Failed to run migrations:', result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`[startup] Migration process exited with code ${result.status}`);
    process.exit(result.status || 1);
  }
} else {
  console.log(`[startup] No migration file found at ${migrationFile}; skipping migrations.`);
}
