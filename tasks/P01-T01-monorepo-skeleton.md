---
title: "Bootstrap monorepo skeleton (pnpm + Turborepo + TypeScript strict)"
author: "@cyberskill-eng"
department: engineering
status: in_progress
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: not_ai
target_release: "2026-05-08"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Bootstrap the `cyberskill-official/shinhan-innoboost-engine` monorepo with the eight workspaces required by the demo build (`engine`, `hitl`, `vibe`, `ui`, `eval`, `data`, `infra`, `compliance`) using pnpm workspaces, Turborepo for task orchestration, TypeScript 5.5 strict mode, ESLint 9 flat config, Prettier 3, Husky 9, conventional-commits enforcement, Renovate for dependency management, and CodeQL + Dependabot security scanning. The skeleton must be deployable to laptop / cloud / on-prem from commit #1 — meaning every workspace ships with a working container, a working unit test, and a working build target *before* any feature code lands. This is the foundation every Phase 2+ task depends on; a sloppy skeleton compounds into weeks of late-cycle reconciliation.

## Problem

The demo-build-plan.md commits to an explicit eight-workspace folder layout and to a "deployable to laptop / cloud / on-prem from commit #1" property. Without this skeleton in place from the start, the engineering squad cannot productively start Phase 2 work; every developer makes locally divergent choices about where files go, which build tool to use, how tests run, what TypeScript settings apply, what the import boundary between workspaces is.

Specific risks if we shortcut:

- **TypeScript-strict adoption later is dramatically more painful than upfront.** Retrofitting strict-mode to a non-strict codebase typically takes 2–4× the time of building strict from the start. Banking-grade software cannot tolerate runtime type surprises in production; strict-from-day-one is non-negotiable per CyberSkill engineering bar.
- **Conventional-commits enforcement applied retroactively means a PR cleanup sprint nobody wants.** Releasing notes generated from conventional commits is part of the Phase 1 CI/CD plan (P01-T02); broken commits = broken release notes.
- **Monorepo build-cache configuration is far cheaper to set up before any package depends on another.** Once cross-package dependencies form, restructuring the cache invalidation rules is a brittle exercise.
- **Container-from-day-one keeps the on-prem deployment path (P10-T03) honest.** If we ever skip a workspace's Dockerfile, we discover the gap during demo rehearsal — the worst possible time.
- **The `.npmrc` / `engines` setting prevents the "works on my machine but not in CI" class of bug.** Cheap to set up; expensive to debug without.

The `shinhanos_tech_stack` memory note locks Apollo Server 5 + Express + Postgres + pgvector + Module Federation MFE for the broader CyberSkill platform. The demo monorepo is *not* ShinhanOS — but ADR-SHB-001 (P00-T02) mandates portability constraints. The monorepo's tech choices must be ShinhanOS-compatible (no foot-guns that prevent later port). Specifically: package boundaries map cleanly to ShinhanOS modules; only MIT/Apache-licensed primitives (no GPL); CyberSkill-internal package naming convention follows `@cyberskill/*` namespace.

There is a downstream-reuse dimension: every Phase 1+ task lives in this monorepo. P01-T02 (CI/CD) extends `.github/workflows`; P01-T03 (secrets) configures Doppler/Vault from this repo; P01-T04 (IaC) lives in `infra/`; Phase 2 lives in `engine/`. A sloppy skeleton makes every downstream task worse. A precise skeleton makes every downstream task easier.

The Innoboost Q&A also signals that Shinhan reviewers will press on operational maturity (Section V.4 — "commercial readiness and market traction"). A real, well-structured monorepo is the cheapest signal of operational maturity we can give them when they look at the demo's source.

## Proposed Solution

A scaffolded monorepo at `cyberskill-official/shinhan-innoboost-engine` with all eight workspaces present, each shipping a "hello world" deliverable that exercises the full build / test / lint / typecheck / containerise / deploy pipeline. Tooling: pnpm 9.x, Turborepo 2.x, Node 20 LTS, TypeScript 5.5 strict, ESLint 9 flat config, Prettier 3, Husky 9, conventional-commits validator, Renovate, CodeQL, Dependabot, branch protection, signed commits, CODEOWNERS, README + CONTRIBUTING + PR template. Bootstrapped end-to-end within 3 days of task assignment.

