// engine/confidence/scoring.ts
// P02-T05 — Confidence-tier scoring (Low/Medium/High thresholds)
// Per AI Doctrine v1.0.0, locked 2026-04-25.

// ─── Types ───────────────────────────────────────────────

export type ConfidenceTier = 'Low' | 'Medium' | 'High';

export interface ConfidenceInput {
  /** Top-1 retrieval similarity from metric registry (0.0–1.0) */
  readonly schemaMatch: number;
  /** SQL validator pass strength: 1.0=clean, 0.7=warnings, 0.0=fail */
  readonly validatorPassStrength: number;
  /** Cosine similarity to known gold-set entry pass rate (0.0 if novel) */
  readonly evalSimilarity: number;
  /** Data freshness factor (1.0 if <1h, linear decay to 0.0 at 24h, 0.0 if >7d) */
  readonly freshnessFactor: number;
  /** Intent classifier confidence (1.0 if >0.85, linear decay to 0.0 at ≤0.5) */
  readonly ambiguityFactor: number;
}

export interface ConfidenceResult {
  readonly score: number;               // 0.0–1.0
  readonly tier: ConfidenceTier;
  readonly components: ConfidenceInput;
  readonly warnings: readonly string[];
  readonly routeToHitl: boolean;
  readonly staleDataWarning: boolean;
}

export interface TenantThresholds {
  readonly lowCeiling: number;          // Default: 0.60
  readonly highFloor: number;           // Default: 0.85
}

// ─── Formula Weights (AI Doctrine v1.0.0) ────────────────

const WEIGHTS = {
  schemaMatch: 0.30,
  validatorPassStrength: 0.20,
  evalSimilarity: 0.20,
  freshnessFactor: 0.15,
  ambiguityFactor: 0.15,
} as const;

const DEFAULT_THRESHOLDS: TenantThresholds = {
  lowCeiling: 0.60,
  highFloor: 0.85,
};

// Bounds per AI Doctrine — tenants cannot set outside these
const THRESHOLD_BOUNDS = {
  min: 0.50,
  max: 0.95,
} as const;

// ─── Scoring Functions ───────────────────────────────────

/**
 * Compute confidence score and tier from input components.
 * Implements the formula from FORMULA.md (AI Doctrine v1.0.0).
 */
export function computeConfidence(
  input: ConfidenceInput,
  thresholds: TenantThresholds = DEFAULT_THRESHOLDS,
): ConfidenceResult {
  // Validate thresholds within bounds
  const validThresholds = validateThresholds(thresholds);
  const warnings: string[] = [];

  // Clamp all inputs to [0.0, 1.0]
  const clamped: ConfidenceInput = {
    schemaMatch: clamp(input.schemaMatch),
    validatorPassStrength: clamp(input.validatorPassStrength),
    evalSimilarity: clamp(input.evalSimilarity),
    freshnessFactor: clamp(input.freshnessFactor),
    ambiguityFactor: clamp(input.ambiguityFactor),
  };

  // Compute weighted score
  let score =
    clamped.schemaMatch * WEIGHTS.schemaMatch +
    clamped.validatorPassStrength * WEIGHTS.validatorPassStrength +
    clamped.evalSimilarity * WEIGHTS.evalSimilarity +
    clamped.freshnessFactor * WEIGHTS.freshnessFactor +
    clamped.ambiguityFactor * WEIGHTS.ambiguityFactor;

  // Clamp total
  score = clamp(score);

  // Special rule: stale data (freshness = 0.0) forces tier ≤ Medium
  let staleDataWarning = false;
  if (clamped.freshnessFactor === 0.0) {
    staleDataWarning = true;
    warnings.push('Data is >7 days stale — confidence capped at Medium');
    if (score >= validThresholds.highFloor) {
      score = validThresholds.highFloor - 0.01;
    }
  }

  // Determine tier
  const tier = scoreTier(score, validThresholds);

  // Route to HITL if Low tier
  const routeToHitl = tier === 'Low';

  if (clamped.validatorPassStrength < 1.0 && clamped.validatorPassStrength > 0) {
    warnings.push('SQL validator passed with warnings');
  }

  if (clamped.evalSimilarity === 0.0) {
    warnings.push('Novel question — no gold-set baseline');
  }

  return {
    score,
    tier,
    components: clamped,
    warnings,
    routeToHitl,
    staleDataWarning,
  };
}

/**
 * Compute freshness factor from data age.
 * - <1h: 1.0
 * - 1h–24h: linear decay
 * - >7d: 0.0
 */
export function computeFreshnessFactor(dataAgeHours: number): number {
  if (dataAgeHours < 1) return 1.0;
  if (dataAgeHours > 168) return 0.0; // 7 days
  if (dataAgeHours > 24) return Math.max(0, 1 - (dataAgeHours / 168));
  // 1h–24h: linear decay from 1.0 to ~0.0
  return 1 - ((dataAgeHours - 1) / 23);
}

/**
 * Compute ambiguity factor from intent classifier confidence.
 * - >0.85: 1.0
 * - 0.5–0.85: linear
 * - ≤0.5: 0.0
 */
export function computeAmbiguityFactor(intentConfidence: number): number {
  if (intentConfidence > 0.85) return 1.0;
  if (intentConfidence <= 0.5) return 0.0;
  return (intentConfidence - 0.5) / 0.35;
}

// ─── Helpers ─────────────────────────────────────────────

function clamp(value: number, min: number = 0, max: number = 1): number {
  return Math.max(min, Math.min(max, value));
}

function scoreTier(score: number, thresholds: TenantThresholds): ConfidenceTier {
  if (score < thresholds.lowCeiling) return 'Low';
  if (score >= thresholds.highFloor) return 'High';
  return 'Medium';
}

function validateThresholds(thresholds: TenantThresholds): TenantThresholds {
  return {
    lowCeiling: clamp(thresholds.lowCeiling, THRESHOLD_BOUNDS.min, THRESHOLD_BOUNDS.max),
    highFloor: clamp(thresholds.highFloor, THRESHOLD_BOUNDS.min, THRESHOLD_BOUNDS.max),
  };
}
