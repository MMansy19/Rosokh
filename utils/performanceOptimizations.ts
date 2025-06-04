interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  largestChunks: Array<{ name: string; size: number }>;
  unusedCode: number;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = [];
  private static observers: Map<string, PerformanceObserver> = new Map();

  static startMeasurement(name: string, context?: Record<string, any>): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric({
        name,
        value: duration,
        timestamp: Date.now(),
        context
      });
    };
  }

  static recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Report critical performance issues
    if (metric.value > 5000) { // > 5 seconds
      console.warn(`Performance issue detected: ${metric.name} took ${metric.value}ms`);
    }
  }

  static getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  static getAverageMetric(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    return metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length;
  }

  static observeWebVitals(): void {
    if (typeof window === 'undefined') return;

    // First Contentful Paint
    this.observeMetric('paint', (entries) => {
      const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        this.recordMetric({
          name: 'FCP',
          value: fcp.startTime,
          timestamp: Date.now()
        });
      }
    });

    // Largest Contentful Paint
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lcp = entries[entries.length - 1];
      if (lcp) {
        this.recordMetric({
          name: 'LCP',
          value: lcp.startTime,
          timestamp: Date.now()
        });
      }
    });    // First Input Delay
    this.observeMetric('first-input', (entries) => {
      const fid = entries[0] as PerformanceEventTiming;
      if (fid && 'processingStart' in fid) {
        this.recordMetric({
          name: 'FID',
          value: fid.processingStart - fid.startTime,
          timestamp: Date.now()
        });
      }
    });

    // Cumulative Layout Shift
    this.observeMetric('layout-shift', (entries) => {
      let cls = 0;
      for (const entry of entries) {
        if (!(entry as any).hadRecentInput) {
          cls += (entry as any).value;
        }
      }
      
      this.recordMetric({
        name: 'CLS',
        value: cls,
        timestamp: Date.now()
      });
    });
  }

  private static observeMetric(
    type: string, 
    callback: (entries: PerformanceEntry[]) => void
  ): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ entryTypes: [type] });
      this.observers.set(type, observer);
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  static cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.length = 0;
  }
}

// Bundle size analysis
export class BundleAnalyzer {
  static async analyzeBundleSize(): Promise<BundleAnalysis> {
    // This would integrate with webpack-bundle-analyzer or similar
    // For now, return mock data
    return {
      totalSize: 2.5 * 1024 * 1024, // 2.5MB
      gzippedSize: 0.8 * 1024 * 1024, // 800KB
      largestChunks: [
        { name: 'main.js', size: 1.2 * 1024 * 1024 },
        { name: 'vendor.js', size: 0.8 * 1024 * 1024 },
        { name: 'audio-player.js', size: 0.3 * 1024 * 1024 }
      ],
      unusedCode: 0.2 * 1024 * 1024 // 200KB
    };
  }

  static formatSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    
    return `${size.toFixed(2)} ${sizes[i]}`;
  }
}

// Code splitting utilities
export class CodeSplitter {
  private static loadedChunks = new Set<string>();

  static async loadChunk<T>(
    chunkName: string,
    loader: () => Promise<T>
  ): Promise<T> {
    const endMeasurement = PerformanceMonitor.startMeasurement(`chunk-load-${chunkName}`);
    
    try {
      if (this.loadedChunks.has(chunkName)) {
        // Return from cache if already loaded
        return await loader();
      }

      const module = await loader();
      this.loadedChunks.add(chunkName);
      
      return module;
    } finally {
      endMeasurement();
    }
  }

  static preloadChunk(loader: () => Promise<any>): void {
    // Preload during idle time
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        loader().catch(() => {
          // Silent fail for preloading
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        loader().catch(() => {
          // Silent fail for preloading
        });
      }, 100);
    }
  }
}

// Memory management
export class MemoryManager {
  private static cache = new Map<string, { data: any; timestamp: number; size: number }>();
  private static maxCacheSize = 50 * 1024 * 1024; // 50MB
  private static currentCacheSize = 0;

  static set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    const size = this.estimateSize(data);
    
    // Clean up if cache is getting too large
    if (this.currentCacheSize + size > this.maxCacheSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl,
      size
    });
    
    this.currentCacheSize += size;
  }

  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.timestamp) {
      // Expired
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  static delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentCacheSize -= entry.size;
      this.cache.delete(key);
    }
  }

  static cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp) {
        toDelete.push(key);
      }
    }

    // If still over limit, remove oldest entries
    if (this.currentCacheSize > this.maxCacheSize * 0.8) {
      const entries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const removeCount = Math.floor(entries.length * 0.3);
      for (let i = 0; i < removeCount; i++) {
        toDelete.push(entries[i][0]);
      }
    }

    toDelete.forEach(key => this.delete(key));
  }

  private static estimateSize(obj: any): number {
    // Rough estimation of object size in bytes
    return JSON.stringify(obj).length * 2; // UTF-16 encoding
  }

  static getStats() {
    return {
      cacheSize: this.currentCacheSize,
      maxCacheSize: this.maxCacheSize,
      entryCount: this.cache.size,
      memoryUsage: this.getMemoryUsage()
    };
  }

  private static getMemoryUsage() {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }
}

// Image optimization
export class ImageOptimizer {
  static optimizeImage(
    src: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpeg' | 'png';
      lazy?: boolean;
    } = {}
  ): {
    src: string;
    srcSet?: string;
    sizes?: string;
    loading?: 'lazy' | 'eager';
  } {
    const {
      width,
      height,
      quality = 75,
      format = 'webp',
      lazy = true
    } = options;

    // In a real implementation, this would integrate with Next.js Image or similar
    let optimizedSrc = src;
    
    // Mock optimization parameters
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality) params.append('q', quality.toString());
    if (format) params.append('f', format);

    if (params.toString()) {
      optimizedSrc += `?${params.toString()}`;
    }

    // Generate responsive srcSet
    const srcSet = width ? [
      `${optimizedSrc}&w=${Math.round(width * 0.5)} ${Math.round(width * 0.5)}w`,
      `${optimizedSrc}&w=${width} ${width}w`,
      `${optimizedSrc}&w=${Math.round(width * 1.5)} ${Math.round(width * 1.5)}w`,
      `${optimizedSrc}&w=${Math.round(width * 2)} ${Math.round(width * 2)}w`
    ].join(', ') : undefined;

    return {
      src: optimizedSrc,
      srcSet,
      sizes: width ? `(max-width: ${width}px) 100vw, ${width}px` : undefined,
      loading: lazy ? 'lazy' : 'eager'
    };
  }

  static preloadCriticalImages(images: string[]): void {
    images.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = src;
      link.as = 'image';
      document.head.appendChild(link);
    });
  }
}

// Performance-oriented React hooks
export function usePerformanceMonitoring(componentName: string) {
  const renderCount = React.useRef(0);
  const mountTime = React.useRef<number>(0);

  React.useEffect(() => {
    mountTime.current = performance.now();
    renderCount.current++;

    return () => {
      const unmountTime = performance.now();
      PerformanceMonitor.recordMetric({
        name: `component-lifecycle-${componentName}`,
        value: unmountTime - mountTime.current,
        timestamp: Date.now(),
        context: { renderCount: renderCount.current }
      });
    };
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    recordMetric: (name: string, value: number, context?: Record<string, any>) => {
      PerformanceMonitor.recordMetric({
        name: `${componentName}-${name}`,
        value,
        timestamp: Date.now(),
        context
      });
    }
  };
}

// Import React for the hook
import React from 'react';
