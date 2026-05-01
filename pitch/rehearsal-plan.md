# Rehearsal Plan
## P12-T05

---

## Rehearsal Schedule

| # | Type | Date | Duration | Focus | Attendees |
|---|---|---|---|---|---|
| 1 | **Internal Dry-Run** | [TBD - Week -3] | 90 min | Full pitch × 3 BUs, brutal feedback | Full team |
| 2 | **External Friendly** | [TBD - Week -2] | 60 min | 1 BU pitch + live demo, outsider perspective | Team + 1 banking advisor |
| 3 | **Stress Test** | [TBD - Week -1] | 60 min | Time pressure, deliberate failures, fallback drills | Full team |

---

## Rehearsal 1 — Internal Dry-Run

### Objective
Run the full 15-minute pitch for all 3 BUs back-to-back. Get honest, uncomfortable feedback from the team.

### Agenda (90 min)

| Time | Activity |
|---|---|
| 0:00 - 15:00 | SVFC pitch (full, with live demo) |
| 15:00 - 20:00 | Feedback round #1 |
| 20:00 - 35:00 | Bank HO pitch (full, with live demo) |
| 35:00 - 40:00 | Feedback round #2 |
| 40:00 - 55:00 | Securities pitch (full, with live-coding) |
| 55:00 - 60:00 | Feedback round #3 |
| 60:00 - 75:00 | Cross-cutting issues |
| 75:00 - 90:00 | Action items and fixes |

### Feedback Template
Each observer rates 1-5 on:
- [ ] Opening hook (did it grab attention?)
- [ ] Demo smoothness (any stumbles?)
- [ ] Technical credibility (did it land?)
- [ ] Governance messaging (did they feel safe?)
- [ ] Time management (on schedule?)
- [ ] Q&A readiness (could they handle tough questions?)
- [ ] Overall confidence (would you buy this?)

---

## Rehearsal 2 — External Friendly

### Objective
Run one BU pitch (SVFC recommended — most detailed demo) with someone who has banking industry experience but is not on the team. Get outsider perspective.

### Ideal Reviewer Profile
- Has worked in Vietnamese banking/fintech
- Understands regulatory landscape
- Not afraid to ask hard questions
- Available for 60 minutes

### Agenda (60 min)

| Time | Activity |
|---|---|
| 0:00 - 15:00 | Full SVFC pitch |
| 15:00 - 30:00 | Reviewer Q&A (unscripted) |
| 30:00 - 45:00 | Reviewer feedback (structured) |
| 45:00 - 60:00 | Discussion + adjustments |

### Key Questions for Reviewer
1. "If you were Shinhan's reviewer, what would worry you?"
2. "Was there a moment you felt we oversold?"
3. "What question would you ask that we didn't answer?"
4. "Would you trust this system with your bank's data?"
5. "What was the weakest 2 minutes of the pitch?"

---

## Rehearsal 3 — Stress Test

### Objective
Deliberately break things. Test every fallback. Build muscle memory for failure recovery.

### Stress Scenarios

| # | Scenario | How to Simulate | Expected Recovery |
|---|---|---|---|
| 1 | Internet dies | Disconnect Wi-Fi at random point | Switch to hotspot within 10 seconds |
| 2 | Cloud stack down | Stop cloud services | Switch to local Docker in 30 seconds |
| 3 | LLM returns garbage | Inject bad prompt template | "Let me show you how our review layer handles this" |
| 4 | Demo app crashes | Kill engine container | Switch to backup laptop |
| 5 | Time pressure | Set timer to 10 min (5 min less) | Cut architecture slide, shorten governance |
| 6 | Hostile question | Team member plays hostile reviewer | Use FAQ doc responses |
| 7 | Projector fails | Disconnect HDMI | Switch to screen share |

### Agenda (60 min)

| Time | Activity |
|---|---|
| 0:00 - 20:00 | Full pitch with random interruptions (team sabotages) |
| 20:00 - 30:00 | Debrief: what worked, what didn't |
| 30:00 - 45:00 | Repeat worst failure scenarios |
| 45:00 - 60:00 | Final calibration: what we will and won't say |

---

## Final Calibration Checklist

### We WILL Say
- [ ] "We built the compliance layer before the AI"
- [ ] "We've killed 50% of our prototypes — that's healthy"
- [ ] "Every answer has a citation and an audit trail"
- [ ] "You can call our references"
- [ ] "If the PoC fails the kill criteria, we walk away"
- [ ] "Founder-led, full commitment, HCM-based"

### We Will NOT Say
- [ ] ~~"Our AI never makes mistakes"~~ → "Our system catches mistakes automatically"
- [ ] ~~"We can do anything"~~ → "Here's what we're great at, and here's what we'd scope carefully"
- [ ] ~~Specific pricing numbers~~ → "Details in the SOW, happy to discuss"
- [ ] ~~Negative comments about competitors~~ → Focus on our differentiators
- [ ] ~~Guarantees about timelines we can't control~~ → "Assuming data delivery by Week -2"

### Post-Rehearsal Sign-Off
- [ ] All 3 pitch decks finalised and version-locked
- [ ] All demo scripts tested ≥ 3 times
- [ ] All recorded fallbacks verified
- [ ] FAQ doc reviewed by entire team
- [ ] Equipment backup plan verified
- [ ] Team roles and speaking assignments confirmed
