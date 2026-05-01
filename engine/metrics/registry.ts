// engine/metrics/registry.ts
// P02-T01 — Semantic metric layer with registry and lineage tracking
// The metric registry is the source of truth for NL→SQL resolution.

import { createHash } from 'node:crypto';

// ─── Core Types ──────────────────────────────────────────

export type SensitivityTier = 'public' | 'internal' | 'restricted' | 'regulated';
export type Grain = 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type WarehouseDialect = 'postgres' | 'bigquery' | 'snowflake';

export interface MetricDefinition {
  readonly name: string;                    // kebab-case, stable across versions
  readonly description: string;
  readonly owner: string;                   // @handle
  readonly version: string;                 // semver
  readonly formulas: Record<WarehouseDialect, string>;
  readonly dimensions: readonly string[];
  readonly grain: Grain;
  readonly freshnessExpected: string;       // e.g., '< 24 hours'
  readonly sensitivity: SensitivityTier;
  readonly sourceTables: readonly string[];
  readonly sourceColumns: Record<string, readonly string[]>;
  readonly tags: readonly string[];
  readonly examples: readonly string[];     // Sample questions
  readonly createdAt: string;               // ISO 8601
  readonly updatedAt: string;               // ISO 8601
}

export interface LineageEdge {
  readonly metricName: string;
  readonly metricVersion: string;
  readonly sourceTable: string;
  readonly sourceColumn: string;
  readonly direction: 'upstream';
}

export interface MetricSearchResult {
  readonly metric: MetricDefinition;
  readonly similarityScore: number;         // 0.0–1.0 from vector search
  readonly rank: number;
}

export interface ImpactAssessment {
  readonly affectedMetrics: readonly string[];
  readonly affectedColumns: Record<string, readonly string[]>;
  readonly riskLevel: 'none' | 'low' | 'medium' | 'high';
}

// ─── Registry Implementation ─────────────────────────────

export class MetricRegistry {
  private readonly metrics: Map<string, MetricDefinition> = new Map();
  private readonly versionIndex: Map<string, MetricDefinition[]> = new Map();

  /**
   * Register a metric definition. Validates schema conformance.
   */
  register(metric: MetricDefinition): void {
    this.validateMetric(metric);

    const key = this.metricKey(metric.name, metric.version);
    if (this.metrics.has(key)) {
      throw new MetricRegistryError(
        `Metric ${metric.name}@${metric.version} already registered`,
      );
    }

    this.metrics.set(key, metric);

    // Maintain version history
    const versions = this.versionIndex.get(metric.name) ?? [];
    versions.push(metric);
    this.versionIndex.set(metric.name, versions);
  }

  /**
   * Get a specific version of a metric.
   */
  get(name: string, version?: string): MetricDefinition | undefined {
    if (version) {
      return this.metrics.get(this.metricKey(name, version));
    }
    // Return latest version
    const versions = this.versionIndex.get(name);
    return versions?.[versions.length - 1];
  }

  /**
   * List all registered metrics, optionally filtered.
   */
  list(filter?: {
    readonly tags?: readonly string[];
    readonly sensitivity?: SensitivityTier;
    readonly grain?: Grain;
  }): readonly MetricDefinition[] {
    let results = [...this.latestVersions()];

    if (filter?.tags?.length) {
      results = results.filter((m) =>
        filter.tags!.some((t) => m.tags.includes(t)),
      );
    }
    if (filter?.sensitivity) {
      results = results.filter((m) => m.sensitivity === filter.sensitivity);
    }
    if (filter?.grain) {
      results = results.filter((m) => m.grain === filter.grain);
    }

    return results;
  }

  /**
   * Semantic search over metrics using question text.
   * In production this delegates to pgvector; here we use keyword matching.
   */
  search(query: string, topK: number = 5): readonly MetricSearchResult[] {
    const normalised = query.toLowerCase().trim();
    const scored: MetricSearchResult[] = [];

    for (const metric of this.latestVersions()) {
      const score = this.computeSimilarity(normalised, metric);
      if (score > 0.1) {
        scored.push({ metric, similarityScore: score, rank: 0 });
      }
    }

    scored.sort((a, b) => b.similarityScore - a.similarityScore);

    return scored.slice(0, topK).map((r, i) => ({
      ...r,
      rank: i + 1,
    }));
  }

