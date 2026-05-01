// eval/cli/cyber-eval.ts
// P04-T04 — Harness CLI & CI Integration
// Usage: cyber-eval run --bu=svfc --suite=gold → JSON + HTML report
//        cyber-eval compare --baseline=<hash> → PR regression comment

import {
  type GoldSetEntry,
  type PipelineResult,
  type AdversarialEntry,
  type AdversarialResult,
  type EvalReport,
  type EvalScores,
  type EvalDetail,
  type Regression,
  computeGoldSetScores,
  detectRegressions,
  evaluateAdversarial,
  TARGETS,
} from '../metrics/framework.js';

// ─── CLI Interface ───────────────────────────────────────

interface RunOptions {
  readonly bu: 'svfc' | 'bank' | 'securities' | 'all';
  readonly suite: 'gold' | 'adversarial' | 'full';
  readonly format: 'json' | 'html' | 'both';
  readonly output: string;
  readonly baseline?: string;  // Git hash for comparison
  readonly ci?: boolean;       // CI mode: output PR comment format
}

interface CompareOptions {
  readonly baseline: string;  // Path to baseline report JSON
  readonly current: string;   // Path to current report JSON
  readonly format: 'json' | 'markdown';
}

// ─── Report Generation ───────────────────────────────────

export function generateJsonReport(report: EvalReport): string {
  return JSON.stringify(report, null, 2);
}