### Subtasks

- [ ] **Create the GitHub repository.** Org `cyberskill-official` (per `cyberskill_company_facts`); name `shinhan-innoboost-engine`; visibility `private`; default branch `main`; description "Shinhan Global Innoboost 2026 — chat-with-data engine + HITL + vibe-coding kit (PoC)."
- [ ] **Configure repo-level features.** Enable Issues, Projects, Wikis off (we use Linear for issues and the docs/ folder for wikis). Enable Discussions off. Enable security advisories on. Enable Dependabot security updates on.
- [ ] **Configure branch protection on `main`.** Require PR (no direct push); require 2 reviewer approvals (or 1 for documentation-only PRs as defined in CODEOWNERS rules); require all status checks to pass; require branches to be up to date before merge; require signed commits; require linear history; restrict who can push to admins; do not allow force-pushes; do not allow deletions.
- [ ] **Initialise pnpm workspaces.** Root `package.json` with `private: true`, `engines: { node: ">=20.0.0", pnpm: ">=9.0.0" }`, common scripts (`build`, `test`, `lint`, `typecheck`, `dev`, `containerise`, `eval`). `pnpm-workspace.yaml` listing all 8 workspaces. `.npmrc` pinning Node 20 LTS and configuring strict-peer-dependencies, hoisting boundaries, and the internal CyberSkill registry.
- [ ] **Add Turborepo `turbo.json`.** Pipeline tasks: `build` (depends on dependencies' `build`); `test` (depends on `build`); `lint`; `typecheck`; `dev` (no caching); `containerise` (depends on `build`); `eval` (depends on `build` for engine + eval workspaces); `clean`. Configure remote caching to a CyberSkill-internal Turbo Remote Cache (Vercel-hosted or self-hosted on Cloudflare R2).
- [ ] **Create eight workspaces with skeleton files.** Each workspace has:
  - `package.json` with scoped name `@cyberskill/shinhan-{workspace}`, `version: 0.0.1`, `private: true`, scripts that match the root pipeline.
  - `tsconfig.json` extending root `tsconfig.base.json`.
  - `src/index.ts` with a hello-world export.
  - `src/index.test.ts` with at least one passing smoke test (using vitest as the test runner).
  - `Dockerfile` (multi-stage, distroless base — `gcr.io/distroless/nodejs20-debian12:nonroot`).
  - `README.md` describing the workspace's purpose, surface, and entry points.
  - `.eslintrc.cjs` extending root.
  - The eight workspaces: `engine/`, `hitl/`, `vibe/`, `ui/`, `eval/`, `data/`, `infra/`, `compliance/`.
- [ ] **Author root `tsconfig.base.json`.** Compiler options: `target: "ES2022"`, `module: "ESNext"`, `moduleResolution: "bundler"`, `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`, `exactOptionalPropertyTypes: true`, `isolatedModules: true`, `verbatimModuleSyntax: true`, `noFallthroughCasesInSwitch: true`, `noPropertyAccessFromIndexSignature: true`, `forceConsistentCasingInFileNames: true`, `incremental: true`, `composite: true`, `skipLibCheck: true`. Disallow `any`; require `@ts-expect-error` with reasoning instead of `@ts-ignore`.
- [ ] **Author root ESLint flat config.** Extend `@typescript-eslint/recommended-type-checked`, `eslint-plugin-import` (with project-aware resolution), `eslint-plugin-unicorn` (relaxed rules for project preferences), `eslint-plugin-security`, `eslint-plugin-vitest`. Custom rules to error: `no-floating-promises`, `no-misused-promises`, `no-explicit-any`, `prefer-readonly`, `no-unused-vars` (with `_`-prefix exception), `consistent-type-imports`. Custom rules to warn: `prefer-const`, `no-console` (allowing `error`).
- [ ] **Configure Prettier.** Root `.prettierrc.json` with `singleQuote: true`, `tabWidth: 2`, `printWidth: 100`, `trailingComma: "all"`, `arrowParens: "always"`, `bracketSpacing: true`, `endOfLine: "lf"`. Configure `.prettierignore` to skip generated files, `node_modules`, `.next`, `dist`.
- [ ] **Configure Husky pre-commit.** Use Husky 9 with the modern `.husky/_/` shim. Hooks: `pre-commit` runs `lint-staged` (eslint --fix + prettier --write on staged files); `commit-msg` runs the conventional-commits validator (`@commitlint/cli` + `@commitlint/config-conventional`); `pre-push` runs `pnpm turbo run typecheck`.
- [ ] **Configure Renovate.** Root `renovate.json` with: schedule `["after 9am and before 5pm every weekday"]`; security updates auto-merge; patch-level dev-dep updates auto-merge; minor and major updates require human review; group all linting/formatting tools together; group all TypeScript tooling together; rate limit to 5 PRs/hour.
- [ ] **Enable CodeQL.** GitHub Advanced Security CodeQL workflow at `.github/workflows/codeql.yml` running on push, pull_request, and weekly. Languages: TypeScript, JavaScript.
- [ ] **Enable Dependabot.** `.github/dependabot.yml` for npm + GitHub-Actions ecosystems; weekly; auto-assign to engineering tech lead.
- [ ] **Configure CODEOWNERS.** `.github/CODEOWNERS` mapping each workspace to the relevant squad: `engine/` → `@engine-squad`; `hitl/` → `@engine-squad @design-squad`; `ui/` → `@design-squad @engine-squad`; `infra/` → `@platform-squad`; `compliance/` → `@compliance-lead`; etc. Documentation-only paths (`docs/**`, `*.md`) → `@pm`.
- [ ] **Author root `README.md`.** Sections: project name and one-line purpose; the eight workspaces and their roles; the Turborepo task graph; the deployment targets (laptop / cloud / on-prem); links to the ADRs from P00-T02; quickstart for new joiners; reference to `tasks/INDEX.md` for the full plan.
- [ ] **Author root `CONTRIBUTING.md`.** Sections: commit conventions (link to commitlint config); branch naming (`{type}/{ticket-id}-{slug}`, e.g. `feat/P02-T01-metric-layer`); PR template fields; review etiquette; how to add a new workspace; how to bump versions.
- [ ] **Author PR template.** `.github/pull_request_template.md` with prompts: Linked task ID; what does this change; tests added or N/A; docs updated or N/A; eval-harness impact (none / regression-checked / blessed); compliance impact (none / Phase 8 controls touched); breaking change (yes / no).
- [ ] **First end-to-end smoke.** From a clean clone: `pnpm install` succeeds; `pnpm turbo run build test lint typecheck` runs green; `pnpm turbo run containerise` produces a Docker image for each workspace; the Docker images can be `docker run --rm` and exit cleanly. CI pipeline (set up in P01-T02) reproduces all of this.

### Acceptance criteria

- Repository created with all 8 workspaces present; each workspace has build / test / lint / typecheck / containerise targets that all pass on a clean clone.
- TypeScript strict mode is on; no `any`; no `@ts-ignore`; verified by grep across the codebase.
- Husky + conventional-commits + lint-staged operational; verified by attempting a non-conventional commit (should fail).
- Renovate is active and has produced its first dependency-update PR within 7 days.
- CodeQL + Dependabot are active and visible in the GitHub Security tab.
- Branch protection is enforced; verified by attempting direct push to `main` (should fail).
- CODEOWNERS, README, CONTRIBUTING, PR template are all in place and reviewed.
- First green CI run on `main` recorded.

## Alternatives Considered

- **Multi-repo (one repo per workspace).** Rejected: cross-workspace refactors become painful, dependency-version drift increases, demo build becomes harder to atomic-deploy. Monorepo is the right call for this scope and timeline.
- **Nx instead of Turborepo.** Rejected: Turborepo is lighter weight, integrates more cleanly with pnpm workspaces, and the team has prior production experience with it. Nx's heavier opinions add overhead the demo timeline cannot absorb.
- **Yarn Berry instead of pnpm.** Rejected: pnpm's strict node-modules layout catches dependency leaks earlier (a property we want for compliance evidence); pnpm-workspace is our existing standard.
- **Loose TypeScript (no strict).** Rejected: banking-grade software cannot tolerate runtime type surprises; strict-from-day-one is non-negotiable. Adding strict later is dramatically more expensive.
- **Use Bun instead of Node.** Rejected: Bun is impressive but its production-readiness for our specific stack (Apollo Server 5, vLLM clients, etc.) is not yet verified; demo timeline cannot absorb a Bun-related debug spiral.
- **Use Yarn classic (1.x).** Rejected: actively unmaintained; Yarn Berry or pnpm are the choices; pnpm wins per above.
- **Skip the skeleton; let engineers create files as they go.** Rejected: see "Problem" — divergence guaranteed.
- **Skip the eight-workspace structure; use one big workspace.** Rejected: eight is the right number for this build's clarity, parallelism, and post-PoC port to ShinhanOS modules.

## Success Metrics

- **Primary**: First green CI run on `main` within 3 days of this task being assigned. Measured by: GitHub Actions workflow run status.
- **Guardrail**: Subsequent CI runs on the same skeleton (no feature changes) are green ≥ 99% of the time over the next 30 days; flaky-test rate < 1%. Measured by: GitHub Actions failure rate filtered to "skeleton-only" PRs (no feature code).

## Scope

### In scope
- Eight workspaces with hello-world content and full toolchain (build / test / lint / typecheck / containerise).
- Branch protection, security scanning (CodeQL + Dependabot), Renovate.
- Distroless Dockerfile per workspace; basic Helm chart stub per workspace (full Helm in P01-T04).
- CODEOWNERS, README, CONTRIBUTING, PR template.
- Conventional-commits + Husky + lint-staged enforcement.
- Internal Turborepo remote cache configuration.

### Out of scope
- Feature implementation in any workspace (handled by Phase 2+ tasks).
- Production-shape Helm charts (handled by P01-T04).
- CI/CD pipeline workflows beyond CodeQL (handled by P01-T02).
- Secrets management (handled by P01-T03).
- Auth service (handled by P01-T06).

## Dependencies

- **Upstream**: ADR-SHB-001 (P00-T02) ratified — host-platform decision must be locked.
- **People**: lead engineer authoring the scaffold; one platform engineer for Helm stubs and the distroless Dockerfile pattern; founder for repo-creation approval (since `cyberskill-official` org access is restricted).
- **External**: GitHub org `cyberskill-official` (per `cyberskill_company_facts`); npm registry for internal packages; Turborepo Remote Cache (Vercel or self-hosted Cloudflare R2 — pick during this task, document in README).
- **Memory references**: `cyberskill_company_facts`, `shinhanos_tech_stack`, `shinhanos_id_conventions` (for module naming compatibility with ShinhanOS).

## Open Questions

- Q1: Turborepo Remote Cache — Vercel-hosted (free up to a usage limit) or self-hosted on Cloudflare R2 (cheaper at scale, more setup)? Recommendation: Vercel for the demo phase (saves setup time; usage will be modest); migrate to self-hosted for production track if scale warrants.
- Q2: Use of changesets vs. semantic-release vs. simple version-bumps? Recommendation: changesets for the demo phase (each workspace has its own version; changesets handles the multi-package release flow well).
- Q3: Should the `infra/` workspace be a real workspace or just a folder? Recommendation: folder (it doesn't ship JS code; Terraform + Helm only). Alternative: keep as a workspace for consistency. Pick the folder option to reduce noise.
- Q4: Should the `compliance/` workspace ship runtime code (e.g., a compliance-rule engine) or just docs? Recommendation: both — it ships the runtime PDPL/sensitivity-tier classifier (used by P02-T07) plus the human-readable compliance dossiers (Phase 8).
- Q5: Should we enforce import boundaries between workspaces (e.g., `engine` cannot import from `ui`)? Recommendation: yes, via `@nx/eslint-plugin-nx`'s import-boundary rules or a custom ESLint rule. Locks in clean architecture.

## Implementation Notes

- The distroless base image (`gcr.io/distroless/nodejs20-debian12:nonroot`) ships with no shell. This is good for security (smaller attack surface; no `sh` for an attacker to abuse). It does mean debugging a container by `docker exec -it ... bash` doesn't work. Use the `:debug` variant for local dev, distroless for production.
- TypeScript `composite: true` enables project references, which speeds up rebuilds significantly. Pair with `tsc --build`. Turborepo handles the orchestration.
- For ESLint flat config, the migration story away from legacy `.eslintrc` is now stable; use flat config from the start.
- For commitlint, choose `@commitlint/config-conventional` plus a custom plugin that requires the commit subject to begin with the linked Linear ticket ID (e.g., `feat(P02-T01): bootstrap metric registry`). This forces traceability from commit → ticket → FR.
- For PR template, the "eval-harness impact" prompt is the most consequential — every change to engine code should explicitly state whether it touched eval-relevant behaviour. This is the structural enforcement of Phase 4's "eval is the spine" principle.
- For the Turborepo cache, the cache key includes the workspace name, the file hashes, and the lockfile hash. A lockfile change invalidates everything; a file change invalidates only the affected workspace and its dependents.

## Test Plan

- Test 1: Clean clone + `pnpm install` + `pnpm turbo run build test lint typecheck` — all pass.
- Test 2: Attempt a direct push to `main` from a non-admin account — should be rejected by branch protection.
- Test 3: Open a PR with a non-conventional commit — Husky `commit-msg` hook should fail locally; if bypassed, `pr-check.yml` (P01-T02) should fail in CI.
- Test 4: Add `any` to a TypeScript file in `engine/` — ESLint should error.
- Test 5: Containerise each workspace; verify each Docker image runs and exits cleanly.
- Test 6: Renovate produces its first PR within 7 days; the PR is auto-merged if dev-dep patch.
- Test 7: CodeQL produces no Critical or High findings on the skeleton.

## Rollback Plan

- The skeleton is configuration; rollback equals revert. Each setting-change is its own PR with revertibility.
- If a tool choice proves wrong (e.g., Turborepo unsuited for our scale), the migration target is Nx; mechanical migration via codemod.
- If CI proves prohibitively slow, optimise (parallel jobs; smarter cache keys); only migrate to a different CI platform if optimisations exhaust their value.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Repository | `cyberskill-official/shinhan-innoboost-engine` | Lead engineer | Indefinite |
| First commit hash on `main` | Tagged `skeleton-v0.0.1` | Lead engineer | Indefinite |
| README, CONTRIBUTING, CODEOWNERS, PR template | Repo root | Lead engineer | Continuous |
| ADR cross-references | In each workspace's README | Lead engineer | Continuous |
| First green CI run record | GitHub Actions history | Lead engineer | Per GitHub retention |
| Branch-protection settings export | `.github/settings/branch-protection.yml` (Settings as code, optional) | Lead engineer | Continuous |

## Operational Risks

- **GitHub org `cyberskill-official` restricted access blocks repo creation.** Mitigation: founder pre-approves; ops lead has admin access for backup.
- **Turborepo Remote Cache outage.** Mitigation: cache miss falls back to local rebuild; build is slower but correct. Keep the Vercel-hosted cache as primary, self-host as future-state.
- **Renovate flood (too many PRs at once).** Mitigation: rate-limit configured; group rules in `renovate.json`.
- **Dependabot vulnerability that requires immediate patch but breaks our build.** Mitigation: Dependabot PR runs full CI; we have visibility before merge; if patch breaks, we pin to the secure version manually.
- **CodeQL false-positive flood.** Mitigation: triage on first run; suppress with documented justifications; never blanket-disable a rule.

## Definition of Done

- Repository in place with 8 workspaces and full toolchain.
- Branch protection, security scans, Renovate active.
- First green CI run recorded.
- All four root docs (README, CONTRIBUTING, CODEOWNERS, PR template) in place.
- Container image for each workspace builds and runs.
- ADR cross-references present in each workspace README.
- This FR's ticket marked Done in tracker with links to artefacts.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections of this FR.
- **Human review**: lead engineer reviews the actual scaffold; platform engineer reviews Helm stubs and Dockerfile pattern; `@stephen-cheng` ratifies repo creation.
