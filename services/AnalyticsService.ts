import { BaseService } from './BaseService';

export interface AnalyticsEvent {
  event: string;
  category: 'user' | 'content' | 'performance' | 'engagement' | 'error';
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
  page?: string;
  source?: string;
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  pageViews: number;
  events: AnalyticsEvent[];
  userAgent: string;
  referrer: string;
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
}

export interface PageView {
  page: string;
  title: string;
  timestamp: number;
  duration?: number;
  userId?: string;
  sessionId: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface ConversionGoal {
  id: string;
  name: string;
  description: string;
  type: 'page_view' | 'event' | 'duration' | 'custom';
  target: string | number;
  value?: number;
}

export interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  sessions: number;
  pageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  topPages: Array<{ page: string; views: number; duration: number }>;
  topEvents: Array<{ event: string; count: number }>;
  userFlow: Array<{ from: string; to: string; count: number }>;
  deviceTypes: Record<string, number>;
  browsers: Record<string, number>;
  countries: Record<string, number>;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  domContentLoaded: number;
  resourceLoadTime: Record<string, number>;
}

export interface ErrorAnalytics {
  errorType: string;
  errorMessage: string;
  stack?: string;
  page: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  context?: Record<string, any>;
}

/**
 * Enhanced Analytics Service
 * Provides comprehensive analytics tracking for user behavior, performance, and errors
 */
export class AnalyticsService extends BaseService {
  private static instance: AnalyticsService;
  private currentSession: UserSession | null = null;
  private sessionStartTime: number = Date.now();
  private currentPageStartTime: number = Date.now();
  private eventQueue: AnalyticsEvent[] = [];
  private performanceObserver: PerformanceObserver | null = null;
  private userId?: string;
  private isEnabled: boolean = true;
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;
  constructor() {
    super({
      baseUrl: '/api/analytics',
      timeout: 15000,
      retries: 2
    });
    
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.initializeSession();
      this.setupPerformanceMonitoring();
      this.setupErrorTracking();
      this.setupBatchProcessing();
      this.trackPageView(window.location.pathname);
    }
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize analytics session
   */
  private initializeSession(): void {
    const sessionId = this.generateSessionId();
    
    this.currentSession = {
      id: sessionId,
      userId: this.getUserId(),
      startTime: this.sessionStartTime,
      pageViews: 0,
      events: [],
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    };

    // Detect user location (approximate)
    this.detectUserLocation();

    this.logger.info('Analytics session initialized', { sessionId });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get or generate user ID
   */
  private getUserId(): string {
    if (this.userId) return this.userId;

    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_user_id', userId);
    }
    
    this.userId = userId;
    return userId;
  }

