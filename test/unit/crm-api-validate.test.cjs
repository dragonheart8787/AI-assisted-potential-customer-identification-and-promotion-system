'use strict';
const assert = require('assert');
const test = require('node:test');
const {
  validateRegisterPayload,
  validateLoginPayload,
  validateCustomerPayload,
  validateInteractionPayload,
  validateTagsPayload
} = require('../../lib/api-validate.js');

test('validateRegisterPayload 接受合法輸入', () => {
  const v = validateRegisterPayload({ email: 'a@b.co', password: '12345678' });
  assert.strictEqual(v.ok, true);
  assert.strictEqual(v.email, 'a@b.co');
});

test('validateRegisterPayload 拒絕密碼過短', () => {
  const v = validateRegisterPayload({ email: 'a@b.co', password: 'short' });
  assert.strictEqual(v.ok, false);
});

test('validateLoginPayload', () => {
  assert.strictEqual(validateLoginPayload({ email: 'x@y.z', password: 'x' }).ok, true);
  assert.strictEqual(validateLoginPayload({ email: 'bad', password: 'x' }).ok, false);
});

test('validateCustomerPayload 限制大小', () => {
  const big = { id: '1', x: 'y'.repeat(500 * 1024) };
  const v = validateCustomerPayload(big);
  assert.strictEqual(v.ok, false);
});

test('validateInteractionPayload 需要 customerId', () => {
  assert.strictEqual(validateInteractionPayload({ type: 'email' }).ok, false);
  assert.strictEqual(validateInteractionPayload({ customerId: 'c1', type: 'email' }).ok, true);
});

test('validateTagsPayload', () => {
  assert.strictEqual(validateTagsPayload({ tags: ['a', 'b'] }).ok, true);
  assert.strictEqual(validateTagsPayload({ tags: 'no' }).ok, false);
});
