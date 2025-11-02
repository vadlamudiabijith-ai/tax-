export interface MonitoringEvent {
  type: 'error' | 'warning' | 'info' | 'security';
  category: string;
  message: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class SecurityMonitor {
  private events: MonitoringEvent[] = [];
  private readonly MAX_EVENTS = 1000;

  logEvent(event: Omit<MonitoringEvent, 'timestamp'>): void {
    const fullEvent: MonitoringEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(fullEvent);

    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }

    if (event.type === 'error' || event.type === 'security') {
      console.error(`[${event.type.toUpperCase()}] ${event.category}:`, event.message);
    } else {
      console.log(`[${event.type.toUpperCase()}] ${event.category}:`, event.message);
    }
  }

  getEvents(filter?: {
    type?: MonitoringEvent['type'];
    category?: string;
    since?: number;
  }): MonitoringEvent[] {
    let filtered = this.events;

    if (filter?.type) {
      filtered = filtered.filter(e => e.type === filter.type);
    }

    if (filter?.category) {
      filtered = filtered.filter(e => e.category === filter.category);
    }

    if (filter?.since) {
      filtered = filtered.filter(e => e.timestamp >= filter.since);
    }

    return filtered;
  }

  getSecurityEvents(): MonitoringEvent[] {
    return this.getEvents({ type: 'security' });
  }

  getRecentErrors(minutes: number = 5): MonitoringEvent[] {
    const since = Date.now() - minutes * 60 * 1000;
    return this.getEvents({ type: 'error', since });
  }

  clearEvents(): void {
    this.events = [];
  }

  getStats(): {
    total: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    this.events.forEach(event => {
      byType[event.type] = (byType[event.type] || 0) + 1;
      byCategory[event.category] = (byCategory[event.category] || 0) + 1;
    });

    return {
      total: this.events.length,
      byType,
      byCategory
    };
  }
}

export const monitor = new SecurityMonitor();

export const trackUserAction = (action: string, metadata?: Record<string, unknown>): void => {
  monitor.logEvent({
    type: 'info',
    category: 'user_action',
    message: action,
    metadata
  });
};

export const trackError = (error: Error, context?: string): void => {
  monitor.logEvent({
    type: 'error',
    category: 'application_error',
    message: error.message,
    metadata: {
      context,
      stack: error.stack,
      name: error.name
    }
  });
};

export const trackSecurityEvent = (event: string, details?: Record<string, unknown>): void => {
  monitor.logEvent({
    type: 'security',
    category: 'security_event',
    message: event,
    metadata: details
  });
};

export const trackPerformance = (metric: string, value: number, unit: string = 'ms'): void => {
  monitor.logEvent({
    type: 'info',
    category: 'performance',
    message: `${metric}: ${value}${unit}`,
    metadata: { metric, value, unit }
  });
};

export class PerformanceTracker {
  private startTime: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = performance.now();
  }

  end(): void {
    const duration = performance.now() - this.startTime;
    trackPerformance(this.label, Math.round(duration));
  }
}

export const trackAPICall = async <T>(
  endpoint: string,
  call: () => Promise<T>
): Promise<T> => {
  const tracker = new PerformanceTracker(`API: ${endpoint}`);

  try {
    const result = await call();
    tracker.end();
    return result;
  } catch (error) {
    tracker.end();
    trackError(error as Error, `API call to ${endpoint}`);
    throw error;
  }
};

export const trackPageView = (pageName: string): void => {
  monitor.logEvent({
    type: 'info',
    category: 'navigation',
    message: `Page view: ${pageName}`,
    metadata: {
      page: pageName,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    }
  });
};

export const detectAnomalies = (): {
  detected: boolean;
  anomalies: string[];
} => {
  const anomalies: string[] = [];
  const recentErrors = monitor.getRecentErrors(5);

  if (recentErrors.length > 10) {
    anomalies.push('High error rate detected (>10 errors in 5 minutes)');
  }

  const securityEvents = monitor.getSecurityEvents();
  const recentSecurityEvents = securityEvents.filter(
    e => Date.now() - e.timestamp < 5 * 60 * 1000
  );

  if (recentSecurityEvents.length > 5) {
    anomalies.push('Multiple security events detected');
  }

  return {
    detected: anomalies.length > 0,
    anomalies
  };
};

export const getHealthMetrics = (): {
  status: 'healthy' | 'degraded' | 'unhealthy';
  metrics: {
    errorRate: number;
    securityEvents: number;
    lastError?: MonitoringEvent;
  };
} => {
  const stats = monitor.getStats();
  const recentErrors = monitor.getRecentErrors(5);
  const errorRate = recentErrors.length;
  const securityEvents = monitor.getSecurityEvents().length;

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  if (errorRate > 10) {
    status = 'unhealthy';
  } else if (errorRate > 5 || securityEvents > 3) {
    status = 'degraded';
  }

  return {
    status,
    metrics: {
      errorRate,
      securityEvents,
      lastError: recentErrors[recentErrors.length - 1]
    }
  };
};

export const exportMonitoringData = (): string => {
  const data = {
    exportedAt: new Date().toISOString(),
    stats: monitor.getStats(),
    recentErrors: monitor.getRecentErrors(60),
    securityEvents: monitor.getSecurityEvents(),
    health: getHealthMetrics()
  };

  return JSON.stringify(data, null, 2);
};
