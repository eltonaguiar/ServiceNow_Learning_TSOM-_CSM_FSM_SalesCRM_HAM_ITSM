---
layout: default
title: Foundation — properties, metadata, configuration vs customization
---

# Foundation — the layer under all six modules

Every module guide in this repo assumes you already know this page. It covers the things that
are identical whether you are in ITSM, CSM, FSM, Sales CRM, HAM or TSOM:

1. **System properties** that actually change behaviour
2. **Metadata breadcrumbs** — from "I see a field/button/flow" to the record that defines it
3. **Guided setup vs configuration vs customization** — the decision ladder and upgrade safety
4. **Critical foundation data** — what has to exist before a module works at all
5. **Metrics and dashboards** — what to report, and where the numbers come from
6. **What the success packs say to build** — the artefact set that proves you did it

Module guides: [ITSM](./itsm.md) · [CSM](./csm.md) · [FSM](./fsm.md) · [Sales CRM](./sales-crm.md) · [HAM](./ham.md) · [TSOM](./tsom.md)

---

## 1. System properties that matter

Properties live in **`sys_properties`** (`sys_properties.list`). Read them with
`gs.getProperty('name', 'default')` — never hard-code a value you might want to change per
environment.

### 1.1 Verified platform properties

Names below are taken from the current platform documentation (*Available system properties*,
Brazil/Zurich). Defaults are the documented defaults — check your own instance before quoting them.

| Property | Default | What it changes | When you care |
|---|---|---|---|
| `glide.ui.session_timeout` | 30 (minutes) | Idle timeout for authenticated sessions | Security review; too long fails audits, too short annoys agents |
| `glide.guest.session_timeout` | 30 | Guest/portal idle timeout, independent of the above | CSM/FSM customer portals |
| `glide.guest.active.session.life_span` | 0 (unlimited) | Absolute guest session life regardless of activity | Portal security posture |
| `glide.unauthorized.session_timeout` | — | How long a logged-out session lingers; must be lower than `glide.ui.session_timeout` | Same review as above |
| `com.glide.attachment.max_size` | 1024 (MB) | Max attachment size | Case/incident attachments, FSM photos |
| `glide.attachment.extensions` | empty (no restriction) | Allow-list of attachable file extensions | Blocking `.exe` on a portal |
| `com.snc.task.refresh_impacted_services` | `incident,change_request` | Task types showing **Refresh Impacted Services** | Adding `sn_customerservice_case` so CSM can pull CMDB impact |
| `com.snc.time_card.default_rate` | — | Fallback hourly rate when no rate card matches | HAM/FSM cost reporting |
| `glide.debugger.log.ui` | `Page` | Whether debug logs render under forms or only in the session log | Debugging without leaking logs to users |

### 1.2 Finding the module ones (the honest method)

Module properties are **prefixed by their scope**, so you search rather than memorise:

```
sys_properties.list  →  filter "Name contains"
  glide.                 platform UI/behaviour
  com.glide.             newer platform features
  com.snc.               platform family apps (SLA, CMDB, task, cost)
  sn_customerservice     CSM
  sn_hamp / alm_         HAM
  wm_ / com.snc.wm       FSM
  sn_order_mgmt / sn_prd Sales CRM + order management
  sn_tsom_core / sn_ni_  TSOM / TNI
```

Two faster routes:

- **From a module to its properties:** the product docs have a "Properties" page per app; the
  in-product equivalent is *System Properties → All Properties* filtered by the scope prefix.
- **From a scope to its properties:** `sys_scope` record → related list of the scope's records,
  or `sys_properties.list` filtered on `Private = true` plus name prefix.

**Custom properties:** create them in your own scope (or with a company prefix), never
`glide.`-prefixed, and document them in the same table as the config decision they control.

### 1.3 Property discipline that survives an upgrade

- One property per behaviour. A property called `enable_everything` is a future incident.
- Store environments in the property *value*, not in the *name* (`x_acme.sla_pause_on_hold`).
- Add a description that says **who owns it and why**; the description is the only documentation
  that travels with the record.
- Prefer a property over a hard-coded `if (gs.getProperty(...) === 'true')` scattered in five
  business rules — one read, one place.

---

## 2. Metadata breadcrumbs

Half of ServiceNow work is answering *"where does this come from?"*. This table is the answer key.

