const { createVerificationService } = require('@/modules/verification/verification.service');

describe('verification service', () => {
  test('accepts a known NIK', () => {
    const service = createVerificationService();

    expect(service.verify({ nik: '3171010101900001' })).toEqual({
      nik: '3171010101900001',
      valid: true,
      reason: null
    });
  });

  test('rejects an unknown NIK without throwing', () => {
    const service = createVerificationService();

    expect(service.verify({ nik: '3171010101900099' })).toEqual({
      nik: '3171010101900099',
      valid: false,
      reason: 'NIK_NOT_FOUND'
    });
  });

  test('accepts an injected dataset', () => {
    const service = createVerificationService(['3171010101900011']);

    expect(service.verify({ nik: '3171010101900011' }).valid).toBe(true);
    expect(service.verify({ nik: '3171010101900001' }).reason).toBe('NIK_NOT_FOUND');
  });
});
