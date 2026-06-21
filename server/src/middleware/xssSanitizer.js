/**
 * XSS Sanitization Middleware
 * Strips < > " ' ` / chars from string values in req.body, req.query, and req.params
 * to prevent reflected/stored XSS attacks without adding heavy libraries.
 */

const XSS_PATTERN = /[<>"'`/\\]/g;

const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    return val.replace(XSS_PATTERN, '');
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val !== null && typeof val === 'object') {
    return sanitizeObject(val);
  }
  return val;
};

const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const key of Object.keys(obj)) {
    sanitized[key] = sanitizeValue(obj[key]);
  }
  return sanitized;
};

const xssSanitizer = (req, res, next) => {
  if (req.body)   req.body   = sanitizeObject(req.body);
  if (req.query)  req.query  = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

module.exports = xssSanitizer;
