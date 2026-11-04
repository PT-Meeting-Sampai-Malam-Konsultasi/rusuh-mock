const { createSampleResourceService } = require('@/modules/sample-resource/sample-resource.service');

describe('sample resource service', () => {
  test('creates, lists, and retrieves an in-memory resource', () => {
    const service = createSampleResourceService();
    const created = service.create({ name: 'Example', description: 'A test resource' });

    expect(created.id).toEqual(expect.any(String));
    expect(service.list()).toEqual([created]);
    expect(service.getById(created.id)).toEqual(created);
  });

  test('rejects an unknown resource identifier', () => {
    const service = createSampleResourceService();
    expect(() => service.getById('018f2e6b-5aa2-7e1c-a890-123456789012')).toThrow('SAMPLE_RESOURCE_NOT_FOUND');
  });
});
