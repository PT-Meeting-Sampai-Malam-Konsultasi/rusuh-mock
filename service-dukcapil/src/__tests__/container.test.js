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

  test('wires routers and use cases', () => {
    const container = createContainer({ config });

    expect(typeof container.healthRouter).toBe('function');
    expect(typeof container.verificationRouter).toBe('function');
    expect(container.healthUseCase.live()).toEqual({ status: 'ok' });
    expect(container.verificationUseCase.verify({ nik: '3171010101900001' })).toEqual({
      nik: '3171010101900001',
      valid: true,
      reason: null
    });
    expect(container.verificationUseCase.verify({ nik: '3171010101900099' }).valid).toBe(true);
  });

  test('reflects a configured CORS origin', async () => {
    const app = createApp({ config: { ...config, corsOrigins: ['https://rusuh-tiket.web.id'] }, platform });

    const response = await request(app).get('/sys/ping').set('Origin', 'https://rusuh-tiket.web.id');

    expect(response.headers['access-control-allow-origin']).toBe('https://rusuh-tiket.web.id');
  });
});
