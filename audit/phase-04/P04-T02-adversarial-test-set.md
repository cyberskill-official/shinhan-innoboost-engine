# Deep Audit — P04-T02: Adversarial Test Set

> **Auditor**: Antigravity Engine Audit  
> **Date**: 2026-05-02  
> **Status**: 🟡 PARTIALLY COMPLETE (~40%)  
> **Risk Level**: High  

---

## 1. Acceptance Criteria Audit

| # | Criterion | Status | Evidence | Gap |
|---|-----------|--------|----------|-----|
| AC-1 | 200+ injection attempts across subcategories | ❌ FAIL | `eval/adversarial/corpus.yaml` contains only **32 entries** (grep `id:` = 32). FR specifies 200+. | **168+ entries missing** (84% short). |
| AC-2 | Categories: injection, ambiguity, out-of-scope, sensitive extraction | ✅ PASS | All 4 categories present. Subcategories: role-swap, DAN, system-prompt-leak, encoded, context-overflow, SQL-injection, temporal, entity, metric, general-knowledge, creative, coding, opinion, competitor, PII, credentials, system. | — |
| AC-3 | Subcategory: role-swap (40 entries) | ❌ FAIL | Only **5 role-swap entries** (ADV-INJ-001 to 005). FR specifies 40. | 35 missing. |
| AC-4 | Subcategory: DAN (30 entries) | ❌ FAIL | Only **3 DAN entries** (ADV-INJ-010 to 012). FR specifies 30. | 27 missing. |
| AC-5 | Subcategory: system-prompt-leak (20 entries) | ❌ FAIL | Only **3 entries** (ADV-INJ-020 to 022). FR specifies 20. | 17 missing. |
| AC-6 | Subcategory: encoded payloads (30 entries) | ❌ FAIL | Only **3 entries** (ADV-INJ-030 to 032). FR specifies 30. | 27 missing. |
| AC-7 | Subcategory: context-overflow (20 entries) | ❌ FAIL | Only **1 entry** (ADV-INJ-040). FR specifies 20. | 19 missing. |
| AC-8 | Subcategory: SQL injection via prompt (20 entries) | ❌ FAIL | Only **2 entries** (ADV-INJ-050 to 051). FR specifies 20. | 18 missing. |
| AC-9 | Subcategory: ambiguity stressors (50 entries) | ❌ FAIL | Only **5 entries** (ADV-AMB-001 to 005). FR specifies 50. | 45 missing. |
| AC-10 | Subcategory: out-of-scope (30 entries) | ❌ FAIL | Only **5 entries** (ADV-OOS-001 to 005). FR specifies 30. | 25 missing. |
| AC-11 | Subcategory: sensitive data extraction (30 entries) | ❌ FAIL | Only **5 entries** (ADV-EXT-001 to 005). FR specifies 30. | 25 missing. |
| AC-12 | Expected outcomes defined per entry | ✅ PASS | All entries have `expected_outcome`: refuse, clarify, sanitise. | — |
| AC-13 | Severity levels assigned | ✅ PASS | All entries have `severity`: low, medium, high. Distribution: high (majority), low (ambiguity/OOS). | — |
| AC-14 | Sources cited per entry | ✅ PASS | All entries have `source`: internal-redteam, OWASP-LLM-Top-10, published-DAN, JailbreakBench. | — |
| AC-15 | 95% pass rate required in CI | 🟡 PARTIAL | Target is defined in `TARGETS.adversarial_pass_rate = 95` (framework.ts L113). But **no CI pipeline runs the corpus**. | CI not wired. |
| AC-16 | 99% pass rate for high-severity entries | 🟡 PARTIAL | Target defined: `TARGETS.adversarial_high_pass_rate = 99` (L114). Not executed. | CI not wired. |
| AC-17 | Access restricted to squad + founder | 🟡 PARTIAL | YAML header comment says "Access restricted to squad + founder". **No file-level access control enforced** (CODEOWNERS, .gitattributes). | No enforcement. |

**AC Summary**: 3/17 PASS, 3/17 PARTIAL, 11/17 FAIL.

---

## 2. Test Plan Audit

