/**
 * 簡易記憶體速率限制（程序重啟即清空）
 */
const buckets = new Map();

function makeKey(req, prefix) {
  const ip = req.socket.remoteAddress || 'local';
  return `${prefix}:${ip}`;
}

function rateLimit({ windowMs, max, prefix }) {
  return (req, res, next) => {
    const key = makeKey(req, prefix);
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || now > b.resetAt) {
      b = { count: 0, resetAt: now + windowMs };
      buckets.set(key, b);
    }
    b.count += 1;
    if (b.count > max) {
      res.status(429).json({ error: '請求過於頻繁，請稍後再試' });
      return;
    }
    next();
  };
}

const loginLimiter = rateLimit({ windowMs: 60_000, max: 20, prefix: 'login' });
const proxyLimiter = rateLimit({ windowMs: 60_000, max: 120, prefix: 'proxy' });
const emailLimiter = rateLimit({ windowMs: 60_000, max: 30, prefix: 'email' });

module.exports = { rateLimit, loginLimiter, proxyLimiter, emailLimiter };
