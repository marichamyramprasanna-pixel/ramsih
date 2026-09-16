/**
 * Security & Input Sanitization Utilities for Aegis 3D
 */

/**
 * Escapes HTML characters in strings to prevent Cross-Site Scripting (XSS) attacks.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates whether a string is a valid IPv4 or IPv6 address.
 */
export function isValidIP(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  
  // IPv4 regex pattern
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // IPv6 regex pattern
  const ipv6Regex = /^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/;
  
  return ipv4Regex.test(ip.trim()) || ipv6Regex.test(ip.trim());
}

export interface PasswordStrengthResult {
  score: number; // 0 (very weak) to 4 (very strong)
  label: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  isValid: boolean;
  feedback: string[];
}

/**
 * Evaluates password strength and checks security complexity rules.
 */
export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return { score: 0, label: 'Weak', isValid: false, feedback: ['Password cannot be empty'] };
  }

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Must be at least 8 characters long');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one uppercase letter (A-Z)');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one number (0-9)');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one special character (!@#$%^&*)');
  }

  const labels: Array<PasswordStrengthResult['label']> = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const isValid = password.length >= 8 && score >= 2;

  return {
    score,
    label: labels[score] || 'Weak',
    isValid,
    feedback
  };
}

/**
 * Recursively sanitizes string properties within an object.
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeInput(obj) as unknown as T;
  if (Array.isArray(obj)) return obj.map(item => sanitizeObject(item)) as unknown as T;
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeObject((obj as any)[key]);
    }
    return sanitized as T;
  }
  return obj;
}
