const { createConfigDbClient } = require('@/infrastructure/config-db/config-db.client');

describe('configuration database adapter', () => {
  test('does not call an adopter lookup when disabled', async () => {
    const fetchConfig = jest.fn();
    const client = createConfigDbClient({ enabled: false, fetchConfig });

    await expect(client.get('example')).resolves.toBeUndefined();
    expect(fetchConfig).not.toHaveBeenCalled();
  });

  test('delegates lookups and refreshes when enabled', async () => {
    const fetchConfig = jest.fn().mockResolvedValue({ enabled: true });
    const refreshConfig = jest.fn().mockResolvedValue();
    const client = createConfigDbClient({ enabled: true, fetchConfig, refreshConfig });

    await expect(client.get('example', { traceId: 'trace-1' })).resolves.toEqual({ enabled: true });
    await client.refresh();

    expect(fetchConfig).toHaveBeenCalledWith('example', { traceId: 'trace-1' });
    expect(refreshConfig).toHaveBeenCalledTimes(1);
  });
});
