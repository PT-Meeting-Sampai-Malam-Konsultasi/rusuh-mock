const { isValidNikFormat, getNikFormatReason, NIK_INVALID_FORMAT } = require('@/domain/nik');

describe('NIK format validation', () => {
  test('accepts male and female NIKs with valid birth dates', () => {
    expect(isValidNikFormat('3171010101900001')).toBe(true); // male, 1 Jan 1990
    expect(isValidNikFormat('3171014101900002')).toBe(true); // female, 1 Jan 1990 (day 41)
    expect(isValidNikFormat('3271010202850003')).toBe(true); // male, 2 Feb 1985
    expect(isValidNikFormat('3171012902000004')).toBe(true); // 29 Feb (table allows it)
  });

  test('rejects non-16-digit and non-digit input', () => {
    expect(isValidNikFormat('123')).toBe(false);
    expect(isValidNikFormat('31710101019000AB')).toBe(false);
    expect(isValidNikFormat('31710101019000011')).toBe(false);
  });

  test('rejects invalid birth-date components', () => {
    expect(isValidNikFormat('3171010113900001')).toBe(false); // month 13
    expect(isValidNikFormat('3171013201900001')).toBe(false); // day 32
    expect(isValidNikFormat('3171010001900001')).toBe(false); // day 00
    expect(isValidNikFormat('3171013002900001')).toBe(false); // 30 Feb
    expect(isValidNikFormat('3171017201900001')).toBe(false); // female day 72 (> 71)
  });

  test('rejects sequence 0000', () => {
    expect(isValidNikFormat('3171010101900000')).toBe(false);
  });
});

describe('NIK format reason codes', () => {
  test('returns null for a valid format', () => {
    expect(getNikFormatReason('3171010101900001')).toBeNull();
  });

  test('returns the single NIK_INVALID_FORMAT code for non-16-digit or non-digit input', () => {
    expect(getNikFormatReason('123')).toBe(NIK_INVALID_FORMAT);
    expect(getNikFormatReason('31710101019000AB')).toBe(NIK_INVALID_FORMAT);
    expect(getNikFormatReason('31710101019000011')).toBe(NIK_INVALID_FORMAT);
    expect(getNikFormatReason(3171010101900001)).toBe(NIK_INVALID_FORMAT);
    expect(getNikFormatReason(undefined)).toBe(NIK_INVALID_FORMAT);
  });

  test('returns the single NIK_INVALID_FORMAT code for an invalid date component', () => {
    expect(getNikFormatReason('3171010113900001')).toBe(NIK_INVALID_FORMAT);
    expect(getNikFormatReason('3171013201900001')).toBe(NIK_INVALID_FORMAT);
    expect(getNikFormatReason('3171013002900001')).toBe(NIK_INVALID_FORMAT);
    expect(getNikFormatReason('3171017201900001')).toBe(NIK_INVALID_FORMAT);
  });

  test('returns the single NIK_INVALID_FORMAT code for sequence 0000', () => {
    expect(getNikFormatReason('3171010101900000')).toBe(NIK_INVALID_FORMAT);
  });

  test('every kind of format failure maps to the same single code', () => {
    const failures = [
      '123', // wrong length
      '31710101019000AB', // non-digit characters
      '3171010113900001', // month 13
      '3171013201900001', // day 32
      '3171013002900001', // 30 Feb
      '3171017201900001', // female day 72
      '3171010101900000' // sequence 0000
    ];

    failures.forEach((nik) => {
      expect(getNikFormatReason(nik)).toBe(NIK_INVALID_FORMAT);
    });
  });
});
