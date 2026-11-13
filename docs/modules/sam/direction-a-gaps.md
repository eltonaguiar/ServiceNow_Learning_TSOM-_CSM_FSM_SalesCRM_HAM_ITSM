# Direction A — Repo-Covered but Not on the SAM Guide Page

**Date:** 2026-11-13T15:47:53Z  
**Identifier:** kilo-kilo-ollama-checks-v2  
**Repo:** `ServiceNow_Learning_TSOM-_CSM_FSM_SalesCRM_HAM_ITSM`  
**Cross-reference:** vs. `eltonaguiar/ALT_PARALLELSWARM_SAM` `final/` docs (beam/kilo Australia-pinned + grok/xai/kilo Brazil-pinned)

---

## Gaps on the SAM Guide Page Not Covered by the Current Guide

These items are well-documented in the `ALT_PARALLELSWARM_SAM` repository but absent from the SAM guide page (`docs/modules/sam/sam-guide.md`). Recommend adding to a **Carry-Over Addendum** or new sections.

### 1. SAM Pro vs Foundation & Role Matrix
- **Plugins:** `com.snc.sams` (Foundation/Basic) vs SAM Pro `com.sn_samp_master_ws` / `com.snc.samp`; SaaS LM = `sn_sam_saas_int`. Upgrade to Pro is **irreversible**.
- **Roles:** `sam_admin` (contains `sam_user`, `sam_spend_import`, `asset`, `model_manager`, `contract_manager`), `sam_user` (analyst), `sam_developer` (script work only if trained), `sam_integrator` (SaaS + `connection_admin` + `flow_operator`), `sam_spend_import`.
- **⚠️ Curriculum-wrong names:** `sam_license_manager` / `sn_sam.admin` are NOT official role names.
- **Gap on page:** Neither the role matrix nor the plugin decision table appears in the SAM guide.

### 2. Four Discovery-to-SAM Catalog Paths (A–D)
The guide collapses "requestable vs observed" and lacks explicit framing of "catalog last, not first."

- **Path A — Catalog (requestable):** Product Catalog, `sc_cat_item`, `model_manager` / `catalog_admin`; `glide.model.catalog_item_currency`. Not created by Discovery.
- **Path B — Create in SAM before discovery:** Custom product → software model → entitlement (contract exists, nothing installed).
- **Path C — Discovered software linked to SAM model:** Install → discovery model → normalize → `SAM – Discovery Model to Software Model matching` → recon.
- **Path D — Block / exclude / do not manage:** Hardware boolean + `com.snc.samp.exclude_device_flag`; published-products (`com.snc.samp.manage.published.products`); exclude-from-content-service; leave `automaticsmrcreation` off.

### 3. Phase-Wise Published Products + Exclude-CI Flag
- `com.snc.samp.manage.published.products` (default **false**) → enable, add licensable products, **re-run reconciliation** to make published products the report surface.
- `com.snc.samp.exclude_device_flag` + job `SAM — Adjust Installs for excluded CIs`.
- Auto-creation gate `com.snc.samp.automaticsmrcreation` (off in Crawl); `com.snc.sam.auto_suite_inference` (false by default; turn on **only after** suites verified).
- **Suite parent/child publish warning:** do NOT publish a top-level suite in a pilot.

### 4. Foundation vs Pro / 3rd-Party IRE Data Source Contract
- **REST payload keys:** `publisher`, `version`, `display_name` (+ optional edition); parent CI identified by `name`; send `sys_class_name` so the CI is not reclassified.
- **Property:** `com.snc.samp.ire.datasource.integration`.
- **Role required:** `sam_developer`.

### 5. Normalization Coverage Numbers Used as Onboarding Gates
- ~85%+ normalization hit rate out-of-the-box on SCCM-class sources.
- ~95%+ after Content Service opt-in.
- Treat as Path-to-Value figures, **not SLAs**; use as gate criterion before enabling `automaticsmrcreation`.

