const { createHealthUseCase } = require('@/application/health/health.use-case');

describe('health use case', () => {
  test('reports live status', () => {
    expect(createHealthUseCase().live()).toEqual({ status: 'ok' });
  });

  test('reports ready status unconditionally', () => {
    expect(createHealthUseCase().ready()).toEqual({ status: 'ready' });
  });
});
