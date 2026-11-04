const { createMemoryCache } = require('@/infrastructure/cache/memory-cache');

describe('memory cache', () => {
  test('stores, retrieves, deletes, and clears values', () => {
    const cache = createMemoryCache({ maxEntries: 2, ttlMs: 1000 });
    cache.set('one', { value: 1 });
    expect(cache.get('one')).toEqual({ value: 1 });

    expect(cache.delete('one')).toBe(true);
    expect(cache.get('one')).toBeUndefined();

    cache.set('two', 2);
    cache.clear();
    expect(cache.get('two')).toBeUndefined();
  });
});