### 6. Organizational MVP Baseline (Carry-Over)
- "80% process and governance, 20% tool"; 80% of spend concentrated in Microsoft, VMware, Adobe, Oracle, IBM, SAP, Salesforce.
- Crawl / Walk / Run phases and the difference between Crawl and Act on First Recon.

### 7. Operational Runbooks Added in Repo
- **Entitlement import contract column map** (table: field, required, notes — see below).
- **Dead-SaaS-connector monitoring** (drift + stale alert designs + dual-auth hazard rule).
- **Hypercare KPI list + thresholds** (job filter `Name starts with SAM`).
- **Rollback/deactivation runbook** (scenario → procedure).
- **Change-control blast-radius rubric** (change × blast radius × CAB flag).
- **Privacy/PII/identity specifics.**
- **Guided Setup vs phase-wise decision at Sprint 0** (and the re-scoping cost).
- **"Found rocks":** maintenance ≠ license, metric-mismatch flips to Unknown, exclude-CI long tail, subscription-without-usage, billing-cycle alignment.
- **Cutover/cleanup:** publishing correction SLA = ≤ 5 business days after validated change; data refresh every ≤ 2 weeks.

### 8. Foundation vs Pro Edition Decision (Irreversible Upgrade to Pro)
Described in repo; not foregrounded on guide.

### 9. CIS/SAM Scope Freeze
- ~85%+ normalization hit rate after opt-in.
- Published-products freeze with re-run of recon for the product set.

### 10. Data-Source Reliability Ranking, Dedup, Stale Installs
- "Brazil Exact / Major / Any" dedup rule naming; dedup job `Software Install Deduplication` / `SAM – Discovery Model to Software Model matching`.

### 11. Entitlement Import Contract Column Map
| Field | Required | Notes |
|---|---|---|
| `license_type` | Yes | Must be chosen before import — it is the entire reconciliation basis |
| `metric_type` | Yes | A mismatch makes the reconciliation result silently `Unknown` |
| `quantity` | Yes | Never overwrite; create true-up rows instead |
| `entitlement_model` → `cmdb_software_product_model` | Yes | Link to the model, not only product string |
| `contract (ast_contract)` reference | Yes | Audit evidence |
| `purchase_order_no` / `invoice_no` | Yes | Audit evidence (esp. for publisher audit defence) |
| `start_date` / `end_date` | Yes | Drives expiry reconciliation and renewal discipline |
| `unit_cost` / `currency` / `cost_center` | Recommended | Basis for optimization and true-up cost calculation |
| `upgrade_right` | Recommended | Controls when a Perpetual entitlement covers an older/newer install |
| `maintenance_only` flag | Recommended | Maintenance does NOT produce compliance for an install by itself |
| `publisher_part_number (PPN)` | Recommended | Lays the cable to Content Library auto-match |
| `allocations: user vs device` (allocations table) | Optional but usually needed | Per-user / per-device metrics collapse without it |
| `source_system` + `source_record_id` | Yes | Idempotency + error handling + dedup |

### 12. Dead-SaaS-Connector Monitoring (Concrete Design)
- **Health baseline snapshot:** capture assigned-seat count + sign-in count per connector every run (timestamped).
- **Drift alert:** if delta between consecutive connector runs is > `X%` (default 20%) without a matching PA/Audit Event, fire notification to `sam_integrator` + integration owner — silent feed failure is the common cause.
- **Stale alert:** if no successful sync in `N` hours (suggest 36h), post to Slack/Email + freeze reclamation rule actions so you don't reclaim seats from a stale feed.
- **Dual-auth hazard:** never attach both SSO and a direct SaaS integration to the same app.

### 13. Hypercare KPIs and Monitoring Signals
- Failed/missed scheduled jobs with `Name starts with SAM` — daily digest.
- DMAP count by norm status — should stabilize within week-1; a sudden drop means Content Service/normalization rule regressed.
- Unlicensed product-result count trend — should trend **down** in pilot; if it grows, normalization or PPN mapping regressed.
- % CIs with owner/location — regression alarm if <40% after data fix.
- Published-product freeze ratio — `published_count` / `in_scope_count`; stable after pilot.
- Time of last successful recon + last successful SaaS sync — SLA-style.

