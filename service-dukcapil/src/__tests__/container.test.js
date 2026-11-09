const request = require('supertest');
const { createContainer } = require('@/container');
const { createApp } = require('@/app');

const config = {
  bodyLimit: '100kb',
  enableDuplicateJsonKeyValidation: false
};

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

describe('container (composition root)', () => {
  test('requires validated configuration', () => {
    expect(() => createApp()).toThrow('createApp requires validated configuration');
  });

  test('wires routers and use cases with the default dataset', () => {
    const container = createContainer({ config });

    expect(typeof container.healthRouter).toBe('function');
    expect(typeof container.verificationRouter).toBe('function');
    expect(container.healthUseCase.live()).toEqual({ status: 'ok' });
    expect(container.verificationUseCase.verify({ nik: '3171010101900001' })).toEqual({
      nik: '3171010101900001',
      valid: true,
      reason: null
    });
  });

  test('wires an injected dataset', () => {
    const container = createContainer({ config, verificationDataset: ['3171010101900011'] });

    expect(container.verificationUseCase.verify({ nik: '3171010101900011' }).valid).toBe(true);
    expect(container.verificationUseCase.verify({ nik: '3171010101900001' }).reason).toBe('NIK_NOT_FOUND');
  });

  test('applies the platform preHandler when enabled', async () => {
    const preHandler = jest.fn((_request, _response, next) => next());
    const app = createApp({ config, platform: { ...platform, preHandler }, usePlatformPreHandler: true });

    await request(app).post('/api/v1/verifications').send({ nik: '3171010101900001' });

    expect(preHandler).toHaveBeenCalled();
  });

  test('reflects a configured CORS origin', async () => {
    const app = createApp({ config: { ...config, corsOrigins: ['https://rusuh-tiket.web.id'] }, platform });

    const response = await request(app).get('/sys/ping').set('Origin', 'https://rusuh-tiket.web.id');

    expect(response.headers['access-control-allow-origin']).toBe('https://rusuh-tiket.web.id');
  });
});
