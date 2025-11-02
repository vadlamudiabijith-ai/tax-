# Security Implementation Guide

## Quick Start Security Checklist

This guide provides practical implementation examples for securing the TaxFund Portal.

## 1. Using Validation Utilities

### Email Validation

```typescript
import { validateEmail } from './utils/validation';

const handleEmailInput = (email: string) => {
  if (!validateEmail(email)) {
    setError('Please enter a valid email address');
    return;
  }
  // Proceed with valid email
};
```

### Password Validation

```typescript
import { validatePassword } from './utils/validation';

const handlePasswordChange = (password: string) => {
  const result = validatePassword(password);

  if (!result.valid) {
    setErrors(result.errors);
    return;
  }

  // Password is strong enough
};
```

### Amount Validation

```typescript
import { validateAmount } from './utils/validation';

const handlePayment = (amount: number) => {
  if (!validateAmount(amount)) {
    setError('Invalid amount. Must be between 0 and 1,000,000,000');
    return;
  }

  // Process payment
};
```

### Input Sanitization

```typescript
import { sanitizeInput } from './utils/validation';

const handleUserInput = (input: string) => {
  const clean = sanitizeInput(input);
  // Use clean input safely
};
```

## 2. XSS Prevention

### Displaying User Content

```typescript
import { preventXSS } from './utils/security';

const UserComment = ({ comment }: { comment: string }) => {
  const safeComment = preventXSS(comment);

  return (
    <div className="comment">
      {safeComment}
    </div>
  );
};
```

### Content Security Validation

```typescript
import { validateContentSecurityPolicy } from './utils/security';

const handleRichTextInput = (content: string) => {
  if (!validateContentSecurityPolicy(content)) {
    setError('Content contains potentially dangerous elements');
    return;
  }

  // Save content
};
```

## 3. Rate Limiting

### Login Rate Limiting

```typescript
import { rateLimit } from './utils/security';

const handleLogin = async (email: string, password: string) => {
  const canAttempt = rateLimit.check(email, 5, 15 * 60 * 1000);

  if (!canAttempt) {
    const remaining = rateLimit.getRemainingAttempts(email, 5);
    setError(`Too many attempts. Try again in 15 minutes. Attempts remaining: ${remaining}`);
    return;
  }

  try {
    await login(email, password);
    rateLimit.reset(email); // Reset on success
  } catch (error) {
    setError('Invalid credentials');
  }
};
```

### API Rate Limiting

```typescript
const handleAPIRequest = async (userId: string) => {
  const canProceed = rateLimit.check(`api_${userId}`, 100, 60 * 1000);

  if (!canProceed) {
    throw new Error('Rate limit exceeded. Please try again in a minute.');
  }

  // Make API request
};
```

## 4. Security Monitoring

### Track User Actions

```typescript
import { trackUserAction, trackSecurityEvent } from './utils/monitoring';

const handlePayment = async (amount: number) => {
  trackUserAction('payment_initiated', { amount });

  try {
    await processPayment(amount);
    trackUserAction('payment_completed', { amount });
  } catch (error) {
    trackSecurityEvent('payment_failed', {
      amount,
      error: error.message
    });
  }
};
```

### Track Errors

```typescript
import { trackError } from './utils/monitoring';

const handleDataFetch = async () => {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    trackError(error as Error, 'Data fetch in Dashboard');
    throw error;
  }
};
```

### Performance Tracking

```typescript
import { PerformanceTracker } from './utils/monitoring';

const expensiveOperation = async () => {
  const tracker = new PerformanceTracker('Expensive Operation');

  try {
    // Do expensive work
    await heavyComputation();
  } finally {
    tracker.end();
  }
};
```

### API Call Tracking

```typescript
import { trackAPICall } from './utils/monitoring';

const fetchUserData = async (userId: string) => {
  return await trackAPICall(`/users/${userId}`, async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  });
};
```

### Health Monitoring

