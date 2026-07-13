'use strict';

const { parseMigrationName, sortMigrationFiles } = require('../migrations/migrate');

// ─── parseMigrationName ───────────────────────────────────────────────────────

describe('parseMigrationName', () => {
  it('parses a plain numbered migration', () => {
    expect(parseMigrationName('001_initial_schema.sql')).toEqual({
      num: 1,
      suffix: '',
      filename: '001_initial_schema.sql',
    });
  });

  it('parses a migration with an alphabetic suffix', () => {
    expect(parseMigrationName('020a_live_commerce.sql')).toEqual({
      num: 20,
      suffix: 'a',
      filename: '020a_live_commerce.sql',
    });
  });

  it('parses a multi-digit prefix with suffix', () => {
    expect(parseMigrationName('007b_suppliers_import.sql')).toEqual({
      num: 7,
      suffix: 'b',
      filename: '007b_suppliers_import.sql',
    });
  });

  it('returns null for a non-migration SQL file', () => {
    expect(parseMigrationName('seed_data.sql')).toBeNull();
  });

  it('returns null for a file without the underscore separator', () => {
    expect(parseMigrationName('001initial.sql')).toBeNull();
  });

  it('returns null for a non-SQL file', () => {
    expect(parseMigrationName('migrate.js')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(parseMigrationName('')).toBeNull();
  });
});

// ─── sortMigrationFiles ───────────────────────────────────────────────────────

describe('sortMigrationFiles', () => {
  it('sorts by numeric prefix ascending', () => {
    const input = ['003_product_status.sql', '001_initial_schema.sql', '002_extended_schema.sql'];
    expect(sortMigrationFiles(input)).toEqual([
      '001_initial_schema.sql',
      '002_extended_schema.sql',
      '003_product_status.sql',
    ]);
  });

  it('places plain numbers before alphabetic suffixes of the same number', () => {
    const input = ['020a_live_commerce.sql', '020_creator_referrals.sql'];
    expect(sortMigrationFiles(input)).toEqual([
      '020_creator_referrals.sql',
      '020a_live_commerce.sql',
    ]);
  });

  it('sorts alphabetic suffixes in order for the same numeric prefix', () => {
    const input = ['007b_suppliers_import.sql', '007a_subdomain_support.sql', '007_stores_subdomain.sql'];
    expect(sortMigrationFiles(input)).toEqual([
      '007_stores_subdomain.sql',
      '007a_subdomain_support.sql',
      '007b_suppliers_import.sql',
    ]);
  });

  it('falls back to filename order for two files with identical prefix and suffix', () => {
    const input = ['036_script_runs_enabled.sql', '036_marketplace_automation.sql'];
    expect(sortMigrationFiles(input)).toEqual([
      '036_marketplace_automation.sql',
      '036_script_runs_enabled.sql',
    ]);
  });

  it('skips files that do not match the migration naming convention', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const input = ['001_initial_schema.sql', 'seed_data.sql', '002_extended_schema.sql'];
    const result = sortMigrationFiles(input);
    expect(result).toEqual(['001_initial_schema.sql', '002_extended_schema.sql']);
    expect(warnSpy).toHaveBeenCalledWith('[migrate] skipping non-migration file: seed_data.sql');
    warnSpy.mockRestore();
  });

  it('handles a realistic mixed list from the project', () => {
    const input = [
      '041_seed_admin.sql',
      '001_initial_schema.sql',
      '020a_live_commerce.sql',
      '003a_central_catalog.sql',
      '003_product_status.sql',
      '020_creator_referrals.sql',
      '007b_suppliers_import.sql',
      '007a_subdomain_support.sql',
      '007_stores_subdomain.sql',
      '009a_price_tiers.sql',
      '009_platform_price.sql',
    ];
    expect(sortMigrationFiles(input)).toEqual([
      '001_initial_schema.sql',
      '003_product_status.sql',
      '003a_central_catalog.sql',
      '007_stores_subdomain.sql',
      '007a_subdomain_support.sql',
      '007b_suppliers_import.sql',
      '009_platform_price.sql',
      '009a_price_tiers.sql',
      '020_creator_referrals.sql',
      '020a_live_commerce.sql',
      '041_seed_admin.sql',
    ]);
  });
});
