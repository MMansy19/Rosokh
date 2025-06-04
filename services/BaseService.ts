// Base Service Class with Error Handling and Performance Optimizations
import { AppError, NetworkError, ServerError, NotFoundError, withRetry, withErrorHandling } from '../utils/errorHandling';

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number;
  staleWhileRevalidate: boolean;
}

export interface ServiceConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  cache: CacheConfig;
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  skipCache?: boolean;
  cacheKey?: string;
}

export class BaseService {
  protected config: ServiceConfig;
  protected logger: {
    info: (message: string, data?: any) => void;
    error: (message: string, data?: any) => void;
    debug: (message: string, data?: any) => void;
    warn: (message: string, data?: any) => void;
  };
  private cache = new Map<string, { data: any; timestamp: number; stale: boolean }>();
  private requestCounter = 0;
  private performanceMetrics = new Map<string, number[]>();
  constructor(config: Partial<ServiceConfig> = {}) {
    this.config = {
      baseUrl: '/api',
      timeout: 10000,
      retries: 3,
      cache: {
        ttl: 5 * 60 * 1000, // 5 minutes
        maxSize: 100,
        staleWhileRevalidate: true,
      },
      ...config,
    };

    // Initialize logger
    this.logger = {
      info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data || ''),
      error: (message: string, data?: any) => console.error(`[ERROR] ${message}`, data || ''),
      debug: (message: string, data?: any) => console.debug(`[DEBUG] ${message}`, data || ''),
      warn: (message: string, data?: any) => console.warn(`[WARN] ${message}`, data || ''),
    };

    // Auto-cleanup cache periodically
    this.setupCacheCleanup();
  }

  private setupCacheCleanup() {
    setInterval(() => {
      this.cleanupCache();
    }, this.config.cache.ttl);
  }

  private cleanupCache() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    for (const [key, { timestamp }] of entries) {
      if (now - timestamp > this.config.cache.ttl) {
        this.cache.delete(key);
      }
    }

    // Remove oldest entries if cache is too large
    if (this.cache.size > this.config.cache.maxSize) {
      const sortedEntries = entries
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)
        .slice(0, this.cache.size - this.config.cache.maxSize);
      
      for (const [key] of sortedEntries) {
        this.cache.delete(key);
      }
    }
  }

  private getCacheKey(url: string, options: RequestOptions = {}): string {
    if (options.cacheKey) return options.cacheKey;
    
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  private isCacheValid(entry: { timestamp: number; stale: boolean }): boolean {
    const age = Date.now() - entry.timestamp;
    return age < this.config.cache.ttl && !entry.stale;
  }

  private markCacheStale(cacheKey: string) {
    const entry = this.cache.get(cacheKey);
    if (entry) {
      entry.stale = true;
      this.cache.set(cacheKey, entry);
    }
  }

  protected async fetchWithErrorHandling<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const startTime = Date.now();
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;
    const cacheKey = this.getCacheKey(fullUrl, options);
    
    // Check cache first (unless skipCache is true)
    if (!options.skipCache && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        this.recordPerformanceMetric(url, Date.now() - startTime);
        console.log(`[cached data]  -  ${cached.data}`);
        return cached.data;
      }

      // Serve stale content while revalidating
      if (cached && this.config.cache.staleWhileRevalidate) {
        // Trigger background refresh
        this.refreshInBackground(fullUrl, options, cacheKey);
        this.recordPerformanceMetric(url, Date.now() - startTime);
        return cached.data;
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, options.timeout || this.config.timeout);

    try {
      const response = await withRetry(
        async () => {
          const fetchOptions: RequestInit = {
            ...options,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              'X-Request-ID': `${++this.requestCounter}-${Date.now()}`,
              ...options.headers,
            },
          };

          const response = await fetch(fullUrl, fetchOptions);
          
          if (!response.ok) {
            await this.handleHttpError(response);
          }

          return response;
        },
        options.retries || this.config.retries,
        1000,
        (attempt, error) => {
          console.warn(`Retry attempt ${attempt} for ${url}:`, error.message);
        }
      );

      const data = await response.json();

      // Cache successful responses
      if (!options.skipCache && (options.method === 'GET' || !options.method)) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          stale: false,
        });
      }

      this.recordPerformanceMetric(url, Date.now() - startTime);
      return data;

    } catch (error) {
      this.recordPerformanceMetric(url, Date.now() - startTime);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async refreshInBackground(url: string, options: RequestOptions, cacheKey: string) {
    try {
      const fresh = await this.fetchWithErrorHandling(url, { ...options, skipCache: true });
      this.cache.set(cacheKey, {
        data: fresh,
        timestamp: Date.now(),
        stale: false,
      });
    } catch (error) {
      // Mark cache as stale if background refresh fails
      this.markCacheStale(cacheKey);
    }
  }

  private async handleHttpError(response: Response): Promise<never> {
    const errorText = await response.text().catch(() => 'Unknown error');
    
    switch (response.status) {
      case 404:
        throw new NotFoundError(`Resource not found: ${response.url}`);
      case 401:
      case 403:
        throw new NetworkError(`Authentication error (${response.status}): ${errorText}`, response.status);
      case 429:
        throw new NetworkError(`Rate limit exceeded (${response.status}): ${errorText}`, response.status);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(`Server error (${response.status}): ${errorText}`, response.status);
      default:
        if (response.status >= 400 && response.status < 500) {
          throw new NetworkError(`Client error (${response.status}): ${errorText}`, response.status);
        }
        throw new ServerError(`HTTP error (${response.status}): ${errorText}`, response.status);
    }
  }

  private recordPerformanceMetric(endpoint: string, duration: number) {
    if (!this.performanceMetrics.has(endpoint)) {
      this.performanceMetrics.set(endpoint, []);
    }
    
    const metrics = this.performanceMetrics.get(endpoint)!;
    metrics.push(duration);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }
  public getPerformanceMetrics(endpoint?: string): any {
    if (endpoint) {
      const metrics = this.performanceMetrics.get(endpoint) || [];
      return {
        endpoint,
        count: metrics.length,
        average: metrics.length ? metrics.reduce((a, b) => a + b, 0) / metrics.length : 0,
        min: metrics.length ? Math.min(...metrics) : 0,
        max: metrics.length ? Math.max(...metrics) : 0,
      };
    }

    return Array.from(this.performanceMetrics.keys()).map((endpoint: string) =>
      this.getPerformanceMetrics(endpoint)
    );
  }

  public clearCache(pattern?: string) {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  public getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.cache.maxSize,
      hitRate: this.calculateHitRate(),
      oldestEntry: this.getOldestEntry(),
    };
  }

  private calculateHitRate(): number {
    // Simplified hit rate calculation
    // In a real implementation, you'd track hits vs misses
    return 0.75; // Placeholder
  }
  private getOldestEntry(): number {
    let oldest = Date.now();
    for (const { timestamp } of this.cache.values()) {
      if (timestamp < oldest) {
        oldest = timestamp;
      }
    }
    return oldest;
  }

  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