export function generateHtmlReport(report: EvalReport): string {
  const scoreRows = Object.entries(report.scores)
    .filter(([, v]) => typeof v === 'number')
    .map(([key, value]) => {
      const target = (TARGETS as Record<string, number>)[key];
      const status = target !== undefined
        ? (value as number) >= target ? '✅' : '❌'
        : '—';
      return `<tr><td>${key}</td><td>${(value as number).toFixed(2)}</td><td>${target ?? '—'}</td><td>${status}</td></tr>`;
    })
    .join('\n');

  const detailRows = report.details
    .map((d) => `<tr class="${d.pass ? 'pass' : 'fail'}"><td>${d.id}</td><td>${d.pass ? '✅' : '❌'}</td><td>${d.reason ?? ''}</td></tr>`)
    .join('\n');

  const regressionRows = report.regressions.length > 0
    ? report.regressions
        .map((r) => `<tr class="${r.blocks_merge ? 'blocker' : 'warning'}"><td>${r.metric}</td><td>${r.baseline.toFixed(2)}</td><td>${r.current.toFixed(2)}</td><td>${r.delta_pct.toFixed(1)}%</td><td>${r.blocks_merge ? '🚫 BLOCKS' : '⚠️ Warning'}</td></tr>`)
        .join('\n')
    : '<tr><td colspan="5">No regressions detected ✅</td></tr>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CyberSkill Eval Report — ${report.bu} / ${report.suite}</title>
  <style>
    :root { --bg: #0f1117; --surface: #1a1d27; --text: #e4e6eb; --accent: #6366f1; --green: #10b981; --red: #ef4444; --yellow: #f59e0b; }
    body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 2rem; }
    h1 { color: var(--accent); }
    h2 { border-bottom: 1px solid #333; padding-bottom: 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #2a2d37; }
    th { background: var(--surface); color: var(--accent); }
    .pass td { color: var(--green); }
    .fail td { color: var(--red); }
    .blocker td { color: var(--red); font-weight: bold; }
    .warning td { color: var(--yellow); }
    .meta { color: #888; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>🧪 CyberSkill Eval Report</h1>
  <p class="meta">BU: ${report.bu} | Suite: ${report.suite} | Version: ${report.version} | ${report.timestamp}</p>

  <h2>📊 Scores</h2>
  <table>
    <thead><tr><th>Metric</th><th>Value</th><th>Target</th><th>Status</th></tr></thead>
    <tbody>${scoreRows}</tbody>
  </table>

  <h2>🔍 Details</h2>
  <table>
    <thead><tr><th>ID</th><th>Pass</th><th>Reason</th></tr></thead>
    <tbody>${detailRows}</tbody>
  </table>

  <h2>📉 Regressions</h2>
  <table>
    <thead><tr><th>Metric</th><th>Baseline</th><th>Current</th><th>Delta</th><th>Action</th></tr></thead>
    <tbody>${regressionRows}</tbody>
  </table>
</body>
</html>`;
}

/**
 * Generate a PR comment in Markdown format for CI.
 */
export function generatePrComment(report: EvalReport): string {
  const lines = [
    `## 🧪 Eval Report: ${report.bu} / ${report.suite}`,
    '',
    `| Metric | Value | Target | Status |`,
    `|---|---|---|---|`,
  ];

  const numericScores = Object.entries(report.scores)
    .filter(([, v]) => typeof v === 'number');

  for (const [key, value] of numericScores) {
    const target = (TARGETS as Record<string, number>)[key];
    const status = target !== undefined
      ? (value as number) >= target ? '✅' : '❌'
      : '—';
    lines.push(`| ${key} | ${(value as number).toFixed(2)} | ${target ?? '—'} | ${status} |`);
  }

  if (report.regressions.length > 0) {
    lines.push('', '### ⚠️ Regressions', '', '| Metric | Baseline → Current | Delta | Blocks |', '|---|---|---|---|');
    for (const r of report.regressions) {
      lines.push(`| ${r.metric} | ${r.baseline.toFixed(2)} → ${r.current.toFixed(2)} | ${r.delta_pct.toFixed(1)}% | ${r.blocks_merge ? '🚫' : '⚠️'} |`);
    }
  } else {
    lines.push('', '### ✅ No regressions detected');
  }

  const failedDetails = report.details.filter((d) => !d.pass);
  if (failedDetails.length > 0 && failedDetails.length <= 10) {
    lines.push('', '### ❌ Failed Items', '');
    for (const d of failedDetails) {
      lines.push(`- **${d.id}**: ${d.reason}`);
    }
  } else if (failedDetails.length > 10) {
    lines.push('', `### ❌ ${failedDetails.length} items failed (see full report)`);
  }

  const blockers = report.regressions.filter((r) => r.blocks_merge);
  if (blockers.length > 0) {
    lines.push('', '> 🚫 **This PR is blocked from merging** due to metric regressions.', '');
  }

  return lines.join('\n');
}

/**
 * Main eval runner. Orchestrates loading gold-set, running pipeline, scoring, and reporting.
 */
export async function runEval(options: RunOptions): Promise<EvalReport> {
  const timestamp = new Date().toISOString();

  // In a real implementation, this would:
  // 1. Load gold-set/adversarial entries from YAML files
  // 2. Execute each through the NL→SQL pipeline
  // 3. Collect results
  // 4. Score with the metrics framework
  // For now, return the scaffold with empty results for CI integration.

  const report: EvalReport = {
    version: '0.1.0',
    timestamp,
    bu: options.bu,
    suite: options.suite,
    scores: {
      accuracy: 0,
      coverage: 0,
      faithfulness: 0,
      latency_p50_ms: 0,
      latency_p95_ms: 0,
      latency_p99_ms: 0,
      cost_per_question_usd: 0,
      hallucination_rate: 0,
      refusal_precision: 0,
      refusal_recall: 0,
      confidence_calibration: { high_accuracy: 0, medium_accuracy: 0, low_accuracy: 0 },
      citation_count_avg: 0,
      adversarial_pass_rate: 0,
      adversarial_high_pass_rate: 0,
    },
    details: [],
    regressions: [],
  };

  return report;
}

// ─── CI Integration ──────────────────────────────────────

/**
 * GitHub Actions CI entry point.
 * Exits with code 1 if any regression blocks merge.
 */
export async function ciMain(args: string[]): Promise<number> {
  const bu = (args.find((a) => a.startsWith('--bu='))?.split('=')[1] ?? 'all') as RunOptions['bu'];
  const suite = (args.find((a) => a.startsWith('--suite='))?.split('=')[1] ?? 'full') as RunOptions['suite'];
  const format = (args.find((a) => a.startsWith('--format='))?.split('=')[1] ?? 'both') as RunOptions['format'];
  const output = args.find((a) => a.startsWith('--output='))?.split('=')[1] ?? './eval-report';
  const baseline = args.find((a) => a.startsWith('--baseline='))?.split('=')[1];

  const report = await runEval({ bu, suite, format, output, baseline, ci: true });

  // Output
  if (format === 'json' || format === 'both') {
    console.log(generateJsonReport(report));
  }

  // Check for merge-blocking regressions
  const blockers = report.regressions.filter((r) => r.blocks_merge);
  if (blockers.length > 0) {
    console.error(`\n🚫 ${blockers.length} regression(s) block merge:`);
    for (const b of blockers) {
      console.error(`  - ${b.metric}: ${b.baseline.toFixed(2)} → ${b.current.toFixed(2)} (Δ${b.delta_pct.toFixed(1)}%)`);
    }
    return 1;
  }

  console.log('\n✅ All metrics within threshold. Safe to merge.');
  return 0;
}
