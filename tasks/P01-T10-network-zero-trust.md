---
title: "Configure zero-trust network (mTLS, NetworkPolicy, gateway-only ingress)"
author: "@cyberskill-eng-sec"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: infrastructure
eu_ai_act_risk_class: not_ai
target_release: "2026-06-05"
client_visible: false
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Configure a zero-trust network posture for the demo build: every service-to-service connection is authenticated (mTLS via service mesh, identity from SPIFFE per-pod identities); Kubernetes NetworkPolicy rules enforce default-deny pod-to-pod traffic with explicit allow-lists per service; ingress is gateway-only (a single ingress controller is the only entry point from outside the cluster); egress is allow-listed at the VPC level (only required external endpoints are reachable); intra-cluster traffic does not bypass the policy layer; and the entire posture is encoded in IaC and verified by nightly drift checks. Zero-trust is not a marketing term here — it is the structural enforcement that an attacker who lands in one pod cannot move laterally without being blocked at the network layer.

## Problem

Banking-sector reviewers expect strong network segmentation. The Innoboost Q&A's references to SBV and the new Cybersecurity Law include explicit network-segregation requirements; ISO 27001 control A.8.20 (network controls) and SOC 2 CC6.6 (logical access — network) demand evidence of network controls.

Specific gaps if we shortcut:

- **Without default-deny NetworkPolicy, pod-to-pod traffic is unrestricted.** Any compromised pod can reach any other pod. Default-deny + explicit allow is the standard.
- **Without mTLS service-to-service, in-cluster traffic is plaintext.** Sniffable from a compromised node, from a misconfigured ServiceAccount, from a privileged DaemonSet.
- **Without gateway-only ingress, multiple ingress points produce policy fragmentation.** Unification at one ingress controller is the cleanest model.
- **Without egress allow-listing, a compromised pod can exfiltrate to arbitrary external endpoints.** VPC-level firewalls plus NetworkPolicy egress rules give us defence-in-depth.
- **Without intra-cluster policy enforcement, RBAC bypass via internal endpoints is possible.** All API calls — even from another pod — must go through the policy layer.
- **Without nightly drift checks, the policy posture decays as engineers add services.** Drift is the silent killer.

The `cyberos_architecture` memory note documents 3-layer tenant isolation; network zero-trust is the network layer of defence-in-depth alongside auth (P01-T06), RBAC (P01-T07), and the policy layer (P02-T03).

The `feedback_p1_scope_preference` memory note biases us richer. For network zero-trust, "richer" means: NetworkPolicy at the cluster level + mTLS via service mesh + VPC firewall at the cloud layer + egress allow-list + drift detection. Each layer is well-trodden; together they form an enterprise-grade zero-trust posture.

## Proposed Solution

A multi-layer zero-trust network configuration:

