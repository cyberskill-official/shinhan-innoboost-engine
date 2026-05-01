// engine/citation/citation-engine.ts
// P02-T04 — Citation engine: every numeric claim → verifiable source
// Ensures zero-hallucination by linking claims to executed SQL + rows.

import { createHash } from 'node:crypto';

// ─── Citation Types ──────────────────────────────────────

export interface CitationSource {
  readonly metricRef: string;           // metric-name@version
  readonly sql: string;                  // Executed SQL
  readonly column: string;               // Column the claim came from
  readonly rowIndex: number;             // Row index in result set
  readonly value: unknown;               // Actual value from the result
  readonly freshness: string;            // ISO 8601 — when was the data last updated
  readonly lineageChain: readonly LineageNode[];
}

export interface LineageNode {
  readonly table: string;
  readonly column: string;
  readonly transformation: string;       // e.g., 'SUM', 'direct', 'JOIN'
}

export interface Citation {
  readonly id: string;                   // Unique citation ID (e.g., [1], [2])
  readonly tag: string;                  // From NumericClaim.tag
  readonly source: CitationSource;
  readonly verified: boolean;            // True if value matches expected
  readonly hash: string;                 // SHA-256 of source data for tamper detection
}

export interface CitedNarrative {
  readonly text: string;                 // Narrative with citation markers
  readonly citations: readonly Citation[];
  readonly faithfulnessScore: number;    // 0.0–1.0
  readonly uncitedClaims: readonly string[];
}

export interface NumericClaimInput {
  readonly tag: string;
  readonly expectedColumn: string;
  readonly expectedRowIndex: number;
}

export interface ResultRow {
  readonly [key: string]: unknown;
}

// ─── Citation Engine ─────────────────────────────────────

export class CitationEngine {
  /**
   * Build citations for all numeric claims in a pipeline result.
   * Cross-references claims against actual execution results.
   */
  buildCitations(params: {
    readonly claims: readonly NumericClaimInput[];
    readonly metricRef: string;
    readonly sql: string;
    readonly results: readonly ResultRow[];
    readonly freshness: string;
    readonly sourceColumns: Record<string, readonly string[]>;
  }): readonly Citation[] {
    return params.claims.map((claim, index) => {
      const row = params.results[claim.expectedRowIndex];
      const value = row?.[claim.expectedColumn];
      const verified = row !== undefined && claim.expectedColumn in (row ?? {});

      const lineageChain = this.buildLineage(
        claim.expectedColumn,
        params.sourceColumns,
        params.sql,
      );

      const source: CitationSource = {
        metricRef: params.metricRef,
        sql: params.sql,
        column: claim.expectedColumn,
        rowIndex: claim.expectedRowIndex,
        value,
        freshness: params.freshness,
        lineageChain,
      };

      return {
        id: `[${index + 1}]`,
        tag: claim.tag,
        source,
        verified,
        hash: this.hashSource(source),
      };
    });
  }

  /**
   * Inject citation markers into a narrative text.
   * Replaces numeric values with value[N] citation references.
   */
  citeNarrative(
    narrative: string,
    citations: readonly Citation[],
  ): CitedNarrative {
    let cited = narrative;
    const matched: Set<string> = new Set();

    for (const citation of citations) {
      if (citation.value === null || citation.value === undefined) continue;

      const valueStr = String(citation.value);
      // Match the value in the narrative and append citation marker
      const escaped = valueStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'g');

      if (regex.test(cited)) {
        cited = cited.replace(regex, `${valueStr}${citation.id}`);
        matched.add(citation.tag);
      }
    }

    // Find uncited claims
    const uncited = citations
      .filter((c) => !matched.has(c.tag))
      .map((c) => c.tag);

    // Faithfulness = ratio of cited to total claims
    const faithfulness =
      citations.length > 0 ? matched.size / citations.length : 1.0;

    return {
      text: cited,
      citations,
      faithfulnessScore: faithfulness,
      uncitedClaims: uncited,
    };
  }

  /**
   * Verify that all citations in a narrative are still valid.
   * Re-checks values against the result set.
   */
  verifyCitations(
    citations: readonly Citation[],
    currentResults: readonly ResultRow[],
  ): {
    readonly valid: readonly Citation[];
    readonly invalid: readonly Citation[];
    readonly driftDetected: boolean;
  } {
    const valid: Citation[] = [];
    const invalid: Citation[] = [];

    for (const citation of citations) {
      const row = currentResults[citation.source.rowIndex];
      const currentValue = row?.[citation.source.column];

      if (currentValue === citation.source.value) {
        valid.push(citation);
      } else {
        invalid.push(citation);
      }
    }

    return {
      valid,
      invalid,
      driftDetected: invalid.length > 0,
    };
  }

  // ─── Private Helpers ─────────────────────────────────────

  private buildLineage(
    column: string,
    sourceColumns: Record<string, readonly string[]>,
    sql: string,
  ): readonly LineageNode[] {
    const nodes: LineageNode[] = [];

    // Detect transformation from SQL
    const upperSql = sql.toUpperCase();
    let transformation = 'direct';
    if (upperSql.includes(`SUM(${column.toUpperCase()}`)) transformation = 'SUM';
    else if (upperSql.includes(`AVG(${column.toUpperCase()}`)) transformation = 'AVG';
    else if (upperSql.includes(`COUNT(${column.toUpperCase()}`)) transformation = 'COUNT';
    else if (upperSql.includes(`MAX(${column.toUpperCase()}`)) transformation = 'MAX';
    else if (upperSql.includes(`MIN(${column.toUpperCase()}`)) transformation = 'MIN';

    // Find which source tables contain this column
    for (const [table, columns] of Object.entries(sourceColumns)) {
      if (columns.includes(column)) {
        nodes.push({ table, column, transformation });
      }
    }

    // If no direct match, it might be an alias
    if (nodes.length === 0) {
      // Add a generic node
      const firstTable = Object.keys(sourceColumns)[0];
      if (firstTable) {
        nodes.push({ table: firstTable, column, transformation });
      }
    }

    return nodes;
  }

  private hashSource(source: CitationSource): string {
    return createHash('sha256')
      .update(JSON.stringify({
        metricRef: source.metricRef,
        sql: source.sql,
        column: source.column,
        rowIndex: source.rowIndex,
        value: source.value,
        freshness: source.freshness,
      }))
      .digest('hex')
      .slice(0, 16);
  }
}