```typescript
import { getHealthMetrics, detectAnomalies } from './utils/monitoring';

const HealthDashboard = () => {
  const health = getHealthMetrics();
  const anomalies = detectAnomalies();

  return (
    <div>
      <div>Status: {health.status}</div>
      <div>Error Rate: {health.metrics.errorRate}</div>
      {anomalies.detected && (
        <div className="alert">
          {anomalies.anomalies.map(a => <div key={a}>{a}</div>)}
        </div>
      )}
    </div>
  );
};
```

## 5. Data Masking

### Mask Sensitive Information

```typescript
import { maskEmail, maskPhoneNumber, maskCreditCard } from './utils/security';

const UserProfile = ({ user }: { user: User }) => {
  return (
    <div>
      <div>Email: {maskEmail(user.email)}</div>
      <div>Phone: {maskPhoneNumber(user.phone)}</div>
      <div>Card: {maskCreditCard(user.cardNumber)}</div>
    </div>
  );
};
```

## 6. Password Strength Checking

```typescript
import { checkPasswordStrength } from './utils/security';

const PasswordInput = () => {
  const [password, setPassword] = useState('');
  const strength = checkPasswordStrength(password);

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className={`strength-${strength.score}`}>
        {strength.feedback.join(' ')}
      </div>
    </div>
  );
};
```

## 7. Secure Random Generation

```typescript
import { secureRandomString, generateCSRFToken } from './utils/security';

// Generate secure session ID
const sessionId = secureRandomString(32);

// Generate CSRF token
const csrfToken = generateCSRFToken();
localStorage.setItem('csrf_token', csrfToken);
```

## 8. File Upload Security

```typescript
import { validateFileUpload } from './utils/validation';

const handleFileUpload = (file: File) => {
  const validation = validateFileUpload(file, 5, ['image/jpeg', 'image/png']);

  if (!validation.valid) {
    setError(validation.error);
    return;
  }

  // Process file upload
  uploadFile(file);
};
```

## 9. Secure Redirect Validation

```typescript
import { isValidRedirectURL } from './utils/security';

const handleRedirect = (url: string) => {
  const allowedDomains = ['taxfundportal.gov', 'supabase.co'];

  if (!isValidRedirectURL(url, allowedDomains)) {
    setError('Invalid redirect URL');
    return;
  }

  window.location.href = url;
};
```

## 10. Security Event Logging

```typescript
import { logSecurityEvent } from './utils/security';

const handleLogin = async (email: string, password: string) => {
  try {
    await login(email, password);

    logSecurityEvent({
      type: 'login_success',
      userId: email,
      ip: await getClientIP(),
      userAgent: navigator.userAgent
    });
  } catch (error) {
    logSecurityEvent({
      type: 'login_failed',
      userId: email,
      ip: await getClientIP(),
      userAgent: navigator.userAgent,
      details: { reason: 'invalid_credentials' }
    });
  }
};
```

## 11. Suspicious Activity Detection

```typescript
import { detectSuspiciousActivity } from './utils/security';

const monitorUserActivity = (userId: string, actions: UserAction[]) => {
  const suspicious = detectSuspiciousActivity(actions);

  if (suspicious) {
    trackSecurityEvent('suspicious_activity_detected', {
      userId,
      actionCount: actions.length
    });

    // Trigger additional verification
    requireMFA(userId);
  }
};
```

## 12. Secure Comparison

```typescript
import { secureCompare } from './utils/security';

const verifyToken = (providedToken: string, storedToken: string) => {
  // Use timing-safe comparison
  if (!secureCompare(providedToken, storedToken)) {
    throw new Error('Invalid token');
  }
};
```

## Common Security Patterns

### Protected API Calls

