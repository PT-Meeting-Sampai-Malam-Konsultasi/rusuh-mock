const { createVerificationService } = require('@/modules/verification/verification.service');

describe('verification service', () => {
  test('matches a known NIK and name', () => {
    const service = createVerificationService();

    expect(service.verify({ nik: '9901010101900001', name: 'Budi Santoso' })).toEqual({
      nik: '9901010101900001',
      valid: true,
      name: 'Budi Santoso',
      reason: null
    });
  });

  test('matches names case-insensitively after trimming', () => {
    const service = createVerificationService();

    expect(service.verify({ nik: '9901010101900001', name: '  budi santoso ' }).valid).toBe(true);
  });

  test('rejects a known NIK with a different name', () => {
    const service = createVerificationService();

    expect(service.verify({ nik: '9901010101900001', name: 'Siti Rahma' })).toEqual({
      nik: '9901010101900001',
      valid: false,
      name: null,
      reason: 'NAME_MISMATCH'
    });
  });

  test('rejects an unknown NIK without throwing', () => {
    const service = createVerificationService();

    expect(service.verify({ nik: '9901010101900099', name: 'Nobody Here' })).toEqual({
      nik: '9901010101900099',
      valid: false,
      name: null,
      reason: 'NIK_NOT_FOUND'
    });
  });

  test('accepts an injected dataset', () => {
    const service = createVerificationService([{ nik: '9901010101900011', name: 'Test Person' }]);

    expect(service.verify({ nik: '9901010101900011', name: 'Test Person' }).valid).toBe(true);
    expect(service.verify({ nik: '9901010101900001', name: 'Budi Santoso' }).reason).toBe('NIK_NOT_FOUND');
  });
});
