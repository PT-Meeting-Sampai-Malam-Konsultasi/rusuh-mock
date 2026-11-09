const request = require('supertest');
const { createApp } = require('@/app');

const platform = {
  unifyResponse: jest.fn(),
  logRequest: jest.fn(() => ({})),
  LoggerBuilder: {
    getLogger: jest.fn(() => ({
      addTags: jest.fn().mockReturnThis(),
      addData: jest.fn().mockReturnThis(),
      info: jest.fn(),
      error: jest.fn()
    })),
    getMetadataFromRequest: jest.fn(() => ({}))
  }
};

const config = {
  bodyLimit: '100kb',
  enableDuplicateJsonKeyValidation: false
};

describe('application factory', () => {
  test('serves operational endpoints without a platform envelope', async () => {
    const app = createApp({ config, platform });

    await expect(request(app).get('/sys/ping')).resolves.toMatchObject({ status: 200, text: 'ok' });
    await expect(request(app).get('/health/live')).resolves.toMatchObject({ status: 200, body: { status: 'ok' } });
    await expect(request(app).get('/health/ready')).resolves.toMatchObject({ status: 200, body: { status: 'ready' } });
  });

  test('verifies a known NIK', async () => {
    const app = createApp({ config, platform });
    const response = await request(app).post('/api/v1/verifications').send({ nik: '3171010101900001' });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ nik: '3171010101900001', valid: true, reason: null });
  });

  test('accepts a format-valid NIK that is not in the fixture dataset', async () => {
    const app = createApp({ config, platform });

    await expect(request(app).post('/api/v1/verifications').send({ nik: '3171010101900099' })).resolves.toMatchObject({
      status: 200,
      body: { data: { nik: '3171010101900099', valid: true, reason: null } }
    });
  });

  test('reports format-invalid NIKs as valid:false with the single reason code, not an error', async () => {
    const app = createApp({ config, platform });
    const cases = [
      '123',
      '31710101019000AB',
      '3171010113900001',
      '3171013201900001',
      '3171013002900001',
      '3171010101900000'
    ];

    const responses = await Promise.all(cases.map((nik) => request(app).post('/api/v1/verifications').send({ nik })));
    responses.forEach((response, index) => {
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        nik: cases[index],
        valid: false,
        reason: 'NIK_INVALID_FORMAT'
      });
    });
  });

  test('reports not_ready when the readiness check fails', async () => {
    const app = createApp({ config, platform, isReady: async () => false });

    await expect(request(app).get('/health/ready')).resolves.toMatchObject({
      status: 503,
      body: { status: 'not_ready' }
    });
  });

  test('returns validation, malformed JSON, and not-found errors safely', async () => {
    const app = createApp({ config, platform });

    await expect(request(app).post('/api/v1/verifications').send({})).resolves.toMatchObject({ status: 400 });
    await expect(
      request(app).post('/api/v1/verifications').set('Content-Type', 'application/json').send('{')
    ).resolves.toMatchObject({
      status: 400,
      body: { error: 'Bad Request' }
    });
    await expect(request(app).get('/unknown')).resolves.toMatchObject({ status: 404 });
  });

  test('rejects duplicate JSON keys only when configured', async () => {
    const app = createApp({ config: { ...config, enableDuplicateJsonKeyValidation: true }, platform });
    const response = await request(app)
      .post('/api/v1/verifications')
      .set('Content-Type', 'application/json')
      .send('{"nik":"3171010101900001","nik":"3171010101900002"}');

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Duplicate JSON key detected');
  });
});
