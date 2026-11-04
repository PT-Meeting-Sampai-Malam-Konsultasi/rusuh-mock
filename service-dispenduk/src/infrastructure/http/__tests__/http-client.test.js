const { createHttpClient, redactHeaders } = require('@/infrastructure/http/http-client');

describe('HTTP client', () => {
  test('redacts sensitive headers', () => {
    expect(redactHeaders({ Authorization: 'secret', Accept: 'application/json', 'x-api-key': 'key' })).toEqual({
      Authorization: '[REDACTED]',
      Accept: 'application/json',
      'x-api-key': '[REDACTED]'
    });
  });

  test('propagates supported correlation headers and timeout', async () => {
    const CommonHttpRequest = jest.fn().mockResolvedValue({ status: 200 });
    const platform = {
      CommonHttpRequest,
      LoggerBuilder: {
        getLogger: jest.fn(() => ({
          addTags: jest.fn().mockReturnThis(),
          addData: jest.fn().mockReturnThis(),
          info: jest.fn()
        }))
      }
    };
    const client = createHttpClient({ timeoutMs: 2000, platform });

    await expect(
      client.request(
        { method: 'GET', url: 'https://example.invalid' },
        { headers: { transactionid: 'tx-1', 'x-msisdn': '123' } }
      )
    ).resolves.toEqual({
      status: 200
    });

    expect(CommonHttpRequest).toHaveBeenCalledWith(
      expect.any(Object),
      '123',
      expect.objectContaining({
        timeout: 2000,
        rejectUnauthorized: true,
        headers: { transactionid: 'tx-1', 'x-msisdn': '123' }
      })
    );
  });
});
