const { SYNTHETIC_RESIDENTS } = require('@/infrastructure/data/synthetic-residents');
const { createVerificationUseCase } = require('@/application/verification/verification.use-case');

describe('verification use case', () => {
  test('accepts a known NIK', () => {
    const useCase = createVerificationUseCase({ residents: SYNTHETIC_RESIDENTS });

    expect(useCase.verify({ nik: '3171010101900001' })).toEqual({
      nik: '3171010101900001',
      valid: true,
      reason: null
    });
  });

  test('rejects an unknown NIK without throwing', () => {
    const useCase = createVerificationUseCase({ residents: SYNTHETIC_RESIDENTS });

    expect(useCase.verify({ nik: '3171010101900099' })).toEqual({
      nik: '3171010101900099',
      valid: false,
      reason: 'NIK_NOT_FOUND'
    });
  });

  test('accepts an injected dataset', () => {
    const useCase = createVerificationUseCase({ residents: ['3171010101900011'] });

    expect(useCase.verify({ nik: '3171010101900011' }).valid).toBe(true);
    expect(useCase.verify({ nik: '3171010101900001' }).reason).toBe('NIK_NOT_FOUND');
  });

  test('requires a dataset', () => {
    expect(() => createVerificationUseCase()).toThrow('createVerificationUseCase requires residents');
    expect(() => createVerificationUseCase({})).toThrow('createVerificationUseCase requires residents');
  });
});
