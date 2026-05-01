// observability/cost/cost-tracker.ts
// P09-T05 — Cost Dashboard with Per-Question Tracking & Anomaly Detection

// ─── Types ───────────────────────────────────────────────

export interface CostEvent {
  readonly timestamp: string;
  readonly requestId: string;
  readonly bu: string;
  readonly tenantId: string;
  readonly userId: string;
  readonly components: CostComponent[];
  readonly totalVnd: number;
}

export interface CostComponent {
  readonly component: 'llm_api' | 'cache' | 'database' | 'compute' | 'storage';
  readonly costVnd: number;
  readonly metadata: Record<string, number | string>;
}

export interface CostSummary {
  readonly period: string;           // "2026-05-01", "2026-W18", "2026-05"
  readonly granularity: 'hourly' | 'daily' | 'weekly' | 'monthly';
  readonly totalVnd: number;
  readonly avgPerQuestion: number;
  readonly questionCount: number;
  readonly byBu: Record<string, { totalVnd: number; count: number }>;
  readonly byTenant: Record<string, { totalVnd: number; count: number }>;
  readonly byComponent: Record<string, number>;
  readonly anomalyScore: number;     // Z-score vs 7-day moving avg
}

// ─── LLM Cost Model ─────────────────────────────────────

export interface LLMPricingModel {
  readonly provider: string;
  readonly model: string;
  readonly promptTokenCostVnd: number;      // per 1K tokens
  readonly completionTokenCostVnd: number;  // per 1K tokens
  readonly cachedPromptDiscount: number;    // 0-1
}

const PRICING_MODELS: Record<string, LLMPricingModel> = {
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    promptTokenCostVnd: 63,            // ~$2.50/1M tokens × 25,200 VND/USD
    completionTokenCostVnd: 252,       // ~$10/1M tokens
    cachedPromptDiscount: 0.5,
  },
  'claude-3.5-sonnet': {
    provider: 'anthropic',
    model: 'claude-3.5-sonnet',
    promptTokenCostVnd: 76,            // ~$3/1M tokens
    completionTokenCostVnd: 378,       // ~$15/1M tokens
    cachedPromptDiscount: 0.1,         // 90% discount with prompt caching
  },
  'qwen-7b-local': {
    provider: 'local',
    model: 'qwen-7b',
    promptTokenCostVnd: 5,             // Compute cost only
    completionTokenCostVnd: 8,
    cachedPromptDiscount: 0,
  },
};

// ─── Cost Tracker ────────────────────────────────────────

export class CostTracker {
  private events: CostEvent[] = [];
  private hourlyTotals: Map<string, number> = new Map(); // "YYYY-MM-DDTHH" → VND

  /** Record a cost event for a single question. */
  recordCost(event: CostEvent): void {
    this.events.push(event);

    // Update hourly total for anomaly detection
    const hourKey = event.timestamp.slice(0, 13); // "2026-05-01T14"
    const current = this.hourlyTotals.get(hourKey) ?? 0;
    this.hourlyTotals.set(hourKey, current + event.totalVnd);
  }

  /** Calculate LLM API cost for a request. */
  static calculateLLMCost(
    model: string,
    promptTokens: number,
    completionTokens: number,
    isCached: boolean = false,
  ): CostComponent {
    const pricing = PRICING_MODELS[model] ?? PRICING_MODELS['gpt-4o']!;

    const promptCost = (promptTokens / 1000) * pricing.promptTokenCostVnd
      * (isCached ? (1 - pricing.cachedPromptDiscount) : 1);
    const completionCost = (completionTokens / 1000) * pricing.completionTokenCostVnd;

    return {
      component: 'llm_api',
      costVnd: Math.round(promptCost + completionCost),
      metadata: {
        model,
        promptTokens,
        completionTokens,
        cached: isCached ? 'true' : 'false',
      },
    };
  }

