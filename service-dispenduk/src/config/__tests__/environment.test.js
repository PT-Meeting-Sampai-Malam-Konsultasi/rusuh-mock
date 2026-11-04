const { loadEnvironment } = require('@/config/environment');

describe('environment configuration', () => {
  test('loads defaults and ignores unrelated variables', () => {
    const config = loadEnvironment({ PATH: '/usr/bin', HOME: '/root', PORT: '18081' });

    expect(config.port).toBe(18081);
    expect(config.cache.enabled).toBe(false);
  });

  test('rejects invalid known variables', () => {
    expect(() => loadEnvironment({ PORT: 'not-a-port' })).toThrow('Invalid environment configuration');
  });
});