1. **VPC-level firewall** (configured in IaC per P01-T04): default-deny ingress; default-deny egress except for explicitly allow-listed destinations.
2. **Cluster-level NetworkPolicy**: Calico-enforced (or equivalent on bare-metal); default-deny pod-to-pod traffic; explicit allow rules per service-to-service hop.
3. **Service mesh (linkerd) mTLS** for every pod-to-pod connection.
4. **Gateway-only ingress**: a single ingress-nginx controller (or Istio gateway) is the only external entry point; all other Service `LoadBalancer` types are forbidden.
5. **Egress allow-list** (in NetworkPolicy + VPC firewall) for: Anthropic API, GitHub, Slack, Doppler, HuggingFace, Lambda Labs, Sigstore.
6. **Nightly drift checks** that verify the policy posture against the IaC source of truth.
7. **Documented incident-response path** for "unexpected egress detected" events.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Configure VPC firewall in IaC.** Per P01-T04: default-deny ingress (only explicit allow rules permit traffic); default-deny egress with allow-list. Allow-list: Anthropic API (`api.anthropic.com:443`), GitHub (`github.com:443`, `ghcr.io:443`), Slack (`hooks.slack.com:443`), Doppler (`api.doppler.com:443`), HuggingFace (`huggingface.co:443`), Lambda Labs (`api.lambda.ai:443`), Sigstore (`fulcio.sigstore.dev:443`, `rekor.sigstore.dev:443`), DNS (53/UDP to GCP-resolvers).
- [ ] **Verify private cluster.** Cluster master endpoint is private (not publicly reachable). Engineers reach the cluster via authorised networks (corporate IPs) or via a bastion host (with audit logging).
- [ ] **Configure default-deny NetworkPolicy.** Apply at every namespace: `policy: deny-all-ingress` and `policy: deny-all-egress` as the baseline.
- [ ] **Configure per-service NetworkPolicy allow rules.** Each service in `infra/helm/.../templates/networkpolicy.yaml` declares: `ingressFrom` (which pod selectors can reach this service); `egressTo` (which pod selectors / external CIDRs this service can reach). Examples:
  - `engine` service: `ingressFrom: ui` (UI calls engine); `egressTo: postgres-master, redis-master, anthropic-api, llm-router-pod, audit-log-writer`.
  - `hitl` service: `ingressFrom: ui`; `egressTo: postgres-master, audit-log-writer`.
  - `ui` service: `ingressFrom: gateway`; `egressTo: engine, hitl, keycloak`.
  - `keycloak`: `ingressFrom: gateway, ui, engine`; `egressTo: postgres-master, audit-log-writer`.
  - `audit-log-writer`: `ingressFrom: engine, hitl, keycloak, ui`; `egressTo: postgres-audit, object-storage`.
- [ ] **Install and configure linkerd.** Helm install linkerd; enable automatic proxy injection in application namespaces; verify mTLS for every pod-to-pod connection via linkerd's tap CLI.
- [ ] **Configure gateway-only ingress.** `ingress-nginx` deployed in a dedicated namespace with hardened config; all Service `type: LoadBalancer` are forbidden via OPA / Kyverno admission policy. The gateway is the only `LoadBalancer`.
- [ ] **Configure WAF rules at the gateway.** ingress-nginx with ModSecurity (or equivalent) configured: OWASP Core Rule Set baseline; rate limiting (per-IP and per-path); request-size limits; suspicious-header detection.
- [ ] **Configure egress allow-list at NetworkPolicy level.** `egress-allow-listed-only` policy in every namespace; pods can only egress to pods in the same cluster (via service mesh) or to the explicit external CIDRs in the VPC firewall.
- [ ] **Configure DNS egress.** Pods use the cluster's CoreDNS for internal resolution; external DNS queries go through CoreDNS to upstream resolvers in the allow-list.
- [ ] **Configure node-level hardening.** Node OS minimised (Container-Optimized OS for GKE); SSH disabled; no public IP on nodes.
- [ ] **Configure bastion host (or IAP for GKE).** Engineers reach the cluster master via Identity-Aware Proxy (IAP) on GCP, or a bastion host with audit logging on bare-metal.
- [ ] **Configure nightly drift checks.** A CI job that runs nightly: queries actual NetworkPolicy state in the cluster; compares to IaC source of truth; alerts on drift.
- [ ] **Configure unexpected-egress alerting.** Monitor egress flows; if a pod attempts to egress to an unexpected destination (any not in the allow-list), alert immediately. Reach into observability (P09).
- [ ] **Author the incident-response path.** `docs/runbooks/network-incident.md`: what to do when unexpected-egress fires; containment (NetworkPolicy isolate the pod); investigation (audit log + traffic capture); remediation (image rebuild if compromised).
- [ ] **Test with a pen-test simulation.** From inside the staging cluster, attempt: pod-to-pod traffic that should be denied (verify denial); egress to unexpected destination (verify denial); ingress from outside the gateway (verify denial); replay attack via mTLS bypass (verify denial).

### Acceptance criteria

- VPC firewall configured with default-deny + allow-list; verified by traffic test.
- Cluster master is private; engineer access via IAP/bastion only.
- Default-deny NetworkPolicy in every namespace.
- Per-service NetworkPolicy allow rules in place for every service.
- linkerd mTLS verified for every pod-to-pod connection.
- Single ingress-nginx gateway; no other LoadBalancer Services exist (verified by admission policy).
- WAF rules active at the gateway.
- Nightly drift check operational.
- Unexpected-egress alerting operational.
- Incident-response runbook published.
- Pen-test simulation passes (denials work as expected).

