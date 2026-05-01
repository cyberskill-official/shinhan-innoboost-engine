# legal/

Restricted-access folder for legal artefacts. Most content is gitignored (see `.gitignore`); folder structure is tracked so paths are stable.

## Sub-folders

| Path | Purpose | Anchor FR | Access |
|---|---|---|---|
| `consents/shinhan-innoboost-2026/` | Sponsor consent riders | P00-T01 | Founder + legal lead |
| `ndas/shinhan-innoboost-2026/` | NDA pack (drafts + executed) | P00-T04 | Founder + legal lead |
| `post-poc/` | Post-PoC NDA + SOW templates | P13-T01 | Founder + legal lead |
| `finance/innoboost-2026/` | Provider invoices (Lambda, Runpod, etc.) | P00-T05 | Founder |
| `audits/hitl-calibration/` | Quarterly HITL calibration reports | P06-T03 | Founder + compliance lead |
| `clearances/` | Squad-member clearance records | P11-T06 | Legal lead |

## Audit log

Every upload to legal/ is logged in the relevant `audit.log` file in each sub-folder (e.g., `consents/shinhan-innoboost-2026/audit.log`). Append-only; format `{ISO8601}\t{path}\t{sha256}\t{uploader}\t{reason}`.

## Retention

7 years per regulatory requirements (PDPL, SBV, ISO 27001).
