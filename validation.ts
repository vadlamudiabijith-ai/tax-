export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 1000000000 && !isNaN(amount);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\d\s+()-]{10,20}$/;
  return phoneRegex.test(phone);
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 1000);
};

export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

export const validateURL = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const validateFileUpload = (file: File, maxSizeMB: number = 5, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif']): { valid: boolean; error?: string } => {
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}` };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }

  return { valid: true };
};

export const validateCampaignTitle = (title: string): boolean => {
  return title.length >= 3 && title.length <= 200;
};

export const validateCampaignDescription = (description: string): boolean => {
  return description.length >= 10 && description.length <= 5000;
};

export const validateTaxID = (taxId: string): boolean => {
  const taxIdRegex = /^[A-Z0-9]{8,15}$/;
  return taxIdRegex.test(taxId.toUpperCase());
};

export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const isValidDate = (date: string): boolean => {
  const parsed = Date.parse(date);
  return !isNaN(parsed);
};

export const isPastDate = (date: string): boolean => {
  return new Date(date) < new Date();
};

export const isFutureDate = (date: string): boolean => {
  return new Date(date) > new Date();
};
