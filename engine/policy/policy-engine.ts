// engine/policy/policy-engine.ts
// P02-T03 — Deterministic policy layer for governance gates
// Rule-based gates that run before/during/after LLM, bypassing AI entirely.

import type { UserContext } from '../auth/rbac.js';
import type { SensitivityTier } from '../metrics/registry.js';
import type { PipelineInput, ValidationResult } from '../nl-to-sql/pipeline.js';

// ─── Policy Types ────────────────────────────────────────

export type PolicyGate = 'pre-llm' | 'mid-llm' | 'post-execution';
export type PolicyAction = 'allow' | 'deny' | 'route-to-hitl' | 'mask' | 'cost-confirm';
export type PolicyPriority = 'sla-critical' | 'high' | 'normal';

export interface PolicyRule {
  readonly id: string;
  readonly description: string;
  readonly gate: PolicyGate;
  readonly priority: PolicyPriority;
  readonly version: string;
  readonly evaluate: (ctx: PolicyContext) => PolicyDecision;
}

export interface PolicyContext {
  readonly user: UserContext;
  readonly input: PipelineInput;
  readonly metricSensitivity?: SensitivityTier;
  readonly sqlValidation?: ValidationResult;
  readonly confidenceScore?: number;
  readonly estimatedCostTokens?: number;
  readonly resultRowCount?: number;
}

export interface PolicyDecision {
  readonly ruleId: string;
  readonly action: PolicyAction;
  readonly reason: string;
  readonly metadata?: Record<string, unknown>;
}

export interface PolicyEvaluationResult {
  readonly gate: PolicyGate;
  readonly decisions: readonly PolicyDecision[];
  readonly blocked: boolean;
  readonly blockingRule?: string;
  readonly routeToHitl: boolean;
}

// ─── Seed Rules ──────────────────────────────────────────

const SENSITIVITY_ORDER: Record<SensitivityTier, number> = {
  public: 0,
  internal: 1,
  restricted: 2,
  regulated: 3,
};

const ROLE_SENSITIVITY_MAX: Record<string, SensitivityTier> = {
  super_admin: 'regulated',
  bu_admin: 'restricted',
  reviewer: 'restricted',
  analyst: 'internal',
  viewer: 'public',
  eval_manager: 'internal',
  service: 'internal',
};

export const PRE_LLM_RULES: readonly PolicyRule[] = [
  {
    id: 'pre-tenant',
    description: 'Deny cross-tenant access attempt',
    gate: 'pre-llm',
    priority: 'sla-critical',
    version: '1.0.0',
    evaluate: (ctx) => {
      if (ctx.user.tenantId !== ctx.input.tenantId) {
        return { ruleId: 'pre-tenant', action: 'deny', reason: 'Cross-tenant access denied' };
      }
      return { ruleId: 'pre-tenant', action: 'allow', reason: 'Tenant match' };
    },
  },
  {
    id: 'pre-sensitivity',
    description: 'Deny if metric sensitivity exceeds user role max',
    gate: 'pre-llm',
    priority: 'sla-critical',
    version: '1.0.0',
    evaluate: (ctx) => {
      if (!ctx.metricSensitivity) return { ruleId: 'pre-sensitivity', action: 'allow', reason: 'No metric yet' };
      const userMax = ROLE_SENSITIVITY_MAX[ctx.user.role] ?? 'public';
      if (SENSITIVITY_ORDER[ctx.metricSensitivity] > SENSITIVITY_ORDER[userMax]) {
        return {
          ruleId: 'pre-sensitivity',
          action: 'deny',
          reason: `Metric sensitivity ${ctx.metricSensitivity} exceeds role max ${userMax}`,
        };
      }
      return { ruleId: 'pre-sensitivity', action: 'allow', reason: 'Sensitivity within bounds' };
    },
  },
  {
    id: 'pre-rate-limit',
    description: 'Warn on rate-limit approach (stub)',
    gate: 'pre-llm',
    priority: 'high',
    version: '1.0.0',
    evaluate: (_ctx) => {
      // TODO: Integrate with Redis rate limiter in P02-T08
      return { ruleId: 'pre-rate-limit', action: 'allow', reason: 'Rate limit not exceeded' };
    },
  },
];

