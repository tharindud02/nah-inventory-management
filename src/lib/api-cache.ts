// Cache utility for MarketCheck API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes default

  // Generate cache key from endpoint and parameters
  private generateKey(endpoint: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce(
        (result, key) => {
          result[key] = params[key];
          return result;
        },
        {} as Record<string, any>,
      );

    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  // Get data from cache
  get<T>(endpoint: string, params: Record<string, any>): T | null {
    const key = this.generateKey(endpoint, params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache entry is still valid
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // Set data in cache
  set<T>(
    endpoint: string,
    params: Record<string, any>,
    data: T,
    ttl?: number,
  ): void {
    const key = this.generateKey(endpoint, params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
    };

    this.cache.set(key, entry);
  }

  // Clear cache for specific endpoint
  clear(endpoint?: string): void {
    if (endpoint) {
      const keysToDelete = Array.from(this.cache.keys()).filter((key) =>
        key.startsWith(endpoint + ":"),
      );
      keysToDelete.forEach((key) => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.timestamp + entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }
}

// Export singleton instance
export const apiCache = new APICache();

// Auto-cleanup every 10 minutes
setInterval(
  () => {
    apiCache.cleanup();
  },
  10 * 60 * 1000,
);

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  VIN_REPORT: 60 * 60 * 1000, // 1 hour - VIN data doesn't change frequently
  MARKET_VALUE: 15 * 60 * 1000, // 15 minutes - market values change more frequently
  INVENTORY_STATS: 30 * 60 * 1000, // 30 minutes
  CONSUMER_INTEREST: 60 * 60 * 1000, // 1 hour
  MARKET_DAYS_SUPPLY: 30 * 60 * 1000, // 30 minutes
};