| What you see | Metadata record | Where to look |
|---|---|---|
| A field on a form | `sys_dictionary` (`name`=table, `element`=field) | Configure → Form Layout, then the dictionary record |
| The field's label / help text | `sys_documentation` | Dictionary → Documentation |
| Choice values | `sys_choice` | Dictionary → Choices / "Show Choices" |
| Field read/write rules | `sys_security_acl` + `sys_security_acl_role` | Security → Access Control (ACL) |
| Field mandatory/visible/read-only | `sys_ui_policy`, `sys_ui_policy_action` | System UI → UI Policies |
| Form layout | `sys_ui_form`, `sys_ui_element`, `sys_ui_section` | Configure → Form Design |
| A button / link / context menu item | `sys_ui_action` (+ its client script) | System UI → UI Actions |
| Client-side behaviour | `sys_script_client` | System Client Scripts |
| Server-side behaviour on insert/update/query | `sys_script` | Business Rules |
| Automation with a canvas | `sys_hub_flow` / `sys_flow_*` (Flow Designer); legacy `wf_workflow` | Process Automation → Flow Designer |
| Scheduled job | `sys_trigger`, `sysauto_script` | Scheduled Jobs |
| Event → action wiring | `sysevent`, `sysevent_script_action`, `sysevent_email_action` | System Policy → Events / Notifications |
| Inbound email → record | `sysevent_in_email_action` (inbound action) | Inbound Email Actions |
| Scripted REST endpoint | `sys_ws_definition`, `sys_ws_operation` | Scripted REST APIs |
| Outbound REST/SOAP | `sys_rest_message`, `sys_soap_message` | REST Message |
| Imported data | `sys_data_source`, `sys_transform_map`, `sys_transform_entry` | Data Sources / Transform Maps |
| Left-nav module | `sys_app_module`, `sys_app_application` | System Definition → Applications Menu |
| Which app owns this record | `sys_scope`, `sys_store_app` | Application record → "Scope" |
| Who changed what | `sys_audit`, `sys_update_version`, `sys_journal_field` | Record → History / Audit |
| How it arrived on this instance | `sys_update_xml` (update set), `sys_update_set` | System Update Sets |
| A report | `sys_report` | Reports → All |
| A dashboard | `pa_dashboards` / `pa_widgets` (older) or `par_dashboard*` (Platform Analytics experience) | Platform Analytics |
| An indicator / KPI | `pa_indicators`, `pa_scores`, `pa_snapshots` | Performance Analytics |
| A translated string | `sys_ui_message` | System Localization |

### 2.1 Four queries that answer most "where is it?" questions

```javascript
// 1. Everything the dictionary knows about a table
var d = new GlideRecord('sys_dictionary');
d.addQuery('name', 'sn_customerservice_case');
d.orderBy('element');
d.query();

// 2. Every business rule touching a table (and whether it is OOTB)
var br = new GlideRecord('sys_script');
br.addQuery('collection', 'wm_task');
br.addQuery('active', true);
br.query();
// br.getValue('sys_scope') tells you the owner; br.getValue('sys_class_name') is the type

// 3. ACLs that could deny a field
var acl = new GlideRecord('sys_security_acl');
acl.addQuery('name', 'STARTSWITH', 'incident.');
acl.query();

// 4. The audit trail for one record
var au = new GlideRecord('sys_audit');
au.addQuery('documentkey', currentSysId);
au.orderByDesc('sys_created_on');
au.query();
```

**The breadcrumb habit:** before you change anything, resolve it to three facts — *which scope
owns it, whether it is OOTB, and whether it is captured in an update set.* If you cannot answer
all three, you are about to create an upgrade surprise.

---

## 3. Guided setup vs configuration vs customization

### 3.1 The ladder

Work down this list and stop at the first rung that solves the problem.

| Rung | What it is | Cost | Upgrade risk |
|---|---|---|---|
| 0 | **Guided Setup / product setup checklist** — the vendor's ordered sequence for the module | Low | None |
| 1 | **Property change** — a supported switch | Low | None if the property is documented |
| 2 | **Metadata configuration** — labels, choices, form layout, ACLs, notifications, SLAs, assignment rules, Flow Designer flows | Medium | Low; captured in update sets |
| 3 | **Declarative extension** — new fields (`u_`), new tables, new choices, scripted REST, Flow subflows | Medium | Low if additive |
| 4 | **Script extension** — business rules, script includes, client scripts on OOTB tables | High | Medium: OOTB scripts can be reverted on upgrade; your script can collide |
| 5 | **Forking OOTB behaviour** — editing vendor business rules/UI actions/script includes in place, changing a base-system table's type, deleting OOTB fields | Very high | High: the change is silently lost or breaks the app |