export const MID_LLM_RULES: readonly PolicyRule[] = [
  {
    id: 'mid-cost-ceiling',
    description: 'Deny or cost-confirm on expensive queries',
    gate: 'mid-llm',
    priority: 'high',
    version: '1.0.0',
    evaluate: (ctx) => {
      const tokens = ctx.estimatedCostTokens ?? 0;
      if (tokens > 50_000) {
        return {
          ruleId: 'mid-cost-ceiling',
          action: 'cost-confirm',
          reason: `Estimated ${tokens} tokens exceeds ceiling`,
          metadata: { estimatedTokens: tokens },
        };
      }
      return { ruleId: 'mid-cost-ceiling', action: 'allow', reason: 'Within cost ceiling' };
    },
  },
  {
    id: 'mid-hitl-trigger',
    description: 'Route to HITL on low confidence or restricted metric',
    gate: 'mid-llm',
    priority: 'high',
    version: '1.0.0',
    evaluate: (ctx) => {
      const score = ctx.confidenceScore ?? 1.0;
      if (score < 0.60) {
        return {
          ruleId: 'mid-hitl-trigger',
          action: 'route-to-hitl',
          reason: `Confidence ${(score * 100).toFixed(1)}% below 60% threshold`,
        };
      }
      if (ctx.metricSensitivity === 'restricted' && ctx.user.role !== 'super_admin' && ctx.user.role !== 'bu_admin') {
        return {
          ruleId: 'mid-hitl-trigger',
          action: 'route-to-hitl',
          reason: 'Restricted metric requires elevated review',
        };
      }
      return { ruleId: 'mid-hitl-trigger', action: 'allow', reason: 'Confidence and sensitivity OK' };
    },
  },
  {
    id: 'mid-sql-validation',
    description: 'Deny if SQL validation failed',
    gate: 'mid-llm',
    priority: 'sla-critical',
    version: '1.0.0',
    evaluate: (ctx) => {
      if (ctx.sqlValidation?.verdict === 'fail') {
        return {
          ruleId: 'mid-sql-validation',
          action: 'deny',
          reason: `SQL validation failed: ${ctx.sqlValidation.errors.join('; ')}`,
        };
      }
      return { ruleId: 'mid-sql-validation', action: 'allow', reason: 'SQL validation passed' };
    },
  },
];

export const POST_EXECUTION_RULES: readonly PolicyRule[] = [
  {
    id: 'post-result-mask',
    description: 'Mask PII columns per RBAC scope',
    gate: 'post-execution',
    priority: 'high',
    version: '1.0.0',
    evaluate: (ctx) => {
      // PII masking is applied at the result layer
      if (ctx.metricSensitivity === 'restricted' || ctx.metricSensitivity === 'regulated') {
        return {
          ruleId: 'post-result-mask',
          action: 'mask',
          reason: 'PII masking applied to restricted/regulated results',
        };
      }
      return { ruleId: 'post-result-mask', action: 'allow', reason: 'No masking needed' };
    },
  },
  {
    id: 'post-row-cap',
    description: 'Deny if result exceeds row cap (10,000)',
    gate: 'post-execution',
    priority: 'normal',
    version: '1.0.0',
    evaluate: (ctx) => {
      if ((ctx.resultRowCount ?? 0) > 10_000) {
        return {
          ruleId: 'post-row-cap',
          action: 'deny',
          reason: 'Result exceeds 10,000 row cap — refine your query',
        };
      }
      return { ruleId: 'post-row-cap', action: 'allow', reason: 'Within row cap' };
    },
  },
];

// ─── Policy Engine ───────────────────────────────────────

export class PolicyEngine {
  private readonly rules: Map<PolicyGate, PolicyRule[]> = new Map();

  constructor() {
    this.rules.set('pre-llm', [...PRE_LLM_RULES]);
    this.rules.set('mid-llm', [...MID_LLM_RULES]);
    this.rules.set('post-execution', [...POST_EXECUTION_RULES]);
  }

  /**
   * Add a custom policy rule.
   */
  addRule(rule: PolicyRule): void {
    const gate = this.rules.get(rule.gate) ?? [];
    gate.push(rule);
    this.rules.set(rule.gate, gate);
  }

  /**
   * Evaluate all rules for a given gate.
   * Returns immediately on first deny/route-to-hitl from a sla-critical rule.
   */
  evaluate(gate: PolicyGate, ctx: PolicyContext): PolicyEvaluationResult {
    const gateRules = this.rules.get(gate) ?? [];
    const decisions: PolicyDecision[] = [];
    let blocked = false;
    let blockingRule: string | undefined;
    let routeToHitl = false;

    // Sort: sla-critical first, then high, then normal
    const sorted = [...gateRules].sort((a, b) => {
      const order: Record<PolicyPriority, number> = { 'sla-critical': 0, high: 1, normal: 2 };
      return order[a.priority] - order[b.priority];
    });

    for (const rule of sorted) {
      const decision = rule.evaluate(ctx);
      decisions.push(decision);

      if (decision.action === 'deny') {
        blocked = true;
        blockingRule = decision.ruleId;
        if (rule.priority === 'sla-critical') break; // Short-circuit
      }

      if (decision.action === 'route-to-hitl') {
        routeToHitl = true;
      }
    }

    return { gate, decisions, blocked, blockingRule, routeToHitl };
  }

  /**
   * Run all gates in sequence: pre-llm → mid-llm → post-execution.
   * Short-circuits on block.
   */
  evaluateAll(ctx: PolicyContext): readonly PolicyEvaluationResult[] {
    const results: PolicyEvaluationResult[] = [];

    for (const gate of ['pre-llm', 'mid-llm', 'post-execution'] as PolicyGate[]) {
      const result = this.evaluate(gate, ctx);
      results.push(result);
      if (result.blocked) break;
    }

    return results;
  }
}
