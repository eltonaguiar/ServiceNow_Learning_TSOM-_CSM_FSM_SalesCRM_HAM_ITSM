# Docs-wide structural sweep: swallowed headings, dead anchors, broken tables

**Date:** 2026-11-16 · **Repo:** `eltonaguiar/ServiceNow_Learning_TSOM-_CSM_FSM_SalesCRM_HAM_ITSM` · **Scope:** all 35 markdown files under `docs/`

## What was broken

Found by sweeping every guide for unclosed code fences, anchor links with no matching heading, and tables whose rows disagree on column count.

1. **Two guides rendered whole sections as code.** A `mermaid` block was opened and never closed, so everything after it — headings included — rendered as one code block:
   - `docs/modules/hrsd/hrsd-guide.md`: two blocks swallowed `### HR Service to COE Data Segregation` and `### Employee Center Request Intake Flow`. Their diagrams, and the prose after them, were invisible as prose.
   - `docs/modules/other/other-guide.md`: a block opened at line 1393 swallowed 22 headings — the whole of `## 6. ServiceNow Integration Breadcrumbs` onward, including every subsection, through `## Quick Glossary`.
   - (The HAM equivalent was already fixed in `d747734`.)
2. **152 TOC anchors pointed at the wrong slug.** The generator turns an em dash into `--`, drops `=`, backticks, `?`, `+`, `↔` and emoji, and keeps the leading hyphen an emoji leaves behind. Links written by hand did not match: `#order-vs-priority--lower-=-first` vs the real `#order-vs-priority--lower--first`, `#memory-aids--mnemonics` vs `#-memory-aids--mnemonics`, `#worked-example-\`supermanexe\`...` and so on. Every one was retargeted to the heading that actually exists on the same page.
3. **Four TOC entries pointed at sections that do not exist.** Removed rather than linked to nothing: `SLA Lifecycle and Priority Matrix` (ITSM), `Diagram 6: Flow Designer + IntegrationHub…` and `How These Fit With ServiceNow` (other-guide, two occurrences of the latter).
4. **21 malformed tables.** Three patterns: a doubled edge pipe (`|| Mistake | Symptom | Fix |`, or a row ending `||`), a separator row with one column fewer than its header (the table silently loses a column), and a short row missing a cell. Plus one row whose inline code contained `||`, which split the cell. All normalised to the column count the table's own body uses.
5. **`## Where to Find It` in CSM/FSM/ITSM** had `||` on the header and on the first data row; both fixed.

## Answer sheet added

`docs/modules/sam/sam-guide.md` — `### Answer sheet — instructor copy`, a collapsed `<details>` block with a 7-row marking key (term that moved · proof to accept · fix that scores · predicted post-fix · how the drill is usually missed), the 4-point-per-drill rubric, and the rule that a submitted fix of "re-run reconciliation" scores zero. Predictions are explicitly directional, because absolute numbers are instance-specific.

## Verification

Sweep re-run over all 35 files after the repairs:

| Check | Before | After |
|---|---|---|
| Unclosed fences | 1 file (hrsd region) + other-guide | 0 |
| Anchor-referenced headings inside a code block | 3 blocks (hrsd ×2, other-guide ×1) | 0 |
| Files with unresolvable `](#…)` links | 18 | 0 |
| Malformed table blocks | 21 | 0 |

Plus: Pages build green and live-page greps for the restored headings and the new answer sheet.

## A failed first attempt, recorded

The first repair pass used a heuristic that treated any line matching `^#+ ` inside a fence as a heading. Shell-style `# comment` lines inside JavaScript and YAML samples matched, so it inserted closing fences inside legitimate code blocks; parity then flipped and the damage cascaded through 15 guides. It was detected by re-running the sweep, and `docs/` was restored with `git checkout -- docs/` before redoing the work with a rule that only closes a block when the swallowed line is a heading **that a TOC link on the same page points at**. The damaged attempt is preserved in `git stash@0` (`wip-structural-sweep-corrupt`) — do not apply it.

**Lesson:** never bulk-edit fences with a line-pattern heuristic; anchor the repair to a verifiable claim (a link that must resolve) and re-measure after every pass.
