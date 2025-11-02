export const sanitizeForDisplay = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

export const preventXSS = (userInput: string): string => {
  return userInput
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const isValidRedirectURL = (url: string, allowedDomains: string[]): boolean => {
  try {
    const parsed = new URL(url, window.location.origin);
    return allowedDomains.some(domain => parsed.hostname.endsWith(domain));
  } catch {
    return false;
  }
};

export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const verifyCSRFToken = (token: string, storedToken: string): boolean => {
  if (!token || !storedToken) return false;
  return token === storedToken;
};

export const rateLimit = (() => {
  const attempts = new Map<string, { count: number; timestamp: number }>();

  return {
    check(key: string, maxAttempts: number, windowMs: number): boolean {
      const now = Date.now();
      const record = attempts.get(key);

      if (!record || now - record.timestamp > windowMs) {
        attempts.set(key, { count: 1, timestamp: now });
        return true;
      }

      if (record.count >= maxAttempts) {
        return false;
      }

      record.count++;
      return true;
    },

    reset(key: string): void {
      attempts.delete(key);
    },

    getRemainingAttempts(key: string, maxAttempts: number): number {
      const record = attempts.get(key);
      if (!record) return maxAttempts;
      return Math.max(0, maxAttempts - record.count);
    }
  };
})();

export const secureRandomString = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const hashString = async (input: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
};

export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const maskedLocal = local.charAt(0) + '*'.repeat(Math.max(0, local.length - 2)) + local.charAt(local.length - 1);
  return `${maskedLocal}@${domain}`;
};

export const maskPhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  return '*'.repeat(digits.length - 4) + digits.slice(-4);
};

export const maskCreditCard = (cardNumber: string): string => {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 4) return cardNumber;
  return '**** **** **** ' + digits.slice(-4);
};

export const logSecurityEvent = (event: {
  type: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}): void => {
  const secureLog = {
    timestamp: new Date().toISOString(),
    type: event.type,
    userId: event.userId || 'anonymous',
    ip: event.ip ? maskIP(event.ip) : undefined,
    userAgent: event.userAgent,
    details: event.details
  };

  console.log('[SECURITY]', JSON.stringify(secureLog));
};

const maskIP = (ip: string): string => {
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.**`;
  }
  return ip;
};

export const validateContentSecurityPolicy = (content: string): boolean => {
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi
  ];

  return !dangerousPatterns.some(pattern => pattern.test(content));
};

export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&#]/.test(password)) score++;

  if (score < 3) {
    feedback.push('Password is weak. Add more characters and variety.');
  } else if (score < 5) {
    feedback.push('Password is fair. Consider making it longer.');
  } else if (score < 7) {
    feedback.push('Password is good. You could add more special characters.');
  } else {
    feedback.push('Password is strong!');
  }

  return { score, feedback };
};

export const detectSuspiciousActivity = (actions: {
  type: string;
  timestamp: number;
}[]): boolean => {
  const recentActions = actions.filter(
    action => Date.now() - action.timestamp < 60000
  );

  if (recentActions.length > 50) {
    return true;
  }

  const failedLogins = recentActions.filter(a => a.type === 'login_failed');
  if (failedLogins.length > 5) {
    return true;
  }

  return false;
};

export const validateOrigin = (origin: string, allowedOrigins: string[]): boolean => {
  return allowedOrigins.includes(origin);
};

export const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
};
