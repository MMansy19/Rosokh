import { BaseService } from "./BaseService";
import { withErrorHandling } from "../utils/errorHandling";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: string;
  lastActiveAt: string;
}

export interface UserPreferences {
  language: "en" | "ar" | "ru";
  theme: "light" | "dark" | "auto";
  audioQuality: "low" | "medium" | "high";
  autoPlay: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    largeText: boolean;
  };
  privacy: {
    analytics: boolean;
    personalization: boolean;
    marketing: boolean;
  };
}

export interface UserService {
  getCurrentUser(): Promise<User | null>;
  updateProfile(data: Partial<User>): Promise<User>;
  updatePreferences(
    preferences: Partial<UserPreferences>,
  ): Promise<UserPreferences>;
  getFavorites(): Promise<string[]>;
  addToFavorites(trackId: string): Promise<void>;
  removeFromFavorites(trackId: string): Promise<void>;
  getListeningHistory(): Promise<
    Array<{ trackId: string; timestamp: string; duration: number }>
  >;
  recordListeningSession(trackId: string, duration: number): Promise<void>;
  deleteAccount(): Promise<void>;
  exportUserData(): Promise<any>;
}

class UserServiceImpl extends BaseService implements UserService {
  constructor() {
    super({
      baseUrl: "/api/user",
      timeout: 15000,
      retries: 2,
      cache: {
        ttl: 2 * 60 * 1000, // 2 minutes for user data
        maxSize: 50,
        staleWhileRevalidate: true,
      },
    });
  }

  async getCurrentUser(): Promise<User | null> {
    return await withErrorHandling(async () => {
      return await this.fetchWithErrorHandling<User>("/profile", {
        cacheKey: "current-user",
      });
    });
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const updatedUser = await this.fetchWithErrorHandling<User>("/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
      skipCache: true,
    });

    // Invalidate user cache
    this.clearCache("current-user");

    return updatedUser;
  }

  async updatePreferences(
    preferences: Partial<UserPreferences>,
  ): Promise<UserPreferences> {
    const updatedPreferences =
      await this.fetchWithErrorHandling<UserPreferences>("/preferences", {
        method: "PATCH",
        body: JSON.stringify(preferences),
        skipCache: true,
      });

    // Invalidate related caches
    this.clearCache("current-user");
    this.clearCache("user-preferences");

    return updatedPreferences;
  }

  async getFavorites(): Promise<string[]> {
    return await this.fetchWithErrorHandling<string[]>("/favorites", {
      cacheKey: "user-favorites",
    });
  }

  async addToFavorites(trackId: string): Promise<void> {
    await this.fetchWithErrorHandling("/favorites", {
      method: "POST",
      body: JSON.stringify({ trackId }),
      skipCache: true,
    });

    // Invalidate favorites cache
    this.clearCache("user-favorites");
  }

  async removeFromFavorites(trackId: string): Promise<void> {
    await this.fetchWithErrorHandling(`/favorites/${trackId}`, {
      method: "DELETE",
      skipCache: true,
    });

    // Invalidate favorites cache
    this.clearCache("user-favorites");
  }

  async getListeningHistory(): Promise<
    Array<{ trackId: string; timestamp: string; duration: number }>
  > {
    return await this.fetchWithErrorHandling("/history", {
      cacheKey: "listening-history",
    });
  }

  async recordListeningSession(
    trackId: string,
    duration: number,
  ): Promise<void> {
    // Fire and forget - don't block UI for analytics
    this.fetchWithErrorHandling("/history", {
      method: "POST",
      body: JSON.stringify({
        trackId,
        duration,
        timestamp: new Date().toISOString(),
      }),
      skipCache: true,
    }).catch((error) => {
      // Silent fail for analytics
      console.warn("Failed to record listening session:", error);
    });
  }

  async deleteAccount(): Promise<void> {
    await this.fetchWithErrorHandling("/delete", {
      method: "DELETE",
      skipCache: true,
    });

    // Clear all user-related cache
    this.clearCache();
  }

  async exportUserData(): Promise<any> {
    return await this.fetchWithErrorHandling("/export", {
      skipCache: true,
      timeout: 30000, // Longer timeout for data export
    });
  }

  // Additional utility methods
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(`${this.config.baseUrl}/avatar`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload avatar");
    }

    const { avatarUrl } = await response.json();

    // Invalidate user cache
    this.clearCache("current-user");

    return avatarUrl;
  }

  async resetPassword(email: string): Promise<void> {
    await this.fetchWithErrorHandling("/reset-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipCache: true,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    await this.fetchWithErrorHandling("/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
      skipCache: true,
    });
  }

  getUserMetrics() {
    const baseMetrics = this.getPerformanceMetrics();
    const cacheStats = this.getCacheStats();

    return {
      baseMetrics,
      cacheStats,
      serviceName: "UserService",
      cacheKeys: [
        "current-user",
        "user-favorites",
        "listening-history",
        "user-preferences",
      ],
    };
  }
}

// Singleton instance
export const userService = new UserServiceImpl();

// Factory function for testing
export function createUserService(): UserService {
  return new UserServiceImpl();
}
