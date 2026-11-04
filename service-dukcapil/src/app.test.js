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

  test('verifies a known NIK and name', async () => {
    const app = createApp({ config, platform });
    const response = await request(app)
      .post('/api/v1/verifications')
      .send({ nik: '9901010101900001', name: 'Budi Santoso' });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      nik: '9901010101900001',
      valid: true,
      name: 'Budi Santoso',
      reason: null
    });
  });

  test('reports name mismatch and unknown NIK as valid:false, not errors', async () => {
    const app = createApp({ config, platform });

    await expect(
      request(app).post('/api/v1/verifications').send({ nik: '9901010101900001', name: 'Siti Rahma' })
    ).resolves.toMatchObject({
      status: 200,
      body: { data: { valid: false, reason: 'NAME_MISMATCH' } }
    });

    await expect(
      request(app).post('/api/v1/verifications').send({ nik: '9901010101900099', name: 'Nobody Here' })
    ).resolves.toMatchObject({
      status: 200,
      body: { data: { valid: false, reason: 'NIK_NOT_FOUND' } }
    });
  });

  test('returns validation, malformed JSON, and not-found errors safely', async () => {
    const app = createApp({ config, platform });

    await expect(request(app).post('/api/v1/verifications').send({ nik: '123', name: 'Budi' })).resolves.toMatchObject({
      status: 400
    });
    await expect(request(app).post('/api/v1/verifications').send({ nik: '9901010101900001' })).resolves.toMatchObject({
      status: 400
    });
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
      .send('{"nik":"9901010101900001","nik":"9901010101900002","name":"Budi Santoso"}');

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Duplicate JSON key detected');
  });
});
