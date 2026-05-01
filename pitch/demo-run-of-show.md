# Demo Run-of-Show Plans
## P12-T02 — Per BU, with Failure Plans

---

## General Setup

### Equipment Checklist

| Item | Primary | Backup | Status |
|---|---|---|---|
| Laptop | MacBook Pro M3, 16GB | MacBook Air M2, 16GB | ⬜ |
| Display | HDMI adapter + cable | Screen share (Zoom/Teams) | ⬜ |
| Internet | Venue Wi-Fi | Mobile hotspot (4G) | ⬜ |
| Browser | Chrome (incognito) | Firefox (incognito) | ⬜ |
| iPad | Presentation notes | Timer display | ⬜ |
| Stack | Cloud (primary) | Laptop docker-compose (fallback) | ⬜ |
| Recordings | All 3 scenarios pre-recorded | USB drive + cloud link | ⬜ |

### Pre-Demo Checklist (15 min before)

- [ ] Cloud stack verified (all services healthy)
- [ ] Local stack tested (`docker compose up` → all green)
- [ ] Pre-seeded data loaded and verified
- [ ] Demo users logged in (keep sessions warm)
- [ ] Recorded fallbacks tested on backup laptop
- [ ] Mobile hotspot connected and verified
- [ ] Browser history/bookmarks cleared
- [ ] Notifications silenced on all devices
- [ ] Timer app ready (iPad)
- [ ] Water on table

---

## Run-of-Show A — SVFC (SF9)

**Total time**: 15 minutes  
**Speakers**: Stephen (tech), PM (business)

| Time | Duration | Activity | Speaker | Screen | Notes |
|---|---|---|---|---|---|
| 0:00 | 1 min | Opening: "The problem in your own words" | PM | Slide 1 | Quote from SVFC brief |
| 1:00 | 0:30 | Solution one-liner | PM | Slide 2 | "Ask → Verify → Answer" |
| 1:30 | 5:00 | **Live Demo** | Stephen | Browser | See demo script below |
| 6:30 | 1:00 | Architecture overview | Stephen | Slide 4 | Point at diagram, don't read it |
| 7:30 | 2:00 | Governance deep-dive | PM | Slide 5 | HITL, audit, compliance |
| 9:30 | 1:00 | References | PM | Slide 6 | "You can call them" |
| 10:30 | 1:30 | PoC plan + kill criteria | PM | Slide 7 | "We'd rather kill early than waste your time" |
| 12:00 | 0:30 | Commercial path | PM | Slide 8 | Light touch, "details in SOW" |
| 12:30 | 0:30 | Team | Stephen | Slide 9 | "Founder-led, full commitment" |
| 13:00 | 0:30 | What we need | PM | Slide 10 | Specific asks |
| 13:30 | 1:30 | Q&A | Both | Any slide | Refer to FAQ doc |

### SVFC Demo Script (5 min)

```
[0:00 - 0:30] SETUP
Stephen: "I'm logged in as Nguyễn Thị Mai, a loan officer at SVFC."
→ Show: SVFC dashboard, Vietnamese UI, slate theme

[0:30 - 1:30] SCENE 1: Simple query (auto-served)
Stephen: "Mai wants to know the NPL ratio by province."
→ Type: "Tỷ lệ nợ xấu theo tỉnh quý 1"
→ Show: SQL generation → execution → chart + table
→ Point out: citation ("Source: loan_portfolio, updated 2h ago")
→ Point out: confidence badge (89% → auto-served)

[1:30 - 3:00] SCENE 2: Sensitive query (HITL routed)
Stephen: "Now she asks about individual customer credit scores."
→ Type: "Khách hàng có điểm tín dụng dưới 500"
→ Show: sensitivity detected (RESTRICTED) → routed to HITL
→ Switch tab: HITL reviewer console
→ Show: reviewer sees the query, checks SQL, approves
→ Switch back: results appear with reviewer badge

[3:00 - 4:30] SCENE 3: Multi-step query
Stephen: "Compare quarter-over-quarter for a specific branch."
→ Type: "So sánh quý này với quý trước cho chi nhánh HCM"
→ Show: multi-step SQL → time-series chart → dual citation

[4:30 - 5:00] WRAP
Stephen: "That's the core experience. Questions in Vietnamese,
verified answers with audit trails, in seconds."
```

---

## Run-of-Show B — Bank HO (SB5)

| Time | Duration | Activity | Difference from SVFC |
|---|---|---|---|
| 1:30 | 5:00 | Live Demo | Demo: treasury query → AML-flagged (all HITL) → regulatory report |
| 7:30 | 2:00 | Governance | Emphasis: EVERY query touching regulated data → HITL. Show audit chain verification |
| 10:30 | 1:30 | PoC plan | Kill: compliance gap at week 5. Bank HO will care most about this |

### Bank Demo Script Adaptation
- Scene 1: "Show me treasury position summary" (INTERNAL → auto-served)
- Scene 2: "Find accounts flagged for suspicious transactions" (REGULATED → HITL + senior reviewer)
- Scene 3: "Generate SBV monthly report data" (REGULATED → HITL mandatory, show audit hash chain)

---

## Run-of-Show C — Securities (SS1)

| Time | Duration | Activity | Difference from SVFC |
|---|---|---|---|
| 1:30 | 5:00 | Live Demo | Demo: portfolio query + **live-coding backtest dashboard** (vibe-coding) |
| 7:30 | 2:00 | Governance | Lighter touch; emphasis on speed + cost dashboard |
| 10:30 | 1:30 | PoC plan | Kill: build velocity. Securities cares about speed |

### Securities Demo Script Adaptation
- Scene 1: "Show me top 10 stocks by volume today" (PUBLIC → auto-served, ticker-aware UI)
- Scene 2: "Build a backtest dashboard for VN30 index" (→ **live-coding with Claude Code**)
- Scene 3: Show cost dashboard: "This demo cost 2,300 VND in total"

---

## Failure Plans

### Internet Dies

| Step | Action |
|---|---|
| 1 | Switch to mobile hotspot (pre-connected, tested) |
| 2 | If hotspot fails: switch to local Docker stack |
| 3 | If local fails: play pre-recorded video |
| 4 | **Never apologise for infrastructure. Say "Let me show you our offline capability."** |

### Demo App Crashes

| Step | Action |
|---|---|
| 1 | Switch to backup laptop (local stack pre-running) |
| 2 | If backup fails: play pre-recorded video |
| 3 | **Say "This is exactly why we built the fallback system. In production, it auto-switches."** |

### LLM Returns Wrong Answer

| Step | Action |
|---|---|
| 1 | **Don't hide it.** Say "Great — this is why we have the human review layer." |
| 2 | Show the HITL queue catching it |
| 3 | Show the eval harness that would flag this |
| 4 | **Turn it into a trust signal.** "This is what happens in a system that self-corrects." |

### Question You Can't Answer

| Step | Action |
|---|---|
| 1 | "That's a great question. Let me give you a precise answer after the session." |
| 2 | Write it down visibly (iPad/notebook) |
| 3 | Follow up within 24 hours |
| 4 | **Never make something up.** |