**Guided Setup** is the vendor's answer to rung 0 and it exists per product: ITSM, CSM, FSM, HAM
and the telecom apps each ship a setup/guided-setup entry in their navigation, and each step is
just a shortcut to a configuration record you could reach manually. Use it for greenfield builds
and to enumerate what you have missed; it is *not* a substitute for understanding the records it
opens, and it will not migrate your decisions to another instance.

### 3.2 Upgrade-safe patterns

| Do | Don't |
|---|---|
| Add fields with `u_` prefix (or in your own scope) | Rename or retype an OOTB field |
| Copy an OOTB business rule and disable the original with a documented reason | Edit the OOTB rule body |
| Wrap changes in Flow Designer or a subflow | Bury business logic in a client script |
| Use `sys_scope`-owned custom app for glue code | Put custom tables in the global scope |
| Capture everything in a named update set per change | "Retrieve" someone else's update set |
| Record the decision in a customization ledger | Rely on memory and chat history |

### 3.3 The customization ledger

Create one table (`u_customization_ledger`) with: *what changed, why, who asked, record type,
scope, update set, upgrade impact, review date*. It is the single artefact that makes an
upgrade review possible, and it is the thing interviewers ask about when they ask
"how do you keep a platform maintainable?".

```
u_customization_ledger
├── short_description     "Case: add entitlement check before close"
├── record_type           choice: property | dictionary | acl | flow | script | integration
├── target                reference or table.field
├── scope                 reference to sys_scope
├── update_set            reference to sys_update_set
├── upgrade_impact        choice: none | review | at-risk
├── decision_rationale    journal
└── review_date           date
```

---

## 4. Critical foundation data

No module works on an empty instance. This is the data to load **before** anyone demos anything,
and it is the first thing a hiring manager will ask you to prove you can do.

| Domain | Must exist first | Where it lives | Breaks if missing |
|---|---|---|---|
| **People** | Users, groups, managers, assignment groups with types | `sys_user`, `sys_user_group`, `sys_user_grmember` | Assignment, approvals, SLA ownership, notifications |
| **Place** | Locations/sites with a hierarchy, time zones | `cmn_location` | FSM dispatch, HAM storage, TSOM site modelling, SLA time zones |
| **Time** | Schedules, business hours, holidays, SLA calendars | `cmn_schedule`, `cmn_timemap` (referenced by `contract_sla`) | Every SLA number is wrong |
| **Product** | Manufacturers, product models, categories | `core_company`, `cmdb_model`, `cmdb_model_category` | Assets, install base, entitlements, quotes |
| **Service** | Service catalogue items, CSDM service layer | `sc_cat_item`, `cmdb_ci_service`, `cmdb_rel_ci` | Portals, request fulfilment, impact analysis |
| **Commercial** | Accounts, contracts, entitlements, price lists | `customer_account`, `ast_contract`, `service_entitlement`, price list tables | CSM entitlement checks, Sales CRM quoting |
| **Asset** | Stockrooms, asset states/substates, cost centres | `alm_stockroom`, `alm_asset`, choice tables | HAM lifecycle, FSM parts, disposal audits |

### 4.1 Per-module minimum viable data set

| Module | Load this and nothing else for a first working demo |
|---|---|
| **ITSM** | 5 users in 2 assignment groups, 2 locations, 1 schedule + SLA definition, 5 CIs, 3 catalogue items, incident/problem/change categories |
| **CSM** | 3 accounts with contacts, 1 household/consumer pair, 2 products in the install base, 1 contract + entitlement, 2 case categories, 1 portal user |
| **FSM** | 3 technicians with skills and schedules, 2 service territories, 3 work types, 2 stockrooms with parts, 1 business-hours calendar |
| **Sales CRM** | 3 product offerings with price list entries, 3 leads, 2 opportunities, 1 quote with 2 lines, 1 order that produces an install-base record |
| **HAM** | 3 models, 2 stockrooms, 10 assets across 3 states, 1 cost centre, 1 contract linked to assets, 1 disposal vendor |
| **TSOM** | 2 sites, 5 telecom equipment CIs with a link, 1 service CI related to them, 1 channel/EMS source, 1 alarm rule, 1 correlation rule |