| # | Test | Status | Evidence | Gap |
|---|------|--------|----------|-----|
| TP-1 | Parse adversarial YAML without errors | ❌ NOT RUN | No test. | No tests. |
| TP-2 | Verify 200+ entries | ❌ NOT RUN | Would fail — only 32 present. | Blocked. |
| TP-3 | Execute adversarial corpus against prompt guard | ❌ NOT RUN | Prompt guard (P02-T08) not wired. | Blocked by P02. |
| TP-4 | Verify 95% overall pass rate | ❌ NOT RUN | No pipeline. | Blocked. |
| TP-5 | Verify 99% high-severity pass rate | ❌ NOT RUN | No pipeline. | Blocked. |
| TP-6 | Verify encoded payloads are decoded before sanitisation | ❌ NOT RUN | No decode-before-scan test. | Blocked. |
| TP-7 | Verify SQL injection attempts are blocked | ❌ NOT RUN | No SQL guard test. | Blocked. |

**TP Summary**: 0/7 tests executed. **100% test debt.**

---

## 3. Success Metrics Audit

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| 200+ adversarial entries | 200+ | 32 | ❌ FAIL (16% of target) |
| 95% overall pass rate | 95% | N/A (not runnable) | ❌ FAIL |
| 99% high-severity pass rate | 99% | N/A | ❌ FAIL |
| CI integration | Yes | No | ❌ FAIL |

---

## 4. Definition of Done Audit

| Criterion | Met? | Notes |
|-----------|------|-------|
| 200+ entries authored | ❌ | Only 32 (16%) |
| CI pipeline running | ❌ | Not implemented |
| Pass rates verified | ❌ | No pipeline |
| Access control enforced | ❌ | No CODEOWNERS/gitattributes |
| FR ticket marked Done | ❌ | Major gaps |

---

## 5. Code Quality Assessment

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Entry Quality** | 8/10 | The 32 entries present are well-crafted, diverse, and realistic. |
| **Category Coverage** | 7/10 | All 4 categories + multiple subcategories represented. Missing volume per subcategory. |
| **Source Attribution** | 8/10 | Good mix: OWASP, published-DAN, JailbreakBench, internal-redteam. |
| **Structure Consistency** | 9/10 | All entries follow identical schema. |
| **Volume** | 2/10 | 32/200+ = 16% of target. Most subcategories have 1–5 samples. |
| **Test Coverage** | 0/10 | Zero tests. |

---

## 6. Risk Assessment

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|------------|
| Only 32/200+ entries — insufficient attack surface coverage | **CRITICAL** | Prompt injection defence cannot be validated | Complete remaining 168+ entries |
| No CI pipeline means adversarial testing never runs automatically | **HIGH** | Regressions in prompt guard (P02-T08) go undetected | Wire CI in P04-T04 |
| No access control enforcement on corpus file | **MEDIUM** | Adversarial techniques leak to unauthorised readers | Add CODEOWNERS entry + .gitattributes |
| Encoded payload category has only 3 entries | **HIGH** | Hex/HTML/URL-encoded injection bypasses may not be caught | Expand to 30 entries |

---

## 7. Remediation Priorities

| Priority | Item | Effort | Dependency |
|----------|------|--------|------------|
| P0 | Expand corpus from 32 to 200+ entries across all subcategories | 12h | Security researcher time |
| P0 | Add role-swap entries: 35 more (SVFC-specific, Bank-specific, authority claims) | 3h | None |
| P0 | Add encoded payload entries: 27 more (hex, URL, base64, Unicode, mixed encoding) | 4h | None |
| P0 | Add DAN entries: 27 more (published DAN versions 5.0–15.0, multi-turn variants) | 3h | None |
| P1 | Add CODEOWNERS entry: `eval/adversarial/ @security-squad @founder` | 15min | None |
| P1 | Wire adversarial execution in P04-T04 CI pipeline | 4h | P04-T04 |
| P2 | Add Vietnamese-language injection attempts (cross-lingual attack surface) | 4h | VN security researcher |
| P2 | Add multi-turn adversarial scenarios (conversation-level attacks) | 6h | Chat surface (P05-T01) |
