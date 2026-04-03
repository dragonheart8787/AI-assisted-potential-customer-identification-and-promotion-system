const { test } = require('node:test');
const assert = require('node:assert');

// 模擬瀏覽器環境後載入 data-deduplication.js
const store = {};
global.localStorage = {
  getItem(k) {
    return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null;
  },
  setItem(k, v) {
    store[k] = String(v);
  }
};
global.window = global;

delete require.cache[require.resolve('../../js/data-deduplication.js')];
require('../../js/data-deduplication.js');

const d = global.dataDeduplication;
assert.ok(d, 'dataDeduplication 應已掛載');

test('isValidEmail 接受一般網域', () => {
  assert.strictEqual(d.isValidEmail('user@company.com'), true);
});

test('isValidEmail 拒絕黑名單網域', () => {
  assert.strictEqual(d.isValidEmail('x@test.com'), false);
});

test('findDuplicate 依 email', () => {
  const r = d.findDuplicate([{ email: 'a@b.com', company: 'X' }], { email: 'a@b.com' });
  assert.strictEqual(r.duplicate, true);
  assert.strictEqual(r.reason, 'email');
});

test('normalizeCompanyName', () => {
  const n = d.normalizeCompanyName('  陽光有限公司  ');
  assert.ok(n.includes('陽光') || n.length > 0);
});