## Alternatives Considered

- **Skip NetworkPolicy; rely on service-mesh mTLS alone.** Rejected: defence-in-depth — mTLS authenticates traffic, NetworkPolicy gates whether traffic is even allowed. Both layers are cheap together.
- **Use Cilium's eBPF-based NetworkPolicy instead of Calico.** Cilium has more features (transparent encryption, observability) but adds operational complexity. Calico is sufficient for the demo phase. Reconsider for production track.
- **Use Istio instead of linkerd.** Rejected for demo phase: Istio's feature surface is broader but operational overhead is higher; linkerd's automatic mTLS is sufficient. Reconsider if specific Istio features become needed.
- **Allow public LoadBalancer Services for testing.** Rejected: the moment we allow one, we will accidentally expose another. Strict admission policy is the only sustainable model.
- **Skip egress allow-list; rely on NetworkPolicy alone.** Rejected: VPC firewall is the cloud-provider-enforced layer; NetworkPolicy is the cluster-enforced layer. Both is defence-in-depth.
- **Skip the bastion / IAP; use kubectl over public master.** Rejected: public master endpoints are scanned by attackers continuously; private + IAP is the standard.
- **Skip nightly drift checks; trust IaC.** Rejected: drift will happen; the question is whether we detect it. Nightly check is cheap.

## Success Metrics

- **Primary**: Pen-test simulation passes for all four denial scenarios within 14 days of task assignment. Measured by: pen-test record file.
- **Guardrail**: Zero unexpected-egress alerts triggered by legitimate traffic during the engagement; zero NetworkPolicy drift unaccounted-for. Measured by: nightly drift-check + alert log.

## Scope

### In scope
- VPC firewall + default-deny + allow-list.
- NetworkPolicy default-deny + per-service allow rules.
- linkerd mTLS.
- Gateway-only ingress with WAF.
- Bastion / IAP access pattern.
- Nightly drift checks.
- Unexpected-egress alerting.
- Network incident-response runbook.
- Pen-test simulation as a baseline test.

### Out of scope
- Full external pen-test (handled by P08-T06).
- DDoS protection beyond rate limiting (handled by Cloud Armor / equivalent in production track).
- Geo-IP filtering (deferred; document as future-state if Shinhan requires).
- Advanced WAF rule customisation (start with Core Rule Set; tune as needed).
- Application-level rate limiting (handled at policy layer P02-T03).

## Dependencies

