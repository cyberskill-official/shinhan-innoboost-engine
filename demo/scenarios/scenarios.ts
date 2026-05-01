// demo/scenarios/scenarios.ts
// P07-T02 — Three Live-Build Scenarios
// Each can be completed in 10 minutes during interview
// Each has: user story, spec, kill/graduation criteria, fallback trace

export interface DemoScenario {
  readonly id: string;
  readonly name: string;
  readonly nameVi: string;
  readonly duration: '10min';
  readonly preset: 'broker-tooling' | 'research-desk' | 'vanilla';
  readonly bu: 'securities';

  // User story (90-second video setup)
  readonly userStory: {
    readonly persona: string;
    readonly problem: string;
    readonly desiredOutcome: string;
    readonly videoDuration: '90s';
    readonly videoScript: string;
  };

  // Spec → Code → Demo trace
  readonly buildTrace: {
    readonly steps: readonly BuildStep[];
    readonly fallbackVideoPath: string;
  };

  // Kill criterion + Graduation criterion
  readonly criteria: {
    readonly kill: string;          // When to abandon this scenario
    readonly graduation: string;    // When to declare success
  };
}

export interface BuildStep {
  readonly order: number;
  readonly description: string;
  readonly estimatedSeconds: number;
  readonly command?: string;       // Claude Code command
  readonly expectedOutput: string;
}

// ─── Scenario 1: Portfolio Summariser ─────────────────────

export const PORTFOLIO_SUMMARISER: DemoScenario = {
  id: 'S1-portfolio-summariser',
  name: 'Portfolio Summariser',
  nameVi: 'Tóm tắt Danh mục Đầu tư',
  duration: '10min',
  preset: 'broker-tooling',
  bu: 'securities',

  userStory: {
    persona: 'Portfolio Manager at Shinhan Securities',
    problem: 'Manually compiling portfolio reports takes 2 hours every morning. Needs a conversational summary with risk callouts before the market opens at 9 AM.',
    desiredOutcome: 'Upload a CSV of holdings → get a natural-language summary with unrealised P&L, concentration risk flags, and suggested rebalances.',
    videoDuration: '90s',
    videoScript: `[0:00] Meet Linh, Portfolio Manager at Shinhan Securities. Every morning she spends 2 hours compiling reports from 3 different systems.
[0:15] She wants to upload her portfolio CSV and get an instant summary — in Vietnamese — with risk callouts.
[0:30] Today we'll build this in 10 minutes using CyberSkill's vibe-coding starter kit.
[0:45] The system will: parse holdings, compute P&L, flag concentration risk, and generate a narrative summary.
[1:00] Let's see if spec-to-demo can actually work in under 10 minutes.
[1:15] The kill criterion: if we can't parse the CSV and compute P&L in the first 4 minutes, we stop.
[1:30] Let's go.`,
  },

  buildTrace: {
    steps: [
      { order: 1, description: 'Scaffold CSV parser with financial-types integration', estimatedSeconds: 90, command: '/scaffold csv-parser --types Position', expectedOutput: 'CSV parser component with VND money types' },
      { order: 2, description: 'Implement P&L computation using position deltas', estimatedSeconds: 60, command: '/compute pnl --from csv', expectedOutput: 'Portfolio P&L with unrealised gains/losses per position' },
      { order: 3, description: 'Add concentration risk calculation (Herfindahl index)', estimatedSeconds: 90, command: '/risk concentration --threshold 20', expectedOutput: 'Risk flags for positions exceeding 20% concentration' },
      { order: 4, description: 'Generate natural-language summary via NL engine', estimatedSeconds: 120, expectedOutput: 'Vietnamese narrative: "Danh mục có 15 vị thế, tổng giá trị 12.5 tỷ VND…"' },
      { order: 5, description: 'Wire up conversational UI with citations', estimatedSeconds: 120, expectedOutput: 'Chat interface showing summary with citation pills linking to positions' },
      { order: 6, description: 'Polish and add rebalance suggestions', estimatedSeconds: 120, expectedOutput: 'Suggested trades to reduce concentration risk' },
    ],
    fallbackVideoPath: '/demo/fallbacks/S1-portfolio-summariser.mp4',
  },

  criteria: {
    kill: 'Cannot parse CSV and compute P&L within the first 4 minutes. Stop, show the fallback video, explain what went wrong.',
    graduation: 'User uploads CSV → receives Vietnamese narrative summary with P&L and at least 1 risk callout → all within 10 minutes.',
  },
};

// ─── Scenario 2: Regulatory Checker ──────────────────────

