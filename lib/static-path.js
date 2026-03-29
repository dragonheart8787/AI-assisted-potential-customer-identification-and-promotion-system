/**
 * 安全解析靜態檔路徑，阻擋 path traversal
 */
const path = require('path');

function resolveStaticPath(rootDir, pathname) {
  const rel = pathname === '/' || pathname === '' ? 'app-new.html' : pathname.replace(/^\//, '');
  if (!rel || rel.includes('..')) return null;
  const normalized = path.normalize(rel);
  if (normalized.startsWith('..')) return null;
  const full = path.resolve(path.join(rootDir, normalized));
  const rootResolved = path.resolve(rootDir);
  const relCheck = path.relative(rootResolved, full);
  if (relCheck.startsWith('..') || path.isAbsolute(relCheck)) return null;
  return full;
}

module.exports = { resolveStaticPath };
