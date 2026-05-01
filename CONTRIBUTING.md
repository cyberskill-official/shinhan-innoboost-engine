# Contributing

## Branch naming

`{type}/{ticket-id}-{slug}` where `type` is one of `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.

Examples:
- `feat/P02-T01-metric-registry`
- `fix/P06-T02-hitl-inbox-pagination`
- `docs/P11-T04-dossier-index`

## Commit conventions

[Conventional Commits](https://www.conventionalcommits.org/) enforced via `commitlint` + Husky `commit-msg` hook.

Format:
```
{type}({ticket-id}): subject

body (optional)

footer (optional, breaking changes)
```

Example:
```
feat(P02-T01): bootstrap metric registry with pgvector

Implements the semantic metric layer per P02-T01. Registry stores YAML-defined
metrics in Postgres; embeddings via OpenAI text-embedding-3-large.

Refs: P02-T01
```

## Pull request requirements

Every PR must:

- Reference a linked Task ID in the description (e.g., `Refs: P02-T01`).
- Pass the full PR-check pipeline (lint + typecheck + test + container build + scans).
- Have at least 2 reviewer approvals (1 for documentation-only PRs).
- Update relevant ADR cross-references when architecture changes.
- Update relevant runbook cross-references when operational behaviour changes.
- Update the eval-harness gold-set when engine behaviour changes (or explicitly note no impact).
- State compliance impact (none / Phase 8 controls touched).

## Review etiquette

- Trust the reviewer; if they ask why, explain.
- Disagreement is fine; resolution is required before merge.
- Approving without reading is grounds for losing approval rights.
- Founder + tech lead can break ties.

## Adding a new workspace

Discouraged; the eight-workspace structure is ratified in ADR-SHB-001. If you need a new workspace:

1. Open an ADR proposing the change.
2. Get founder + tech-lead ratification.
3. Update `pnpm-workspace.yaml`, `eslint.config.js` boundary rules, CODEOWNERS, README.

## Versioning

Workspace versions are managed by [Changesets](https://github.com/changesets/changesets). Each workspace has its own version; releases are tagged `{workspace}-v{x.y.z}`.

## Authorship guidance for AI-assisted contributions

This project encourages AI-assisted authorship. When using Claude / Cursor / similar:

- Set `ai_authorship` in any FR document accurately.
- Disclose tools + scope + human review per the `feature_request@1` template.
- Never commit AI-generated code without human review.
- Never delegate architectural decisions to AI; ratify in ADRs.

## Security disclosure

Found a vulnerability? Email `security@cyberskill.world` (NOT a public issue). Per P08-T08 incident-response runbook, disclosures handled within 72 hours.
