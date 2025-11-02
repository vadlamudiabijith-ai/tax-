export const checkBrowserSupport = () => {
  const features = {
    localStorage: typeof Storage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    fetch: typeof fetch !== 'undefined',
    promise: typeof Promise !== 'undefined',
    arrow: (() => { try { eval('() => {}'); return true; } catch { return false; } })(),
    serviceWorker: 'serviceWorker' in navigator,
    intersectionObserver: 'IntersectionObserver' in window,
  };

  const isSupported = Object.values(features).every(feature => feature);

  return {
    isSupported,
    features,
    browser: detectBrowser(),
  };
};

export const detectBrowser = () => {
  const ua = navigator.userAgent;

  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari';
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('Edg') > -1) return 'Edge';
  if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) return 'IE';

  return 'Unknown';
};

export const getBrowserWarning = () => {
  const browser = detectBrowser();
  const support = checkBrowserSupport();

  if (browser === 'IE') {
    return {
      level: 'error',
      message: 'Internet Explorer is not supported. Please use a modern browser like Chrome, Firefox, Safari, or Edge.',
      shouldBlock: true,
    };
  }

  if (!support.isSupported) {
    return {
      level: 'warning',
      message: 'Your browser may not support all features. For the best experience, please update your browser.',
      shouldBlock: false,
    };
  }

  return null;
};

export const loadPolyfills = async () => {
  return Promise.resolve();
};