**Rule of thumb:** if the demo needs more than ~20 records per object, the demo is testing data
entry, not the module.

---

## 5. Metrics and dashboards

Every metric below has a definition, a source table and an owner. If you cannot name the source
table, you do not have a metric — you have an opinion.

### 5.1 ITSM

| Metric | Definition | Source |
|---|---|---|
| MTTR | Mean of (`resolved_at` − `opened_at`) for resolved incidents | `incident` |
| MTTA | Mean time to acknowledge/assign | `incident`, `sys_audit` |
| % within SLA | Share of tasks with no breached SLA | `task_sla` (`has_breached = false`) |
| Backlog ageing | Open incidents bucketed by age | `incident` |
| Reopen rate | Reopened / resolved | `incident` (`reopen_count`) |
| First contact resolution | Resolved without a reassignment or second touch | `incident` + `sys_audit` |
| Change success rate | Successful / closed changes | `change_request` |
| Unplanned change % | Emergency / total changes | `change_request` (`type`) |
| Problem leverage | Incidents closed by a problem's fix | `problem` → related incidents |

**OOTB:** Service Operations Workspace, ITSM dashboards, and the Performance Analytics content
pack for ITSM (incident/Problem/Change/Request indicators). Start there before building anything.

### 5.2 CSM

| Metric | Definition | Source |
|---|---|---|
| CSAT | Survey score average | `asmt_assessment_instance` (Survey/Assessment) |
| First response time | First agent comment − case open | `sn_customerservice_case`, `sys_journal_field` |
| Resolution time | Closed − opened | `sn_customerservice_case` |
| Reopen rate | Reopened cases / closed | `sn_customerservice_case` |
| Entitlement coverage | Cases with a valid entitlement / total | `service_entitlement`, `sn_customerservice_case` |
| Self-service deflection | Portal sessions vs cases created | portal analytics + `sn_customerservice_case` |
| Backlog by account | Open cases per `customer_account` | `sn_customerservice_case` |

**OOTB:** CSM Configurable Workspace, CSM/CRM dashboards, and the CSM Performance Analytics
content pack (case, agent, and account indicators).

### 5.3 FSM

| Metric | Definition | Source |
|---|---|---|
| First-time fix rate | Orders closed on first visit / total | `wm_order`, `wm_task` |
| Schedule adherence | Tasks started within window | `wm_task` |
| Utilisation | Productive hours / available hours | `wm_task`, schedules |
| Travel ratio | Travel time / work time | `wm_task` time entries |
| SLA adherence | Work orders meeting response/arrival SLA | `task_sla` |
| Parts availability | Tasks blocked on parts | `wm_task`, `alm_stockroom` |
| Revisit rate | Repeat visits for the same asset | `wm_order` grouped by CI |

**OOTB:** Dispatcher Workspace, Field Service Manager dashboards/PA content.

### 5.4 Sales CRM

| Metric | Definition | Source |
|---|---|---|
| Win rate | Won / (won + lost) opportunities | `opportunity` |
| Pipeline coverage | Open pipeline / target | `opportunity` |
| Sales cycle length | Close − create | `opportunity` |
| Quote-to-order conversion | Orders / quotes | `quote`, `sn_order_mgmt_order` |
| Average deal size | Mean amount of won deals | `opportunity` |
| Product mix | Revenue by `sn_prd_pm_product_offering` | `quote_line`/order lines |
| Lead conversion | Converted leads / total | `lead` |

**OOTB:** Sales Console / CRM workspace dashboards and the CRM PA content. Install-base and
entitlement data created here is what CSM and FSM consume — report the handoff, not just the sale.

### 5.5 HAM

| Metric | Definition | Source |
|---|---|---|
| Asset accuracy | Audited-present / expected | `sn_hamp_asset_audit` |
| Unassigned assets | Assets with no `assigned_to` | `alm_asset` |
| Utilisation | Assigned / owned hardware | `alm_hardware` |
| Refresh compliance | Assets past refresh date / total | `alm_asset` |
| Cost per asset | Acquisition + support cost / asset | `alm_asset`, contracts |
| Disposal compliance | Disposals with a completed disposal task | `sn_hamp_hardware_disposal`, `sn_hamp_hw_asset_disposal_task` |
| Reclaim backlog | Open reclaim lines | `sn_hamp_asset_reclaim_line` |

