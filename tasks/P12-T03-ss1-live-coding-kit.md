---
title: "Assemble SS1 live-coding kit (clipboard prompts, recorded fallback)"
author: "@cyberskill-eng"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: user_facing
eu_ai_act_risk_class: minimal
target_release: "2026-09-25"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Assemble the SS1 live-coding kit for interview-day execution: founder's laptop pre-staged with all three live-build scenarios (P07-T02); Claude Code session pre-initialised with project memory; clipboard pre-loaded with three scenario seed prompts; recorded fallback video for each scenario at hand; backup laptop with identical config; mobile hotspot tested with VN SIM; Claude Code authenticated and rate-limit-checked. The kit is the operational equivalent of the "broken glass" emergency kit — everything in place so the founder walks in cool, not scrambling.

## Problem

Interview-day surprises kill demos. The kit eliminates as many surprises as possible.

Specific gaps if we shortcut:

- **Without pre-staged scenarios, the live-build wastes 2 minutes on setup.**
- **Without pre-loaded clipboard, founder fumbles.**
- **Without backup laptop, single-point-of-failure.**
- **Without VN-tested hotspot, conference Wi-Fi takes the demo.**
- **Without Claude Code rate-limit check, a mid-demo rate-limit kills momentum.**

The `feedback_p1_scope_preference` memory note biases us richer. For the kit, "richer" means: pre-staged + clipboard + backup laptop + hotspot + auth-checked + rehearsed + transport-tested.

## Proposed Solution

A live-coding kit document at `rehearsals/ss1-live-coding-kit.md` plus the physical kit:

1. **Pre-staged primary laptop** with vibe-coding starter kit (P07-T01) cloned + 3 scenarios (P07-T02) pre-staged in `scenarios/`.
2. **Claude Code initialised** with project memory; tested with sample prompt; auth verified; rate-limit headroom checked.
3. **Clipboard pre-loaded** with three scenario seed prompts (founder hits Cmd-V to start).
4. **Recorded fallback videos** on the laptop's local disk; on a USB-C drive; on iCloud; redundant.
5. **Backup laptop** with identical config; powered + tested.
6. **Mobile hotspot** with VN SIM; tested for ≥ 100 Mbps download.
7. **Power adapters + cables**; printed run-of-show.

Setup target: 7 days from task assignment.

### Subtasks

- [ ] **Pre-stage primary laptop.** All scenarios cloned; verified each runs from clean state.
- [ ] **Initialise Claude Code session.** Project memory loaded; sample prompt tested; rate-limit headroom verified.
- [ ] **Pre-load clipboard.** Founder writes a small clipboard utility; three prompts cycle on hotkey.
- [ ] **Record fallback videos.** Per P07-T02; high quality; bilingual subtitles; tested.
- [ ] **Configure backup laptop.** Identical config; tested; auth set; clipboard loaded.
- [ ] **Test mobile hotspot.** VN SIM; conference-network simulation; ≥ 100 Mbps verified.
- [ ] **Pack kit.** Printed run-of-show; cables; adapters; iPad; spare batteries.
- [ ] **Pre-flight checklist.** Day-of-interview run-through.

### Acceptance criteria

- Primary laptop pre-staged + verified.
- Claude Code session ready.
- Clipboard loaded.
- Fallback videos accessible 3 ways.
- Backup laptop ready.
- Hotspot tested.
- Kit packed; pre-flight checklist documented.

## Alternatives Considered

- **Single laptop, no backup.** Rejected: single point of failure.
- **Cloud-only Claude Code.** Rejected: laptop fallback (P10-T01) requires local LLM option.
- **Skip mobile hotspot.** Rejected: conference Wi-Fi is unreliable.

## Success Metrics

- **Primary**: Kit complete within 7 days.
- **Guardrail**: Day-of pre-flight checklist passes.

## Scope

### In scope
- Pre-staged laptops + Claude Code session + clipboard + fallback videos + hotspot + checklist + run-of-show.

### Out of scope
- Decks (P12-T01).
- Run-of-show authoring (P12-T02).
- FAQ (P12-T04).
- Dry-runs (P12-T05).

## Dependencies

- **Upstream**: P07-T01 (starter kit); P07-T02 (scenarios); P12-T02 (run-of-show).
- **Downstream**: P12-T05 (dry-runs).
- **People**: engineer authoring; founder rehearsing; ops lead managing logistics.

## Open Questions

- Q1: Mobile hotspot carrier — Viettel? Recommendation: Viettel for coverage; backup MobiFone SIM.
- Q2: Backup laptop role on day-of — present or off-stage? Recommendation: off-stage; ready for hot swap.
- Q3: Claude Code rate-limit headroom — what's the budget? Recommendation: pre-staged session; Anthropic API key with elevated rate-limit (P00-T05 procurement).

## Implementation Notes

- Backup laptop is pre-staged identically; weekly sync with primary.
- Clipboard utility is a small shell script with hotkey trigger.
- Fallback videos in 3 locations: primary laptop disk; USB-C drive; iCloud (cloud fallback).
- Pre-flight checklist printed and digital.

## Test Plan

- Test 1: Primary laptop scenarios run from cold.
- Test 2: Claude Code rate-limit check.
- Test 3: Backup laptop hot-swap rehearsed.
- Test 4: Hotspot ≥ 100 Mbps in a conference-room simulation.
- Test 5: Pre-flight checklist walked through.

## Rollback Plan

- Primary laptop fail → swap to backup.
- Both laptops fail → use Shinhan-provided machine + walk through fallback videos.
- All fallback options fail → graceful demo degradation; sales lead handles Q&A.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Live-coding kit doc | `rehearsals/ss1-live-coding-kit.md` | Engineer | Until program end |
| Pre-flight checklist | `rehearsals/ss1-preflight.md` | Engineer + founder | Until program end |
| Kit-readiness log | `docs/audit/ss1-kit-readiness/{date}.md` | Founder | Until program end |

## Operational Risks

- **Both laptops fail.** Mitigation: walk through fallback videos on Shinhan-provided machine.
- **Claude Code rate-limit during demo.** Mitigation: pre-staged session reduces token use; fallback to recorded video.
- **Hotspot dies.** Mitigation: conference Wi-Fi as secondary; offline laptop deploy as tertiary.

## Definition of Done

- Kit complete; pre-flight checklist tested; backup laptop ready.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
Live-coding kit operates on synthetic Securities dataset (P03-T03); no customer data.

### Human Oversight
Founder is the human-in-the-loop during the live build.

### Failure Modes
- Live-build code error: founder corrects; if unrecoverable, switch to fallback.
- Claude API rate-limit: switch to recorded fallback.
- All fallbacks fail: graceful pivot.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR); during live-build interview, Claude Code (Anthropic).
- **Scope**: Claude drafted all sections.
- **Human review**: engineer authors kit; founder rehearses; ops lead manages logistics.
