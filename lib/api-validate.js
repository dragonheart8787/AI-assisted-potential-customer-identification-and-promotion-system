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

const MAX_EMAIL_LOGIN_LEN = 254;
const MAX_PASSWORD_LEN = 128;
const MAX_CUSTOMER_JSON = 400 * 1024;
const MAX_CUSTOMER_ID_LEN = 128;
const MAX_INTERACTION_ID_LEN = 128;

function isEmailish(s) {
  if (typeof s !== 'string' || s.length < 3 || s.length > MAX_EMAIL_LOGIN_LEN) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

function validateRegisterPayload(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: '請求體須為 JSON 物件' };
  const email = body.email;
  const password = body.password;
  if (!isEmailish(email)) return { ok: false, error: 'email 格式無效' };
  if (typeof password !== 'string' || password.length < 8 || password.length > MAX_PASSWORD_LEN) {
    return { ok: false, error: '密碼須至少 8 字元' };
  }
  return { ok: true, email: email.trim().toLowerCase(), password };
}

function validateLoginPayload(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: '請求體須為 JSON 物件' };
  const email = body.email;
  const password = body.password;
  if (!isEmailish(email)) return { ok: false, error: 'email 格式無效' };
  if (typeof password !== 'string' || password.length < 1 || password.length > MAX_PASSWORD_LEN) {
    return { ok: false, error: '密碼無效' };
  }
  return { ok: true, email: email.trim().toLowerCase(), password };
}

function validateCustomerPayload(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: '請求體須為 JSON 物件' };
  const s = JSON.stringify(body);
  if (s.length > MAX_CUSTOMER_JSON) return { ok: false, error: '客戶資料過大' };
  if (body.id != null && (typeof body.id !== 'string' || body.id.length > MAX_CUSTOMER_ID_LEN)) {
    return { ok: false, error: 'id 無效' };
  }
  if (body.email != null && typeof body.email !== 'string') return { ok: false, error: 'email 型別錯誤' };
  return { ok: true };
}

function validateInteractionPayload(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: '請求體須為 JSON 物件' };
  const customerId = body.customerId;
  if (!isNonEmptyString(customerId, MAX_CUSTOMER_ID_LEN)) return { ok: false, error: 'customerId 無效' };
  if (body.id != null && (typeof body.id !== 'string' || body.id.length > MAX_INTERACTION_ID_LEN)) {
    return { ok: false, error: 'id 無效' };
  }
  const s = JSON.stringify(body);
  if (s.length > 64 * 1024) return { ok: false, error: '互動資料過大' };
  return { ok: true };
}

function validateTagsPayload(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: '請求體須為 JSON 物件' };
  if (!Array.isArray(body.tags)) return { ok: false, error: 'tags 須為陣列' };
  if (body.tags.length > 200) return { ok: false, error: '標籤過多' };
  for (const t of body.tags) {
    if (typeof t !== 'string' || t.length > 64) return { ok: false, error: '標籤格式無效' };
  }
  return { ok: true, tags: body.tags };
}

module.exports = {
  MAX_JSON_BODY,
  MAX_CUSTOMER_JSON,
  validateProxyUrlParam,
  validateSendEmailPayload,
  validateOAuthPayload,
  validateEventPayload,
  validateRegisterPayload,
  validateLoginPayload,
  validateCustomerPayload,
  validateInteractionPayload,
  validateTagsPayload
};
