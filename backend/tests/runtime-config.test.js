'use strict';

const request = require('supertest');

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
}));

describe('production runtime config', () => {
  const originalEnv = process.env;

  afterEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('rejects production startup without JWT_SECRET', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      JWT_SECRET: '',
      ALLOWED_ORIGINS: 'https://qualitet-market.com',
    };

    expect(() => require('../src/app')).toThrow(
      'JWT_SECRET musi być ustawiony na bezpieczną wartość w środowisku production'
    );
  });

  it('warns instead of crashing when ALLOWED_ORIGINS is not set in production', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      JWT_SECRET: 'super-secure-production-secret',
      ALLOWED_ORIGINS: '',
    };

    expect(() => require('../src/app')).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith(
      'ALLOWED_ORIGINS nie jest ustawione — używam pustej listy'
    );

    warnSpy.mockRestore();
  });

  it('rejects requests from origins outside the production allowlist', async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      JWT_SECRET: 'super-secure-production-secret',
      ALLOWED_ORIGINS: 'https://qualitet-market.com',
    };

    const app = require('../src/app');
    const res = await request(app)
      .get('/health')
      .set('Origin', 'https://evil.example');

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'Origin not allowed by CORS' });
  });

  it('allows requests from configured production origins', async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      JWT_SECRET: 'super-secure-production-secret',
      ALLOWED_ORIGINS: 'https://qualitet-market.com',
    };

    const app = require('../src/app');
    const res = await request(app)
      .get('/health')
      .set('Origin', 'https://qualitet-market.com');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://qualitet-market.com');
  });
});
