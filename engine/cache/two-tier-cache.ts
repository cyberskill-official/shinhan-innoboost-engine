// engine/cache/two-tier-cache.ts
// P02-T08 — Two-tier cache (L1 in-process LRU + L2 Redis) with versioning

import { createHash } from 'node:crypto';

export interface CacheKeyParams {
  readonly tenantId: string;
  readonly role: string;
  readonly sensitivityMax: string;
  readonly questionHash: string;
  readonly metricVersion: string;
  readonly freshnessWindowId: string;
}

export interface CacheEntry<T> {
  readonly key: string;
  readonly value: T;
  readonly createdAt: number;
  readonly ttlMs: number;
  readonly metricVersion: string;
}

export function buildCacheKey(params: CacheKeyParams): string {
  return createHash('sha256').update(JSON.stringify(params)).digest('base64url');
}

export function normaliseQuestion(question: string): string {
  return question.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[?!.]+$/, '');
}

export function hashQuestion(question: string): string {
  return createHash('sha256').update(normaliseQuestion(question)).digest('hex');
}

/** L1 in-process LRU cache */
export class L1Cache<T> {
  private readonly cache = new Map<string, CacheEntry<T>>();
  private readonly maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.createdAt > entry.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }
    // Move to end (LRU refresh)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number = 300_000, metricVersion: string = ''): void {
    if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) this.cache.delete(oldest);
    }
    this.cache.set(key, { key, value, createdAt: Date.now(), ttlMs, metricVersion });
  }

  invalidateByMetric(metricVersion: string): number {
    let count = 0;
    for (const [key, entry] of this.cache) {
      if (entry.metricVersion === metricVersion) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  clear(): void { this.cache.clear(); }
  get size(): number { return this.cache.size; }
}

/** L2 Redis cache interface (production uses ioredis) */
export interface L2CacheProvider {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(keys: string[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
}

/** Two-tier cache orchestrator */
export class TwoTierCache<T> {
  private readonly l1: L1Cache<T>;
  private readonly l2: L2CacheProvider | null;
  private readonly l1TtlMs: number;
  private readonly l2TtlSeconds: number;

  constructor(params: {
    l1MaxSize?: number; l1TtlMs?: number; l2TtlSeconds?: number;
    l2Provider?: L2CacheProvider;
  } = {}) {
    this.l1 = new L1Cache(params.l1MaxSize ?? 1000);
    this.l2 = params.l2Provider ?? null;
    this.l1TtlMs = params.l1TtlMs ?? 300_000;       // 5 min
    this.l2TtlSeconds = params.l2TtlSeconds ?? 3600;  // 1 hour
  }

  async get(key: string): Promise<{ value: T; tier: 'l1' | 'l2' } | undefined> {
    // Try L1
    const l1Val = this.l1.get(key);
    if (l1Val !== undefined) return { value: l1Val, tier: 'l1' };

    // Try L2
    if (this.l2) {
      const raw = await this.l2.get(key);
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        this.l1.set(key, parsed, this.l1TtlMs);
        return { value: parsed, tier: 'l2' };
      }
    }
    return undefined;
  }

  async set(key: string, value: T, metricVersion: string = ''): Promise<void> {
    this.l1.set(key, value, this.l1TtlMs, metricVersion);
    if (this.l2) {
      await this.l2.set(key, JSON.stringify(value), this.l2TtlSeconds);
    }
  }

  async invalidateByMetric(metricVersion: string): Promise<number> {
    const l1Count = this.l1.invalidateByMetric(metricVersion);
    let l2Count = 0;
    if (this.l2) {
      const keys = await this.l2.keys(`*${metricVersion}*`);
      if (keys.length > 0) l2Count = await this.l2.del(keys);
    }
    return l1Count + l2Count;
  }
}