  /** Generate a cost summary for a period. */
  getSummary(
    startDate: string,
    endDate: string,
    granularity: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily',
  ): CostSummary {
    const periodEvents = this.events.filter(e =>
      e.timestamp >= startDate && e.timestamp <= endDate
    );

    const totalVnd = periodEvents.reduce((sum, e) => sum + e.totalVnd, 0);
    const questionCount = periodEvents.length;

    // By BU
    const byBu: Record<string, { totalVnd: number; count: number }> = {};
    for (const e of periodEvents) {
      if (!byBu[e.bu]) byBu[e.bu] = { totalVnd: 0, count: 0 };
      byBu[e.bu]!.totalVnd += e.totalVnd;
      byBu[e.bu]!.count += 1;
    }

    // By Tenant
    const byTenant: Record<string, { totalVnd: number; count: number }> = {};
    for (const e of periodEvents) {
      if (!byTenant[e.tenantId]) byTenant[e.tenantId] = { totalVnd: 0, count: 0 };
      byTenant[e.tenantId]!.totalVnd += e.totalVnd;
      byTenant[e.tenantId]!.count += 1;
    }

    // By Component
    const byComponent: Record<string, number> = {};
    for (const e of periodEvents) {
      for (const c of e.components) {
        byComponent[c.component] = (byComponent[c.component] ?? 0) + c.costVnd;
      }
    }

    return {
      period: `${startDate} to ${endDate}`,
      granularity,
      totalVnd,
      avgPerQuestion: questionCount > 0 ? Math.round(totalVnd / questionCount) : 0,
      questionCount,
      byBu,
      byTenant,
      byComponent,
      anomalyScore: this.calculateAnomalyScore(),
    };
  }

  /** Z-score anomaly detection: compare latest hour vs 7-day moving average. */
  private calculateAnomalyScore(): number {
    const hours = Array.from(this.hourlyTotals.values());
    if (hours.length < 24) return 0; // Not enough data

    // Last 7 days of hourly data (168 hours)
    const historicalHours = hours.slice(-168, -1);
    if (historicalHours.length < 24) return 0;

    const mean = historicalHours.reduce((s, v) => s + v, 0) / historicalHours.length;
    const variance = historicalHours.reduce((s, v) => s + (v - mean) ** 2, 0) / historicalHours.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    const latestHour = hours[hours.length - 1]!;
    return (latestHour - mean) / stdDev;
  }

  /** Identify cost outlier questions (top 1% by cost). */
  getOutliers(topPercent: number = 1): CostEvent[] {
    const sorted = [...this.events].sort((a, b) => b.totalVnd - a.totalVnd);
    const cutoff = Math.ceil(sorted.length * (topPercent / 100));
    return sorted.slice(0, cutoff);
  }

  /** Get cache savings estimate. */
  getCacheSavings(): { savedVnd: number; cacheHits: number; missedCost: number } {
    let savedVnd = 0;
    let cacheHits = 0;

    for (const event of this.events) {
      const llmComponent = event.components.find(c => c.component === 'llm_api');
      if (llmComponent && llmComponent.metadata['cached'] === 'true') {
        cacheHits++;
        // Estimate: cached request costs ~50% less
        savedVnd += llmComponent.costVnd; // This IS the savings (discounted amount)
      }
    }

    return { savedVnd, cacheHits, missedCost: savedVnd * 2 }; // Full price would be 2x
  }

  /** Export Prometheus metrics. */
  toPrometheusMetrics(): string {
    const lines: string[] = [];

    lines.push('# HELP cost_total_vnd Total cost in VND');
    lines.push('# TYPE cost_total_vnd counter');

    const byBu: Record<string, number> = {};
    const byComponent: Record<string, number> = {};

    for (const e of this.events) {
      byBu[e.bu] = (byBu[e.bu] ?? 0) + e.totalVnd;
      for (const c of e.components) {
        byComponent[c.component] = (byComponent[c.component] ?? 0) + c.costVnd;
      }
    }

    for (const [bu, total] of Object.entries(byBu)) {
      lines.push(`cost_total_vnd{bu="${bu}"} ${total}`);
    }

    for (const [component, total] of Object.entries(byComponent)) {
      lines.push(`cost_total_vnd{component="${component}"} ${total}`);
    }

    lines.push(`# HELP cost_anomaly_score Z-score of hourly cost vs 7-day moving average`);
    lines.push(`# TYPE cost_anomaly_score gauge`);
    lines.push(`cost_anomaly_score ${this.calculateAnomalyScore().toFixed(2)}`);

    lines.push(`# HELP cost_per_question_vnd Average cost per question`);
    lines.push(`# TYPE cost_per_question_vnd gauge`);
    const avg = this.events.length > 0
      ? this.events.reduce((s, e) => s + e.totalVnd, 0) / this.events.length
      : 0;
    lines.push(`cost_per_question_vnd ${avg.toFixed(0)}`);

    return lines.join('\n');
  }
}

// ─── Factory ─────────────────────────────────────────────

export function createCostTracker(): CostTracker {
  return new CostTracker();
}
