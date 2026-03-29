const { test } = require('node:test');
const assert = require('node:assert');
const {
  validateProxyUrlParam,
  validateSendEmailPayload,
  validateOAuthPayload,
  validateEventPayload
} = require('../../lib/api-validate.js');

test('validateProxyUrlParam 接受 https', () => {
  const r = validateProxyUrlParam(encodeURIComponent('https://example.com'));
  assert.strictEqual(r.ok, true);
});

test('validateProxyUrlParam 拒絕非 http(s)', () => {
  const r = validateProxyUrlParam(encodeURIComponent('file:///etc/passwd'));
  assert.strictEqual(r.ok, false);
});

test('validateSendEmailPayload 需要 to', () => {
  assert.strictEqual(validateSendEmailPayload({}).ok, false);
  assert.strictEqual(validateSendEmailPayload({ to: 'a@b.com' }).ok, true);
});

test('validateOAuthPayload platform 白名單', () => {
  assert.strictEqual(validateOAuthPayload({ platform: 'x', code: 'c', redirectUri: 'https://a.com' }).ok, false);
  assert.strictEqual(
    validateOAuthPayload({ platform: 'linkedin', code: 'c', redirectUri: 'https://a.com/cb' }).ok,
    true
  );
});

test('validateEventPayload 拒絕過長 type', () => {
  assert.strictEqual(validateEventPayload({ type: 'x'.repeat(200) }).ok, false);
});
