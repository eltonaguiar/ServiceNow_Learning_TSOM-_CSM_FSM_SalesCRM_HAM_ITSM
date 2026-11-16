# SAM guide — added Publisher Packs & License Metrics section

**Date:** 2026-11-16
**File changed:** `docs/modules/sam/sam-guide.md`
**Published page:** <https://eltonaguiar.github.io/ServiceNow_Learning_TSOM-_CSM_FSM_SalesCRM_HAM_ITSM/docs/modules/sam/sam-guide/>

## What was broken / missing

The guide explained normalization, entitlements and reconciliation well, but never explained **publisher packs** — the per-vendor add-ons that supply the license metrics everything else depends on. Consequences for a reader:

- No list of which packs exist (Adobe, Citrix, IBM incl. Red Hat, Microsoft, Oracle, SAP, VMware), which plugin IDs they are, or that they are a Professional-edition capability.
- No metric inventory per publisher. A reader could not discover that SQL Server per-core uses `Per Core` / `Per Core (with CAL)`, that `Per Core (Physical Core)` and `Per Core (Virtual OSE)` were retired in New York, that VMware `Per Core` has a 16-core-per-processor floor, or that Red Hat metrics come with the IBM pack.
- No mention that a metric group must be present in the instance before it can be selected, and no guidance for what to do when it is missing.
- The *Publisher-Specific Traps* table had one prose row per vendor with no per-metric counting semantics behind it.

## What changed

One new section, `## Publisher Packs & License Metrics (Add-Ons)`, placed between *Entitlements — The Contract Side* and *Reconciliation — The Core Engine*, with:

1. What a pack adds (metric groups, counting rules/reference data, dashboards, pack-scoped properties) plus a mermaid flow from pack → metric group → entitlement → reconciliation result.
2. Plugin-ID table (7 packs + SaaS License Management, Engineering Applications, SAM Professional master, Foundation), with a warning to read the ID from the instance rather than from any guide.
3. Install/verify procedure, including "metric group check first, modelling second".
4. Metric-group matrix: Common, Microsoft, Oracle, IBM, Red Hat, SAP, Adobe, Citrix, VMware, Consumption, Subscription, CrowdStrike — with the one-line counting rule and the plugin gate for each.
5. Per-publisher detail subsections: SQL Server per-core (4-cores-per-socket minimum, core-factor table, cluster/vMotion peak capacity, SA cost-ratio properties, New York deprecation), Oracle (NUP, Employee/Java SE Universal, `reconlevel`, `samp_oracle_options`), IBM (full vs sub-capacity, VPC store app, ILMT, region), SAP (Named User Type from the software model, Digital Access documents, FUE), Adobe (the three User Subscription allocation states), Citrix (distinct user/device across models, Delivery Controller discovery schedule), VMware (32 cores per processor, 16-core floor), Common metrics (allocation requirement, Resource Value for consumption/concurrent), CrowdStrike.
6. Pack-specific property table with defaults and the failure each wrong value causes.
7. Verification snippets (`v_plugin`, `sys_properties`, `alm_license.license_metric_type` distribution), with the UI metric picker declared authoritative.
8. Failure-modes-by-pack table and four self-check questions.

Also updated: frontmatter `Updated:` line, the Contents TOC (new parent + six sub-entries), and a pointer from *Publisher-Specific Traps* to the new section.

## Sources

- `docs/modules/sam/sam-guide.md` (existing content and style).
- `eltonaguiar/ALT_PARALLELSWARM_SAM`:
  - `agents/grok-4.6__xai__kilo/SNC_SAM__WT1/research/raw/software_license_metrics.txt` — ServiceNow *Software license metrics* page (Brazil release, updated 2026-09-10): the metric names, counting descriptions and the "visible only if the X publisher pack is installed" gates.
  - `finalv2/05_FINAL/06_CONFIGURATION_REFERENCE.md` — plugin IDs, pack-scoped properties and defaults.
  - `final/FINAL_SAM_CONFIG_REFERENCE.md` — metric-group table, normalisation statuses, core-factor and properties notes.
  - `agents/grok-4.6__xai__kilo/SNC_SAM__WT1/research/raw/sam_overview.txt` — pack-gated dashboards (Software Publisher Analytics; Office 365 / Adobe Cloud).
- Every release-sensitive claim carries the Brazil pin in the section intro; unverifiable specifics were left out rather than guessed.

## Verification

- `grep -c '^## Publisher Packs & License Metrics'` → 1 section inserted at the intended position (immediately before `## Reconciliation — The Core Engine`).
- Anchor check: a slugifier over all `##`/`###` headings confirms every new TOC link resolves (same failure mode as the earlier "Fix broken TOC anchor links" commit — no emoji in the new headings for this reason).
- Markdown fence balance: total ``` count is even; the added JavaScript blocks close.
- Tables: every new table has a header row plus delimiter row and consistent pipe counts (checked per block).
- Published-page check after the Pages build: the new heading and the SQL Server per-core rows render at the URL above.
