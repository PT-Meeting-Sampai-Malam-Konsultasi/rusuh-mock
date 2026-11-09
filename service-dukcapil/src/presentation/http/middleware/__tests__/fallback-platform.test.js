const fallback = require('@/presentation/http/middleware/fallback-platform');

describe('fallback platform (presentation-local no-op)', () => {
  test('logger chain is a no-op that returns the logger', () => {
    const logger = fallback.LoggerBuilder.getLogger();

    expect(logger.addTags(['x'])).toBe(logger);
    expect(logger.addData({})).toBe(logger);
    expect(() => logger.info('hi')).not.toThrow();
    expect(() => logger.error('hi')).not.toThrow();
    expect(fallback.LoggerBuilder.getMetadataFromRequest({})).toEqual({});
  });

  test('helpers are no-ops', () => {
    expect(fallback.logRequest()).toEqual({});
    expect(fallback.unifyResponse()).toBeUndefined();
  });

  test('preHandler passes through', () => {
    const next = jest.fn();

    fallback.preHandler({}, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