**OOTB:** Asset Manager Workspace and HAM lifecycle dashboards.

### 5.6 TSOM

| Metric | Definition | Source |
|---|---|---|
| Alarm-to-ticket ratio | Alerts / incidents raised | `em_alert`, `incident` |
| MTTD / MTTR by service | Detect/resolve time per service CI | `em_event`, `em_alert`, `cmdb_ci_service` |
| Service availability | Uptime from alerts/health per service | `em_alert`, service health |
| Alarm storm ratio | Alerts per root event | `em_event` → `em_alert` |
| Inventory completeness | Monitored objects not matched to a CI | `em_unique_nodes` |
| Reconciliation drift | Discovered vs asserted discrepancies | TNI reconciliation records |

**OOTB:** Telecom Operations workspace, Event Management dashboards, service health views.

### 5.7 Platform reporting mechanics

- **Reports** (`sys_report`) for tables; **Platform Analytics** (`pa_indicators`, `pa_scores`,
  `pa_dashboards` / `par_dashboard*`) for trends. Indicators need a scheduled collection job —
  a dashboard with no collection job is an empty dashboard.
- **Scorecards** for "are we meeting the target", **KPIs** for "what is the single number".
- Every dashboard you ship needs: the question it answers, the owner, the refresh interval, and
  what "bad" looks like. Otherwise it is decoration.

---

## 6. What the success packs say to build

The five packs in `SUCCESS_PACKS_MERGED` (bestiejob repo) are job-hunting strategy, not platform
documentation, but three of their findings translate directly into what you should produce for
each module.

| Pack | Finding | What you build because of it |
|---|---|---|
| **MUSE** | Weak ties / referral is the ~13× channel; "build in public" is the inbound engine | Publish each lab as a short public write-up: problem → config → result |
| **FREEBUFF** | "Package the evidence" before applying; keep a weekly scoreboard | One evidence pack per module: update-set XML, screenshots, before/after metric |
| **KILOCODE / KILO** | Portfolio patterns beat certificates; ATS keywords must match the posting | Name artefacts with the posting's vocabulary (e.g. "CSM entitlement check", "HAM disposal") |
| **OPENCODE** | A portfolio of small, complete projects | Six small, complete module builds — not one giant half-finished instance |

**The artefact set per module (this is the whole point of the page):**

1. **Foundation data** — the minimum viable set from §4.1, loaded and screenshotted.
2. **One configuration decision** — property or metadata change, with the ledger entry.
3. **One customisation** — additive only (new field/flow), exported as an update set XML.
4. **One dashboard** — OOTB where possible, with the metric definition and source table written down.
5. **One before/after number** — the metric you moved, measured, not asserted.
6. **One "what I would do differently"** — the upgrade-risk item you avoided.

That is a portfolio entry a hiring manager can interrogate, and it is the same shape as a
real implementation work package.

---

## 7. Ten-minute audit of any instance

```text
1. sys_properties.list           → any non-default value without a description?        (risk)
2. sys_scope.list                → custom apps in global scope?                        (risk)
3. sys_script.list (active)      → OOTB scripts with sys_updated_by != system?         (risk)
4. sys_dictionary.list           → OOTB fields retyped or renamed?                     (risk)
5. sys_update_set.list           → update sets still "in progress" from months ago?    (risk)
6. sys_security_acl.list         → ACLs with no role and no condition?                 (risk)
7. sys_trigger.list              → scheduled jobs failing silently?                    (risk)
8. sys_hub_flow.list (active)    → flows with no error handling?                       (risk)
9. pa_indicators.list            → indicators with no scores/snapshots?                (stale)
10. sys_audit / syslog           → who changed what in the last 24h?                   (baseline)
```

Run it before an upgrade, before an interview demo, and after anyone says "it's just a small
change".

---

## Sources

- ServiceNow *Available system properties* (platform administration, Brazil/Zurich) — property
  names and defaults in §1.1.
- ServiceNow CRM data models and Telecom data model documentation — object names in §4.
- `SUCCESS_PACKS_MERGED/` in the [bestiejob repo](https://github.com/eltonaguiar/bestiejob) —
  MUSE, FREEBUFF, KILO, KILOCODE, OPENCODE packs summarised in §6.
