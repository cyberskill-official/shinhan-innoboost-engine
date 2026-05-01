# Shinhan Innoboost 2026 — Demo Build Plan

**Goal**: Build a comprehensive, production-grade demo system that doubles as the foundation for the 12-week PoC if selected. Three BU-specific surfaces (SF9 / SB5 / SS1) on a single engine. No throwaway code — every artefact must be reusable in the commercial-track build that follows the PoC.

**Anchoring principles**
- **One engine, three skins** for SF9 + SB5 (chat-with-data). SS1 is a separate vibe-coding workflow demo; reuses our governance + eval primitives, not the chat engine.
- **PDPL + VN Cybersecurity Law (effective 1 Jul 2026)** baked in from day 1, not retrofitted.
- **On-prem deployable from the first commit.** No cloud-only assumptions. Air-gap-friendly.
- **Audit-log everything.** Every prompt, every SQL, every approval, every reject. Financial regulators love audit logs; demo this loudly.
- **Deterministic governance over probabilistic intelligence.** Address the "banking needs deterministic auditable decisions" objection structurally, not rhetorically.
- **Eval harness is the spine, not a feature.** Gold-set Q&A drives every change.

---

## Phase 0 — Pre-flight Decisions & Approvals

**Goal**: Unblock everything else. No code yet.

