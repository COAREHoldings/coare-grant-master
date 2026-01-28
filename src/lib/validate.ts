/**
 * Input validation and sanitization utilities
 * Provides XSS and SQL injection protection
 */

// HTML entities to escape for XSS protection
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML entities to prevent XSS attacks
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * SQL injection patterns to detect
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|EXECUTE|UNION|JOIN)\b)/gi,
  /(--)|(\/\*)|(\*\/)/g,
  /(;|\||&&)/g,
  /(\bOR\b|\bAND\b)\s*[\d\w]*\s*=\s*[\d\w]*/gi,
  /('|")\s*(OR|AND)\s*('|")\s*=\s*('|")/gi,
];

/**
 * Check if string contains potential SQL injection
 */
export function containsSqlInjection(str: string): boolean {
  if (typeof str !== 'string') return false;
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(str));
}

/**
 * Sanitize string by removing potential SQL injection patterns
 */
export function sanitizeSql(str: string): string {
  if (typeof str !== 'string') return '';
  let sanitized = str;
  // Remove dangerous characters
  sanitized = sanitized.replace(/[;'"\\]/g, '');
  // Remove SQL comments
  sanitized = sanitized.replace(/(--|\/\*|\*\/)/g, '');
  return sanitized;
}

/**
 * Comprehensive sanitization for user input
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  let sanitized = input.trim();
  sanitized = escapeHtml(sanitized);
  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate and sanitize an object's string properties
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeInput(sanitized[key] as string);
    }
  }
  return sanitized;
}

/**
 * Middleware helper to validate request body
 */
export function validateRequestBody(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const bodyStr = JSON.stringify(body);
  if (containsSqlInjection(bodyStr)) {
    return { valid: false, error: 'Invalid input detected' };
  }

  return { valid: true };
}

/**
 * Rate limiting helper - track request counts
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}