  /**
   * Detect user location using browser APIs
   */
  private async detectUserLocation(): Promise<void> {
    try {
      // Try to get timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      if (this.currentSession) {
        this.currentSession.location = { timezone };
      }

      // In a real implementation, you might use a geolocation service
      // For privacy reasons, we'll keep it minimal
    } catch (error) {
      this.logger.error('Failed to detect user location', error);
    }
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    try {
      // Web Vitals monitoring
      if ('PerformanceObserver' in window) {
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackPerformanceMetric(entry);
          }
        });

        // Observe different types of performance entries
        try {
          this.performanceObserver.observe({ entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint'] });
        } catch (error) {
          // Fallback for browsers that don't support all entry types
          this.performanceObserver.observe({ entryTypes: ['navigation'] });
        }
      }

      // Track page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.trackPageLoadPerformance();
        }, 0);
      });

    } catch (error) {
      this.logger.error('Failed to setup performance monitoring', error);
    }
  }

  /**
   * Setup error tracking
   */
  private setupErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        errorType: 'javascript',
        errorMessage: event.message,
        stack: event.error?.stack,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: this.currentSession?.id || 'unknown',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        errorType: 'promise_rejection',
        errorMessage: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: this.currentSession?.id || 'unknown',
      });
    });
  }

  /**
   * Setup batch processing for events
   */
  private setupBatchProcessing(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);

    // Flush events before page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
      this.endSession();
    });

    // Flush events when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flushEvents();
      }
    });
  }

  /**
   * Track custom event
   */
  public trackEvent(
    event: string,
    category: AnalyticsEvent['category'] = 'user',
    properties?: Record<string, any>
  ): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      properties,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.currentSession?.id,
      page: window.location.pathname,
      source: 'web',
    };

    this.eventQueue.push(analyticsEvent);
    
    if (this.currentSession) {
      this.currentSession.events.push(analyticsEvent);
    }

    this.logger.debug('Event tracked', analyticsEvent);

    // Flush if queue is full
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  /**
   * Track page view
   */
  public trackPageView(page: string, title?: string): void {
    if (!this.isEnabled) return;

    // End previous page timing
    if (this.currentPageStartTime) {
      const duration = Date.now() - this.currentPageStartTime;
      this.trackEvent('page_duration', 'engagement', {
        page: window.location.pathname,
        duration,
      });
    }

    // Start new page timing
    this.currentPageStartTime = Date.now();

    const pageView: PageView = {
      page,
      title: title || document.title,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.currentSession?.id || 'unknown',
      referrer: document.referrer,
    };

    // Extract UTM parameters
    const urlParams = new URLSearchParams(window.location.search);
    pageView.utmSource = urlParams.get('utm_source') || undefined;
    pageView.utmMedium = urlParams.get('utm_medium') || undefined;
    pageView.utmCampaign = urlParams.get('utm_campaign') || undefined;

    if (this.currentSession) {
      this.currentSession.pageViews++;
    }

    this.trackEvent('page_view', 'content', pageView);
    
    this.logger.info('Page view tracked', { page, title });
  }

  /**
   * Track user interaction
   */
  public trackInteraction(element: string, action: string, context?: Record<string, any>): void {
    this.trackEvent('user_interaction', 'engagement', {
      element,
      action,
      ...context,
    });
  }

  /**
   * Track Quran reading session
   */
  public trackQuranReading(surah: number, ayah: number, duration: number): void {
    this.trackEvent('quran_reading', 'engagement', {
      surah,
      ayah,
      duration,
      activity: 'reading',
    });
  }

  /**
   * Track audio playback
   */
  public trackAudioPlayback(trackId: string, duration: number, completed: boolean): void {
    this.trackEvent('audio_playback', 'content', {
      trackId,
      duration,
      completed,
      activity: 'audio',
    });
  }

  /**
   * Track search query
   */
  public trackSearch(query: string, category: string, resultsCount: number): void {
    this.trackEvent('search', 'engagement', {
      query,
      category,
      resultsCount,
    });
  }

  /**
   * Track conversion goal
   */
  public trackConversion(goalId: string, value?: number): void {
    this.trackEvent('conversion', 'user', {
      goalId,
      value,
    });
  }

  /**
   * Track performance metric
   */
  private trackPerformanceMetric(entry: PerformanceEntry): void {
    const metric = {
      name: entry.name,
      type: entry.entryType,
      startTime: entry.startTime,
      duration: entry.duration,
    };

    // Add specific properties based on entry type
    if (entry.entryType === 'navigation') {
      const navEntry = entry as PerformanceNavigationTiming;
      Object.assign(metric, {
        domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
        loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
        dnsLookup: navEntry.domainLookupEnd - navEntry.domainLookupStart,
        tcpConnect: navEntry.connectEnd - navEntry.connectStart,
        serverResponse: navEntry.responseEnd - navEntry.requestStart,
      });
    }

    this.trackEvent('performance_metric', 'performance', metric);
  }

  /**
   * Track page load performance
   */
  private trackPageLoadPerformance(): void {
    try {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (perfData) {
        const metrics: PerformanceMetrics = {
          pageLoadTime: perfData.loadEventEnd - perfData.loadEventStart,
          firstContentfulPaint: 0, // Would need Paint Timing API
          largestContentfulPaint: 0, // Would need LCP API
          firstInputDelay: 0, // Would need FID API
          cumulativeLayoutShift: 0, // Would need CLS API
          timeToInteractive: 0, // Custom calculation
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          resourceLoadTime: {},
        };

        this.trackEvent('page_load_performance', 'performance', metrics);
      }
    } catch (error) {
      this.logger.error('Failed to track page load performance', error);
    }
  }

  /**
   * Track error
   */
  public trackError(error: ErrorAnalytics): void {
    if (!this.isEnabled) return;

    this.trackEvent('error', 'error', error);
    
    this.logger.error('Error tracked', error);
  }  /**
   * Flush events to server
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      const events = [...this.eventQueue];
      this.eventQueue = [];

      // For now, just store events locally instead of sending to server
      // In production, you would implement the analytics API endpoint
      this.logger.debug('Analytics events stored locally', { count: events.length });
      
      // Store in localStorage for debugging purposes
      if (typeof window !== 'undefined') {
        const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        storedEvents.push(...events);
        // Keep only last 100 events to prevent storage overflow
        if (storedEvents.length > 100) {
          storedEvents.splice(0, storedEvents.length - 100);
        }
        localStorage.setItem('analytics_events', JSON.stringify(storedEvents));
      }
    } catch (error) {
      this.logger.error('Failed to flush analytics events', error);
      // Don't re-throw to prevent infinite loops
    }
  }

  /**
   * End current session
   */
  private endSession(): void {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;

    this.trackEvent('session_end', 'user', {
      duration: this.currentSession.duration,
      pageViews: this.currentSession.pageViews,
      eventCount: this.currentSession.events.length,
    });

    this.flushEvents();
  }

  /**
   * Get analytics metrics
   */
  public async getMetrics(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<AnalyticsMetrics> {
    try {
      const response = await fetch(`/api/analytics/metrics?timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics metrics');
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Failed to get analytics metrics', error);
      
      // Return default metrics on error
      return {
        totalUsers: 0,
        activeUsers: 0,
        sessions: 0,
        pageViews: 0,
        averageSessionDuration: 0,
        bounceRate: 0,
        conversionRate: 0,
        topPages: [],
        topEvents: [],
        userFlow: [],
        deviceTypes: {},
        browsers: {},
        countries: {},
      };
    }
  }

  /**
   * Enable/disable analytics
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (!enabled) {
      this.flushEvents();
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
        this.flushTimer = null;
      }
    } else if (!this.flushTimer) {
      this.setupBatchProcessing();
    }

    this.logger.info('Analytics enabled status changed', { enabled });
  }

  /**
   * Set user ID for tracking
   */
  public setUserId(userId: string): void {
    this.userId = userId;
    if (this.currentSession) {
      this.currentSession.userId = userId;
    }
    localStorage.setItem('analytics_user_id', userId);
  }

  /**
   * Clear user data (GDPR compliance)
   */
  public clearUserData(): void {
    localStorage.removeItem('analytics_user_id');
    this.userId = undefined;
    if (this.currentSession) {
      this.currentSession.userId = undefined;
    }
    this.trackEvent('user_data_cleared', 'user');
    this.flushEvents();
  }

  /**
   * Get session information
   */
  public getSessionInfo(): UserSession | null {
    return this.currentSession;
  }

  /**
   * Track custom timing
   */
  public trackTiming(category: string, variable: string, time: number, label?: string): void {
    this.trackEvent('timing', 'performance', {
      category,
      variable,
      time,
      label,
    });
  }

  /**
   * Start timing measurement
   */
  public startTiming(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.trackTiming('custom', label, duration);
    };
  }
}

export const analyticsService = AnalyticsService.getInstance();