### 14. Rollback / Deactivation Runbook
1. **Software model mismatch** (wrong metric linked to entitlement): create a new version/corrected model, **re-run reconciliation**, verify alignment, and deprecate (not delete) the old.
2. **Wrong license metric on an entitlement:** create a true-up/retirement row on the old entitlement and a corrected entitlement linked to the corrected model; keep both auditable.
3. **Bad normalization rule** (e.g., over-broad pattern rule): disable the rule, re-run "Software Install to Discovery Model" matching, inspect `Match Not Found` delta; canonicalize via Change Record (`CR`) before merge.
4. **Third-party integration garbage data:** disable the IRE datasource connection (`com.snc.samp.ire.datasource.integration` toggled off), **do not** delete the raw installs via the CI table — run the IRE "drop" job to reverse staged data.
5. **Snapshot before model/metric change:** take a `sys_mod_count`/`sys_updated_on` snapshot view — store in an `update_set` level artifact, document in the Change Record. Reconciliation results are computed live; there is no historical versioning built-in.

### 15. Change-Control Blast-Radius Rubric
| Change | Blast radius | CAB? |
|---|---|---|
| Add a new normalization exception (manual normalize) | Low | No (only queue owner approval) |
| Add a pattern rule / wide-net rule | Medium | Owner review + sample-check |
| Create/match a Software Model | Medium | Only if high publisher spend |
| Change license metric group/type on a model | **High** | Yes — re-runs entire publisher position |
| Modify reconciliation subgrouping (`com.snc.samp.recon.group`) | **High** | Yes |
| Change IRE identifier attributes for 3rd-party | **High** | Yes — duplicates risk |
| Disable a SaaS connector | **High** | Yes — drives reclamation eligibility |
| Published-products freeze changes | Medium/High | RCO review + notify stakeholders |

### 16. Privacy, PII, and Identity Specifics for Per-User SAM
- Per-user allocation, reclamation, and SaaS seat mgmt depends on **per-person identity references**. Document whether your organization requires user-concent for usage metering (SCCM/BigFix agent telemetry) and how the choice affects `samp_sw_usage` completeness.
- Pseudonymization/anonymization strategy for cross-instance sharing of pilot data.
- Document a retention window for `samp_sw_usage` (last-used evidence) that satisfies your regulatory baseline — SAM does not impose one.
- Owner (`managed_by`/`assigned_to`) of CI should be a standardized field — recommend naming one source of truth (Discovery vs HR).

### 17. Guided Setup vs Phase-Wise Decision at Sprint 0
- **Guided Setup** (OOB wizards) is fine for SAM Foundation, single-publisher initial scope. It will not scale to 10+ publishers or custom integration IDs.
- **Phase-wise with published-product freeze** (`com.snc.samp.manage.published.products` enabled, recon re-run) is required for any MVP that wants defensible reconciliation within the pilot window.
- Document this decision **at Sprint 0**, not at Walk phase; re-scoping mid-flight from guided to phase-wise resets the normalization baselines.

