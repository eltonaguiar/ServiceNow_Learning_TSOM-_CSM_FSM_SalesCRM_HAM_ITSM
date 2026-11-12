# 2026-11-12 — ITSM depth, City-test integration patterns, and cross-cutting navigation

## What was broken / missing

Three separate problems, all surfaced by the gap analysis:

1. **ITSM guide had no Major Incident Management treatment.** It was a single sentence — "a separate process for high-impact outages" — with no distinction between priority (a form value) and declaration (a business event). Both the City of Toronto Systems Integrator test and the CIS-ITSM exam domain 1 expect the workflow: Major Incident Manager, bridge, comms plan, post-incident review.

2. **Change Management was a four-bullet list.** No CAB-vs-ECAB distinction, no approval-path table, no lead-level framing about pushing change volume to standard changes, and no mention of the CI/blackout-window collision check that the City test asks about.

3. **Two duplicated "📺 Visual & Video Guides" sections with empty `src=""`.** Both blocks rendered a broken iframe and a dead "Fallback link: [ITSM Demo]()" on the live page. The same content was pasted twice, one directly after the other.

4. **`docs/cross-cutting.md` had been rewritten with 10 new sections but was effectively invisible.** It was reachable only from a single bullet in `index.md`'s Additional Resources, not from the topnav or sidebar, and it had never appeared in any navigation before.

## What changed

### `docs/modules/itsm/itsm-guide.md`

**Added `### 🚨 Major Incident Management (MIM)`** under Process Deep Dives, after Incident Management:

- A comparison table: normal incident vs major incident across who drives it, cadence, comms, coordination, and exit criteria.
- Platform mechanics: `major_incident_state`, the `major_incident` flag / candidate records, comms plans generating stakeholder tasks, the bridge recorded on the record, and the post-incident review that feeds Problem/Change.
- An interview framing paragraph: severity ≠ declaration; a P1 in one department may not be major; a public-facing outage is major regardless of ticket count.

**Rewrote `### ⚙️ Change Management`** as a table plus prose:

| Change type | Approval path | Risk | Typical use |
|-------------|---------------|------|-------------|
| Standard | Pre-approved, templated | Low | Monthly patching, routine config |
| Normal | Assessed, CAB-reviewed | High | New deployments, infra changes |
| Emergency | ECAB, expedited | High | Fixing a production outage |

Plus: CAB membership, ECAB as the on-call subset, blackout windows, the lead-level point about promoting repeated Normal changes to Standard, CI collision + blackout-window detection, and change tasks gating the Implement state.

**Replaced the two broken video sections** with `## Integrations for Legacy / Public-Sector Environments`:

| Pattern | How it works |
|---------|--------------|
| JDBC / ODBC data source | External DB → MID Server → import set → transform map (coalesce) |
| SOAP web service | Legacy SOAP endpoint, basic auth / WS-Security, MID Server for on-prem |
| Flat-file transfer | Nightly drop picked up by a MID probe, parsed into an import set |
| REST Message | Modern outbound, OAuth 2.0 preferred, basic auth still common in legacy vendors |
| Flow Designer vs Workflow | Flow Designer current; Workflow Studio legacy — maintain, don't start new work |

Closed with the data-migration shape: import set (staging) → transform map (field maps, transform scripts, coalesce on legacy key) → target table, and the explicit statement that coalesce is the duplicate-prevention mechanism.

**Updated the Contents block** to drop the now-deleted `📺 Visual & Video Guides` anchor and add the new legacy-integrations anchor. Also expanded the Process Deep Dives entry into a one-line sub-list of all six process sections.

### `_layouts/default.html`

**Topnav:** added `Cross-Cutting` between `JavaScript` and `Getting Started`. It points at `/docs/cross-cutting/`.

**Sidebar:** added `JavaScript Reference` at the end of the Guides group, then created a new **Platform Skills** group containing:

- Cross-Cutting Skills — Integrations · Scripting · Jelly · ATF · Governance
- Interview Prep — Prioritized by interview order
- Learning Paths — Official courses & certifications
- Video Library — Official channels & playlists

Before this, the sidebar had only Guides, Getting Started, and Repository groups — the interview-prep and learning docs were reachable only from `index.md`.

### `index.md`

Expanded the Additional Resources bullet for the cross-cutting guide to name every section it now contains: Integrations, Scripting, Jelly, Update Sets vs Source Control, App Engine & scoped apps, CMDB de-dup & health, Major Incident Management, CAB & change types, JDBC/ODBC via MID Server, Platform Governance & Lead Layer.

### `docs/cross-cutting.md`

No change in this commit — the 10 sections were already written in the prior working tree. This commit only makes them reachable from navigation.

## Verification

- `grep -rn 'src=" title='` across `docs/` and `getting-started/` confirms **zero** remaining empty-iframe defects. ITSM was the only file with bare `src=`.
- `git diff --stat` before commit: 4 files, 191 insertions, 24 deletions.
- Commit `460d8dc` pushed to `origin/main` (`5d9ecf4..460d8dc`).

## Live URLs to check after the Pages build

- `https://eltonaguiar.github.io/ServiceNow_Learning_TSOM-_CSM_FSM_SalesCRM_HAM_ITSM/docs/modules/itsm/itsm-guide/` — MIM + CAB sections, no broken iframes
- `https://eltonaguiar.github.io/ServiceNow_Learning_TSOM-_CSM_FSM_SalesCRM_HAM_ITSM/docs/cross-cutting/` — all 14 sections, now linked from topnav
- `https://eltonaguiar.github.io/ServiceNow_Learning_TSOM-_CSM_FSM_SalesCRM_HAM_ITSM/` — new Platform Skills sidebar group

## Interview mapping

| Gap analysis item | Where it now lives |
|---|---|
| Major Incident Management | ITSM guide → Process Deep Dives → MIM |
| CAB & change types | ITSM guide → Change Management (table + lead-level framing) |
| JDBC/ODBC via MID Server | ITSM guide → Legacy Integrations; also cross-cutting |
| Flow Designer vs Workflow | ITSM guide → Legacy Integrations; cross-cutting has the full comparison |
| Import sets, transform maps, coalesce | ITSM guide → Legacy Integrations; cross-cutting has the deep treatment |
| Jelly | `docs/cross-cutting.md` → Jelly |
| Update Sets vs Source Control | `docs/cross-cutting.md` → Update Sets vs Source Control |
| App Engine & scoped apps | `docs/cross-cutting.md` → App Engine & Scoped Applications |
| CMDB de-duplication & health | `docs/cross-cutting.md` → CMDB De-duplication & Health |
| Platform governance & lead layer | `docs/cross-cutting.md` → Platform Governance & Lead Layer |
