/**
 * 依 ALLOWED_ORIGINS 設定 CORS；未設時允許本機展示預設來源。
 */
function parseAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS;
  if (raw && String(raw).trim()) {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return ['http://localhost:3856', 'http://127.0.0.1:3856'];
}

function corsDynamicMiddleware(req, res, next) {
  const allowed = parseAllowedOrigins();
  const origin = req.headers.origin;
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    // 同源或非瀏覽器客戶端
    res.setHeader('Access-Control-Allow-Origin', allowed[0] || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'null');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie');
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
}

module.exports = { corsDynamicMiddleware, parseAllowedOrigins };
