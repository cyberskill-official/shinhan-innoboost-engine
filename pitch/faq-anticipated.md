# Anticipated Reviewer FAQ
## P12-T04

> Answer the hard questions before they're asked.

---

## Competition & Positioning

### Q1: "How do you compare to [incumbent vendor / internal tool]?"

**SVFC**: "Existing BI tools require SQL knowledge. We eliminate that barrier. 45 business users vs 2 analysts — that's the difference. We're not replacing your BI platform; we're putting a natural-language layer on top of it."

**Bank HO**: "Internal tools don't have HITL or audit trails built for SBV compliance. We do. The compliance infrastructure was built before the AI — not bolted on after."

**Securities**: "Bloomberg/Reuters are data providers; we're a data access layer. We connect to *your* data, in *your* systems, with *your* security policies. And we do it in 5 seconds instead of 3 days."

### Q2: "Why three submissions instead of one focused one?"

"Because each BU has genuinely different needs. Bank needs governance. Securities needs speed. SVFC needs accuracy. We built one engine that serves all three — that's the architecture advantage. But each BU gets a customised experience: different UI themes, different HITL rules, different sensitivity tiers, different demo scenarios."

---

## Technical Resilience

### Q3: "What happens if your LLM provider has an outage?"

"Three layers of fallback:
1. **Cache**: 60%+ of repeated queries served from cache (no LLM needed)
2. **Local model**: Qwen-7B runs on-premise with no internet. Reduced accuracy (~85% vs 91%), but functional
3. **Graceful degradation**: Users see 'answers may be slower' banner; queue builds until service restores

We've tested all three. The local model is part of our air-gap deployment bundle."

### Q4: "How do you handle a hallucination in production?"

"Five defences:
1. **SQL validation**: We only execute verified SELECT statements — no DML ever
2. **Confidence scoring**: Low confidence → routed to human reviewer
3. **Citation engine**: Every answer shows its source (table, column, freshness)
4. **Eval harness**: 90 gold-set questions run on every deployment; 2% regression blocks deployment
5. **HITL queue**: Humans verify sensitive queries before users see results

If a hallucination gets through all five layers, the audit trail captures it, the feedback loop flags it, and the next eval run adds it to the adversarial corpus."

### Q5: "Can you operate fully on-prem with no internet egress?"

"Yes. Our air-gap deployment bundle includes:
- All container images (OCI format)
- Qwen-7B model weights (4-bit quantised, 4GB)
- Helm charts for vanilla Kubernetes
- No cloud dependencies

Sizing: small deployment fits on one server (10.5 cores, 18GB RAM, 110GB storage). Medium production fits on 3 servers. See our sizing guide."

---

## Data & Privacy

### Q6: "What's your data-deletion guarantee?"

"Per our PDPL compliance mapping:
- **Right to erasure**: 72-hour SLA upon valid request
- **Scope**: All personal data, query history, cached results
- **Verification**: Cryptographic proof of deletion provided
- **Audit**: Deletion event recorded in tamper-evident audit log
- **Retention exception**: Audit log entries retained for 7 years (regulatory requirement) but personal data within them is anonymised

The DPO is the named point of contact for all data subject requests."

### Q7: "Where exactly does our data go?"

"Here's the complete data flow:
- **User queries**: Stored in VN (Postgres, encrypted at rest)
- **LLM prompts**: Only column names and aggregation patterns — NO raw data values, NO customer names, NO PII
- **LLM responses**: SQL query text — no data values
- **Query results**: Stay in VN (never sent to LLM)
- **Audit logs**: VN (hash-chained, WORM storage)
- **Cache**: VN (Redis, TTL-controlled)

For fully air-gapped: zero data leaves the network. We've mapped three VN IDC options: Viettel, VNPT, FPT."

---

## Eval & Quality

### Q8: "Show us a wrong answer your eval caught."

"In January, we upgraded from GPT-4o to GPT-4o-mini to save costs. The eval harness caught a 15-point accuracy drop within 5 minutes:
- Query: 'Show NPL ratio by product type for Q4'
- GPT-4o-mini generated a SQL join on the wrong column
- Eval flagged: expected 8 product types, got 3
- Automatic rollback within 15 minutes

This is now in our transparency log. We'd rather show you the failures we've caught than claim perfection."

### Q9: "What did you kill last year and why?"

"Three examples from our vibe-coding evidence kit:
1. **Real-time market ticker widget**: Killed at prototype — latency was 800ms, target was 200ms. Technology wasn't ready for that UX.
2. **Voice-to-query interface**: Killed at spec — Vietnamese speech-to-text accuracy was 72%, below our 90% threshold.
3. **Auto-generated regulatory reports**: Killed at decision gate — compliance team said AI-generated reports need manual review anyway, so the automation value was marginal.

Kill rate is ~50%. That's healthy — it means we're exploring, not just building safe things."

---

## Commercial & Operational

### Q10: "What's your pricing model?"

"Per-BU subscription. Three components:
1. **Platform fee**: Fixed monthly per BU (covers infrastructure, updates, support)
2. **Usage fee**: Per-question (above included volume)
3. **Professional services**: Onboarding, custom integrations, training

Details in the SOW. We're flexible on structure — the goal is to align incentives: you pay more when you get more value."

### Q11: "What happens after the PoC?"

"Three paths:
1. **Graduate to pilot**: 6-month production deployment with real data, full support team
2. **Expand to other BUs**: Shared engine makes multi-BU deployment incremental, not multiplicative
3. **Kill**: If the PoC doesn't meet graduation criteria, we walk away. No hard feelings, no lock-in.

We've pre-drafted the SOW, NDA, and kickoff agenda. If selected, we can start week 1 without scrambling."

### Q12: "What's your team's availability and commitment?"

"Founder-led. Stephen Cheng is 100% dedicated to this engagement. Full team of 6 — backend, frontend, ML, DevOps, PM (Korean-speaking). All based in Ho Chi Minh City. All available for on-site work."

---

## Curveball Questions (Prepare Mentally)

| Question | Strategy |
|---|---|
| "Can you do this in 6 weeks instead of 12?" | "We can demo in 6 weeks. Production readiness needs 12. Happy to discuss scope trade-offs." |
| "Our IT team says they can build this internally." | "They absolutely can. The question is: do they have 6 months and an AI safety team? We've spent 18 months on the compliance layer alone." |
| "What about vendor lock-in?" | "All components are open-source or standard. PostgreSQL, Redis, Kubernetes. Your data stays in your DB. No proprietary formats." |
| "Can you guarantee 99.9% uptime?" | "We target 99.5% (3.6h/month budget). For 99.9% we'd need multi-region failover — happy to scope that for production." |
