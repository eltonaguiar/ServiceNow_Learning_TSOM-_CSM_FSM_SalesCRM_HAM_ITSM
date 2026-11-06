# TSOM — Telecom Service Operations Management

**Agent:** opencode  
**Date:** 2026-11-05  
**Module:** TSOM (Telecom Service Operations Management)  
**App:** TSOM  
**Confidence:** verify  

---

## Contents

- [Capabilities — assurance, AIOps, AI, inventory](tsom-capabilities.md) — *companion page: Event Management, Metric Intelligence, Health Log Analytics, Service Impact Analysis, Synthetic Monitoring, AIOps LEAP, Now Assist, discovery protocols, TNI class hierarchy, discrepancy remediation, plus the doc breadcrumb for each*
- [Purpose](#purpose)
- [ELI5 — the whole module in plain English](#eli5--the-whole-module-in-plain-english)
- [Where to Find It](#where-to-find-it)
- [Prerequisites and availability](#prerequisites-and-availability)
- [System properties and workflows you must configure](#system-properties-and-workflows-you-must-configure)
- [Using TSOM — the day-2 operational tasks (Australia docs)](#using-tsom--the-day-2-operational-tasks-australia-docs)
- [Metrics: what is out of the box, and what you build](#metrics-what-is-out-of-the-box-and-what-you-build)
- [Workspaces you get, and how to learn this](#workspaces-you-get-and-how-to-learn-this)
- [The TMT Recommended Implementation Sequence (Now Create)](#the-tmt-recommended-implementation-sequence-now-create)
- [Re-usable Code / Metadata](#re-usable-code--metadata)
- [Out-of-Box Features](#out-of-box-features)
- [Key Table Hierarchy](#key-table-hierarchy)
- [Integrations](#integrations)
- [Key Fields](#key-fields)
- [Common Mistakes](#common-mistakes)
- [Implementer Labs — What Actually Exists (Researched 2026-11-05)](#implementer-labs--what-actually-exists-researched-2026-11-05)
- [Lab: Create Your First Telecom Service](#lab-create-your-first-telecom-service)
- [Quiz](#quiz)

---

## Purpose

ServiceNow Telecom Service Operations Management (TSOM) is purpose-built for communications service providers (CSPs). It manages the lifecycle of telecom services—from order capture through activation, assurance, and billing—using telecom-specific data models, inventory, and orchestration. TSOM is where ITIL meets telecom: incidents are alarms, changes are network changes, and assets are network elements.

---

## ELI5 — the whole module in plain English

A hospital patient monitor does three things: it watches the body, it beeps when something is
wrong, and it tells the nurse *which patient* is in trouble. TSOM is that monitor for a telecom
network:

- the **body** is the network — routers, switches, fibre, ports, circuits;
- the **beep** is an alarm from a device or from the vendor software that manages it;
- the **patient** is the customer service running over that network — a business's internet
  line, a phone service, a mobile data session.

Without TSOM you get the beeps (hundreds of them, from five different tools) but not the patient.
TSOM's job is to connect the two: *"this port is down → this circuit is down → this customer's
service is degraded → these 40 subscribers are affected → raise one incident, not forty."*

### What each word actually means

| Term | Plain English | Why you care |
|---|---|---|
| **Event** | Anything that happened, recorded. Like a CCTV tape: most of it is boring. | Raw material; too many to look at |
| **Alarm** | An event that says *something is wrong* — a device (or the software managing it) raised its hand. Like a smoke detector beeping. | This is what the network produces |
| **Alert** | The platform's cleaned-up version of one or more alarms — scored, de-duplicated, assigned to a service. Like the fire panel showing one light for 40 smoking detectors. | This is what a human works |
| **Clear** | The device says the problem is over, so the alarm closes. | Unclosed alarms are how dashboards lie |
| **Severity** | How bad: critical → major → minor → warning. | Drives who gets woken up |
| **Probable cause** | The device's guess at *why* (link down, power failure, threshold crossed). | The first clue for root cause |
| **CI** (configuration item) | Any "thing" you manage: a router, a port, a circuit, a service. Think of one line in an inventory list. | Everything in TSOM hangs off CIs |
| **CMDB** | The database of every CI and how they connect. An address book plus a family tree for your infrastructure. | If the CMDB is wrong, every answer is wrong |
| **Relationship** | "This router connects to that switch", "this service runs over that circuit". | Relationships are how impact travels |
| **Service** | What the customer actually buys and feels: internet line, voice, VPN. The business view on top of the hardware. | The only layer customers understand |
| **Impact / blast radius** | Everything downstream of a broken thing. | Turns a port failure into a business decision |
| **Incident** | The ticket a human works when something is broken. | What TSOM raises so the NOC has something to close |
| **Change** | A planned, approved modification — the difference between "we fixed it" and "we changed it on purpose". | Network work is mostly change work |
| **NOC** | Network Operations Center — the room with the big screens where people watch alarms all day. | Your user is a NOC engineer, not a form-filler |
| **EMS / NMS** | Vendor software that manages network devices (Element Management System / Network Management System). e.g. Nokia, Cisco, Ericsson tools. | Your main data source |
| **SNMP** | An old, simple protocol devices use to report health. | The cheapest way to get alarms |
| **MID Server** | A small ServiceNow agent running inside your network that reaches devices the cloud cannot. | Half of telecom integration is MID Server placement |
| **Discovery** | Automatic scanning that fills the CMDB for you instead of typing records by hand. | Keeps inventory honest |
| **ETL** | Extract, Transform, Load: pull data out of a system, reshape it to fit our model, store it. | The Telecom Discovery Builder is an ETL framework |
| **Reconciliation (IRE)** | Deciding whether an incoming record is a brand-new thing or the same thing you already have. Prevents 12 copies of one router. | Bad reconciliation = duplicate CIs = wrong impact |
| **Discrepancy** | The gap between what discovery found and what the CMDB claims. | Your inventory quality score |
| **Topology** | The map of what connects to what. | The thing you draw on the whiteboard |
| **Circuit** | A rented path between two sites (fibre, MPLS, leased line). | The unit telecom customers buy |
| **SLA** | A promise about how fast you respond and fix. | Makes "down" measurable |
| **MTTD / MTTR** | Mean time to **detect** / mean time to **repair**. How long until you notice, and until it is fixed. | The two numbers TSOM exists to shrink |
| **Correlation** | Grouping alarms that share a cause into one alert. | 400 alarms → 1 incident |
| **Suppression** | Muting alarms during planned maintenance so the NOC is not woken for work they scheduled. | The most-requested feature in week one |
| **TNI** | Telecommunications Network Inventory — the app that stores the *inventory* of network gear and circuits (a separate product from TSOM). | Where the "body" is modelled |
| **CSDM** | ServiceNow's standard, opinionated way of organising services and CIs. | Speak it and you sound senior |
| **Orchestration** | An automated sequence of steps that makes something happen (provision, activate, remediate). | Where TSOM is heading: auto-remediation |

### The one-sentence version

> **TSOM watches the network, decides which customer service is hurt, and gives the NOC one
> prioritised work item instead of a wall of alarms.**


---

## Where to Find It

| Breadcrumb | Path |
|------------|------|
| Module entry | All > Telecom Service Operations > ... |
| TSOM Home | All > Telecom Service Operations > Home |
| Inventory | All > Telecom Service Operations > Inventory > ... |
| Service Inventory | All > Telecom Service Operations > Service Inventory > ... |
| Network Inventory | All > Telecom Service Operations > Network Inventory > ... |
| Service Order | All > Telecom Service Operations > Service Orders > All |
| Alarms | All > Telecom Service Operations > Alarms > All |
| Administration | All > Telecom Service Operations > Administration > ... |

**Not here:** the assurance *engine* is not under these menus. Event Management, Metric Intelligence,
Health Log Analytics and **Synthetic Monitoring** are ITOM features TSOM consumes, and each has its own
breadcrumb (Synthetic Monitoring lives under **IT Operations Management → Synthetic monitoring**).
See the [capabilities page](tsom-capabilities.md#1-breadcrumb-map--where-each-capability-actually-lives)
for the full map before you go hunting in Telecom Service Operations.

**Tip:** If you don't see these menus, the TSOM application is not installed. The plugin to request is `com.sn_tsom_core` (Store app id `sn_tsom_core`) — see [Prerequisites and availability](#prerequisites-and-availability) below; there is no `com.snc.tsom` plugin.

---

## Prerequisites and availability

> **Read this before you plan a lab.** Everything else in this guide assumes the TSOM
> applications are installed. They usually are not — including on a Personal Developer
> Instance.

### Does a PDI support telecom out of the box?

**No, not by default.** Two independent gates apply:

1. **Subscription.** Every TSOM application is a ServiceNow Store app that requires a valid
   Telecommunications Service Operations Management subscription. The docs state this on each
   app page ("A valid Telecommunications Service Operations Management subscription is
   required…").
2. **Store apps on a PDI.** ServiceNow's own PDI guidance says many Store applications cannot be
   installed to PDIs, and plugins that require activation by ServiceNow personnel do not appear
   in the PDI plugin list at all.

So on a stock PDI you should expect the TSOM modules to be **absent**, not broken. Check
`System Applications > All Available Applications > All` (or the Developer Site →
*Manage my Instance → Plugins for your Instance*) and filter for `TSOM` / `sn_tsom`. If nothing
appears, the app is not entitled for that instance — no amount of role granting will change it.

**What you can still do on a PDI:** build the telecom *data model* by hand. The CMDB classes and
relationship types are ordinary platform records, so you can create equipment CIs, ports and
links, relate them to a `cmdb_ci_service`, and — if Event Management is available on your
instance — send test events and watch `em_event` → `em_alert`. That demonstrates the modelling
and the assurance pattern; it does not demonstrate the telecom connectors, TNI entities or the
alarm-management API.

**If you need the real thing:** ask your ServiceNow account team or a partner for a TSOM-enabled
non-production instance, or use an industry-demo instance in a guided workshop. Budget a day for
installation and data-source validation before you can demo anything.

### What is out of the box vs what you install

| Layer | Comes with installing `sn_tsom_core` / TSOM apps | You still have to do |
|---|---|---|
| Telecom data model | Telecom-aware CMDB classes (equipment, cards, slots, subslots, interfaces, ports, links, circuits), TNI-aligned hierarchy | Load/assert your inventory; map vendors and models |
| TNI entities | TNI entity records are generated when the TNI plugin is installed | Install TNI separately (`sn_ni_adv`), then populate |
| Discovery | Telecom Discovery Builder framework ETL (auto-provisioned generic ETL) | Clone the ETL per connector; build/validate the transform; schedule it |
| Discovery patterns | `sn_tsom_patterns` (Telco Discovery Patterns) for direct SNMP/CLI discovery | Credentials, SNMP access, MID Server placement |
| SGC connectors | Per-vendor connectors (Nokia Altiplano, Cisco Meraki SD-WAN, …) | A MID Server and API access to the controller |
| Assurance | Event Management integration, Telecom Alarm Management Open API (`sn_ind_tmf642`), correlation/suppression rules | Topic + subscription + endpoint activation; severity mapping; correlation rules |
| Reconciliation | Discrepancy identification and reconciliation, built on CMDB Health/Compliance certification audits | Audit definitions and remediation workflow |
| Workspaces | Telecom operations/visibility workspaces, service health dashboards | Onboarding users, tuning the views |

### Plugin and application dependencies

TSOM Visibility (`sn_tsom_core`) is the bundle most labs start with. The docs list these
dependencies:

| Item | ID | Notes |
|---|---|---|
| Telecom Service Operations Core | `sn_tsom_core` / `com.sn_tsom_core` | The core app; installs the telecom data model, ETL framework and properties |
| CMDB CI Class Models | `sn_cmdb_ci_class` | **Version 1.69.0+**; auto-upgraded by the TSOM apps |
| Expanded Model and Asset Classes | `sn_ent` | Store app |
| Visibility Content | `sn_pattern_design` | Store app |
| Integration Commons for CMDB | `sn_cmdb_int_util` | Store app |
| IntegrationHub Starter Pack Installer | `com.glide.hub.integration` | Family plugin |
| Discovery Core | `com.snc.discovery.core` | Installed by Discovery |
| ITOM Discovery License | `com.snc.itom.discovery.license` | Must be activated |
| ITOM Licensing | `com.snc.itom.license` | Required for Discovery patterns |
| IntegrationHub ETL | `sn_int_studio` | Development instances only |
| Telecommunications Network Inventory | `sn_ni_adv` → installs `sn_ni_core` | **Separate app**, separate entitlement; install TNI Advanced, then load TNI Core demo data manually if you want it |

Roles to plan for: `admin` for installation; TNI ships inventory roles such as
`sn_ni_core.inventory_admin`, `sn_ni_core.inventory_agent`,
`sn_ni_core.inventory_template_manager` and `sn_ni_core.telco_inventory_catalog_manager`.

### Do you need CSM for TSOM to work?

**No — not for TSOM Core, TSOM Visibility or TNI.** None of those dependency lists include
Customer Service Management.

**Yes, effectively, for the subscriber-facing story.** Three things change that answer:

- **Telecommunications Service Management (TSM)** — the telecom case/workflow layer — *extends*
  CSM. If your demo is "customer calls about a dead line, agent sees the affected service",
  CSM is the base.
- **Entitlements and install base** — knowing what a subscriber is owed comes from CSM data
  (`service_entitlement`, `sn_install_base_item`, `ast_contract`). TSOM can model the network
  without it; it cannot answer "is this customer entitled to a fix?"
- **TNI Remote Hands** — the docs list `sn_cs_sm_request` (Customer service install base
  management) as a requirement for that feature, and it is delivered through the CSM portal.

Also note the incident/alert detail views inside TNI require `sn_ind_tmf642` (Telecommunications
Alarm Management Open API) and `sn_sprb_mgmt` (Customer Service Problem Management) — so even
the "network-only" side pulls in apps you may not have.

**Practical answer for an interview:** TSOM does not depend on CSM to run; the *end-to-end
telecom service-assurance story* does, because CSM is where the subscriber, the entitlement and
the case live.


---

## System properties and workflows you must configure

Installing the app gives you the machinery; these are the switches and sequences that make it
work on *your* network. Property names below are documented for the TSOM apps.

### 5.1 Properties

| Property | Scope | Default | What it does | If you get it wrong |
|---|---|---|---|---|
| `sn_tsom_patterns.itom_pattern_enabled` | `sn_tsom_patterns` | `true` | Whether discovery runs TSOM patterns **plus** ITOM patterns (`true`) or TSOM patterns only (`false`) | `false` on an instance that also does IT discovery silently drops the ITOM coverage |
| `mid.telecom.discovery.patterns.enabled` | MID Server (`ecc_agent_config`) | per-MID | Enables telecom discovery patterns **on that MID Server** | Discovery finds nothing and logs no obvious error — the MID just does not run the telecom patterns |
| `sn_tsom_core.audit.log.level` | `sn_tsom_core` | `info` | Logging for the Telecom Discrepancy audit (`debug` / `info` / `warn`) | `debug` in production floods the log; `warn` hides why a discrepancy task was not created |
| `sn_tsom_core.audit.relationship_types` | `sn_tsom_core` | `Contains::Contained By` | Which CI relationship types the discrepancy audit walks | Add a custom relationship type and reconciliation silently ignores those links |
| `sn_tsom_core.audit.discovery_sources` | `sn_tsom_core` | e.g. `SG-Altiplano`, `ServiceNow` | Which discovery sources count as "discovered truth" | Your connector's source is not listed → everything looks like a discrepancy, or nothing does |

Each connector also ships **connector-scoped properties** (visible under the connector's
**Properties** section in its guided setup) and each SGC has its own app scope
(`sn_sgc_nsp`, `sn_sgc_altiplano`, `sn_tsom_meraki_connector`, …). Read those before tuning
anything globally — they are the only supported way to change connector behaviour.

### 5.2 The configuration sequence that actually has to happen, in order

| # | Configure | Where | Why it is a prerequisite for the next step |
|---|---|---|---|
| 1 | **MID Server** reachable from the network, with `mid.telecom.discovery.patterns.enabled` set | MID Server / `ecc_agent_config` | Nothing can reach devices or controllers without it |
| 2 | **Credentials + connection alias** for each EMS/NMS/controller | Connections & Credential Aliases | Used by both discovery patterns and SGCs |
| 3 | **Data source** (clone of the Generic Schema multi-source data source) | Data Sources | Gives the ETL schema-aligned placeholders to test against |
| 4 | **Duplicate the Telecom Discovery Builder ETL into your connector scope** | Flow/ETL designer | You never edit the core ETL in place — you copy it, then adapt |
| 5 | **Transform / mapping to CMDB + TNI classes**, run against placeholder data | ETL test run | Catches schema mistakes before 40k devices land wrong |
| 6 | **Import schedule + filters** | Import Schedules / Filters | Controls volume; full vs filtered discovery |
| 7 | **IRE identification rules** for telecom classes | CMDB → Identification and Reconciliation | Without this, the first real run creates duplicates |
| 8 | **Telecom Discrepancy audit** (CMDB Health certification audit + the `sn_tsom_core.audit.*` properties) | CMDB Health / Compliance | Turns "inventory is probably wrong" into a task list |
| 9 | **Alarm path** — Telecom Alarm Management Open API topic + subscription + active endpoint, or SNMP trap → MID | IntegrationHub / Event Management | This is what makes it *assurance* rather than an inventory app |
| 10 | **Event rules, correlation rules, maintenance windows** | Event Management | Otherwise the NOC gets the wall of alarms you were hired to remove |
| 11 | **Service model** — `cmdb_ci_service` records related to the equipment | CMDB / CSDM | Impact analysis has nothing to walk without it |
| 12 | **Incident hand-off** — flow or business rule creating one incident per correlated alert | Flow Designer | The point of the whole exercise |
| 13 | **Roles and groups** — `sn_ni_core.*` inventory roles, NOC assignment group | Users, Groups and Roles | People cannot see the workspace otherwise |

**Guided setup:** the SGCs ship one — navigate to
`All > Service Graph Connectors > <connector> > Setup` and it walks you through MID Server,
connection, credentials, data sources, schedules, filters and properties. TSOM Core and TNI
themselves are configured through their own product modules rather than a single wizard, so
treat the table above as the order, and the guided setup as the shortcut for steps 1–6.

### 5.3 Configuring TSOM — the official configuration map (Australia docs)

Section 5.2 is the order an implementer actually works in. This section maps it to the **official Australia-release documentation** ("Configuring TSOM"), so every step above can be traced to its doc page. The docs define the goal in one line: enable *real-time event ingestion, correlation, and automated remediation* by integrating with external network monitoring and discovery systems — alarm ingestion, CMDB population, discrepancy detection, and service impact visibility.

**Step 0 — the plugins the Configure page names** (dependencies resolve automatically during install):

| Plugin | ID | Doc family |
|---|---|---|
| TSOM Event Management Connectors | `sn_tsom_em_connectors` | Telecom Assurance |
| Service Graph Connector for Fortinet Telco SD-WAN | `sn_tsom_fortinet_connector` | Telecom Visibility |
| Service Graph Connector for Meraki Telco SD-WAN | `sn_tsom_meraki_connector` | Telecom Visibility |
| Service Graph Connector for VeloCloud Telco SD-WAN | `sn_tsom_vcloud_connector` | Telecom Visibility |

**Configure Telecom Visibility** (the docs' first configuration branch):

- **Install Horizontal Discovery** — the pattern-based discovery install that Telecom Discovery depends on.
- **Activate Discrepancy and Reconciliation**, which itself has three configuration children the implementer must know separately: **configure the certification filter for the audit** (which CIs the audit examines), **configure attribute comparison settings** for attribute value discrepancy in **CMDB 360**, and **control CI attribute updates using reconciliation rules** (which source is allowed to overwrite which attributes — the control that stops a noisy source from clobbering good data).
- **Configure Telecom Discovery Builder**, as a chain: **create a duplicate TSOM core data source** (a clone of the Generic Schema multi-source data source) → **duplicate the Telecom Discovery Builder ETL** into your connector scope (the docs include a worked example) → **update the connector data source** → **deploy a new Service Graph Connector** on the duplicated ETL → optionally **extend TNI entity support** for the duplicated ETLs → keep payloads to the **standard JSON for Service Graph Connectors** (the standardized common data set every connector is expected to emit).

**Configure each Service Graph Connector** (the docs give each its own branch; the recurring shape is setup → multiple instances → mapping):

| Connector | Configuration specifics the docs call out |
|---|---|
| **Nokia Altiplano** | Initial setup procedure · manage **multiple Altiplano instances** · **concurrent import and parallel loading** · map Altiplano CIs and relationships · its system properties are a reference page of their own |
| **Cisco Meraki** | Set up the connector schedule · manage multiple Meraki SD-WAN instances · configure **allowlists** · map Meraki CIs and relationships |
| **Fortinet** | Set up the connector schedule · manage multiple instances · configure **ADOM** for the connector instance · **filter ADOMs** (for the pull connector, and ADOM discovery for the SGC) · **customize scripted extension points** · map Fortinet CIs and relationships |
| **Arista VeloCloud** | Set up the connector schedule · manage multiple instances · map VeloCloud CIs and relationships |

**Configure Telecom Assurance** (the docs' second branch):

- **Configure API notifications**: create a **topic** → create a **topic subscription** → **activate the endpoint in the Telecommunications Alarm Management Open API**. The reference side names the tables and roles: Topic [`sn_api_notif_mgmt_topic`] and Topic Subscription [`sn_api_notif_mgmt_subscription`], with standard roles for administering them.
- **Configure a webhook** for fault management event intake.
- **Configure a metric pull connector**, and the MPN-specific family: **elastic event pull connectors for MPN**, **elastic connectors for MPN alarm collection**, and **security log collection for MPN**.
- **Override the default metric-to-CI binding** when a connector's metrics land on the wrong CI.
- **Configure a metric aggregation job**, or **create a custom metric aggregation implementation** when the shipped modes do not fit.

---

## Using TSOM — the day-2 operational tasks (Australia docs)

The docs' "Using TSOM" page lists what operations teams actually *do* once configuration is done — proactively monitor services, validate data integrity, and reconcile discrepancies so the telecom-aware CMDB stays accurate. Four task families:

1. **Run Telecom Discrepancy audits.** Certification audits, run on the CMDB Compliance framework, validate the integrity of CIs and their relationships across telecom inventory against discovered data and reconciliation rules (the audit properties and filters are the §5.1/§5.3 configuration above).
2. **Validate attribute value mismatches in CMDB 360.** The Attribute Value Discrepancy feature compares attribute values *across discovery sources* — and against the CMDB baseline — and the **attribute value discrepancy report** is how you surface conflicts and outdated records for cleanup. This is a different lens from the relationship audit: relationships vs attribute values.
3. **Use Telecom Discovery patterns.** Pattern-based discovery identifies and classifies network functions (**xNFs**) from vendor devices — Cisco, Juniper, routers, switches — and maps them into the CMDB. The docs give each shipped pattern its own xNF classification page: **Telecom Router Pattern**, **Telecom Cisco 7613 Router Pattern**, **Telecom Juniper MX SSH Router Pattern**, **Telecom Cisco Switch Pattern**, and **Telecom Switch Pattern**.
4. **Run and verify import jobs from Service Graph Connectors.** Manually trigger an import schedule (the docs walk through Nokia Altiplano, and the same run-and-verify pattern for Fortinet, Meraki, and VeloCloud) and verify topology and device data landed in the CMDB mapped to the correct CI classes.

Plus the utility every implementer should know exists: **validate JSON payloads with the TSOM Schema Validator** — the `TsomSchemaValidator` utility class checks a payload against TSOM schemas *before* import, so malformed data is caught early instead of surfacing as ETL failures.

---

## Metrics: what is out of the box, and what you build

### 6.1 Genuinely out of the box

| Asset | What you get | Where |
|---|---|---|
| Event Management dashboards + PA content (`com.snc.pa.em`) | Alert volume, alert-to-incident conversion, MTTR-style alert trends, alert ageing | Platform Analytics / Event Management |
| ITSM dashboards content pack (`com.snc.pa.itsm_dashboards`) | The incident/change side of the story once TSOM raises incidents | Platform Analytics |
| Telecom operations workspace | Alert list, service health, affected-service views for the NOC | TSOM navigation |
| Network Inventory Workspace / TNI dashboards | Inventory coverage, network hierarchy, datacenter floor views, capacity | TNI navigation |
| MPN metric panels (where the MPN connector is installed) | Latency KPIs, per-KPI trends, last-recorded-value panels | TSOM / MPN views |
| CMDB Health / compliance scorecards | Completeness, correctness, compliance — includes the telecom audit | CMDB Health |

### 6.2 What is not out of the box (build these)

There is no documented TSOM-specific Performance Analytics content pack that hands you
"MTTD by customer service". These are the indicators you build, with the source table and the
recipe:

| Indicator | Source | Recipe |
|---|---|---|
| **MTTD** (per service) | `em_alert` | `sys_created_on` (raised) → `acknowledged_at`/first assignment; breakdown by `cmdb_ci` → service |
| **MTTR** (per service) | `em_alert` / `incident` | `resolved_at` − `sys_created_on`, joined to the service CI; PA collects daily |
| **Alarm-to-ticket ratio** | `em_alert`, `incident` | Count alerts ÷ count incidents created from alerts (`correlation_id` link) |
| **Alarm storm ratio** | `em_event`, `em_alert` | Events per alert — a spike means correlation is not grouping |
| **Unresolved monitored objects** | `em_unique_nodes` | Count where `type = unknown`; trend it, it is your inventory gap |
| **Reconciliation drift** | Telecom audit / discrepancy tasks | Open discrepancy tasks by class and discovery source |
| **Service availability** | `em_alert` per service CI | Time in non-critical state ÷ total time, per service, monthly |
| **Change success on network** | `change_request` (TNI-created) | Successful ÷ closed, filtered to network change models |

### 6.3 Minimum dashboard for a demo

One dashboard, four widgets, all defensible:

1. **Open alerts by severity** (stacked bar) — *is the NOC drowning?*
2. **Top 10 affected services** (bar) — *is the customer hurting?*
3. **MTTD / MTTR trend, 28-day** (line) — *are we getting faster?*
4. **Unresolved monitored objects** (single score) — *is the inventory trustworthy?*

If a widget cannot be traced to a table and a definition, delete it.


---

### 6.4 The metric machinery, MPN, and the reference components (Australia docs)

The Australia docs document a metric pipeline underneath the dashboards that §6.1–6.3 summarize. The pieces an implementer is expected to know by name:

- **Pull connectors** bring metrics and events in on a schedule (as opposed to pushed alarms): each connector instance has a **metric parameter** that determines what it collects, and each connector type enforces **granularity constraints** — minimum and maximum values for granularity and collection schedule, rejected on the form when out of range.
- **Pagination in Meraki pull connector requests**: the connector paginates so all records are retrieved for large organizations, with the page size set per endpoint to that endpoint's maximum in Meraki API v1.
- **Metric-to-CI binding** decides which CI a metric attaches to; it can be **overridden** per connector (see §5.3) when the default binding lands metrics on the wrong CI.
- **Metric aggregation** turns raw time-series into reportable values: the docs define the **aggregation modes**, a **metric aggregation scripted extension** (a scripted extension point whose configuration object defines what to aggregate, how, and where to publish), and a **metric type IDs** reference — the IDs identify each time-series metric a connector writes to the metrics database, and are how you find a metric in Insights Explorer or build custom indicators.
- **MPN (Nokia Mobile Packet Core networks)** is a documented sub-family of its own: an **MPN data model**, the **MPN Formula Engine** (formulas live in the MPN Formulas table [`sn_tsom_em_conns_kpi_definitions`], with automatic processing on insert/update of a formula record), **MPN latency KPIs** including the derived **UE-to-switch latency** metric, **MPN security log fields** (the structured fields produced when a raw security log is parsed), and the **MPN Latency Dashboard**.
- **SD-WAN dashboards** ship for the SD-WAN connectors: the **SD-WAN Alerts Dashboard** and the **SD-WAN Inventory Dashboard** (alerts, events, and metrics), fed by the installed integrations — VeloCloud REST APIs pulling **events**, Fortinet and Meraki REST APIs pulling **metric data** — and each SGC's **API endpoints** are documented as reference pages (what data flows, through which endpoints).
- **Altiplano over REST**: the reference includes worked examples of retrieving data from Nokia Altiplano via its REST API — the same API the connector's imports are built on, and the fastest way to sanity-check what a connector *should* be bringing in.

---

## Workspaces you get, and how to learn this

### Is there a TSOM workspace out of the box?

**There is no separate "TSOM workspace" app.** TSOM's screens live inside
**Service Operations Workspace (SOW)**, which is where the alert list, service health and service
visualization views render. What you actually get depends on what else is installed:

| View | Where it appears | Comes from |
|---|---|---|
| Alert list, alert details, alert explanation, remediation tasks | Service Operations Workspace | Event Management + TSOM |
| Service health / service visualization over the topology | Service Operations Workspace | TSOM + CMDB service model |
| Converged network + IT operations views | Service Operations Workspace ("converged" in Zurich and later) | SOW + ITOM + TSOM |
| Network inventory, datacenter floor maps, capacity | Network Inventory Workspace / Service Operations Workspace for TNI | TNI (separate app) |
| Dashboards over time (trends, MTTR) | Platform Analytics | PA + content packs |

So: install TSOM and you get the telecom assurance capability, but the *workspace* is SOW — which
means your install also needs ITSM/SOW. That is a practical dependency the dependency tables do not
spell out: **no SOW, no agent workspace**, even though the TSOM plugins install fine.

### ServiceNow learning for TSOM (self-directed)

ServiceNow University / Now Learning publishes a **Telecommunications Service Operations Management
Implementer Learning Path**, and a **TSOM Accreditation** exam. As of the current catalog:

| Item | Detail |
|---|---|
| Learning path | *Telecommunications Service Operations Management* Implementer path (ServiceNow University / Now Learning) |
| Path courses (on-demand unless noted) | Event Management Fundamentals · Event and Flow in Action · Service Graph Connector Essentials · Operational Intelligence Fundamentals |
| Also recommended in the path | IT Operations Management (ITOM) Overview · certification prep for CIS-Event Management |
| Accreditation | **Telecommunications Service Operations Management (TSOM) Accreditation** — exam blueprint on `learning.servicenow.com` |
| Accreditations in the same family | Telecommunications Network Inventory (TNI) · Telecommunications, Media and Technology (TMT) Service Essentials |
| Prerequisite courses listed by ServiceNow for the TSOM accreditation | Welcome to ServiceNow · ServiceNow Administration Fundamentals · CMDB Fundamentals · Introduction to ITOM · ITOM Discovery Implementer · ITOM Implementation (Lab Guide) |

Note the shape of that list: **TSOM accreditation is built on ITOM, CMDB and Event Management, not on
TSOM-specific fundamentals alone.** If you are starting from zero, the honest order is
Welcome to ServiceNow → CSA fundamentals → CMDB Fundamentals → Introduction to ITOM →
Event Management Fundamentals → TSOM path.

Free/self-directed complements (no subscription needed):

- [ServiceNow product documentation](https://www.servicenow.com/docs/) — *Explore / Configure / Use / Reference* for TSOM, plus the
  Telecom data model and TNI pages.
- [ServiceNow Community](https://www.servicenow.com/community/) **Telecom** forum and the *What's new in ServiceNow's <release> release for
  Telecom* sessions (recorded).
- The Best Practices Library (requires a ServiceNow account) linked from the TSOM docs landing page.

### Official ServiceNow video (YouTube)

There is no "TSOM course" on YouTube, but ServiceNow publishes product and release content worth
watching, in rough order of usefulness:

| Video | Why watch it |
|---|---|
| [*TSOM – Auto-discover and Reconcile Network, IT, and Cloud Inventory Data on a Single AI Platform*](https://www.youtube.com/watch?v=rSQGXKCgwz8) | The Visibility half: discovery + reconciliation, i.e. the data model this guide is about |
| [ServiceNow **Telecom** playlist](https://www.youtube.com/playlist?list=PLkGSnjw5y2U4i9IYJYt6RfQUgas-4Nxdc) | TSM / TSOM / SOMT updates and quick demos in one place |
| [*What's new in ServiceNow's Zurich release for Telecom*](https://www.youtube.com/watch?v=Njyt-YgpONY) | Current-release feature walkthrough (Discovery Builder, Altiplano SGC, discrepancy audit) |
| [*Discover What's New: Yokohama Highlights for Telecom*](https://www.youtube.com/watch?v=SBJrGFh2Unw) | Prior-release context; useful for understanding how the product is evolving |
| [*Transform Telecommunications Field Service Operations*](https://www.youtube.com/watch?v=DHn49aHeroo) | The adjacent FSM story, useful for the end-to-end telco narrative |

Treat partner videos (TSM showcases, webinars by consultancies) as context, not as documentation —
several are several years old and describe pre-Zurich behaviour.


---

## The TMT Recommended Implementation Sequence (Now Create)

ServiceNow's own **Now Create** guidance for Telecommunications, Media & Technology sequences every TMT capability into five maturity phases — **Foundation → Crawl → Walk → Run → Fly** — placed by *when implementation may start*, not by product. Three principles run down the side of the official diagram: capabilities are placed by implementation timing and mature customers keep enhancing their initial implementations; you **realize incremental value with every product deployed**; and your maturity path is unique — some capabilities may never be required in your situation. The diagram's legend separates **TMT** capabilities from **Platform** capabilities and **Other Product** capabilities (ITSM/CMDB and the like).

**Before you start** (the diagram's own checklist): 1. Understand TMT · 2. Determine your Desired Outcomes · 3. Plan the next step with Solution Planner · 4. Calculate Business Value · 5. Build a phased program plan · 6. Establish an Organization Change Management Plan — and the program-level gate underneath all of it: **executive sponsorship is in place**, and the customer is willing to embrace modern, lean approaches.

### The five phases

| Phase | What lands there |
|-------|------------------|
| **Foundation** | Customer and Service Organization Data Management · User Administration · Case Management · Case Types · Reporting · Configurable Workspace · Integrations · Configuration Management (CMDB) · **Site and Inventory Management** |
| **Crawl** | Knowledge Management · Customer Facing Portal · Advanced Work Assignment · Chat · Email · Telephony Integration · Service Level Agreements · **Network Model Relationship** · Customer Central · Common Data Model (CSDM) · Platform Analytics |
| **Walk** | Virtual Agent · Major Case Management · Automatic Case Categorization · Playbooks · **Network Inventory Workspace** · **Telco Assurance Workflows** · Proactive Customer Service · Change / Incident / Problem Management · Surveys and Assessment |
| **Run** | Omni channel · **Sales and Order Management** · Domain Separation · Guided Decisions · **Network Inventory Templates** · Proactive Issue Notification · **TSOM Event Management** · Account Lifecycle Events · Communities · Request Management · Continual Improvement Management |
| **Fly** | **Now Assist for TMT** · **TM Forum APIs** · Field Service Management · Process Mining · Workforce Optimization · **Network Change Models** · **Proactive Service Experience Workflows** · **TSOM — Operational Intelligence** · **Service Bridge** · **Horizontal Catalog Dependencies** · Predictive Intelligence |

### Where TSOM actually lands — the part worth remembering

TSOM is **not one phase**. Its pieces are deliberately spread across the whole path (bolded above): inventory in **Foundation** (Site and Inventory Management), network modelling in **Crawl** (Network Model Relationship), daily network operations in **Walk** (Network Inventory Workspace, Telco Assurance Workflows), event management in **Run** (TSOM Event Management), and intelligence in **Fly** (TSOM — Operational Intelligence, Network Change Models). Two consequences:

- A "TSOM implementation" is really slices of a multi-phase program. If a customer has not done the Foundation/Crawl data work — customer data, CMDB, inventory, network model relationships — the Run/Fly TSOM capabilities have nothing solid to stand on. This is the same dependency the accreditation path shows (ITOM + CMDB + Event Management first), seen from the delivery side.
- When you scope or interview for a TSOM role, locate the customer on this path first: the work, the team, and the success measures are completely different at Walk than at Fly.

### Move to the next phase when…

| Gate | Evidence the diagram asks for |
|------|-------------------------------|
| Foundation → Crawl | Minimum foundational data imported (customer & user); future data requirements assessed; Case Management with at least 1 Case Type in place; baseline measured for current KPIs; reporting in place to measure business outcomes |
| Crawl → Walk | Foundational data required for Walk imported; Knowledge Management in place for agents to leverage; decrease in handling time from the swivel-chair improvement; increase in agent utilization |
| Walk → Run | Visible increase in first contact resolution; case deflection due to self-service; reduction in case volume due to self-service; identification of the customer's preferred contact channel; decrease in case resolution time |
| Run → Fly | Visible increase in agent productivity from reduced manual tasks; increase in case deflections due to Virtual Agent; reduction in ongoing case assignments; standardization in customer support; decrease in agent onboarding time |
| Fly (steady state) | Automation of improvement initiatives (agent, customer); higher % of AI-driven decisions than non-AI; greater transparency for customers; same customer experience from in-sourced support as outsourced |

### Success measures, by phase

| Phase | Measures named on the diagram |
|-------|-------------------------------|
| Foundation | Agent productivity · agent satisfaction score · portal click-through rate · Average Handling Time · self-service usage rate · prospect conversion rate · cases not updated in the last 30 days |
| Crawl | Customer churn · open-to-sales rate · summed call volume · Mean Time To Resolve cases · ticket resolution per hour · average case age · average case assignment duration |
| Walk | Rate of customer loyalty · % of OLAs breached · rate of change requests closed successfully · Average Revenue Per User (ARPU) · problem by resolution code · Quality of Service · Return On Invested Capital |
| Run | Average service outage · number of interactions per channel · number of events which ended in correlation · number of proactive alerts · number of call deflections · digital channels breakdown · number of Network Disruptions |
| Fly | Number of truck rolls · First Call Resolution · impacted customers per month · summed applicable outage cost · network performance score · network operating cost · % of cases closed through automation |

Note the shape of the Run/Fly measures — *events ending in correlation*, *proactive alerts*, *network disruptions*, *truck rolls*, *outage cost*: that is the TSOM value story told in the customer's numbers, and it only becomes measurable if the earlier phases built the inventory and event pipeline those numbers come from.

---

## Re-usable Code / Metadata

### Scoped Application

TSOM ships as a scoped application. This means:

| Scope Aspect | Detail |
|--------------|--------|
| Scope name | `com.snc.tsom` |
| Cross-scope access | Required to read/write TSOM tables from global scope |
| Tables | Prefixed `u_` when custom; OOB TSOM tables use native names |
| Roles | `sn_tsom.admin`, `sn_tsom.user`, `sn_tsom.reader` |

### Meta Data Patterns

| Metadata Element | Example | Notes |
|------------------|---------|-------|
| Application menu | `sn_tsom.menu.main` | Defines left-nav items |
| Module | `sn_tsom.menu.inventory` | Points to a table/list view |
| Table extension | `cmdb_ci` extends `cmdb_ci_network` | Telecom CIs inherit from generic CIs |
| Choice list | `sn_tsom.service_status` | Active, Pending, Suspended, Retired |
| UI Policy | `sn_tsom.policy.validate_service_order` | Conditionally shows fields based on service type |

### The re-usable metadata inventory

TSOM reuses the Discovery/ITOM machinery plus its own telecom layer — these are the objects you configure once:

| Re-usable piece | What it is | Where it lives (breadcrumb) |
|-----------------|------------|------------------------------|
| **TSOM discovery patterns** | The telecom pattern set (`sn_tsom_patterns` scope) that identifies network elements — reused by every telecom discovery run, and gated by the `sn_tsom_patterns.itom_pattern_enabled` property covered in section 5.1. Customizing one follows the Discovery guide's pattern deep dive (copy, never edit in place). | All > Discovery > Discovery Definition > **Patterns** (Pattern Designer) |
| **Service Graph Connector definitions** | Each connector (Nokia Altiplano, NSP, Cisco Meraki, …) is a reusable definition: connection, data source, and the **Telecom Discovery Builder ETL** map that turns its payload into TNI-model CIs. Clone and adapt the ETL per connector — never edit the core map in place (see section 5.2). | All > Service Graph Connectors / the connector's guided setup |
| **Discrepancy audit configuration** | The audit definition plus the `sn_tsom_core.audit.*` properties (log level, relationship types, discovery sources) form one reusable reconciliation rule set: it judges *every* discovered-vs-inventory comparison the same way. | CMDB Health / Compliance + the properties in section 5.1 |
| **Event & alert rules (Event Management)** | Event rules, alert correlation rules, and maintenance windows are shared noise-reduction logic: defined once, applied to every alarm every connector raises — this is what turns raw traps into a workable alert list. | All > Event Management > **Event Rules** / **Alert Correlation** |
| **Alarm API topic & subscriptions** | The Telecom Alarm Management Open API topic and its endpoint subscriptions are a single reusable integration contract for all southbound alarm sources. | IntegrationHub / Event Management (alarm path, section 5.2 step 9) |
| **TM Forum API definitions** | The inventory/resource APIs TSOM exposes and consumes follow TM Forum contracts — one definition reused by every OSS/BSS integration instead of point-to-point mappings. | API / integration definitions for the TSOM applications |
| **Service model templates (CSDM)** | The service and service-offering structures impact analysis walks: defined once in the CMDB, reused by every alert's blast-radius calculation. | All > Configuration (services / offerings) — see the ITSM guide's CSDM deep dive |

### Re-usable Code Snippets

#### REST Message Outbound (Telco API call)

```javascript
var rm = new sn_ws.RESTMessageV2('TSOM External API', 'GET');
rm.setEndpoint('https://api.telco-provider.com/v1/services');
rm.setHttpHeader('Content-Type', 'application/json');
rm.setRequestHeader('Authorization', 'Bearer ' + gs.getProperty('tsom.api.token'));
var response = rm.execute();
var httpStatus = response.getStatusCode();
var body = response.getBody();
if (httpStatus === 200) {
    var jsonResponse = new JSON().decode(body);
    gs.print('Service count: ' + jsonResponse.services.length);
} else {
    gs.error('API call failed: ' + httpStatus + ' - ' + body);
}
```

#### Business Rule: Auto-assign Service Order

```javascript
(function rule(current, previous) {
    if (current.operation() == 'insert' && !current.assignment_group) {
        var gr = new GlideRecord('sys_user_group');
        gr.addQuery('name', 'Telecom Operations Team');
        gr.query();
        if (gr.next()) {
            current.assignment_group = gr.sys_id;
        }
    }
})(current, previous);
```

#### UI Policy: Show Fields Based on Service Type

```javascript
(function rule(current) {
    if (current.service_type == 'fiber') {
        g_form.setVisible('fiber_termination_point', true);
        g_form.setMandatory('fiber_termination_point', true);
        g_form.setHidden('copper_pair', true);
    } else if (current.service_type == 'copper') {
        g_form.setVisible('copper_pair', true);
        g_form.setMandatory('copper_pair', true);
        g_form.setHidden('fiber_termination_point', true);
    } else {
        g_form.setHidden('fiber_termination_point', true);
        g_form.setHidden('copper_pair', true);
    }
})(current);
```

#### Script Include: TSOM Helper

```javascript
var TSOMHelper = Class.create();
TSOMHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getServiceStatus: function() {
        var serviceSysId = this.getParameter('sys_id');
        var gr = new GlideRecord('sn_tsom_service');
        gr.addQuery('sys_id', serviceSysId);
        gr.query();
        if (gr.next()) {
            return gr.getValue('state');
        }
        return 'unknown';
    },
    type: 'TSOMHelper'
});
```

---

## Out-of-Box Features

*In plain words: these are the parts you get by installing the app — the inventory model, the pipes
that pull data in, the alarm machinery, and the screens. Everything in the "you still have to do"
column of the prerequisites table is the part that is actually your job.*

| Feature | Description | Where |
|---------|-------------|-------|
| Service Inventory | Track logical telecom services (voice, data, VPN) | All > TSOM > Service Inventory |
| Network Inventory | Track physical/network CIs (routers, switches, fiber) | All > TSOM > Network Inventory |
| Service Orders | Order-to-activate workflow for new services | All > TSOM > Service Orders |
| Alarms | Correlate network alarms into service-impacting events | All > TSOM > Alarms |
| Service Orders Approval | Approve/reject new service orders | All > TSOM > Approvals |
| Service Catalog for Telecom | Order new lines, ports, circuits via portal | Service Portal |
| Device Inventory | Track routers, switches, ONTs, modems | All > TSOM > Device Inventory |
| Circuit Management | Track leased lines, MPLS, dark fiber circuits | All > TSOM > Circuits |

---

## Key Table Hierarchy

> **Correction (Freebuff, 2026-11-05):** the table names in this section (`sn_tsom_service`,
> `sn_tsom_service_order`, `sn_tsom_network_element`, `sn_tsom_circuit`, …) could not be
> verified against ServiceNow documentation and should be treated as illustrative only. The
> verified telecom surface is the CMDB extension model — `cmdb_ci_telco_equipment`,
> `cmdb_ci_network_packet_broker`, `cmdb_ci_optical_line_terminal`,
> `cmdb_ci_optical_network_terminal`, network interfaces/ports/links — plus the TNI entity
> tables, Event Management (`em_event`, `em_alert`, `em_unique_nodes`) and the standard
> `cmdb_ci_service` layer. Verify every class name in your own instance before quoting it.
> A verified walkthrough is in [`getting-started/tsom.md`](../../../getting-started/tsom.md).


### Core Tables

| Table | Purpose | Extends | Key Fields |
|-------|---------|---------|------------|
| `sn_tsom_service` | Logical telecom service instance | `task` | `number`, `state`, `service_type`, `customer`, `assigned_to` |
| `sn_tsom_service_order` | Order to provision a service | `task` | `number`, `state`, `service_type`, `billing_account` |
| `sn_tsom_network_element` | Physical network device | `cmdb_ci` | `name`, `serial_number`, `ip_address`, `location` |
| `sn_tsom_circuit` | Point-to-point circuit | `cmdb_ci` | `circuit_id`, `bandwidth`, `termination_a`, `termination_b` |
| `sn_tsom_inventory_item` | Trackable inventory (ONT, modem, SIM) | `alm_asset` | `asset_tag`, `serial_number`, `status` |
| `sn_tsom_alarm` | Network alarm/event | `em_event` | `node`, `alarm_type`, `severity`, `clear_state` |
| `sn_api_notif_mgmt_topic` | Telecommunications API notification topic (alarm ingestion) | — | topic name, endpoint |
| `sn_api_notif_mgmt_subscription` | Subscription of a consumer to an API notification topic | — | topic, subscriber, state |
| `sn_tsom_em_conns_kpi_definitions` | MPN Formulas — KPI formula definitions for the MPN Formula Engine | — | formula, metric, processing on insert/update |
| `sn_tsom_service_instance` | Provisioned service instance | `task` | `service`, `customer`, `activation_date` |

### Table Relationships

*In plain words: read the tree like folders on a disk. `cmdb_ci` is the master "everything we
manage" folder; telecom equipment, optical terminals and network gear are sub-folders; a
relationship row is a rubber band tying two folders together. Impact analysis is just walking the
rubber bands upward until you hit something a customer pays for.*

```
sn_tsom_service_order
    │
    ├──► sn_tsom_service (one order → many services)
    │
sn_tsom_service
    │
    ├──► sn_tsom_circuit (uses circuit)
    ├──► sn_tsom_network_element (uses network element)
    ├──► sn_tsom_inventory_item (uses inventory items)
    │
sn_tsom_alarm
    │
    ├──► sn_tsom_network_element (alarm raised on element)
    │
sn_tsom_inventory_item
    │
    ├──► cmdb_ci (links to CMDB)
```

### CMDB Integration

| TSOM Table | Maps to CMDB Table | Relationship |
|------------|-------------------|--------------|
| `sn_tsom_network_element` | `cmdb_ci_network` | Extends |
| `sn_tsom_circuit` | `cmdb_ci_network` | Extends |
| `sn_tsom_inventory_item` | `cmdb_ci_hardware` | Via `alm_asset` |
| `sn_tsom_service` | `cmdb_ci_service` | Logical service mapping |

---

## Integrations

*In plain words: TSOM is a consumer of other systems, not the centre of the universe. Something
must tell it what gear exists (discovery/ETL), something must tell it what is broken (alarms), and
something must be told what to do about it (tickets, changes, remediation). If one of those three
arrows is missing, the demo looks fine and production does not work.*

| Integration | Direction | Purpose | Protocol |
|-------------|-----------|---------|----------|
| OSS/BSS Sync | Outbound | Push service orders to telecom OSS | REST/SOAP |
| Network Discovery | Inbound | Discover network elements via SNMP/SSH | Discovery/MID Server |
| Alarm Ingestion | Inbound | Ingest alarms from NMS (Nokia, Ericsson, etc.) | REST/EM |
| Billing Integration | Outbound | Push service activations to billing system | REST/SFTP |
| Provisioning | Outbound | Provision circuits on Ciena/ADVA/etc. | NETCONF/REST |
| Customer Portal | Inbound | Customers order services via portal | Service Portal REST |
| CDRs | Inbound | Call detail records for usage billing | SFTP/API |
| Test & Measurement | Outbound | Run line tests on CPE | REST/SSH |

---

## Key Fields

| Table | Field | Type | Why It Matters |
|-------|-------|------|----------------|
| `sn_tsom_service` | `number` | String | Unique service identifier |
| `sn_tsom_service` | `state` | Choice | Draft → Pending → Active → Suspended → Retired |
| `sn_tsom_service` | `service_type` | Choice | Voice, Data, VPN, TV, Mobile |
| `sn_tsom_service` | `assigned_to` | Reference | Support owner |
| `sn_tsom_service_order` | `order_type` | Choice | New, Modify, Disconnect, Move |
| `sn_tsom_network_element` | `ip_address` | String | Management IP |
| `sn_tsom_network_element` | `location` | Reference | Physical site |
| `sn_tsom_circuit` | `bandwidth` | String | Circuit capacity (e.g., 1Gbps) |
| `sn_tsom_circuit` | `termination_a` | Reference | Location A |
| `sn_tsom_circuit` | `termination_b` | Reference | Location B |
| `sn_tsom_alarm` | `severity` | Choice | Critical, Major, Minor, Warning |
| `sn_tsom_alarm` | `clear_state` | Boolean | Whether alarm is cleared |

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Creating services without a customer | Services don't show on customer portal | Always populate `customer` field |
| Ignoring territory/region constraints | Orders fail to assign | Set territory on service order |
| Creating duplicate circuits | Same circuit appears twice | Use circuit ID as identification rule |
| Forgetting activation date | SLA calculations wrong | Set `activation_date` on provision |
| Mixing physical and logical inventory | Confusion in reports | Keep network elements separate from services |

---

## Implementer Labs — What Actually Exists (Researched 2026-11-05)

TSOM and TNI are **licensed products**. They cannot be installed on a free Personal Developer Instance (PDI) — Store applications need an entitled organisation account, and TSOM's documentation requires an active TSOM subscription. So where does hands-on implementer practice actually happen? Researched against official ServiceNow sources on 2026-11-05:

<div class="verdict">
<h3>Verdict</h3>
<p><strong>Yes for TNI, effectively no for TSOM itself.</strong> The hands-on implementer labs live in the TNI courses and bootcamps, whose ServiceNow University lab instances come with the licensed plugins provisioned. TSOM Essentials is content-only. All ServiceNow University on-demand content is currently <strong>free</strong> with a free account — no partner or customer affiliation is needed (ServiceNow Training FAQs, KB0012229).</p>
</div>

<div class="card-grid">
  <div class="card">
    <h3>TSOM Essentials <span class="pill pill-no">No lab</span></h3>
    <p class="meta">ServiceNow University, March 2026 Store Release (Yokohama → Zurich, plus Australia).</p>
    <p>Covers the right objectives — Telecom Discovery Patterns, Service Graph Connectors, the Discovery Builder Framework, discrepancy remediation, TMF 688 event ingestion — but the official course page shows no lab instance, lab guide, or simulator. ServiceNow's own telecom training catalogue lists hands-on trainings under TNI and none under TSOM. Treat it as concepts only.</p>
    <p class="meta"><a href="http://nowlearninguat.service-now.com/lxp/en/telecommunications-service-management/telecommunications-service-operations?course_id=f07adf8c9307b2d056aeb94c5cba1094&amp;id=learning_course_prev">Course page</a></p>
  </div>
  <div class="card">
    <h3>TNI Essentials <span class="pill pill-yes">Has a lab ✓</span></h3>
    <p class="meta">ServiceNow University · Telecommunications Network Inventory</p>
    <p>The official catalogue: learners "apply what they have learned in hands-on lab exercises to fulfill multiple use cases," on a provided lab instance with the TNI plugins installed. Two cautions from learners: the Washington version had plugin mismatches between lab content and lab instance, and the indexed 7h15m version is retired — enrol via "View other releases" (a Vancouver version exists).</p>
    <p class="meta"><a href="https://learning.servicenow.com/lxp/en/telecommunications-service-management/telecommunications-network-inventory?course_id=5951bdd8471a9550f6b11244846d4313&amp;id=learning_course_prev">Course page</a></p>
  </div>
  <div class="card">
    <h3>TNI Implementation Bootcamp <span class="pill pill-yes">Has a lab ✓</span></h3>
    <p class="meta">ServiceNow University</p>
    <p>Officially "a comprehensive guide to implementing TNI within the ServiceNow platform, featuring hands-on lab activities that enable practical application of the concepts learned." This is the deepest sanctioned TNI practice available to an individual.</p>
  </div>
  <div class="card">
    <h3>TNI Implementer Learning Path <span class="pill pill-yes">Has a lab ✓</span></h3>
    <p class="meta">14h 13m · Prerequisites: ServiceNow Administration Fundamentals, CMDB Fundamentals, Flow Designer Fundamentals</p>
    <p>Lab scope: Network Inventory Workspace modelling and templates, sites, equipment, cards, interfaces and connections, telephone-number and IP allocation, design-and-assign, and applying the TMF API to create, search, and patch CIs — plus TNI's integration points with HAM and Order Management.</p>
    <p class="meta"><a href="https://learning.servicenow.com/lxp/en/telecommunications-service-management/telecommunications-network-inventory?id=learning_path_prev&amp;path_id=bff84642870295d4046fff38dabb35e6">Learning path</a></p>
  </div>
  <div class="card">
    <h3>TSOM Visibility &amp; Event Management Implementation Bootcamp <span class="pill pill-unverified">Lab unverified</span></h3>
    <p class="meta">ServiceNow University, on-demand, Yokohama</p>
    <p>The course exists officially, and bootcamps in this catalogue normally include labs — but its lab details (duration, TSOM plugin activation, task list) could not be confirmed from outside the enrolment page. Check the signed-in course page before counting on it.</p>
    <p class="meta"><a href="https://learning.servicenow.com/lxp/en/telecommunications-service-management/tsom-visibility-and-event-management?id=learning_course_prev&amp;course_id=8ea3f0f7872f1ad4bfe94088dabb350d">Course page</a></p>
  </div>
  <div class="card">
    <h3>AI for Telecommunications Implementation Bootcamp <span class="pill pill-yes">Has a lab ✓</span></h3>
    <p class="meta">ServiceNow University, Zurich</p>
    <p>Explicitly includes hands-on labs and a requestable lab instance (note on the course page: instances requested before June 1, 2026 should be terminated and re-requested). The Now Assist / agentic layer on top of the TSOM/TNI foundation.</p>
    <p class="meta"><a href="http://nowlearninguat.service-now.com/lxp/en/telecommunications-service-management/ai-for-telecommunications?course_id=57fc4b64c3ed3690e5533b877d013168&amp;id=learning_course_prev">Course page</a></p>
  </div>
  <div class="card">
    <h3>TNI Delivery Accreditation <span class="pill pill-info">Credential</span></h3>
    <p class="meta">Non-proctored exam in ServiceNow University · ~17 hours of prep per ServiceNow's APAC promo</p>
    <p>A credential, not a lab — it attests you have learned how to implement TNI. The Essentials and Bootcamp labs are the preparation. No partner-only gate was found; no price is published. There is no CIS-TSOM exam and no TSOM/TNI simulator; TSOM credentialing routes through Event Management (CIS-EM) in the TSOM Implementer path, and the TNI micro-certification feeds the HAM with Telecommunications Network Inventory Professional suite (with CIS-HAM).</p>
    <p class="meta"><a href="https://learning.servicenow.com/lxp/en/pages/now-learning-get-certified?id=amap_detail&amp;summary_id=79d64e311bfcf01002ed2f89bd4bcb51&amp;achievement_id=50487bb99302fd9056aeb94c5cba1003">Accreditation page</a></p>
  </div>
  <div class="card">
    <h3>Personal Developer Instance <span class="pill pill-no">No</span></h3>
    <p class="meta">developer.servicenow.com</p>
    <p>TSOM/TNI cannot be installed on a PDI — Store entitlement is tied to an organisation account. The only sanctioned hands-on routes are course lab instances (above) or an entitled employer, customer, or partner instance. On a PDI you can still build adjacent proof: telecom-style CMDB modelling, Discovery patterns, IntegrationHub ETL imports that mimic a Service Graph Connector feed, and TMF 688-style event ingestion by REST.</p>
  </div>
</div>

### The individual route, in order

1. Free ServiceNow University account → enrol on demand (free).
2. **TNI Essentials** (via "View other releases") — request the lab instance; do the labs.
3. **TNI Implementation Bootcamp** — the deep implementation practice.
4. **TSOM Essentials** — concepts layer (no lab; don't expect one).
5. Optionally: **AI for Telecommunications Implementation Bootcamp** for the Now Assist layer, then the **TNI Delivery Accreditation**.

### Lab instance rules (ServiceNow University, KB0012546)

- A lab instance is a real practice instance, requestable **with certain courses** for labs and simulator tasks; URL and credentials arrive by email. Licensed products **are** provisioned in course lab instances when the course requires them — that is what makes TNI hands-on possible.
- Maximum **3 instances per course**, only **1 assigned at a time**; a new instance does **not** carry over your work.
- Instances hibernate; allow ~15 minutes to wake.
- A lab instance **terminates 2 days after course completion** and cannot be extended once terminated.
- Default terms: lab/simulation access up to **2 weeks** with an option of **one 2-week extension**, unless the course states otherwise (some courses run 2–4 days); the KB also describes two built-in extensions plus a catalogue request for one extra 2-week extension and one extra instance with justification.

### What does not exist

- No TSOM or TNI **instructor-led** course — the official 2026 Learning Paths guide marks every TNI/TSOM item as no-charge on-demand. (Generic ILT economics, if one ever appears: 1,900 Learning Credits for 2 days / 2,700 for 3 days, 1 LC = $1 USD.)
- No dedicated TSOM/TNI **simulator** and no **CIS-TSOM** exam.

**Sources:** [ServiceNow Training FAQs (KB0012229)](https://learning.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0012229) · [Lab instance help (KB0012546)](https://nowlearning.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0012546) · [TMT knowledge catalogue](https://www.servicenow.com/community/telecom-articles/telecommunications-media-and-technology-knowledge-amp/ta-p/3416810) · [2026 Learning Paths guide (PDF)](https://www.servicenow.com/community/s/cgfwn76974/attachments/cgfwn76974/training-certifications-forum/27192/1/Learning%20paths%20-%20ServiceNow.pdf) · [Zurich TSOM product documentation (PDF)](https://downloads.docs.servicenow.com/pdf/enus/servicenow-zurich-telecom-service-ops-enus.pdf)

---

## Lab: Create Your First Telecom Service

> **Instance requirement:** this walkthrough needs TSOM installed, which means an entitled instance — a ServiceNow University course lab instance or an employer/customer/partner instance. It will not run on a free PDI (see *Implementer Labs* above).

1. **Navigate** to All > Telecom Service Operations > Service Orders > All
2. **Click New** and fill:
   - Order Type: New
   - Service Type: Fiber Broadband
   - Customer: Select existing or create new
   - Billing Account: Select account
   - Termination Point: Customer premises address
3. **Submit** and note the order number
4. **Open** the created service order → change State to "Provisioned"
5. **Observe** a `sn_tsom_service` record was auto-created
6. **Create** a `sn_tsom_network_element` (router) and link it to the service via Related Lists
7. **Create** an `sn_tsom_alarm` on that network element with severity "Major"
8. **Verify** the alarm appears on the service's related list

---

### What you just did, in plain English

You created a record of a thing (an order), a record of what the customer has (a service), a
record of the hardware that carries it (a network element), and a beep from that hardware (an
alarm) — then tied them together. That chain — *order → service → hardware → alarm* — is the whole
of telecom assurance. Every dashboard, every incident and every SLA number in TSOM is a view over
that chain.

---

## Quiz

1. What is the primary table for telecom services in TSOM?
2. What table stores physical network elements?
3. What is the difference between a service and a service order?
4. Which table stores alarms?
5. How do you link a circuit to a service?
