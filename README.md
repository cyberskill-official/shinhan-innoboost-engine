# Shinhan Innoboost 2026 — Engine Scaffold

> Turn Your Will Into Real.

This is the project scaffold for the Shinhan Global Innoboost 2026 demo build. It implements the structure ratified across 80 feature requests in [`tasks/`](tasks/) — every directory here corresponds to one or more FRs, and every FR cross-references the directories that ship its outputs.

## Quickstart

```bash
# Prerequisites: Node 20 LTS, pnpm 9.x, Docker Desktop 4.x
pnpm install
pnpm turbo run build test lint typecheck

# Laptop demo (per P10-T01)
cd infra/laptop && docker compose up
```

## Directory map

| Folder | Purpose | Anchor FR |
|---|---|---|
| `engine/` | Chat-with-data core: NL→SQL, policy, citation, confidence, audit | P02-T01..T09 |
| `hitl/` | Human-in-the-loop reviewer queue (the SB5 wedge) | P06-T01..T05 |
| `ui/` | Next.js chat surface + admin console | P05-T01..T05 |
| `eval/` | Gold-set, adversarial corpus, metrics framework, harness CLI | P04-T01..T05 |
| `data/` | Synthetic dataset generators (SVFC / Bank / Securities) | P03-T01..T04 |
| `infra/` | Terraform + Helm + laptop / cloud / on-prem deployment targets | P01-T04, P10-T01..T04 |
| `compliance/` | PDPL / Cybersecurity Law / SBV / ISO 27001 / ISO 42001 / SOC 2 dossiers | P08-T01..T08 |
| `docs/` | ADRs, runbooks, observability docs, integration docs | Cross-cutting |
| `references/` | Reference one-pagers, AI Doctrine excerpts, diagrams, team bios | P11-T01..T06 |
| `decks/` | Per-BU pitch decks (SF9 / SB5 / SS1) | P12-T01 |
| `rehearsals/` | Demo run-of-show, recordings, SS1 live-coding kit | P12-T02..T05 |
| `legal/` | NDAs, sponsor consent riders, clearances (gitignored content) | P00-T01, P00-T04 |
| `packages/faker-vn/` | Vietnamese-realistic synthetic data generator | P03-T04 |

## Workspace boundaries

Eight pnpm workspaces, each independently buildable / testable / containerisable:

- `engine/` — TypeScript service; consumes the metric registry, runs NL→SQL, exposes gRPC + REST.
- `hitl/` — TypeScript service; reviewer queue + triage + notifications.
- `ui/` — Next.js 15 / React 19 application; consumes brand-surface package.
- `eval/` — TypeScript CLI + library; runs gold-set, adversarial, metrics.
- `data/` — TypeScript generators; produces SQL or Parquet for the synthetic datasets.
- `infra/` — Terraform + Helm + scripts (no JS code).
- `compliance/` — Markdown dossiers + scaffolds (no JS code).
- `packages/faker-vn/` — published TypeScript library.

Cross-workspace import boundaries are enforced by ESLint `eslint-plugin-import` rules; engine cannot import from ui, etc.

## Status

Scaffold v0.0.1 — directory structure + placeholder content.
First green CI: pending P01-T02 implementation.
First metric registered: pending P02-T01 + P03-T01.

## Key documents

- [`demo-build-plan.md`](emo-build-plan.md) — the 14-phase build plan
- [`tasks/INDEX.md`](tasks/INDEX.md) — master task list (when authored)
- [`docs/adr/shinhan-innoboost/`](docs/adr/shinhan-innoboost/) — architecture decisions (P00-T02)
- [`compliance/DOSSIER.md`](compliance/DOSSIER.md) — compliance dossier index (P11-T04)

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Conventional commits enforced; PRs require linked Task ID; CI gates on lint + typecheck + test + eval-harness regression.

## Licence

Private. CyberSkill internal. Distribution outside the squad requires founder approval.