- Confirm sponsor consent — Engagement A and Engagement B owners agree we can show sanitised, anonymised flavours to Shinhan under mutual NDA. Get it in writing.
- Decide host platform: standalone repo (faster) vs. ShinhanOS module (more strategic, slower). Recommendation: standalone now, port to ShinhanOS post-PoC.
- Lock the brand surface: Global Design System tokens, logo lockup, BU-specific theme variants (Bank navy, SVFC slate, Securities charcoal).
- Lock the AI Doctrine version reference (v1.0.0, locked 2026-04-25). Pin the excerpt set we'll attach to each BU pitch.
- Choose model stack: primary (Claude Sonnet for SQL gen + Opus for adversarial eval), fallback (open-weight on-prem — Qwen 2.5 72B per Shinhan's stated openness to Qwen).
- Choose warehouse stack: Postgres (laptop demo), BigQuery + Snowflake adapters (cloud demo), on-prem Postgres adapter (commercialisation track).
- Procurement of GPU/inference: 1× H100 box on-demand (Lambda/Runpod) for on-prem rehearsal of Qwen path.
- Open three NDAs: SFL-V mutual NDA, GenAI Fund mutual NDA, internal NDA template for CyberSkill team members joining the squad.
- Stand up a dedicated Slack channel + shared drive folder + Linear/Asana project. Single source of truth.

**Phase 0 deliverables**: signed sponsor consent, NDA pack, host-platform ADR, brand spec, model + warehouse ADRs, GPU procurement plan, project workspace.

---

## Phase 1 — Foundation: Infra, Security, Repo

**Goal**: A repo that's deployable to laptop, cloud, and on-prem from commit #1.

- Monorepo skeleton: `engine/` (chat-with-data), `hitl/` (reviewer queue), `vibe/` (SS1 starter kit), `ui/` (Next.js shell), `eval/` (gold-set + harness), `data/` (synthetic generators), `infra/` (Terraform + Helm), `compliance/` (PDPL/SBV/ISO scaffolds).
- Tooling: pnpm workspaces, Turborepo, TypeScript strict, ESLint + Prettier, conventional commits, Husky pre-commit, Renovate.
- CI/CD: GitHub Actions — lint, type-check, unit, integration, eval harness, security scan (Trivy + Snyk + Semgrep), build-and-push to GHCR, deploy to staging on main.
- Secrets management: Doppler or HashiCorp Vault. No secrets in repo, no secrets in env files committed. Rotate on schedule.
- IaC: Terraform for cloud (VPC, KMS, RDS, GKE/EKS), Helm charts for on-prem. Nothing clicked in a console.
- Containers: distroless base, multi-stage builds, non-root, read-only FS, capability drop. SBOM on every build.
- Auth: OAuth2/OIDC via Keycloak (self-hosted, on-prem-friendly). MFA mandatory. SAML adapter for Shinhan SSO ready.
- RBAC: roles (admin, reviewer, analyst, viewer) + scopes per BU. Tenant boundary enforced at every query.
- Encryption: TLS 1.3 in transit, AES-256 at rest, BYOK supported, KMS rotation policy.
- Network: zero-trust between services, mTLS, no public ingress except the UI gateway.
- Backups: PITR on Postgres, weekly full + daily incremental, restore tested on a calendar.
- Disaster recovery runbook: RTO/RPO documented, tested.

**Phase 1 deliverables**: deployable scaffold to laptop / cloud / on-prem; CI green; threat model v0; security baseline doc.

---

## Phase 2 — Core Engine: Chat-with-Data

**Goal**: The thing SF9 + SB5 are buying. Production-grade NL → governed SQL → audited answer.

### 2.1 Semantic metric layer
- dbt-style metrics catalogue: every metric defined as a YAML (name, dimensions, grain, formula, owner, freshness, sensitivity tier).
- Metric registry API (gRPC + REST). Versioned.
- Lineage tracking: every metric maps to source tables/columns; impact analysis on schema change.
- Sensitivity tiers: Public / Internal / Restricted / Regulated. Drives downstream RBAC + masking.

### 2.2 NL → SQL pipeline
- Intent classifier: question type (lookup / aggregation / trend / comparison / freeform).
- Schema retriever: pgvector-backed semantic search over metric registry; returns top-k metrics + tables.
- Constrained SQL generator: LLM proposes SQL, **validator** parses with sqlparse / DuckDB-parser, rejects anything touching unauthorised tables, dropping rows, mutating state, or missing tenant predicate.
- Policy layer (the "deterministic" answer to Shinhan's GenAI objection): rule-based gates run before LLM output reaches user — sensitivity check, PII masking, query cost estimate, rate limit, tenant isolation. LLM never bypasses policy.
- Query executor: read-replica only, time-out enforced, row-cap enforced.
- Result post-processor: shape into table + chart + narrative.

### 2.3 Citation engine
- Every numeric claim in the answer narrative carries a citation token.
- Citation expands to: source SQL, row-count, freshness timestamp, metric definition, lineage chain.
- "Trust drawer" UI: click any number → see exactly how it was derived.

### 2.4 Confidence tiers
- Per AI Doctrine: Low <60%, Medium 60–85%, High >85%.
- Score derived from: schema-match confidence, SQL-validator pass rate, eval-harness similarity to known-good answers, freshness staleness penalty, ambiguity score.
- UI surfaces tier prominently. Below 60% → blocks output and triggers HITL (when SB5 mode active) or refusal (default).

### 2.5 Prompt-injection defence
- Layered: input sanitiser (drops/escapes adversarial markers), system-prompt isolation (user content never inherits system role), output classifier (catches model attempting to exfiltrate system prompt or break role).
- Adversarial corpus: 200+ injection attempts (DAN, role-swap, context-overflow, encoded payloads). Run as part of eval harness on every build.

### 2.6 PDPL consent + data minimisation
- Consent ledger: who consented to what data being used, when, for which purpose.
- Per-question consent check before query.
- Data minimisation: queries select only columns needed; PII columns require explicit elevation.
- Right-to-erasure hook: identifiable data is purgeable on request, audit-log preserves the action.

### 2.7 Caching + latency
- Two-tier cache: L1 in-process (LRU, 1k entries), L2 Redis (10k entries, 1h TTL).
- Cache key includes metric version, RBAC scope, freshness window — so a metric definition change invalidates correctly.
- Target: p50 < 1.5s, p95 < 5s, p99 < 8s on cached metrics; ad-hoc < 30s.

### 2.8 Audit log
- Every event: question text, retrieved schema, generated SQL, validator verdict, policy verdict, executed SQL, result hash, answer text, citations, confidence tier, user, tenant, timestamp.
- Append-only, hash-chained, exportable to SIEM.
- Immutable storage: S3 Object Lock or on-prem WORM.
- Retention: 7 years (financial regulator default).

**Phase 2 deliverables**: runnable engine that takes a natural-language question and returns an audited answer with citations and confidence; integration test suite; threat model v1.

---

## Phase 3 — Synthetic Datasets (Three BU Flavours)

**Goal**: Realistic enough that demo questions aren't toy-shaped; synthetic enough that no real PII can leak.

### 3.1 SVFC consumer-finance dataset
- Tables: customers (~50K), loans (~120K), payments (~2M), branches (32), products (12), risk_scores (snapshot daily 365d), collections_actions, marketing_campaigns.
- Realism: VND amounts at correct magnitude, VN provincial branch distribution, ICB-Vietnam-style loan products, realistic NPL distribution (~2.5%), seasonality.
- Edge cases seeded: write-offs, restructured loans, dual-currency, KYC-flagged customers.

### 3.2 Bank HO Department dataset (SB5)
- Tables: branch_pnl (monthly, 5y history × 60 branches), deposit_balances (daily 2y × product × branch), forex_positions, lending_book, treasury_positions, ops_incidents, customer_complaints.
- Realism: matches the kinds of cuts HO Departments actually request from ICT-Reporting (the Bank brief flagged this directly).
- Sensitive-tier seeding: deliberate mix of Public / Internal / Restricted rows so RBAC + sensitivity policy can be demonstrated.

### 3.3 Securities dataset (SS1, used in some live-coding scenarios)
- Tables: customers, accounts, holdings, trades (~5M, intraday tick reduced to 1-min), portfolios, watchlists, research_notes, market_data (HOSE/HNX symbols, 5y daily).
- Realism: realistic VN stock universe, correct trading hours, realistic order types.

### 3.4 Generators + tooling
- Faker-VN extension for VN-realistic names, addresses, ID numbers (clearly synthetic patterns), phone numbers.
- Seedable, reproducible — `make data SEED=42` regenerates identical data.
- Loader scripts for Postgres / BigQuery / Snowflake.
- Schema documentation auto-generated.
- Data-card documents per dataset (provenance: synthetic, generation method, seeded statistics, known limitations).

**Phase 3 deliverables**: three loaded warehouses with documented schemas and data cards; regenerable on demand.

---

## Phase 4 — Eval Harness & Continuous QA

**Goal**: The harness runs on every commit. We can prove accuracy, not assert it.

### 4.1 Gold-set Q&A
- 30+ questions per BU (90+ total), each with: question, expected SQL, expected answer shape, expected numeric range, expected citations, expected confidence tier, sensitivity classification.
- Mix: factual lookup (40%), aggregation (30%), trend/compare (20%), ambiguous-or-out-of-scope (10% — system should refuse or clarify).
- Authored by domain reviewer (someone who knows banking/SVFC/securities), not the engineer who built the system.

### 4.2 Adversarial set
- 200+ prompt-injection attempts, 50+ ambiguity stressors ("show me last quarter" — when is "last"?), 30+ out-of-scope ("write me a poem"), 30+ sensitive-data extraction attempts.
- Expected outcome per item: refuse / clarify / answer-with-caveat / escalate to HITL.

### 4.3 Metrics tracked
- Accuracy (matches expected answer within tolerance)
- Coverage (% of gold-set answered without HITL)
- Faithfulness (does narrative match cited data — automated check)
- Latency (p50/p95/p99)
- Cost per question (tokens × rate)
- Hallucination rate (numeric claim with no valid citation)
- Refusal precision (refused items that should have been refused)

### 4.4 Harness tooling
- CLI: `cyber-eval run --bu=svfc --suite=gold` → JSON + HTML report.
- CI integration: PR comment with delta vs main.
- Regression alarms: any metric drop >2% blocks merge.
- Public dashboard for the demo: live metrics, last 30-day trend.

### 4.5 Reviewer feedback loop
- HITL rejections automatically flagged for gold-set candidacy.
- Weekly triage: domain reviewer promotes/demotes/edits gold-set entries.
- Versioned gold-set; eval results comparable across versions.

**Phase 4 deliverables**: harness CLI + CI integration; living gold-set; eval dashboard; reviewer triage runbook.

---

## Phase 5 — UI Shells per BU

**Goal**: Three branded surfaces over one engine. Polished enough that a CEO sees it and trusts it.

### 5.1 Shared chat surface
- Conversational UI: question input, streaming answer, citation pills, confidence-tier badge, "show me how" drawer, regenerate, follow-up suggestions.
- History: per-user, searchable, exportable.
- Sharing: deep-link to a question + answer + citation set, RBAC-respecting.
- Dashboard panel: pin frequently asked questions, schedule digests.
- Empty states, loading states, error states, refusal states (with reason).
- Accessibility: WCAG 2.2 AA, keyboard-first, screen-reader tested, contrast verified.
- Internationalisation: English + Vietnamese, ready for Korean.
- Mobile-responsive (an MD might open this on iPad in the boardroom).

### 5.2 SVFC theme (SF9)
- Branding lockup, sample questions on landing ("MIS-style" examples — NPL by branch, monthly disbursement, top 10 collectors).
- Persona sandbox: "log in as MIS lead" / "log in as collections manager" / "log in as CFO" — different RBAC scope = different answers visible.

### 5.3 Bank theme (SB5)
- Landing positions chat as **complement** to Power BI, not replacement (the Bank brief is sensitive on this).
- Sample questions geared to HO Departments currently blocked by ICT-Reporting bottleneck.
- HITL banner visible on regulated-tier questions.

### 5.4 Securities theme (light surface for SS1 contextual demos)
- Ticker-aware chat: type "$VNM" → contextual portfolio drilldown.
- Vibe-coding sandbox embed (see Phase 7).

### 5.5 Admin surface
- Tenant/BU management, RBAC matrix editor, metric registry browser, audit-log explorer with full-text + filters, eval-harness viewer, prompt-injection alert console.
- Designed to be the surface a Shinhan compliance officer would log into.

**Phase 5 deliverables**: three themed surfaces deployed to demo environments; admin console; UX walkthrough video per BU.

---

## Phase 6 — HITL Reviewer Queue (SB5's wedge)

**Goal**: The Bank brief explicitly named HITL as a requirement. This is your differentiator. Make it the cleanest reviewer queue Shinhan has ever seen.

### 6.1 Queue mechanics
- Triage rules: confidence tier < 65%, sensitivity tier ≥ Restricted, novel question (similarity below threshold to anything in gold-set), reviewer-flagged-historically pattern.
- Routing: round-robin within reviewer pool, priority queue for SLA-critical.
- SLA tracking: 30-min target (per your SF9/SB5 promise), warning at 20 min, breach alert at 30, escalation at 45.

### 6.2 Reviewer console
- Inbox view: question, generated answer, generated SQL, confidence reasoning, citations, sensitivity verdict, suggested-edit prompt.
- Actions: approve as-is, edit-and-approve, reject (reason required), escalate, refuse and notify user.
- Inline diff if reviewer edits answer or SQL.
- Side panel: similar prior questions and how they were resolved (institutional memory).

### 6.3 Audit + governance
- Every reviewer decision logged with timestamp, reviewer ID, action, reason, before/after state.
- Reviewer performance metrics (volume, SLA adherence, override rate, downstream user-feedback).
- Quarterly calibration report: are reviewers consistent? Drift detected? Disagreement clusters?

### 6.4 Reviewer-feedback → engine
- Approved-with-edits feeds gold-set candidate review.
- Rejected-with-reason feeds prompt-improvement queue.
- Patterns across rejections drive metric-registry corrections.

### 6.5 Notifications
- Email + in-app + Shinhan-side webhook for SLA-critical breaches.
- End-user notified on approval ("your answer is ready") with deep-link.

**Phase 6 deliverables**: reviewer console; SLA dashboard; calibration report template; integration with audit log.

---

## Phase 7 — Vibe-Coding Demo Track (SS1)

**Goal**: SS1 wants velocity, not polish. Show that we can spec → demo in days, not quarters. The interview demo is *live*; the supporting infra is what makes the live demo bulletproof.

### 7.1 Starter-kit repo
- Pre-configured Claude Code workspace with project memory, slash commands, MCPs (warehouse, Figma, Linear), evals scaffold.
- Curated primitive library: chart components, table components, RBAC helpers, audit-log decorators, SQL helpers, financial-domain types (VND money, OHLC, position deltas).
- Three vertical "starter brains": vanilla repo, "broker tooling" preset, "research desk" preset.

### 7.2 Live-build scenarios (canned)
Three rehearsed scenarios, any of which we can complete in 10 minutes during interview:
- **Portfolio summariser**: ingest a CSV of holdings → conversational summary with risk callouts.
- **Regulatory checker**: parse a draft trade against a small ruleset → flag exceptions with reasoning.
- **Backtest dashboard**: run a strategy spec across the synthetic securities dataset → chart + narrative.

Each scenario has:
- A 90-second user-story video to set up the build.
- Spec → code → demo trace recorded as a fallback.
- Kill criterion + graduation criterion in writing (so Shinhan sees we don't sunk-cost into failures).

### 7.3 Vibe-coding workflow itself, productised
- Spec template (problem, success criteria, kill criterion, time-box).
- Demo template (what to show, what to *not* show, observability hooks).
- Decision-gate template (graduate / kill / pivot).
- Weekly cadence template (Monday spec → Wednesday checkpoint → Friday demo + decision).

### 7.4 Evidence kit
- Past vibe-coding cycle artefacts (anonymised) — show this is a system, not a stunt.
- "What we built and what we killed" log — credibility comes from showing things we deliberately abandoned.

**Phase 7 deliverables**: starter-kit repo, three rehearsed scenarios with fallback videos, workflow templates, evidence kit.

---

## Phase 8 — Compliance & Security Hardening

**Goal**: Walk into the interview with a security questionnaire already filled out. Shinhan compliance review is a downstream gate; clear it now.

- PDPL mapping: consent purposes, data subject rights flow, retention policies, cross-border transfer posture (data stays in VN).
- VN Cybersecurity Law (1 Jul 2026) mapping: data localisation, incident reporting, lawful interception interface, security audit cadence.
- SBV regulatory mapping: relevant circulars on banking IT (e.g., 09/2020/TT-NHNN on IT operations, 50/2024/TT-NHNN if applicable), incident reporting timelines.
- ISO 27001 control mapping (which controls are in place, which are roadmap).
- ISO 42001 (AI management system) control mapping — given Shinhan's appetite for AI, this is a wedge.
- SOC 2 Type II readiness checklist (your ShinhanOS roadmap is already heading here).
- Threat model: STRIDE per service + LLM-specific (prompt injection, training-data extraction, model-output exfiltration, adversarial inputs).
- Penetration-test readiness: scoped, vendor selected, NDA template ready.
- Data classification policy + tagged in every table.
- Data flow diagrams: per BU + cross-BU.
- Pre-filled vendor questionnaires: SIG Lite, CAIQ, Shinhan-specific if available.
- Incident response plan: roles, comms tree, containment, regulator notification SLAs.
- Business continuity plan: tested.
- Background checks for team members on the squad (a financial-sector ask).

**Phase 8 deliverables**: compliance dossier (one PDF per regime), threat model, IR + BCP runbooks, pre-filled vendor questionnaires.

---

## Phase 9 — Observability

**Goal**: Demo a metric dashboard during the interview. Show we run this like a service, not a project.

- Structured logs (JSON), shipped to OpenSearch / Grafana Loki.
- Metrics: Prometheus + Grafana. Dashboards per: engine health, eval scores, HITL queue, costs, security events.
- Tracing: OpenTelemetry end-to-end (UI → engine → warehouse → LLM → cache → audit log).
- Alerting: Pagerduty (or Shinhan-preferred) — SLO breach, eval regression, security anomaly.
- SLOs defined: availability 99.5%, p95 latency < 5s, eval accuracy ≥ 95%, HITL SLA adherence ≥ 95%.
- Cost dashboard: per-question, per-BU, per-tenant; trend; outlier detection.
- Anomaly detection on prompt-injection attempts, refusal-rate spikes, confidence-tier shifts.

**Phase 9 deliverables**: live observability stack; dashboards; SLO doc; alerting runbook.

---

## Phase 10 — Deployment Targets

**Goal**: Three deployment shapes ready to demo: laptop, cloud, on-prem.

### 10.1 Laptop (interview fallback)
- `docker compose up` brings the entire stack up on a 16GB MacBook.
- Local Postgres, local Redis, local Qwen-7B (quantised) for offline LLM, falls back to API if online.
- Pre-seeded data, pre-seeded users, pre-recorded demo script.

### 10.2 Cloud (PoC phase)
- GKE/EKS with Helm. Terraform for everything below k8s.
- Per-BU namespace, per-BU TLS cert, per-BU OIDC realm.
- Production-shape but with synthetic data and demo branding.

### 10.3 On-prem (commercialisation phase)
- Helm chart for vanilla Kubernetes (no cloud-specific dependencies).
- Air-gap install bundle: all images, charts, models, dependencies in one tarball.
- Reproducible build manifest (SBOM + signatures).
- Bare-metal sizing guide: GPU + CPU + storage + network for various tenant sizes.
- Operations runbook: install, upgrade, backup, restore, rotate, decommission.

### 10.4 Migration / data residency
- VN-hosted infra story: Viettel IDC, VNPT IDC, FPT IDC viable; mapping per option.
- Per-tenant residency engineering (already in your ShinhanOS memory) ported.

**Phase 10 deliverables**: three deployment targets, sizing + ops runbooks, air-gap bundle.

---

## Phase 11 — Trust & Reference Materials

**Goal**: Hand the reviewer enough material that they can mentally pre-approve the PoC before kickoff.

- Reference engagement one-pagers (Engagement A, Engagement B) — anonymised, sponsor-approved, with metrics.
- Reference call schedule: time slots reserved, sponsors briefed, intro template ready.
- AI Doctrine excerpts, three lenses: governance (Bank), velocity (Securities), accuracy (SVFC).
- Architecture diagrams: per BU, plus cross-BU shared-engine view.
- Data-flow diagrams: per BU, with sensitivity tiers + residency.
- Threat model summary (one-pager).
- Compliance dossier index (Phase 8 outputs, with index).
- Past-incident transparency log: anything we've shipped, anything that's failed in eval, what we did about it. Trust comes from candour.
- Customer NPS / testimonial reel (if Engagement A sponsor will allow).
- Team bios for the squad joining the PoC: relevant experience, security clearance status, language fluency (VI / EN / KO).

**Phase 11 deliverables**: trust dossier (one shared folder, one index PDF).

---

## Phase 12 — Pitch & Rehearsal

**Goal**: Three interviews, three different decks, one rehearsed team. Live demo bulletproof.

### 12.1 Per-BU pitch deck (15 min)
- Slide 1 — the problem in their own words (quote from their brief).
- Slide 2 — the solution, one sentence.
- Slide 3 — live demo (5 min).
- Slide 4 — architecture (1 min, technical-credibility signal).
- Slide 5 — governance (HITL, audit, eval, compliance — their crown-jewel concerns).
- Slide 6 — references (Engagement A + B, with permission to reach out).
- Slide 7 — 12-week PoC plan with kill + graduation criteria.
- Slide 8 — commercial path post-PoC, indicative pricing.
- Slide 9 — team + commitment (founder + delivery lead, full program).
- Slide 10 — ask: what we need from Shinhan (data, sponsor, infra).

### 12.2 Demo run-of-show
- Setup: laptop + iPad + backup laptop + mobile hotspot + recorded fallback.
- Persona sequencing: who's logged in for each scene.
- Dialogue cues: who speaks during which transition.
- Failure plan: if X breaks, switch to recorded video; if internet dies, switch to local stack.

### 12.3 SS1 live-coding kit
- Repo opened, Claude Code initialised, three scenario seed prompts ready in clipboard.
- Practice run: fully build at least one scenario in front of a stopwatch.
- Recorded fallback for each scenario.

### 12.4 FAQ doc
Anticipate and answer:
- "How do you compare to incumbent X?" (per BU)
- "What happens if your LLM provider has an outage?"
- "How do you handle a hallucination in production?"
- "Can you operate fully on-prem with no internet egress?"
- "What's your data-deletion guarantee?"
- "Show us a wrong answer your eval caught."
- "What did you kill last year and why?" (vibe-coding credibility)
- "Why three submissions instead of one focused one?"

### 12.5 Rehearsal cadence
- Internal dry-run #1: full team watching, brutal feedback.
- Dry-run #2: with a friendly outside-the-team reviewer (someone with banking experience).
- Dry-run #3: time-pressure run, things deliberately broken to test fallbacks.
- Final calibration: what we will and won't say, especially on pricing and scope.

**Phase 12 deliverables**: three decks, three demo run-of-shows, FAQ doc, three rehearsals logged.

---

## Phase 13 — Post-Interview / Kickoff Readiness

**Goal**: If selected, we have nothing to scramble for between June 9 (kickoff) and the first weekly demo.

- NDA executed.
- SOW drafted: scope, milestones, success criteria, kill criterion, IP terms aligned to Shinhan's three-tier model.
- Joint working agreements: cadence, comms channels, decision-gate process, escalation tree.
- Onboarding pack for Shinhan-side team members: how to use the tool, how to review HITL items, how to read the audit log.
- Data delivery checklist: what masked data we need, what schema, what freshness.
- Infrastructure delivery checklist: what GPU, what network, what VPN access.
- Joint kickoff agenda + slide deck.
- Mid-term assessment template (Shinhan reviews us at week 6).
- Final assessment template (Demo Day prep starts week 9).
- Commercialisation playbook: from PoC success → MSA → first commercial SOW.

**Phase 13 deliverables**: kickoff packet, SOW template, working agreements, assessment templates, commercialisation playbook.

---

## Cross-cutting tracks (run in parallel from Phase 1)

- **Documentation**: every component has a README, every API has OpenAPI, every flow has a diagram. Treat docs as PRD-grade, not afterthought.
- **Security review cadence**: weekly threat-model touch-up, monthly internal pen-test sprint.
- **Brand consistency**: every surface conforms to Global Design System; no rogue colours, no rogue fonts.
- **Stakeholder comms**: weekly internal status to founder + delivery lead, even before kickoff.
- **Risk register**: top-10 risks tracked, owners, mitigations, status. Reviewed weekly.

---

## What "production-ready" specifically means here

You're not building a demo for a pitch competition. You're building the v0 of a system that, if Shinhan picks you, will be deployed inside a financial institution within 90 days, and if it works, inside three more within a year. Every shortcut you take now is a debt you pay down with interest during the PoC. Build the boring infrastructure (audit, eval, RBAC, HITL, observability, on-prem path, compliance dossier) before the flashy parts. The flashy parts take a week. The boring parts take the month — and they're the ones the Shinhan compliance team will care about, not the ones the BU sponsor will.
