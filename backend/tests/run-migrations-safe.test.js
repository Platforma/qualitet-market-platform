'use strict';

const { runMigrationsSafe } = require('../scripts/run-migrations-safe');

describe('runMigrationsSafe', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('runs migrate.js when it exists', () => {
    const fsImpl = { existsSync: jest.fn().mockReturnValue(true) };
    const spawnSyncImpl = jest.fn().mockReturnValue({ status: 0 });

    const result = runMigrationsSafe({
      fsImpl,
      spawnSyncImpl,
      nodeBin: 'node',
      migrationFilePath: '/tmp/migrate.js',
    });

    expect(spawnSyncImpl).toHaveBeenCalledWith('node', ['/tmp/migrate.js'], { stdio: 'inherit' });
    expect(result).toEqual({ skipped: false, status: 0 });
  });

  it('skips migrations when migrate.js is missing', () => {
    const fsImpl = { existsSync: jest.fn().mockReturnValue(false) };
    const spawnSyncImpl = jest.fn();

    const result = runMigrationsSafe({
      fsImpl,
      spawnSyncImpl,
      migrationFilePath: '/tmp/missing-migrate.js',
    });

    expect(spawnSyncImpl).not.toHaveBeenCalled();
    expect(result).toEqual({ skipped: true });
  });

  it('throws when spawning the migration process fails', () => {
    const fsImpl = { existsSync: jest.fn().mockReturnValue(true) };
    const spawnSyncImpl = jest.fn().mockReturnValue({
      error: new Error('spawn failed'),
      status: null,
    });

    expect(() =>
      runMigrationsSafe({
        fsImpl,
        spawnSyncImpl,
        migrationFilePath: '/tmp/migrate.js',
      })
    ).toThrow('spawn failed');
  });

  it('throws with the child exit code when migrations fail', () => {
    const fsImpl = { existsSync: jest.fn().mockReturnValue(true) };
    const spawnSyncImpl = jest.fn().mockReturnValue({ status: 3 });

    expect(() =>
      runMigrationsSafe({
        fsImpl,
        spawnSyncImpl,
        migrationFilePath: '/tmp/migrate.js',
      })
    ).toThrow('Migration process exited with code 3');

    try {
      runMigrationsSafe({
        fsImpl,
        spawnSyncImpl,
        migrationFilePath: '/tmp/migrate.js',
      });
    } catch (error) {
      expect(error.exitCode).toBe(3);
    }
  });
});
