import { BaseService } from './BaseService';

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  inApp: boolean;
  sound: boolean;
  vibration: boolean;
  prayerTimes: boolean;
  readingReminders: boolean;
  newContent: boolean;
  systemUpdates: boolean;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  timestamp: number;
  priority: 'low' | 'normal' | 'high';
  category?: 'prayer' | 'reading' | 'content' | 'system';
  scheduledTime?: number;
  recurring?: {
    pattern: 'daily' | 'weekly' | 'custom';
    interval?: number;
    daysOfWeek?: number[];
  };
}

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  template: string;
  variables: Record<string, any>;
  priority: 'low' | 'normal' | 'high';
  scheduledTime?: number;
  category: 'welcome' | 'reminder' | 'newsletter' | 'system';
}

export interface NotificationStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  failed: number;
}

/**
 * Enhanced Notification Service
 * Handles push notifications, email notifications, and in-app notifications
 */
export class NotificationService extends BaseService {
  private static instance: NotificationService;
  protected logger = console;
  private permission: NotificationPermission = 'default';
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private preferences: NotificationPreferences;
  private scheduledNotifications = new Map<string, NodeJS.Timeout>();

  constructor() {
    super({
      baseUrl: '/api/notifications',
      timeout: 10000,
      retries: 2
    });
    
    this.preferences = this.getDefaultPreferences();
    
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.initializeServiceWorker();
      this.checkPermission();
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize service worker for push notifications
   */
  private async initializeServiceWorker(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        this.logger.info('Service worker registered');
      }
    } catch (error) {
      this.logger.error('Service worker registration failed', error);
    }
  }

  /**
   * Check current notification permission
   */
  private checkPermission(): void {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Request notification permission
   */
  public async requestPermission(): Promise<NotificationPermission> {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        this.permission = permission;
        
        this.logger.info('Notification permission:', permission);
        
        if (permission === 'granted') {
          await this.subscribeToPushNotifications();
        }
        
        return permission;
      }
      return 'denied';
    } catch (error) {
      this.logger.error('Failed to request notification permission', error);
      return 'denied';
    }
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribeToPushNotifications(): Promise<void> {
    try {
      if (!this.serviceWorkerRegistration) {
        this.logger.warn('Service worker not available for push notifications');
        return;
      }

      // Check if push messaging is supported
      if (typeof window === 'undefined' || !('PushManager' in window)) {
        this.logger.warn('Push messaging not supported');
        return;
      }

      // Check for VAPID key configuration
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey || vapidKey === 'your-vapid-public-key') {
        this.logger.warn('VAPID key not configured, skipping push subscription');
        return;
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey),
      });      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      this.logger.info('Push subscription successful');
    } catch (error) {
      this.logger.error('Push subscription failed', error);
    }
  }

  /**
   * Send push subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {      // For now, just log the subscription instead of sending to non-existent endpoint
      this.logger.info('Push subscription would be sent to server:', {
        endpoint: subscription.endpoint,
        p256dh: subscription.getKey('p256dh'),
        auth: subscription.getKey('auth')
      });
      
      // In production, uncomment this:
      // const response = await fetch('/api/notifications/subscribe', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(subscription),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to send subscription to server');
      // }
    } catch (error) {
      this.logger.error('Failed to send subscription to server', error);
    }
  }

  /**
   * Show browser notification
   */
  public async showNotification(notification: Omit<PushNotification, 'id' | 'timestamp'>): Promise<string> {
    try {
      if (this.permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      const id = this.generateId();
      const timestamp = Date.now();

      const notificationData: PushNotification = {
        ...notification,
        id,
        timestamp,
      };

      // Use service worker for better notification handling
      if (this.serviceWorkerRegistration) {
        await this.serviceWorkerRegistration.showNotification(notification.title, {
          body: notification.body,
          icon: notification.icon || '/icons/notification-icon.png',
          badge: notification.badge || '/icons/badge-icon.png',
          data: notificationData,
          tag: `${notification.category}-${id}`,
          requireInteraction: notification.priority === 'high',
          silent: !this.preferences.sound,
          vibrate: this.preferences.vibration ? [200, 100, 200] : [],
        } as NotificationOptions);
      } else {
        // Fallback to browser notification
        new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon || '/icons/notification-icon.png',
          data: notificationData,
          tag: `${notification.category}-${id}`,
          silent: !this.preferences.sound,
        });
      }

      this.logger.info('Notification shown', { id, title: notification.title });
      
      // Track notification metrics
      await this.trackNotificationEvent('sent', id);
      
      return id;
    } catch (error) {
      this.logger.error('Failed to show notification', error);
      throw error;
    }
  }

  /**
   * Schedule a notification
   */
  public scheduleNotification(
    notification: Omit<PushNotification, 'id' | 'timestamp'>,
    delay: number
  ): string {
    const id = this.generateId();
    
    const timeout = setTimeout(async () => {
      await this.showNotification(notification);
      this.scheduledNotifications.delete(id);
    }, delay);

    this.scheduledNotifications.set(id, timeout);
    
    this.logger.info('Notification scheduled', { id, delay });
    
    return id;
  }

  /**
   * Cancel a scheduled notification
   */
  public cancelScheduledNotification(id: string): boolean {
    const timeout = this.scheduledNotifications.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledNotifications.delete(id);
      this.logger.info('Scheduled notification cancelled', { id });
      return true;
    }
    return false;
  }

  /**
   * Get notification preferences
   */
  public getPreferences(): NotificationPreferences {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('notification_preferences');
        if (stored) {
          return { ...this.getDefaultPreferences(), ...JSON.parse(stored) };
        }
      }
    } catch (error) {
      this.logger.error('Failed to get notification preferences', error);
    }
    return this.getDefaultPreferences();
  }

  /**
   * Update notification preferences
   */
  public async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      this.preferences = { ...this.preferences, ...preferences };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
      }
      
      // If push notifications are disabled, unsubscribe
      if (!preferences.push && this.serviceWorkerRegistration) {
        const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }
      
      this.logger.info('Notification preferences updated', preferences);
    } catch (error) {
      this.logger.error('Failed to update notification preferences', error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  public async getNotificationStats(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<NotificationStats> {
    try {
      // For now, return mock data instead of fetching from non-existent endpoint
      this.logger.info('Would fetch notification stats for timeframe:', timeframe);
      
      // Return default stats for now
      return {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        failed: 0,
      };
    } catch (error) {
      this.logger.error('Failed to get notification stats', error);
      
      // Return default stats on error
      return {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        failed: 0,
      };
    }
  }

  /**
   * Track notification events
   */
  private async trackNotificationEvent(event: string, notificationId: string): Promise<void> {
    try {
      // For now, just log the event instead of sending to non-existent endpoint
      this.logger.info('Notification event tracked:', {
        event,
        notificationId,
        timestamp: Date.now()
      });
    } catch (error) {
      this.logger.error('Failed to track notification event', error);
    }
  }

  /**
   * Get default notification preferences
   */
  private getDefaultPreferences(): NotificationPreferences {
    return {
      push: true,
      email: true,
      inApp: true,
      sound: true,
      vibration: true,
      prayerTimes: true,
      readingReminders: true,
      newContent: true,
      systemUpdates: true,
    };
  }
  /**
   * Generate unique ID
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert VAPID key for push subscription
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  /**
   * Clear all scheduled notifications
   */
  public clearAllScheduledNotifications(): void {
    this.scheduledNotifications.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.scheduledNotifications.clear();
    this.logger.info('All scheduled notifications cleared');
  }

  /**
   * Test notification functionality
   */
  public async testNotification(): Promise<void> {
    await this.showNotification({
      title: 'Test Notification',
      body: 'Notifications are working correctly!',
      priority: 'normal',
      category: 'system',
    });
  }

  /**
   * Schedule prayer time notifications
   */
  public async schedulePrayerNotifications(prayerTimes: Record<string, string>): Promise<void> {
    try {
      if (this.permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      // Clear any existing prayer notifications first
      this.clearPrayerNotifications();

      const now = new Date();
      const today = now.toDateString();

      for (const [prayer, time] of Object.entries(prayerTimes)) {
        if (!time) continue;

        // Parse prayer time
        const [hours, minutes] = time.split(':').map(Number);
        const prayerDate = new Date();
        prayerDate.setHours(hours, minutes, 0, 0);

        // If prayer time has passed today, schedule for tomorrow
        if (prayerDate <= now) {
          prayerDate.setDate(prayerDate.getDate() + 1);
        }

        const delay = prayerDate.getTime() - now.getTime();

        // Schedule the notification
        const notificationId = this.scheduleNotification({
          title: `${prayer} Prayer Time`,
          body: `It's time for ${prayer} prayer`,
          priority: 'high',
          category: 'prayer',
          icon: '/icons/prayer-icon.png',
        }, delay);

        this.logger.info(`Scheduled ${prayer} prayer notification`, {
          prayer,
          time,
          delay,
          notificationId
        });
      }
    } catch (error) {
      this.logger.error('Failed to schedule prayer notifications', error);
      throw error;
    }
  }

  /**
   * Clear all prayer notifications
   */
  public clearPrayerNotifications(): void {
    // Clear all scheduled notifications (in a real implementation, you'd want to track prayer-specific ones)
    this.clearAllScheduledNotifications();
    this.logger.info('Prayer notifications cleared');
  }
}

export const notificationService = NotificationService.getInstance();
