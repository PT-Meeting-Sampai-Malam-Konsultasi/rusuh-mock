const {
  createDuplicateKeyVerifier,
  detectDuplicateJsonKey
} = require('@/presentation/http/middleware/duplicate-json-keys');

describe('duplicate JSON key middleware', () => {
  test('finds duplicate keys in one object', () => {
    expect(detectDuplicateJsonKey('{"id":"one","id":"two"}')).toBe('id');
  });

  test('allows the same key in separate object scopes', () => {
    expect(detectDuplicateJsonKey('{"first":{"id":"one"},"second":{"id":"two"}}')).toBeNull();
  });

  test('allows the same key in separate array objects', () => {
    expect(detectDuplicateJsonKey('[{"id":"one"},{"id":"two"}]')).toBeNull();
  });

  test('handles escaped key content', () => {
    expect(detectDuplicateJsonKey('{"a\\"b":"one","a\\"b":"two"}')).toBe('a\\"b');
  });

  test('rejects a duplicate key only when enabled', () => {
    const verify = createDuplicateKeyVerifier(true);
    expect(() => verify({}, {}, Buffer.from('{"id":"one","id":"two"}'))).toThrow('Duplicate JSON key detected');
  });

  test('does not inspect a request when disabled', () => {
    const verify = createDuplicateKeyVerifier(false);
    expect(() => verify({}, {}, Buffer.from('{"id":"one","id":"two"}'))).not.toThrow();
  });
});
