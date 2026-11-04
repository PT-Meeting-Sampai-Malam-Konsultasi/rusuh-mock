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

  test('creates and reads a sample resource', async () => {
    const app = createApp({ config, platform });
    const createResponse = await request(app)
      .post('/api/v1/sample-resources')
      .send({ name: 'Example', description: 'Example description' });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.name).toBe('Example');

    const readResponse = await request(app).get(`/api/v1/sample-resources/${createResponse.body.data.id}`);
    expect(readResponse.status).toBe(200);
    expect(readResponse.body.data).toEqual(createResponse.body.data);
  });

  test('returns validation, malformed JSON, and not-found errors safely', async () => {
    const app = createApp({ config, platform });

    await expect(request(app).post('/api/v1/sample-resources').send({})).resolves.toMatchObject({ status: 400 });
    await expect(
      request(app).post('/api/v1/sample-resources').set('Content-Type', 'application/json').send('{')
    ).resolves.toMatchObject({
      status: 400,
      body: { error: 'Bad Request' }
    });
    await expect(request(app).get('/unknown')).resolves.toMatchObject({ status: 404 });
  });

  test('rejects duplicate JSON keys only when configured', async () => {
    const app = createApp({ config: { ...config, enableDuplicateJsonKeyValidation: true }, platform });
    const response = await request(app)
      .post('/api/v1/sample-resources')
      .set('Content-Type', 'application/json')
      .send('{"name":"one","name":"two"}');

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Duplicate JSON key detected');
  });
});
