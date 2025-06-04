import { Metadata } from 'next';

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
  locale?: string;
  type?: 'website' | 'article' | 'audio' | 'video';
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  author?: string;
  structuredData?: any;
}

export class SEOOptimizer {
  private static readonly DEFAULT_TITLE = 'Rosokh - Islamic Audio Platform';
  private static readonly DEFAULT_DESCRIPTION = 'Discover and listen to Islamic audio content including Quran recitations, lectures, and more.';
  private static readonly DEFAULT_KEYWORDS = ['islamic', 'audio', 'quran', 'recitation', 'lectures', 'islamic content'];
  private static readonly SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rosokh.vercel.app';

  static generateMetadata(config: SEOConfig = {}): Metadata {
    const {
      title,
      description = this.DEFAULT_DESCRIPTION,
      keywords = [],
      ogImage,
      canonical,
      noIndex = false,
      locale = 'en',
      type = 'website',
      publishedTime,
      modifiedTime,
      section,
      tags = [],
      author,
      structuredData
    } = config;

    const fullTitle = title 
      ? `${title} | ${this.DEFAULT_TITLE}`
      : this.DEFAULT_TITLE;

    const fullKeywords = [...this.DEFAULT_KEYWORDS, ...keywords];
    const canonicalUrl = canonical ? `${this.SITE_URL}${canonical}` : undefined;
    const imageUrl = ogImage ? `${this.SITE_URL}${ogImage}` : `${this.SITE_URL}/images/og-default.jpg`;

    const metadata: Metadata = {
      title: fullTitle,
      description,
      keywords: fullKeywords.join(', '),
      authors: author ? [{ name: author }] : undefined,
      
      // Open Graph
      openGraph: {
        title: fullTitle,
        description,
        url: canonicalUrl,
        siteName: this.DEFAULT_TITLE,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title || this.DEFAULT_TITLE,
          },
        ],
        locale,
        type: type as any,
        ...(publishedTime && { publishedTime }),
        ...(modifiedTime && { modifiedTime }),
        ...(section && { section }),
        ...(tags.length && { tags }),
      },

      // Twitter
      twitter: {
        card: 'summary_large_image',
        title: fullTitle,
        description,
        images: [imageUrl],
        creator: '@rosokh',
        site: '@rosokh',
      },

      // Additional metadata
      alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
      robots: noIndex ? 'noindex, nofollow' : 'index, follow',
      
      // Structured data will be handled separately
      other: structuredData ? { 'structured-data': JSON.stringify(structuredData) } : undefined,
    };

    return metadata;
  }

  static generateStructuredData(type: 'website' | 'audioObject' | 'article' | 'breadcrumb', data: any) {
    const baseContext = {
      '@context': 'https://schema.org',
    };

    switch (type) {
      case 'website':
        return {
          ...baseContext,
          '@type': 'WebSite',
          name: this.DEFAULT_TITLE,
          url: this.SITE_URL,
          description: this.DEFAULT_DESCRIPTION,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${this.SITE_URL}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
          ...data,
        };

      case 'audioObject':
        return {
          ...baseContext,
          '@type': 'AudioObject',
          name: data.title,
          description: data.description,
          contentUrl: data.url,
          duration: data.duration,
          encodingFormat: data.format || 'audio/mpeg',
          author: {
            '@type': 'Person',
            name: data.author || data.reciter,
          },
          publisher: {
            '@type': 'Organization',
            name: this.DEFAULT_TITLE,
            url: this.SITE_URL,
          },
          datePublished: data.datePublished,
          inLanguage: data.language || 'ar',
          genre: data.genre || 'Religious',
          keywords: data.keywords || ['islamic', 'audio', 'quran'],
          ...data,
        };

      case 'article':
        return {
          ...baseContext,
          '@type': 'Article',
          headline: data.title,
          description: data.description,
          author: {
            '@type': 'Person',
            name: data.author,
          },
          publisher: {
            '@type': 'Organization',
            name: this.DEFAULT_TITLE,
            url: this.SITE_URL,
          },
          datePublished: data.datePublished,
          dateModified: data.dateModified || data.datePublished,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': data.url,
          },
          image: data.image,
          articleSection: data.section,
          keywords: data.keywords,
          ...data,
        };

      case 'breadcrumb':
        return {
          ...baseContext,
          '@type': 'BreadcrumbList',
          itemListElement: data.items.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url ? `${this.SITE_URL}${item.url}` : undefined,
          })),
        };

      default:
        return { ...baseContext, ...data };
    }
  }

  static generateHrefLang(languages: { [key: string]: string }, currentLocale: string) {
    return Object.entries(languages).map(([locale, url]) => ({
      hreflang: locale,
      href: url,
    }));
  }

  static generateSitemap(pages: Array<{
    url: string;
    lastModified?: Date;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  }>) {
    const baseUrl = this.SITE_URL;
    
    return {
      sitemap: pages.map(page => ({
        url: `${baseUrl}${page.url}`,
        lastModified: page.lastModified || new Date(),
        changeFrequency: page.changeFrequency || 'weekly',
        priority: page.priority || 0.5,
      })),
    };
  }

  static generateRobotsTxt(options: {
    disallowedPaths?: string[];
    allowedPaths?: string[];
    crawlDelay?: number;
    sitemapUrl?: string;
  } = {}) {
    const {
      disallowedPaths = ['/admin', '/api', '/_next'],
      allowedPaths = ['/'],
      crawlDelay,
      sitemapUrl = `${this.SITE_URL}/sitemap.xml`
    } = options;

    let robots = 'User-agent: *\n';
    
    allowedPaths.forEach(path => {
      robots += `Allow: ${path}\n`;
    });
    
    disallowedPaths.forEach(path => {
      robots += `Disallow: ${path}\n`;
    });
    
    if (crawlDelay) {
      robots += `Crawl-delay: ${crawlDelay}\n`;
    }
    
    robots += `\nSitemap: ${sitemapUrl}`;
    
    return robots;
  }

  static optimizeImageAlt(title: string, context?: string): string {
    const baseAlt = title.trim();
    
    if (context) {
      return `${baseAlt} - ${context}`;
    }
    
    return baseAlt;
  }

  static generateCanonicalUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.SITE_URL}${cleanPath}`;
  }

  static validateMetadata(metadata: SEOConfig): string[] {
    const issues: string[] = [];
    
    if (!metadata.title || metadata.title.length > 60) {
      issues.push('Title should be between 1-60 characters');
    }
    
    if (!metadata.description || metadata.description.length > 160) {
      issues.push('Description should be between 1-160 characters');
    }
    
    if (metadata.keywords && metadata.keywords.length > 10) {
      issues.push('Too many keywords (recommended max: 10)');
    }
    
    return issues;
  }
}

// Performance monitoring for SEO
export class SEOPerformanceMonitor {
  static measurePageLoadMetrics() {
    if (typeof window === 'undefined') return null;

    return new Promise<{
      fcp: number;
      lcp: number;
      cls: number;
      fid: number;
    }>((resolve) => {
      // First Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
        
        // This is a simplified version - in production, use web-vitals library
        resolve({
          fcp: fcp?.startTime || 0,
          lcp: 0, // Would need actual LCP measurement
          cls: 0, // Would need actual CLS measurement
          fid: 0, // Would need actual FID measurement
        });
      }).observe({ entryTypes: ['paint'] });
    });
  }

  static reportToAnalytics(metrics: any) {
    // In production, integrate with Google Analytics, Google Search Console, etc.
    if (process.env.NODE_ENV === 'development') {
      console.log('SEO Performance Metrics:', metrics);
    }
  }
}
