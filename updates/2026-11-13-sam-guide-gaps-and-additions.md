# SAM guide — gaps and proposed additions

**Author:** `kilo-sam-deepdive__kilo__cli` · **Date:** 2026-11-13
**Stamp:** 2026-11-13T15:44:29Z · **run-id:** `4178ec70-e3f5-4bc9-a0ab-9c7cdb2acf25`
**Target page:** `docs/modules/sam/sam-guide.md` (published at <https://eltonaguiar.github.io/ServiceNow_Learning_TSOM-_CSM_FSM_SalesCRM_HAM_ITSM/docs/modules/sam/sam-guide/>)
**Verification:** live page fetched 2026-11-13 and confirmed byte-identical to the repository file (1,074 lines). Findings below apply to the published page.

**Sources:** official ServiceNow product documentation (Brazil ITAM map + Australia pages) cross-referenced by the `alt_parallelswarm_SAM` fleet; see `research/servicenow-sam/CURRICULUM_FINDINGS.md` and `BIDIRECTIONAL_GAP_DIFF.md` in that repository.

> Status: **proposed, not applied.** This note documents corrections and additions for maintainer review.

---

## 1. Factual corrections (high priority)

| # | Current text | Correction |
|---|---|---|
| E1 | Usage table `cmdb_sam_sw_usage` | **`samp_sw_usage`** (product-level; reclamation types Total Usage Time / Last Used Date) |
| E2 | Reconciliation result `sam_sw_reconciliation_result` | **`samp_reconciliation_result`** parent; three tiers Product Results → Software Model Results → License Metric Results (`samp_license_metric_result`) |
| E3 | Reconciliation "default nightly" | **Weekly default; on demand** per publisher/group/subgroup |
| E4 | "SUMN (Software Usage and Normalization Mapping)" | Not an official term; use **Content Library normalization** + `SAM - Normalize discovery models using content library rules` |
| E5 | Menus need `com.snc.sams` (Pro) + `com.snc.iam` | Foundation `com.snc.sams`; Professional `com.sn_samp_master_ws` / `com.sn_samp_master` / `com.snc.samp`; `com.snc.iam` is unrelated |
| E6 | Sample business rule writes `software_model` on install | The OOB business rule matches **discovered publisher + product + version** against the **discovery model** |
| E7 | Breadcrumb root `All > Software Asset Management` | `Workspaces > Software Asset Workspace`; classic `All > Software Asset > …` / `All > Software asset > …` |
| E8 | `license_metric_type`, `normalized_software_model`, `compliance_state` | Not confirmed in official docs — mark UNVERIFIED or replace with documented field sets |
| E9 | Six compliance states incl. "Unknown" | Two published statuses (**Compliant / Not Compliant**); unlicensed installs and rights needed are the exposure signals |
| E10 | Result fields `entitlement_count` / `install_count` | Documented fields: Rights owned / Rights used / Rights available + allocation breakdown + Rights needed |

Also: label all sample scripts (BR, scheduled job, script include, client script) as **illustrative, not out-of-box**, and remove custom fields from any "expected" listing.

---

## 2. Content gaps to add

The page is strong on concepts but lacks the operational layer administrators need.

| # | Addition | Why it matters |
|---|---|---|
| A1 | **Out-of-box component inventory** — scheduled jobs (`Name starts with SAM`), the install→discovery-model business rule, reconciliation script includes (Yokohama move to `com.sn_itam_samp`), flows | Feature lists cannot be audited; admins need the shipped-object inventory |
| A2 | **Parameter quick reference** — Tier 0 go-live blockers (auto-create off, published products, exclude-device flag, recon grouping), Tier 1 tuning, pack-specific tunables | No property guidance exists today; these decide whether results are trustworthy |
| A3 | **License Position / LMR result fields** — rights owned/used/available, Allocated in use / Not allocated in use / Allocated not in use / Nontransferable rights, Rights Needed By | The page has no result-field reference |
| A4 | **Normalization mechanics** — statuses, rule families (Product/Package Map, Pattern, Enhanced Pattern, Wide-net, ML), revert rules, suggestions, matching-job algorithm + manual lock | Page says only "SUMN normalization" without mechanics |
| A5 | **Software-model creation procedure + PPN resolution scenarios** | Page omits how models are created and matched |
| A6 | **Usage & reclamation data model** — `samp_sw_usage`, Total Usage Time / Last Used Date, CI-retirement deletion, flow timeout 30 days, suite-parent behaviour | Reclamation described conceptually only |
| A7 | **Duplicate/stale hygiene controls** — dedup levels + custom rules, Active flag, REST uninstalled-install delete, exclude-CI flag, Security Update exception | Duplicates mentioned once, no controls |
| A8 | **CMDB/IRE governance cross-reference** — identification / IRE data source / reconciliation / data refresh rules; insert gate | Page ignores IRE entirely |
| A9 | **Plugin tier split** — Foundation vs Professional vs SaaS LM; workspace activation hides classic UI; classic-only menus | Plugin tip is wrong/incomplete |
| A10 | **Operations surface** — activity-center alerts with source tables, health-check suites, success portal maturity, renewals calendar, overlapping usage | Dashboard list is generic |
| A11 | **Content Service toggles & product-suggestion consolidation** | Absent |
| A12 | **Insert-vs-update decision matrix + duplicate-prevention layers** | Absent |

---

## 3. Keep, clearly labelled as practice (not vendor defaults)

- Optimization priority order and the 60–90 day reclamation window.
- Indicative KPI targets (keep the "indicative" label).
- Entitlement hygiene (one entitlement per contract line; never overwrite quantity; maintenance ≠ licence; metric mismatch is silent).
- Publisher trap table, SaaS assigned-vs-active guidance, dead-connector warning, day-one report definitions, lab and memory aids (with corrected names/paths).

---

## 4. Suggested placement

1. Apply corrections E1–E10 first (small edits, no structural change).
2. Add a new "Operational Reference" section containing A1–A12, or link to the fleet's `final/FINAL_kilo-sam-deepdive.md` for the full detail.
3. Mark practice guidance explicitly as non-normative so it is not confused with documented defaults.

*Prepared from the `alt_parallelswarm_SAM` fleet research; no changes applied to this repository beyond this note.*
