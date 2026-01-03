
type CacheEntry = {
  data: any;
  expiry: number;
};

export class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number = 60 * 1000; // 1 Minute

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set(key: string, data: any, ttl?: number) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttl || this.defaultTTL)
    });
  }

  flush(keyPrefix?: string) {
    if (!keyPrefix) {
      this.cache.clear();
    } else {
      for (const key of this.cache.keys()) {
        if (key.startsWith(keyPrefix)) this.cache.delete(key);
      }
    }
  }
}

export const cacheService = new CacheService();
