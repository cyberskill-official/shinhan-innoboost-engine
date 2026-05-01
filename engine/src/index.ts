// Engine entry point.
// Re-exports all core modules for the chat-with-data engine.
// See: engine/README.md for sub-module map.

export const ENGINE_VERSION = '0.1.0';

export function helloEngine(): string {
  return `CyberSkill engine ${ENGINE_VERSION} — chat-with-data core`;
}

// ─── Core Module Re-exports ─────────────────────────────

// P02-T01: Semantic Metric Layer
export { MetricRegistry } from '../metrics/registry.js';
export type { MetricDefinition, MetricSearchResult, SensitivityTier } from '../metrics/registry.js';

// P02-T02: NL→SQL Pipeline
export { runPipeline, classifyIntent, validateSql } from '../nl-to-sql/pipeline.js';
export type { PipelineInput, PipelineResult, PipelineRefusal } from '../nl-to-sql/pipeline.js';

// P02-T03: Policy Engine
export { PolicyEngine } from '../policy/policy-engine.js';
export type { PolicyDecision, PolicyEvaluationResult } from '../policy/policy-engine.js';

// P02-T04: Citation Engine
export { CitationEngine } from '../citation/citation-engine.js';
export type { Citation, CitedNarrative } from '../citation/citation-engine.js';

// P02-T05: Confidence Scoring
export { computeConfidence, computeFreshnessFactor, computeAmbiguityFactor } from '../confidence/scoring.js';
export type { ConfidenceResult, ConfidenceTier } from '../confidence/scoring.js';

// P02-T06: Prompt Guard
export { guardInput, guardOutput, sanitiseInput } from '../security/prompt-guard.js';

// P02-T07: Consent Ledger
export { ConsentLedger, minimiseColumns } from '../compliance/consent-ledger.js';

// P02-T08: Two-Tier Cache
export { TwoTierCache, L1Cache, buildCacheKey } from '../cache/two-tier-cache.js';

// P02-T09: Audit Log
export { AuditLog } from '../audit/audit-log.js';
export type { AuditEvent } from '../audit/audit-log.js';

// P01-T07: RBAC
export { assertCan, assertBuAccess, canDo } from '../auth/rbac.js';
export type { UserContext, Role } from '../auth/rbac.js';
