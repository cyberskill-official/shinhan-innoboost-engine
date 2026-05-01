---
title: "Build reviewer-feedback → gold-set candidacy loop"
author: "@cyberskill-engine-tech-lead"
department: engineering
status: draft
priority: p1
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: internal_tooling
eu_ai_act_risk_class: minimal
target_release: "2026-07-17"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build the loop that turns HITL reviewer rejections (P06-T02) into gold-set candidates (P04-T01) and prompt-improvement queue (P02-T02). Every reviewer rejection records: what the engine produced; what the reviewer corrected; the reason. The loop deduplicates patterns; surfaces high-frequency rejection patterns to engine tech lead for prompt or metric tuning; promotes well-formed corrections to gold-set additions for the next gold-set version. The loop is what makes the engine improve over time without manual archaeology.

## Problem

Without a feedback loop, reviewer corrections are ephemeral — useful for the immediate question, lost for the next. The gold-set (P04-T01) decays in coverage as production reveals new questions. Without the loop, the engine doesn't get better between releases.

Specific gaps if we shortcut:

- **Without rejection capture, learning from production is impossible.**
- **Without deduplication, the prompt-improvement queue is noise.**
- **Without gold-set promotion, the gold-set doesn't grow with usage.**

The `feedback_p1_scope_preference` memory note biases us richer. For the loop, "richer" means: rejection capture + deduplication + prompt-improvement queue + gold-set candidacy + admin-mediated promotion + observability of loop health.

## Proposed Solution

A loop in `engine/feedback/` that consumes HITL rejections, dedups, surfaces, and promotes:

1. **Capture.** Every reviewer rejection (HITL action: reject; HITL action: edit-and-approve) records to a "feedback events" table.
2. **Deduplication.** Cluster events by question similarity (semantic) + rejection reason; surface clusters with > 3 occurrences.
3. **Prompt-improvement queue.** Engine tech lead reviews clusters; either tunes the prompt, updates a metric, or creates a gold-set entry.
4. **Gold-set candidacy.** Reviewer-edit-approved entries that re-pass the engine after prompt tuning are candidates for the gold-set.
5. **Admin-mediated promotion.** Eng-data approves gold-set additions; promotion happens at gold-set version bumps.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Implement capture mechanism.** P06-T02 (reviewer console) writes to `feedback_events` table on every reject / edit. Fields: question, engine_output, reviewer_correction, reason, occurred_at, reviewer_id.
- [ ] **Implement deduplication.** Nightly job: cluster events by question-embedding similarity > 0.85 + reason-similarity; surface clusters with ≥ 3 occurrences.
- [ ] **Implement prompt-improvement queue.** Admin UI surface in P05-T05: clusters listed; each cluster has: representative question, count, reasons, sample engine outputs, sample reviewer corrections, suggested action (tune prompt, update metric, add to gold-set).
- [ ] **Implement gold-set candidacy.** When a cluster is resolved with a prompt tune that passes the cluster's questions, the cluster becomes a gold-set candidate.
- [ ] **Implement admin-mediated promotion.** Eng-data reviews candidates; approved candidates added to next gold-set version.
- [ ] **Implement observability.** Per-week metrics: feedback events captured; clusters surfaced; prompts tuned; gold-set additions.

### Acceptance criteria

- Capture, deduplication, queue, candidacy, promotion all in place.
- First end-to-end loop verified on a sample feedback event.
- Observability flowing.

## Alternatives Considered

- **Skip the loop; manual review of HITL rejections.** Rejected: doesn't scale; corrections lost.
- **Auto-promote candidates without admin review.** Rejected: gold-set quality requires human review.

## Success Metrics

- **Primary**: First feedback-driven prompt tune deployed within 14 days of HITL queue going live.
- **Guardrail**: Gold-set grows by ≥ 10% per quarter.

## Scope

### In scope
- Capture, dedup, queue, candidacy, promotion.
- Observability.

### Out of scope
- HITL queue itself (P06).
- Gold-set authoring (P04-T01).

## Dependencies

- **Upstream**: P06-T02 (HITL console writes events); P04-T01 (gold-set); P04-T03 (eval harness).
- **People**: engine tech lead authoring; eng-data reviewing candidates.

## Open Questions

- Q1: Cluster threshold — 3 occurrences is the floor; tune later? Recommendation: yes.
- Q2: Promotion cadence — every gold-set version (semver-major) or continuous? Recommendation: at version bumps (predictable releases).

## Implementation Notes

- Embedding for question clustering uses the same model as the retriever (P02-T02).
- Reasons are free-text; deduplicate via short-text similarity.
- Gold-set additions go through P04-T01's authorship workflow.

## Test Plan

- Test 1: Sample 10 events; cluster forms; surfaces correctly.
- Test 2: Resolved cluster promotes to candidate; candidate is reviewable in admin UI.
- Test 3: Approved candidate appears in next gold-set version.

## Rollback Plan

- Bad cluster surfacing rolled back via revert.
- Bad candidate promotion rolled back via gold-set version revert.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Feedback events table | Postgres | Engine tech lead | 7 years |
| Cluster surface | Admin UI (P05-T05) | Eng-data | Continuous |
| Promotion log | `eval/gold-set/PROMOTION_LOG.md` | Eng-data | Continuous |
| Loop metrics | Central observability store | Engine tech lead | Continuous |

## Operational Risks

- **Reviewer-correction quality varies.** Mitigation: only edit-and-approve corrections become candidates; reject-only events surface as patterns but don't directly become gold-set entries.
- **Cluster noise.** Mitigation: 3+ occurrence threshold; eng-data review.

## Definition of Done

- Loop in place; first cycle completed.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Loop consumes reviewer corrections; corrections may contain user-original question text plus reviewer edits. Personal data appears only insofar as user questions reference data subjects; treat per P02-T07 PDPL rules.

### Human Oversight
Eng-data reviews every candidate; admin promotes; nothing auto-promotes.

### Failure Modes
- Bad cluster forms: noise surfaces; eng-data filters.
- Promoted candidate is wrong: revert at next version bump.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: engine tech lead authors; eng-data reviews promotion.