### 18. "Found Rocks" Not Called in the Repo's Lists
Small but exam/operational-relevant items not found in any cited final doc:
1. `com.snc.samp.automaticsmrcreation` off in Crawl (Office Hours) — mentioned, good; but **no note** that it should be turned on only once a normalization hit-rate ≥ claimed 85%+ — say so.
2. `com.snc.sam.auto_suite_inference` (false default) — the condition for turning it on (after suite hierarchies verified in Content Library) is not in any doc.
3. `license_metric_type` stored on *both* model and entitlement; mismatch → `Unknown` (not `Not counted`) — subtle pair any test should include ("change metric on model only and watch result flip to Unknown").
4. Exclude-CI flag + `SAM — Adjust Installs for excluded CIs` job: long tail — once excluded, installs are *not* hard-deleted immediately; reconciliation continues to see them until that job runs; recommend scheduling it post-exclusion in the same control.
5. `sam_spend_import` role + "Load Spend" UI16 deprecated — both noted, but the modern path (Spend store app) is not given a decision-criteria note.
6. "Treat first reconciliation as data-quality loop, and **never as a true-up invoice**" is repeated twice but **no SLA-like statement** (e.g., at most one re-trim cycle per quarter in the first 6 months) — consider adding to Crawl success metrics.
7. Content Service opt-in default OFF is clearly mentioned, but the technical "what triggers outbound traffic" (regional Content Service endpoint, licensing for anonymized telemetry) is absent — worth a footnote for data-residency reviewers.
8. Subscriptions without usage data (manual subscription): many implementers create dummy/placeholder SaaS entitlements; the docs should gate usage-before-position.
9. Suite parent-child publish warning is mentioned ("warns to include parent/children") but no procedure for unpacking a suite into constituents after publish — worth a "do not publish a top-level suite for a pilot" note.
10. ServiceNow Subscription billing: the system calculates over-consumption and bills; reclamation timing vs. the billing cycle needs a defined run-window alignment, or you get billed for reclaimed seats anyway.

### 19. CIS-SAM Curriculum vs DOC Open Questions Cross-Reference
- Which questions overlap, which are unique to each source.

### 20. All UNVERIFIED Items Consolidated into One Place
- Both the repo final docs and the SAM guide page confess instance-dependence; a consolidated list would be helpful.

### 21. CIS-SAM Quiz Items Mapped to WT1 Section Numbers
- Exam/interview prep material; useful for training new admins.

### 22. Ask-a-Ranger Video List (Community Resource Links)
- Not in repo scope, but useful adjunct.

### 23. Success Portal Widgets / Maturity Model
- Completed goals, actual vs projected savings, health checks passed, value-builder tasks, Crawl/Walk/Run maturity items.

### 24. Coverage Matrix (WT1/Grok/LG Comparison)
- Table of what's documented where, with gap priorities.

### 25. Anti-Patterns (Full List from Both Sources)
- The guide page carries a common-mistakes section; the repo's 19-item anti-pattern list is more complete.

---

## Recommended Additions to the SAM Guide Page

### A. Add a Carry-Over Addendum to `docs/modules/sam/sam-guide.md`
Capture Direction A items. This is an additive documentation change; safe to apply without altering earlier exam content.

### B. Add a SAM Implementation Checklist
See items 11–17 above; include:
- Entitlement import contract column map
- Dead-SaaS-connector monitoring design
- Hypercare KPIs and thresholds
- Rollback / deactivation runbook
- Change-control blast-radius rubric
- Privacy/PII/identity notes
- Sprint 0 decision framework (Guided vs phase-wise)

### C. Mirror Direction B Gaps into This Repo
Add `final/FINAL_SAM_LAB_RUNBOOK.md` to `ALT_PARALLELSWARM_SAM` with lab steps, reusable snippets, mnemonics, quiz items, and migration guidance.

### D. Add an Entry to the Learning Protocol Repo
Surface `ServiceNow_Learning/docs/modules/sam/sam-learning-map.md` on the public site, pointing back to this guide and to `ALT_PARALLELSWARM_SAM` as the configuration reference.

---

**Bottom line:** The SAM guide page is a learner-facing exam guide; the `ALT_PARALLELSWARM_SAM` repo is a configuration/Discovery reference. Bridging the two requires:
- Adding the repo's operational runbooks and role/plugin precision to the guide page.
- Adding the guide's lab steps, mnemonics, quiz, and reusable code snippets to the repo's final docs.

Both repositories are now annotated with bidirectional gap documentation for maintainer review.

*Documented for parity with the bidirectional coverage gap analysis. See also: `ServiceNow_Learning/docs/modules/sam/cross_ref_sam_guide_coverage.md` and `ALT_PARALLELSWARM_SAM/direction-b-gaps.md`.*