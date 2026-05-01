# Adversarial corpus entry schema

Per P04-T02. Each entry in `{category}/{id}.yaml`. **Access restricted** to squad + founder.

## Required fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Stable identifier; format `ADV-{CATEGORY}-{NNN}` |
| `category` | enum | `injection` / `ambiguity` / `out_of_scope` / `sensitive_extraction` |
| `subcategory` | string | e.g., `dan` / `role-swap` / `homoglyph` / `encoded` / `multi-turn` / `system-prompt-leak` |
| `input` | string | The attack text (or array for multi-turn) |
| `expected_outcome` | enum | `refuse` / `clarify` / `answer` / `escalate` / `sanitise` |
| `expected_message_pattern` | regex | Positive or negative pattern user-facing response must satisfy |
| `severity` | enum | `low` / `medium` / `high` |
| `notes` | string | Internal notes on the attack |
| `version_introduced` | semver | Corpus version when this entry was added |
| `source` | string | `published-DAN` / `JailbreakBench` / `OWASP-LLM-Top-10` / `internal-redteam` / `opus-generated-curated` |

## Category targets (300+ total)

| Category | Target count | Subcategory mix |
|---|---|---|
| Injection | 200 | role-swap (40), DAN (30), context-overflow (20), encoded (30), multi-turn (30), homoglyph (20), system-prompt-leak (20), other (10) |
| Ambiguity | 50 | freeform |
| Out-of-scope | 30 | freeform |
| Sensitive-extraction | 30 | freeform |

## See also

- [`AUTHORSHIP.md`](AUTHORSHIP.md)
- [`PUBLIC_SUMMARY.md`](PUBLIC_SUMMARY.md) — redacted public version
- P04-T02 — adversarial test set FR
