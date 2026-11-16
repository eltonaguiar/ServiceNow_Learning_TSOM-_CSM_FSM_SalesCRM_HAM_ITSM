# SAM diagnosis lab + missing-metric tree, mirrored into HAM

**Date:** 2026-11-16
**Pages:** `docs/modules/sam/sam-guide/`, `docs/modules/ham/ham-guide/`
**Companion notes:** `docs/modules/sam/publisher-packs-validated-notes/`

## What was missing

1. **The troubleshooting matrix was readable but not trainable.** A reader could agree with every row and still freeze when handed a wrong number, because nothing asked them to diagnose a case with the answer hidden.
2. **The metric picker had no recovery path.** The guide explained which metrics exist per group and warned that a missing pack hides them, but a reader whose picker was empty or short one metric had no ordered checks — only an explanation.
3. **HAM had none of it.** The SAM guide had gained a cheat sheet, a troubleshooting matrix and a lab; HAM still had a single eight-row "Common Mistakes" table and a build-it-once lab. The transferable half — symptom → what moved → proof → fix, and "the value you need isn't available" — has a HAM equivalent that was simply absent.

## What changed

### SAM — `### When the metric you need isn't in the picker`

Placed at the end of the publisher-packs metric content, immediately before the soft-partitioning subsection.

- Separates **empty picker** (cascade broken upstream) from **one metric missing** (renamed, retired, wrong pack) — the same complaint with different fixes.
- A mermaid decision tree for both branches.
- Seven ordered checks that stop at the first "no": model present → model carries a metric → which group the field shows → pack installed and licensed → metric retired/renamed → metric lives in another vendor's pack → custom metric.
- A "what the picker is telling you" table mapping five sights to readings.
- Three tempting wrong fixes: substituting a Common metric, editing the model's metric to force the picker, and calling a custom metric audit-grade. Each fills the field and produces a false number.
- Two legitimate outcomes: install the pack and re-baseline, or record the entitlement **out of scope** with a reason — instead of inventing a metric.

### SAM — `## Lab: Break It on Purpose — Seven Diagnosis Drills`

New top-level section after the existing happy-path lab, in the Contents list.

Seven drills, each broken deliberately then diagnosed blind: wrong metric group; unnormalized discovery records; expired/on-order entitlement; lowered core floor; the third OSE against a cap of 2; per-named-user demand with assignments but no allocations; and a capstone that combines three faults into a clean "Compliant, zero deltas" screen. Answers live in collapsible `<details>` blocks (matching the existing "Check yourself" convention) and state **moved term · proof · fix · reset · why it catches people**. A 28-point scoring rubric, ground rules, and a lab-hygiene checklist close it.

### HAM — troubleshooting, missing-value tree, and a three-drill lab

- `## Troubleshooting HAM Records` — 11-row matrix (symptom · what it means · check · fix) after "Common Mistakes", plus the three checks to run before escalating: state/substate, links, model.
- `### When the state or model you need isn't available` — decision tree plus notes: states are instance data that vary by release (Rome is numeric 1–11), adding a state has downstream reach in reports and filters, a model that will not appear is usually a lifecycle phase, and a missing field is almost always the category.
- `## Lab: Break Three Records, Diagnose the Symptom` — no category (fields vanish), duplicate tag (one device, two objects), ghost asset (retirement recorded, linkage never moved). Each with a hidden answer and a reset.

## Why it is safe to publish

No new platform claims. The SAM additions route entirely to facts already validated in the notes page, which gained a **provenance table** for them: eight rows Validated, one Corroborated, and the "a custom metric carries no counting rule of its own" statement explicitly marked **Unverified** and labelled as such in the guide. Drill predictions are arithmetic over validated attributes, marked "derived, not quoted".

The HAM section repeats nothing that page did not already assert — its opening line says so, and every row is drawn from the existing state table, fields table, discovery deep dive or Common Mistakes list. It does not claim state transitions are enforced, does not assert ACL behaviour, and does not invent substates.

## Verification

- **Anchors:** link/anchor diff against the previous commit. SAM unresolved set unchanged (4 pre-existing, all in mnemonic/experimental headings containing `=`); both new SAM anchors resolve (`#when-the-metric-you-need-isnt-in-the-picker`, `#lab-break-it-on-purpose--seven-diagnosis-drills`), as do both new HAM anchors (`#troubleshooting-ham-records`, `#when-the-state-or-model-you-need-isnt-available`, `#lab-break-three-records-diagnose-the-symptom`).
- **Structure:** fence parity even in both files; every new table pipe-count uniform per table; the two `<details>` answer sets match one opening per closing.
- **Rendered:** GitHub Pages build success; SAM and HAM pages HTTP 200; live greps for the new headings, "Break it on purpose", "Custom License Metrics", "Break Three Records" and "Troubleshooting HAM Records" all return matches.
- **Not fixed, deliberately:** the pre-existing `||` header rows in HAM's "Common Mistakes" and "Goals, Benefits & Key Metrics" tables, and the unresolved `=`-containing anchors in both guides. Out of scope for this change; recorded here so the next pass does not re-discover them.
