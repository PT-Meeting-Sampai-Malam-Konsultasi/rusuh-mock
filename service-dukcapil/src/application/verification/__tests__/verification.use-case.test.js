const { SYNTHETIC_RESIDENTS } = require('@/infrastructure/data/synthetic-residents');
const { createVerificationUseCase } = require('@/application/verification/verification.use-case');

// The synthetic dataset is used here only as a fixture: known
// format-valid NIKs. Verification itself never looks it up.
describe('verification use case (format-only)', () => {
  test('accepts format-valid NIKs from the fixture dataset', () => {
    const useCase = createVerificationUseCase();

    SYNTHETIC_RESIDENTS.forEach((nik) => {
      expect(useCase.verify({ nik })).toEqual({ nik, valid: true, reason: null });
    });
  });

  test('accepts a format-valid NIK that is not in the fixture dataset', () => {
    const useCase = createVerificationUseCase();

    expect(useCase.verify({ nik: '3171010101900099' })).toEqual({
      nik: '3171010101900099',
      valid: true,
      reason: null
    });
  });

  test('reports format-invalid NIKs with a format-specific reason', () => {
    const useCase = createVerificationUseCase();

    expect(useCase.verify({ nik: '123' })).toEqual({
      nik: '123',
      valid: false,
      reason: 'NIK_INVALID_FORMAT'
    });
    expect(useCase.verify({ nik: '3171010113900001' })).toEqual({
      nik: '3171010113900001',
      valid: false,
      reason: 'NIK_INVALID_BIRTH_DATE'
    });
    expect(useCase.verify({ nik: '3171010101900000' })).toEqual({
      nik: '3171010101900000',
      valid: false,
      reason: 'NIK_INVALID_SEQUENCE'
    });
  });
});
