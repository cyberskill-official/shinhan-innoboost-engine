# Shinhan-Side Onboarding Pack
## P13-T03

> Everything a Shinhan team member needs to know on Day 1.

---

## Welcome

Welcome to the CyberSkill × Shinhan PoC. This pack covers three things you'll interact with:
1. **The Tool** — how to ask questions and read answers
2. **The HITL Queue** — how to review AI-generated answers
3. **The Audit Log** — how to verify what happened

---

## 1. Using the Tool

### Getting Started
1. Log in at `https://[bu].innoboost.cyberskill.io` with your Shinhan SSO
2. You'll see the chat interface in your BU's theme
3. Type your question in Vietnamese or English

### Asking Questions
```
Good questions:
✅ "Tỷ lệ nợ xấu theo tỉnh quý 1"        (NPL ratio by province Q1)
✅ "Top 10 cổ phiếu theo khối lượng hôm nay"  (Top 10 stocks by volume today)
✅ "Compare Q1 vs Q2 for HCM branch"

Questions that will be routed to human review:
⚠️ "Show all customers with credit score < 500"  (individual data → HITL)
⚠️ "List AML-flagged accounts"                    (regulated data → HITL)
```

### Reading Answers
Every answer includes:
- **Result**: Table, chart, or text
- **Citation**: Which table/column was queried, when data was last updated
- **Confidence**: Green (auto-served), Yellow (low confidence), Red (HITL required)
- **"Show Me How"**: Click to see the SQL query that generated the result

### What to Do If Something Looks Wrong
1. Click the **👎 Incorrect** button on the answer
2. Briefly describe what's wrong
3. The system will flag it for review and improve over time

---

## 2. Reviewing HITL Items (For Designated Reviewers Only)

### Your Role
When the AI isn't confident enough to serve an answer directly, or when the data is sensitive, it routes the answer to you for review. You are the human-in-the-loop.

### Workflow

```
[Notification] → [Open item] → [Review SQL + Result] → [Action]

Actions:
  ✅ Approve    — Answer is correct, serve to user
  ✏️ Edit       — Answer needs minor correction, fix and serve
  ❌ Reject     — Answer is wrong, send back with explanation
  ⬆️ Escalate  — Needs senior review (regulatory data)
  🚫 Refuse     — Query should not be answered (policy violation)
```

### SLA Targets

| Data Sensitivity | Review SLA | Escalation SLA |
|---|---|---|
| Internal (Tier 2) | 30 minutes | 45 minutes |
| Restricted (Tier 3) | 20 minutes | 30 minutes |
| Regulated (Tier 4) | 30 minutes | 45 minutes |

You'll receive notifications via:
- **In-app badge** (always)
- **Email** (SLA warning at 50%)
- **Slack/Teams** (SLA breach)

### Tips for Good Reviews
1. **Check the SQL** — does it match what the user asked?
2. **Check the result** — does the data look reasonable? (e.g., NPL ratio of 150% is probably wrong)
3. **Check sensitivity** — should this user see this data?
4. **Leave a note** — your review comments help the AI improve

---

## 3. Reading the Audit Log

### What Gets Logged
Every interaction is recorded:
- Who asked the question
- What question was asked
- What SQL was generated
- What result was returned
- Whether it was auto-served or human-reviewed
- Who reviewed it and what action they took
- Timestamp for everything

### Accessing the Audit Log
1. **Admin Console** → Audit Trail section
2. Filter by: date range, user, BU, sensitivity tier, review status
3. Each entry has a **hash chain verification** — click "Verify Integrity" to confirm the log hasn't been tampered with

### For Compliance Officers
- Export audit log as CSV or PDF for regulatory reporting
- Run quarterly calibration report: "Are reviewers consistent? Is accuracy trending up?"
- Verify hash chain monthly to confirm log integrity

---

## 4. Quick Reference Card

| Need | Action |
|---|---|
| Ask a question | Type in chat box, press Enter |
| See the SQL | Click "Show Me How" |
| Report a wrong answer | Click 👎 on the answer |
| Review an item (reviewers) | Open HITL queue, take action |
| Check audit trail | Admin Console → Audit Trail |
| Get help | Slack #cyberskill-shinhan or email support@cyberskill.io |
| Report a security issue | Email security@cyberskill.io (24h response) |

---

## 5. FAQ for Shinhan Users

**Q: Can I trust the AI's answers?**  
A: Every answer has a confidence score and citations. Sensitive data always goes through human review first. You can always click "Show Me How" to see exactly what SQL was run.

**Q: What if I ask something I shouldn't?**  
A: The system has sensitivity controls. Queries about restricted data will be routed to a reviewer. If a query violates policy, it will be refused with an explanation.

**Q: Is my data being sent outside Vietnam?**  
A: No. All data stays in Vietnam. Only column names (not data values) are sent to the AI model for query generation.

**Q: Who can see my queries?**  
A: Only you and designated reviewers/admins for your BU. Queries are isolated by tenant.
