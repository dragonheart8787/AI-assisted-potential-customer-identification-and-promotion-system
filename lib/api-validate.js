/**
 * 後端 API 輸入驗證（長度／型別／基本格式）
 */
const MAX_JSON_BODY = 512 * 1024;
const MAX_EMAIL_TO_LEN = 2048;
const MAX_SUBJECT_LEN = 998;
const MAX_OAUTH_CODE_LEN = 4096;
const MAX_REDIRECT_URI_LEN = 2048;
const MAX_EVENT_TYPE_LEN = 128;
const MAX_PROXY_URL_LEN = 4096;

function isNonEmptyString(v, maxLen) {
  if (typeof v !== 'string') return false;
  const s = v.trim();
  return s.length > 0 && s.length <= maxLen;
}

function validateProxyUrlParam(raw) {
  if (raw == null) return { ok: false, error: '缺少 url 參數' };
  const decoded = decodeURIComponent(String(raw));
  if (decoded.length > MAX_PROXY_URL_LEN) return { ok: false, error: 'URL 過長' };
  if (!decoded.startsWith('http://') && !decoded.startsWith('https://')) {
    return { ok: false, error: '僅允許 http(s) URL' };
  }
  return { ok: true, url: decoded };
}

function validateSendEmailPayload(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: '請求體須為 JSON 物件' };
  const to = body.to;
  if (!isNonEmptyString(to, MAX_EMAIL_TO_LEN)) return { ok: false, error: 'to 須為有效字串且長度合理' };
  if (body.subject != null && String(body.subject).length > MAX_SUBJECT_LEN) {
    return { ok: false, error: 'subject 過長' };
  }
  const html = body.html != null ? String(body.html) : '';
  const text = body.text != null ? String(body.text) : '';
  if (html.length + text.length > 400 * 1024) return { ok: false, error: '內文過大' };
  if (body.from != null && String(body.from).length > 256) return { ok: false, error: 'from 過長' };
  return { ok: true };
}

const OAUTH_PLATFORMS = new Set(['linkedin', 'facebook', 'instagram']);

function validateOAuthPayload(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: '請求體須為 JSON 物件' };
  const { platform, code, redirectUri } = body;
  if (!OAUTH_PLATFORMS.has(platform)) return { ok: false, error: '不支援的 platform' };
  if (!isNonEmptyString(code, MAX_OAUTH_CODE_LEN)) return { ok: false, error: 'code 無效或過長' };
  if (!isNonEmptyString(redirectUri, MAX_REDIRECT_URI_LEN)) return { ok: false, error: 'redirectUri 無效或過長' };
  if (!redirectUri.startsWith('http://') && !redirectUri.startsWith('https://')) {
    return { ok: false, error: 'redirectUri 須為 http(s)' };
  }
  return { ok: true };
}

function validateEventPayload(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: '請求體須為 JSON 物件' };
  const t = body.type;
  if (t != null && (typeof t !== 'string' || t.length > MAX_EVENT_TYPE_LEN)) {
    return { ok: false, error: 'type 過長或型別錯誤' };
  }
  const s = JSON.stringify(body);
  if (s.length > 64 * 1024) return { ok: false, error: '事件物件過大' };
  return { ok: true };
}

module.exports = {
  MAX_JSON_BODY,
  validateProxyUrlParam,
  validateSendEmailPayload,
  validateOAuthPayload,
  validateEventPayload
};