- **Upstream**: P01-T01, P01-T02, P01-T04 (VPC + cluster), P01-T08 (encryption — TLS at gateway).
- **People**: eng-sec authoring; platform engineer for service mesh + ingress; founder for sign-off on egress allow-list.
- **External**: Calico (or cluster's CNI); linkerd; ingress-nginx; ModSecurity (or equivalent); Identity-Aware Proxy (GCP).
- **Memory references**: `cyberos_architecture`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: For staging, do we need geo-IP filtering at the ingress (e.g., reject traffic from outside VN/Korea)? Recommendation: not at staging; consider at production-rehearsal if Shinhan requires.
- Q2: For the unexpected-egress alerting, what's the threshold for "unexpected"? Recommendation: any egress to a destination not in the allow-list triggers an alert; the alert may be benign (e.g., a new feature added a new dependency) but the alert is the prompt to update the allow-list intentionally.
- Q3: For the bastion approach on GCP, IAP is preferred over a bastion VM; on bare-metal we need an actual bastion VM. Document the bare-metal approach.
- Q4: For ingress-nginx WAF rules, are the OWASP Core Rule Set rules sufficient or do we need application-specific rules? Recommendation: start with CRS; tune as we observe traffic in staging.
- Q5: For the pen-test simulation, do we run it pre-deploy or post-deploy in staging? Recommendation: post-deploy; it tests the actual deployed posture, not the IaC.

## Implementation Notes

- NetworkPolicy is namespace-scoped; the same ingress + egress allow-lists apply per namespace. We have one production-rehearsal namespace per BU realm.
- linkerd's automatic mTLS is "transparent" — application code doesn't need changes. The proxy sidecar handles encryption; identity comes from ServiceAccount.
- For the WAF, ModSecurity in `DetectionOnly` mode initially is wise — observe the kinds of traffic, then switch to `Enforcing` after tuning. Otherwise legitimate traffic gets blocked.
- For the bastion / IAP, audit-log every shell session; sessions retained 90 days; monthly review of "who SSH'd into what".
- For the unexpected-egress alerting, focus signal-to-noise: alert per-pod-per-destination once per 5 minutes (rate-limited); don't flood ops on a single bad pod.

## Test Plan

- Test 1: Default-deny NetworkPolicy — deploy a test pod that tries to reach a non-allowlisted service; verify denial.
- Test 2: linkerd mTLS — capture pod-to-pod traffic; verify it's encrypted.
- Test 3: Gateway-only ingress — try to deploy a Service of type LoadBalancer; verify admission policy rejects.
- Test 4: WAF — send a request with a SQLi payload; verify WAF blocks.
- Test 5: Egress allow-list — try to egress to `example.com:443`; verify denial.
- Test 6: Nightly drift — manually drift a NetworkPolicy; verify nightly check detects.
- Test 7: Unexpected-egress alerting — manually trigger an egress to an off-list destination; verify alert fires.
- Test 8: Pen-test simulation — full denial scenario verification.
- Test 9: Incident-response dry-run — walk through the runbook; capture timing.

## Rollback Plan

- A bad NetworkPolicy that breaks legitimate traffic is rolled back via Helm rollback; staging monitoring catches the issue.
- A bad WAF rule that blocks legitimate traffic is rolled back via ingress-nginx config revert.
- A bad egress allow-list change is rolled back via VPC firewall revert.
- A linkerd issue (rare; auto-mTLS is reliable) is rolled back by removing the injection annotation; pods restart without sidecars; mTLS is off temporarily; document this as a degraded state with audit-log entry.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| VPC firewall rules | `infra/terraform/.../firewall.tf` | Eng-sec | Continuous |
| NetworkPolicy templates | `infra/helm/.../templates/networkpolicy.yaml` | Eng-sec | Continuous |
| linkerd config | `infra/helm/linkerd/values.yaml` | Eng-sec | Continuous |
| Ingress + WAF config | `infra/helm/ingress-nginx/values.yaml` | Eng-sec | Continuous |
| Drift-check job | `.github/workflows/network-drift.yml` | Eng-sec | Continuous |
| Pen-test simulation script | `infra/security/pen-test-sim.sh` | Eng-sec | Continuous |
| Pen-test simulation records | `docs/audit/pen-test-sims/{date}.md` | Eng-sec | 7 years |
| Incident-response runbook | `docs/runbooks/network-incident.md` | Eng-sec | Continuous |
| Bastion / IAP audit logs | Central observability store | Founder | 7 years |

## Operational Risks

- **NetworkPolicy locks out a legitimate service.** Mitigation: tested in staging first; per-service allow rules co-developed with the service.
- **WAF blocks legitimate traffic during demo.** Mitigation: WAF in detection-only initially; tuned before production-rehearsal demos.
- **linkerd outage.** Mitigation: linkerd-control-plane is HA; data-plane sidecars continue working briefly without control-plane updates.
- **Bastion / IAP access broken during incident.** Mitigation: documented break-glass for emergency cluster access via cloud-console (audited).
- **Drift accumulates undetected.** Mitigation: nightly drift-check; alert on any drift; remediate within 48 hours.

## Definition of Done

- VPC firewall + NetworkPolicy + linkerd + ingress-nginx + WAF all configured and verified.
- Bastion / IAP operational.
- Nightly drift-check + unexpected-egress alerting operational.
- Pen-test simulation passes.
- Incident-response runbook published.
- This FR's ticket marked Done.

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: eng-sec authors and reviews; platform engineer reviews service mesh + ingress; `@stephen-cheng` ratifies egress allow-list and incident-response procedures.