```typescript
const makeSecureAPICall = async (endpoint: string, data: any) => {
  // 1. Validate input
  const sanitized = sanitizeInput(JSON.stringify(data));

  // 2. Check rate limit
  if (!rateLimit.check(endpoint, 100, 60000)) {
    throw new Error('Rate limit exceeded');
  }

  // 3. Track the call
  return await trackAPICall(endpoint, async () => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: sanitized
    });

    if (!response.ok) {
      trackError(new Error(`API Error: ${response.status}`), endpoint);
      throw new Error('API request failed');
    }

    return response.json();
  });
};
```

### Form Submission with Security

```typescript
const SecureForm = () => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate all inputs
    if (!validateEmail(email)) {
      setError('Invalid email');
      return;
    }

    // 2. Sanitize inputs
    const cleanData = {
      email: sanitizeInput(email),
      message: sanitizeInput(message)
    };

    // 3. Check rate limit
    if (!rateLimit.check(`form_${email}`, 5, 3600000)) {
      setError('Too many submissions. Please try again later.');
      return;
    }

    // 4. Track submission
    trackUserAction('form_submission', { form: 'contact' });

    try {
      // 5. Submit data
      await submitForm(cleanData);
      trackUserAction('form_success', { form: 'contact' });
    } catch (error) {
      trackError(error as Error, 'Form submission');
      setError('Submission failed. Please try again.');
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
};
```

## Security Best Practices Summary

### Always Do:
- ✅ Validate all user input
- ✅ Sanitize data before display
- ✅ Use parameterized queries
- ✅ Implement rate limiting
- ✅ Log security events
- ✅ Use HTTPS everywhere
- ✅ Implement proper authentication
- ✅ Enable Row Level Security
- ✅ Mask sensitive data
- ✅ Track performance and errors

### Never Do:
- ❌ Trust user input
- ❌ Use `dangerouslySetInnerHTML` with user data
- ❌ Store passwords in plain text
- ❌ Log sensitive information
- ❌ Expose API keys in client code
- ❌ Use `eval()` with user input
- ❌ Ignore security warnings
- ❌ Skip input validation
- ❌ Hard-code secrets
- ❌ Disable security features

## Testing Security Features

### Unit Tests for Validation

```typescript
import { validateEmail, validatePassword } from './utils/validation';

describe('Validation', () => {
  test('validates correct email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  test('rejects invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });

  test('validates strong password', () => {
    const result = validatePassword('SecurePass123!');
    expect(result.valid).toBe(true);
  });

  test('rejects weak password', () => {
    const result = validatePassword('weak');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

### Testing Rate Limiting

```typescript
import { rateLimit } from './utils/security';

describe('Rate Limiting', () => {
  beforeEach(() => {
    rateLimit.reset('test');
  });

  test('allows requests within limit', () => {
    expect(rateLimit.check('test', 5, 60000)).toBe(true);
    expect(rateLimit.check('test', 5, 60000)).toBe(true);
  });

  test('blocks requests exceeding limit', () => {
    for (let i = 0; i < 5; i++) {
      rateLimit.check('test', 5, 60000);
    }
    expect(rateLimit.check('test', 5, 60000)).toBe(false);
  });
});
```

## Monitoring Dashboard Implementation

```typescript
import { monitor, getHealthMetrics, exportMonitoringData } from './utils/monitoring';

const SecurityDashboard = () => {
  const [stats, setStats] = useState(monitor.getStats());
  const [health, setHealth] = useState(getHealthMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(monitor.getStats());
      setHealth(getHealthMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    const data = exportMonitoringData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-logs-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="dashboard">
      <h1>Security Dashboard</h1>

      <div className="health-status">
        <span className={`status-${health.status}`}>
          {health.status}
        </span>
      </div>

      <div className="stats">
        <div>Total Events: {stats.total}</div>
        <div>Errors: {stats.byType.error || 0}</div>
        <div>Security Events: {stats.byType.security || 0}</div>
      </div>

      <button onClick={handleExport}>Export Logs</button>
    </div>
  );
};
```

---

**Last Updated**: 2025-11-01
**Version**: 1.0.0
**Maintainer**: Security Team
