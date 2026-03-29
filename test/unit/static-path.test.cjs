const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { resolveStaticPath } = require('../../lib/static-path.js');

const root = path.join(__dirname, '..', '..');

test('resolveStaticPath 允許 app-new.html', () => {
  const p = resolveStaticPath(root, '/app-new.html');
  assert.ok(p);
  assert.ok(p.endsWith('app-new.html'));
});

test('resolveStaticPath 阻擋 path traversal', () => {
  assert.strictEqual(resolveStaticPath(root, '/../package.json'), null);
  assert.strictEqual(resolveStaticPath(root, '/foo/../../../etc/passwd'), null);
});
