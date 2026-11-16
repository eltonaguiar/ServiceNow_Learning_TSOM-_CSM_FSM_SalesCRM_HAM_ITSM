# SAM guide — compliance troubleshooting matrix + one-page cheat sheet

**Date:** 2026-11-16
**Page:** `docs/modules/sam/sam-guide/` (published: <https://eltonaguiar.github.io/ServiceNow_Learning_TSOM-_CSM_FSM_SalesCRM_HAM_ITSM/docs/modules/sam/sam-guide/>)
**Companion notes:** `docs/modules/sam/publisher-packs-validated-notes/`

## What was missing

Two review-driven gaps after the metric-group and metric-attribute passes:

1. **No diagnostic path.** The guide explained what a compliance position *is* and listed six generic "what breaks reconciliation" symptoms, but nothing mapped a specific wrong number to the input, attribute or setting that produced it. Readers could describe the arithmetic and still not debug an instance.
2. **No condensed reference.** Groups, metrics, attribute defaults and arithmetic live in four separate sections; there was no single artifact to print or skim before a reconciliation run or an exam.

## What changed

### 1. `### Troubleshooting a wrong compliance position` (Reconciliation section)

Placed directly after the existing "what breaks reconciliation" table so the shallow list leads into the deep one.

- **Triage order** — three questions against the arithmetic: did `demand` move, did `required` move while demand held, did `active_rights` move while demand held. Prefixes the table because a symptom without a moved term is not a diagnosis.
- **A 21-row matrix** — columns `What you see` · `Term that moved` · `Most likely cause` · `Proof to collect` · `Fix`. Covers: unlicensed-with-installs, demand zero against visible installs, allocation-based named metrics, Common-vs-Microsoft per-core floors, the SQL 4-per-socket floor, the OSE cap swallowing extra OSEs, Windows per-VM licensing, Oracle NUP minimums, `oracle.reconlevel` boundary jumps, missing Oracle core factors, VMware 16-core floor and 32-core divisor, IBM sub-capacity without ILMT, Red Hat metrics behind the IBM pack, SAP named-user types, Adobe `Allocated not in use`, empty Citrix positions, run-to-run flapping, two dashboards disagreeing, post-upgrade shifts from the retired Per Core metrics, and exclusions masquerading as compliance.
- **"Not a bug — do not fix these"** — SQL 4/socket, VMware 16-core floor, Oracle edition minimums, cluster boundary. Named explicitly because each has a plausible-looking "fix" (set the attribute to 1) that destroys the number.
- **Escalation pack** — the five items to capture before escalating: reconciliation timestamp, model **and** metric, non-default attributes with justification, entitlement rows with dates and quantities, demand broken out by discovery source.

### 2. `## One-Page Cheat Sheet — Groups, Metrics, Attributes, Arithmetic`

New top-level section at the seam between Publisher Packs and Reconciliation, in the table of contents.

- The chain in one line: pack → group → metric → attributes → demand → required → active_rights → position.
- Group → pack/plugin → metrics you meet → governing rule, for all 12 groups including Subscription/Consumption, Custom and CrowdStrike.
- The arithmetic in five lines (demand / required / active_rights / delta / position).
- Knob defaults table: only the values that change an answer, each with the formula it plugs into.
- Hardcoded list (VMware 16-core floor, VVEP 3 × 2 × 32, Oracle/IBM core factors).
- Position → what you may say, with a "do not say" column ("it's close enough", "we're safe forever", "compliant" for Unknown).
- Seven sentences worth memorising, each already argued in a full section.

Both sections are cross-linked from the cheat sheet preamble to the three sections it condenses, and both were added to the Contents list.

## Why it is safe to publish

No new platform claims were introduced. Every row routes to a fact already validated in `publisher-packs-validated-notes.md` (S1–S18); the notes page gained a **routing table** that states, row by row, which validated source each diagnostic rests on, and separately labels what is the guide's own framing — the demand/required/active_rights triage order and the "not a bug" list are pedagogy, not ServiceNow statements. Two rows are flagged as heuristic/unverified rather than dressed up: run-to-run flapping (no single page states the cause) and "two dashboards disagree" (the `recon.group` default is validated, the per-model×metric framing is ours).

The cheat sheet deliberately omits CrowdStrike consumption internals, IBM's full Australia Patch 6+ metric list and SAP document multipliers — compressing them onto a card would invite misquotation.

## Verification

- **Anchor integrity:** link/anchor diff against `git show HEAD:docs/modules/sam/sam-guide.md` — links 96 → 102, headings 128 → 130, unresolved stayed at 4 (all pre-existing: the mnemonic and experimental-track headings whose anchors contain `=`), **zero newly broken**. Both new anchors resolve in the rendered HTML: `#troubleshooting-a-wrong-compliance-position`, `#one-page-cheat-sheet--groups-metrics-attributes-arithmetic`.
- **Markdown structure:** code-fence parity, per-table pipe consistency on both new tables (5-column matrix, 4-column group table, 4-column knob table, 4-column position table).
- **TOC:** both entries present, and both target headings exist in the body.
- **Rendered page:** GitHub Pages build `success`; guide and notes both HTTP 200; live greps for the new headings, `Minimum cores per server`, `Maximum active OSEs per server`, `com.snc.samp.oracle.reconlevel`, `Allocated not in use` all return matches.
- No changes were made to any other page, and the pre-existing inconsistent table in the experimental-tracks section was left alone.