  /**
   * Lineage: which metrics are affected if a table/column changes?
   */
  impactAnalysis(table: string, columns?: readonly string[]): ImpactAssessment {
    const affected: string[] = [];
    const affectedColumns: Record<string, string[]> = {};

    for (const metric of this.latestVersions()) {
      if (!metric.sourceTables.includes(table)) continue;

      if (!columns) {
        affected.push(`${metric.name}@${metric.version}`);
        continue;
      }

      const metricColumns = metric.sourceColumns[table] ?? [];
      const overlap = columns.filter((c) => metricColumns.includes(c));
      if (overlap.length > 0) {
        affected.push(`${metric.name}@${metric.version}`);
        affectedColumns[metric.name] = [...overlap];
      }
    }

    const riskLevel =
      affected.length === 0
        ? 'none'
        : affected.length <= 2
          ? 'low'
          : affected.length <= 5
            ? 'medium'
            : 'high';

    return { affectedMetrics: affected, affectedColumns, riskLevel };
  }

  /**
   * Build full lineage graph for a metric.
   */
  lineageEdges(metricName: string): readonly LineageEdge[] {
    const metric = this.get(metricName);
    if (!metric) return [];

    const edges: LineageEdge[] = [];
    for (const table of metric.sourceTables) {
      const columns = metric.sourceColumns[table] ?? [];
      for (const col of columns) {
        edges.push({
          metricName: metric.name,
          metricVersion: metric.version,
          sourceTable: table,
          sourceColumn: col,
          direction: 'upstream',
        });
      }
    }
    return edges;
  }

  /**
   * Compute a content hash for cache invalidation.
   */
  contentHash(metricName: string): string {
    const metric = this.get(metricName);
    if (!metric) throw new MetricRegistryError(`Metric ${metricName} not found`);
    return createHash('sha256')
      .update(JSON.stringify(metric))
      .digest('hex')
      .slice(0, 16);
  }

  // ─── Private Helpers ─────────────────────────────────────

  private metricKey(name: string, version: string): string {
    return `${name}@${version}`;
  }

  private *latestVersions(): Generator<MetricDefinition> {
    for (const versions of this.versionIndex.values()) {
      if (versions.length > 0) {
        yield versions[versions.length - 1]!;
      }
    }
  }

  /**
   * Keyword-based similarity (placeholder for pgvector in production).
   */
  private computeSimilarity(query: string, metric: MetricDefinition): number {
    const corpus = [
      metric.name.replace(/-/g, ' '),
      metric.description,
      ...metric.tags,
      ...metric.examples.map((e) => e.toLowerCase()),
    ].join(' ').toLowerCase();

    const queryTokens = query.split(/\s+/).filter((t) => t.length > 2);
    if (queryTokens.length === 0) return 0;

    const matchCount = queryTokens.filter((t) => corpus.includes(t)).length;
    return matchCount / queryTokens.length;
  }

  private validateMetric(metric: MetricDefinition): void {
    if (!metric.name || !/^[a-z][a-z0-9-]*$/.test(metric.name)) {
      throw new MetricRegistryError(
        `Invalid metric name: ${metric.name} (must be kebab-case)`,
      );
    }
    if (!metric.version || !/^\d+\.\d+\.\d+$/.test(metric.version)) {
      throw new MetricRegistryError(
        `Invalid version: ${metric.version} (must be semver)`,
      );
    }
    if (!metric.formulas.postgres) {
      throw new MetricRegistryError(
        `Metric ${metric.name} must have at least a postgres formula`,
      );
    }
    if (metric.sourceTables.length === 0) {
      throw new MetricRegistryError(
        `Metric ${metric.name} must declare at least one source table`,
      );
    }
  }
}

// ─── Errors ──────────────────────────────────────────────

export class MetricRegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MetricRegistryError';
  }
}
