# SAM publisher packs — validated against primary docs, 4 corrections applied

**Date:** 2026-11-16
**Files changed:** `docs/modules/sam/sam-guide.md`, `docs/modules/sam/publisher-packs-validated-notes.md` (new)
**Follows:** `updates/2026-11-16-sam-publisher-packs.md` (the section that was added first)

## What prompted this

The publisher-pack section was drafted from the `ALT_PARALLELSWARM_SAM` research corpus, which carries its own **V/C/U** confidence legend. A guide cannot inherit someone else's confidence markers, so every claim was re-checked against ServiceNow's public Brazil-release pages, and the result is now published as a validation log next to the guide.

## What changed

### Corrections to the guide (4 factual, 6 additions)

| # | Was | Now |
|---|---|---|
| 1 | Oracle NUP minimums "a contract term SAM does not enforce for you" | **Wrong.** Minimums are applied automatically through metric attributes; rights = larger of (minimum × cores) vs (users + devices). Edition table added: SE 5, SE2 10/db + 16 CPU-thread cap, EE 25/processor, WebLogic SE 10/processor, WebLogic EE/Suite 10/core, with the official 25 × 8 = 200 example |
| 2 | IBM sub-capacity "requires evidence" | PVU/RVU/VPC are **only supported** when integrated with ILMT, BigFix Inventory or an authorised CVA provider; VPC additionally needs integration API **v2**; added the discovery-tool matrix |
| 3 | "Metric group need not match the publisher" presented as an official rule | Not stated on any Brazil page re-checked. Reworded to the documented behaviour (group auto-populated from the software model, metric options follow the group) plus the practical warning that counting follows the metric |
| 4 | IBM `default_region` described as a plain setting | Also requires the IBM License Compliance app; IBM usage only calculates for hosts with a region |
| 5 | — | VMware: VVEP caps at 3 hosts × 2 processors × 32 cores; vCenters in VVS/VVEP are inferred suite components and consume no rights |
| 6 | — | SAP Digital Access document multipliers (material/financial 0.2, others 1.0) with the 10+10 → 12 example |
| 7 | — | SAP metric naming: Public Edition = `User Subscription` (renamed in Brazil), Private Edition = `Full Usage Equivalent` |
| 8 | — | Citrix: Application Group mapping overrides Delivery Group mapping when both exist |
| 9 | — | Microsoft: cluster is the calculation boundary but the allocation unit is a host or VM, "not to cluster" — both pages cited |
| 10 | Property table defaults without provenance | Guide now footnotes provenance; `use_component_licenses` annotated as unverified |

### New page: `docs/modules/sam/publisher-packs-validated-notes.md`

A validation log for the whole pack section:

- **Status legend** (Validated / Corroborated / Unverified) with the rule that *Validated* means the statement is readable in a linked Brazil page.
- **10 sources** with URLs and their page dates.
- **Pack matrix** — plugin IDs, all now sourced to the pack page that names them.
- **Per-pack validated notes**: Adobe, Citrix, IBM (+Red Hat), Microsoft, Oracle, SAP, VMware, SaaS LM (Subscription/Consumption incl. CrowdStrike), Engineering Applications, Common — each with the counting rule, the validated traps, and an in-instance check.
- **Property table** with validated defaults and the page each came from.
- **Corrections table** (the 10 rows above) so a future reader can see what the first draft got wrong.
- **Contradictions inside ServiceNow's own docs** — the Per Core (with CAL) cluster/allocation conflict, and the IBM region-property prerequisite.
- **Deliberately not asserted** — the unverified claims (`use_component_licenses`, `samp_oracle_options` gating, the 4-core SQL minimum as a ServiceNow behaviour, `alm_license.license_metric_type`, corpus-only plugin IDs, and correction 3).
- **Re-validation recipe** for the next release.

## Verification

- Live docs fetched 2026-11-16: S1–S10 all returned HTTP 200 and Brazil text (pages dated 2026-09-10, properties page 2026-03-12).
- Guide: every patch anchor asserted to occur exactly once; 261 → 300+ lines; anchors re-checked as a before/after diff — **zero newly broken TOC links**; fences balanced; tables pipe-consistent.
- New page: fence and table consistency checked; linked from the guide's release-pin note via `../publisher-packs-validated-notes/` (directory-style relative link, matching the existing `../ham/ham-guide/` convention).
- Pages build after push: the guide and the new notes page both return 200 with the corrected Oracle minimum table and the validation-log tables rendered.

## Second pass (same day) — arithmetic, the 10-percent myth, and the gap sweep

Triggered by two review comments: the one-line compliance formula was too vague to debug with, and the guide's diagram referenced a "10% rule" that a training video correctly calls a myth.

### Guide additions

1. **Reconciliation arithmetic, spelled out.** The one-line `f(...)` is kept as a summary but replaced as an explanation: `demand → required = metric_rule(demand) → active_rights → delta`, a five-input table (entitlement quantity, normalized installs, usage evidence, metric, rules — each with source table, computation and failure mode), a 12-row demand-formula table, two worked examples (VMware VVS 72 vs 64; Oracle EE NUP 200 vs 150), and the scope note that a position is per model × metric × reconciliation group.
2. **Cadence correction.** "Default nightly" → **weekly by default**, on-demand available (S10, S8).
3. **New subsection: "The 10-percent rule that is not a rule: soft partitioning."** States plainly that no percentage exists, explains where the folklore comes from, and replaces it with the validated vMotion boundary table (ESXi 5.0 / 5.1–5.5 / vCenter 6.0+), affinity caveat, Nutanix AHV, and the approved hard-partitioning list. Includes an ELI5 (building with 20 flats; walls on wheels) and five actions that actually reduce the count.
4. **New section: "Gaps Closed — Depth That Was Missing."** Six mechanisms that were absent: derived entitlement states + BYOL/License Included; Microsoft **Rights per license pack / Number of packs** and non-transferable rights; the Brazil **License Metric Tier** tab; the two reporting surfaces (Software Publisher Analytics vs publisher overview vs License usage view); allocation management + realized-vs-potential savings; and a six-point pre-reporting health check.
5. **Diagram fixes beyond the 10% node:** Adobe Document Cloud no longer claims "per-document pricing" (Adobe has no per-document metric); the IBM branch is wired to its own feed check (ILMT/BigFix → metrics available vs unavailable) instead of dangling.

### Notes page additions

- Sources S11 (soft-partitioned environments), S12 (entitlement fields), S13 (release notes).
- A validated soft-partitioning section quoting the host/cluster rule, the vMotion boundary table and the affinity wording.
- Corrections 11–13 recorded.
- The 10% rule added to *Deliberately not asserted*, marked false/folklore rather than unverified.

### Verification

- Structural checks re-run: TOC anchors before/after diff (zero newly broken), fence balance, per-table pipe consistency in the new blocks.
- Live pages after deploy checked for the new headings and the worked-example numbers.