export const REGULATORY_CHECKER: DemoScenario = {
  id: 'S2-regulatory-checker',
  name: 'Regulatory Checker',
  nameVi: 'Kiểm tra Quy định',
  duration: '10min',
  preset: 'broker-tooling',
  bu: 'securities',

  userStory: {
    persona: 'Compliance Officer at Shinhan Securities',
    problem: 'Draft trades must be checked against 5+ rules before execution. Manual checking delays order flow and misses edge cases.',
    desiredOutcome: 'Enter a draft trade → system flags any rule exceptions with reasoning → compliance officer approves or blocks.',
    videoDuration: '90s',
    videoScript: `[0:00] Meet Tuan, Compliance Officer. He reviews every large trade before it goes live.
[0:15] Right now he checks 5 rules manually: foreign ownership limits, ceiling/floor prices, lot sizes, settlement risk, and insider trading windows.
[0:30] Today we'll build an automated checker that evaluates trades against these rules in real-time.
[0:45] The system will: parse the trade, evaluate each rule, flag exceptions with detailed reasoning, and present a clear approve/block decision.
[1:00] Kill criterion: if we can't evaluate at least 3 rules in 5 minutes, we stop.
[1:15] Let's see how fast we can go from spec to working checker.
[1:30] Starting now.`,
  },

  buildTrace: {
    steps: [
      { order: 1, description: 'Define trade input form and validation', estimatedSeconds: 60, expectedOutput: 'Trade entry form with symbol, side, quantity, price, type' },
      { order: 2, description: 'Implement ceiling/floor price rule (±7% HOSE)', estimatedSeconds: 60, expectedOutput: 'Rule engine checks price against reference ± limit' },
      { order: 3, description: 'Implement lot size rule (100 shares HOSE)', estimatedSeconds: 45, expectedOutput: 'Quantity validation against exchange lot size' },
      { order: 4, description: 'Implement foreign ownership limit check', estimatedSeconds: 90, expectedOutput: 'Checks current FO% + trade quantity against limit' },
      { order: 5, description: 'Implement settlement risk check (T+2 cash availability)', estimatedSeconds: 90, expectedOutput: 'Validates buyer has sufficient settled cash' },
      { order: 6, description: 'Build results UI with reasoning for each rule', estimatedSeconds: 120, expectedOutput: 'Dashboard showing pass/fail per rule with explanation' },
      { order: 7, description: 'Add approve/block action with audit log', estimatedSeconds: 120, expectedOutput: 'Compliance officer approve/block buttons with audit trail' },
    ],
    fallbackVideoPath: '/demo/fallbacks/S2-regulatory-checker.mp4',
  },

  criteria: {
    kill: 'Cannot evaluate at least 3 rules within 5 minutes. Switch to fallback.',
    graduation: 'Enter a draft trade → system evaluates 5 rules → flags at least 1 exception with reasoning → compliance officer can approve/block → all within 10 minutes.',
  },
};

// ─── Scenario 3: Backtest Dashboard ──────────────────────

export const BACKTEST_DASHBOARD: DemoScenario = {
  id: 'S3-backtest-dashboard',
  name: 'Backtest Dashboard',
  nameVi: 'Dashboard Kiểm nghiệm Chiến lược',
  duration: '10min',
  preset: 'research-desk',
  bu: 'securities',

  userStory: {
    persona: 'Research Analyst at Shinhan Securities',
    problem: 'Backtesting a strategy idea requires downloading data, writing Python scripts, and manually creating charts. Takes a day to validate a simple hypothesis.',
    desiredOutcome: 'Describe a strategy in natural language → system runs it against synthetic data → produces chart + narrative with key metrics.',
    videoDuration: '90s',
    videoScript: `[0:00] Meet Hoa, Research Analyst. She has a hypothesis: "Buy VNM when RSI drops below 30, sell when it hits 70."
[0:15] Testing this normally takes a full day. Download data, write Python, generate charts, write up findings.
[0:30] Today we'll build a backtest dashboard that takes strategy specs in natural language and produces results in seconds.
[0:45] The system will: parse the strategy, run it against our synthetic securities dataset, compute returns, and generate a chart with narrative.
[1:00] Kill criterion: if we can't produce a basic equity curve chart in 6 minutes, we stop.
[1:15] The strategy is simple but the demo shows the pattern — any strategy spec can flow through this pipe.
[1:30] Let's build it.`,
  },

  buildTrace: {
    steps: [
      { order: 1, description: 'Parse strategy spec into structured rules', estimatedSeconds: 90, expectedOutput: 'Strategy: { indicator: RSI, buyThreshold: 30, sellThreshold: 70, symbol: VNM }' },
      { order: 2, description: 'Load synthetic OHLC data for target symbol', estimatedSeconds: 60, command: '/query securities ohlc --symbol VNM --period 1y', expectedOutput: '250 trading days of OHLC data loaded' },
      { order: 3, description: 'Implement RSI computation', estimatedSeconds: 90, expectedOutput: 'RSI(14) values computed for each trading day' },
      { order: 4, description: 'Run backtest simulation (signal → position → P&L)', estimatedSeconds: 120, expectedOutput: 'Trade log: 8 trades, 5 wins, 3 losses' },
      { order: 5, description: 'Generate equity curve chart', estimatedSeconds: 90, expectedOutput: 'Line chart: portfolio value over time with buy/sell markers' },
      { order: 6, description: 'Compute key metrics and generate narrative', estimatedSeconds: 120, expectedOutput: 'Total return: +12.3%, Sharpe: 1.4, Max drawdown: -8.2%. Vietnamese narrative summary.' },
    ],
    fallbackVideoPath: '/demo/fallbacks/S3-backtest-dashboard.mp4',
  },

  criteria: {
    kill: 'Cannot produce a basic equity curve chart within 6 minutes. Switch to fallback.',
    graduation: 'Describe strategy → system produces equity curve chart + key metrics (return, Sharpe, drawdown) + Vietnamese narrative → all within 10 minutes.',
  },
};

// ─── Export All Scenarios ─────────────────────────────────

export const ALL_SCENARIOS = [
  PORTFOLIO_SUMMARISER,
  REGULATORY_CHECKER,
  BACKTEST_DASHBOARD,
] as const;
