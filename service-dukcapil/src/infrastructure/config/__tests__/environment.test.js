const { loadEnvironment, parseCorsOrigins, DEFAULT_CORS_ORIGINS } = require('@/infrastructure/config/environment');

describe('environment configuration', () => {
  test('loads defaults and ignores unrelated variables', () => {
    const config = loadEnvironment({ PATH: '/usr/bin', HOME: '/root', PORT: '18081' });

    expect(config.port).toBe(18081);
  });

  test('rejects invalid known variables', () => {
    expect(() => loadEnvironment({ PORT: 'not-a-port' })).toThrow('Invalid environment configuration');
  });

  test('parses custom CORS origins', () => {
    expect(parseCorsOrigins('https://a.example, https://b.example')).toEqual([
      'https://a.example',
      'https://b.example'
    ]);
  });

  test('falls back to defaults for unset, empty, or blank CORS origins', () => {
    expect(parseCorsOrigins()).toEqual([...DEFAULT_CORS_ORIGINS]);
    expect(parseCorsOrigins('')).toEqual([...DEFAULT_CORS_ORIGINS]);
    expect(parseCorsOrigins(' , , ')).toEqual([...DEFAULT_CORS_ORIGINS]);
  });

  test('loads CORS origins from the environment', () => {
    expect(loadEnvironment({ CORS_ORIGINS: 'https://a.example' }).corsOrigins).toEqual(['https://a.example']);
    expect(loadEnvironment({}).corsOrigins).toEqual([...DEFAULT_CORS_ORIGINS]);
    expect(loadEnvironment({ CORS_ORIGINS: '' }).corsOrigins).toEqual([...DEFAULT_CORS_ORIGINS]);
  });
});
