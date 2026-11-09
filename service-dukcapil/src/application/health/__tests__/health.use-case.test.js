const { createHealthUseCase } = require('@/application/health/health.use-case');

describe('health use case', () => {
  test('reports live status', () => {
    expect(createHealthUseCase().live()).toEqual({ status: 'ok' });
  });

  test('reports ready when the default verification self-test passes', async () => {
    await expect(createHealthUseCase().ready()).resolves.toEqual({ status: 'ready' });
  });

  test('reports ready when an injected predicate passes', async () => {
    const useCase = createHealthUseCase({ isReady: async () => true });

    await expect(useCase.ready()).resolves.toEqual({ status: 'ready' });
  });

  test('reports not_ready when an injected predicate fails', async () => {
    const useCase = createHealthUseCase({ isReady: async () => false });

    await expect(useCase.ready()).resolves.toEqual({ status: 'not_ready' });
  });
});
