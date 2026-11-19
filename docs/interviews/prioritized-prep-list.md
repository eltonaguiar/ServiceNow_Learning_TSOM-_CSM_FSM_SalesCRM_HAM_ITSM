# ServiceNow Interview Prep — Generic Role-Based Guidelines

**Date:** 2026-11-19  
**Purpose:** Anonymized interview preparation framework for ServiceNow roles  
**Status:** All original interviews completed; this is now a reusable prep guide

---

## Contents

- [How to Use This Guide](#how-to-use-this-guide)
- [Cross-Cutting Core (Essential for Every Role)](#cross-cutting-core-essential-for-every-role)
- [Role Type 1: ServiceNow Developer / Configurator](#role-type-1-servicenow-developer--configurator)
- [Role Type 2: ServiceNow Developer with Integration Focus](#role-type-2-servicenow-developer-with-integration-focus)
- [Role Type 3: Platform Architect / Technical Specialist](#role-type-3-platform-architect--technical-specialist)
- [Role Type 4: Technical Lead / Senior Developer](#role-type-4-technical-lead--senior-developer)
- [Role Type 5: Public Sector / Legacy Integration Specialist](#role-type-5-public-sector--legacy-integration-specialist)
- [STAR Story Bank (Reusable Across All Roles)](#star-story-bank-reusable-across-all-roles)
- [Certification Talking Points](#certification-talking-points)
- [Guide Cross-Reference Matrix](#guide-cross-reference-matrix)
- [Official Learning Resources](#official-learning-resources)

---

## How to Use This Guide

This guide is organized by **role archetype** rather than specific interview dates. Each role type maps to common ServiceNow job descriptions. Identify which role type(s) match your target position, then follow the corresponding section.

**Suggested prep order:**
1. Cross-Cutting Core (do first — appears in every JD)
2. Your target role type section
3. STAR Story Bank (prepare 4-6 stories)
4. Certification Talking Points
5. Use the Guide Cross-Reference Matrix to deep-dive specific modules

---

## Cross-Cutting Core (Essential for Every Role)

These themes appear in nearly every ServiceNow job description. Master them before role-specific deep dives.

| Theme | What to Know | Key Guides to Review |
|-------|-------------|---------------------|
| **ITSM Core Processes** | Incident → Problem → Change → Request → Knowledge lifecycle; SLA/OLA; assignment groups; priority matrix | [ITSM Guide](../modules/itsm/itsm-guide/) |
| **Integrations** | REST/SOAP outbound; inbound REST; MID Server; IntegrationHub spokes; Flow Designer | [Integration Guide](../cross-cutting/#integrations) |
| **Scripting Fundamentals** | Business Rules, Client Scripts, UI Policies, UI Actions, GlideRecord, GlideAjax, GlideSystem; server-side vs client-side; performance | [JavaScript Reference](../modules/ai/javascript-reference/) |
| **Flow Designer / Workflow** | No-code/low-code automation; triggers, actions, subflows, conditions; when to script vs configure | [AI Guide](../modules/ai/ai-guide/#flow-designer) |
| **CMDB + HAM/SAM + Discovery** | `cmdb_ci`, `cmdb_rel_ci`, asset lifecycle, Discovery schedules, MID Server, IRE rules | [CMDB Guide](../modules/cmdb/cmdb-guide/), [Discovery Guide](../modules/discovery/discovery-guide/) |
| **Update Sets, Testing, Documentation** | 3 types of update sets; source control/Git; unit/system/UAT testing; technical documentation | [Cross-Cutting Skills](../cross-cutting/#update-sets--source-control) |
| **CSA/CAD + ITIL/Agile** | Certification talking points; ITIL process awareness; Agile/Scrum ceremonies | [Certification Talking Points](#certification-talking-points) |

---

## Role Type 1: ServiceNow Developer / Configurator

**Typical JD Keywords:** OOTB configuration, ITSM/CSM/FSM/HAM, Flow Designer, Service Portal, light scripting, CSA/CAD

### Key Modules (Priority Order)
1. **ITSM** — Incident, Problem, Change, Request, Knowledge
2. **HAM/SAM** — Asset lifecycle, procurement → retirement
3. **CSM** — Cases, accounts, entitlements, customer-facing SLAs
4. **FSM** — Work orders, territories, scheduling, mobile
5. **Sales CRM / TSOM** — OOTB config + light customization

### Core Concepts to Master
- ServiceNow Studio + Workflow Studio / Flow Designer
- Forms, UI Actions, Business Rules, Client Scripts, scheduled jobs
- Reports & dashboards
- REST/SOAP integrations + MID Server basics
- Unit / system / UAT testing + technical documentation

### Prep Focus
Walk through how you've **configured or extended ITSM + HAM** with a mix of OOTB and light scripting. Emphasize **practical delivery** on specific modules.

### Module Checklist

| Module | Key Tables | Key Flows | Story to Tell | Relevant Guide |
|--------|-----------|-----------|---------------|----------------|
| ITSM | `incident`, `problem`, `change_request`, `task_sla`, `kb_knowledge` | Incident → resolution → problem → change | Reduced incident volume or improved resolution time | [ITSM Guide](../modules/itsm/itsm-guide/) |
| HAM | `alm_asset`, `alm_hardware`, `ast_contract`, `alm_asset_model` | Procurement → assignment → retirement | Asset lifecycle managed; discovery-to-asset reconciliation | [HAM Guide](../modules/ham/ham-guide/) |
| CSM | `sn_customerservice_case`, `customer_account`, `sn_customerservice_entitlement` | Case → entitlement check → resolution | Customer-facing case workflow | [CSM Guide](../modules/csm/csm-guide/) |
| FSM | `wm_order`, `wm_task`, `wm_agent`, `wm_territory` | Work order → dispatch → completion | Technician dispatch and parts management | [FSM Guide](../modules/fsm/fsm-guide/) |
| Sales CRM | `sn_sales_opportunity`, `sn_sales_account`, `sn_sales_quote` | Lead → opportunity → quote → order | Sales pipeline automation | [Sales CRM Guide](../modules/sales-crm/sales-crm-guide/) |

---

## Role Type 2: ServiceNow Developer with Integration Focus

**Typical JD Keywords:** 80% development / 20% admin, integrations, legacy systems, Boomi/UKG, platform upgrades, CAD/CIS required

### Key Modules
1. **ITSM** — Core processes
2. **HRSD** — HR case management, employee center
3. **ITOM** — Discovery, Event Management, operational modules

### Core Concepts
- Flow Designer + IntegrationHub + Service Portal
- Custom apps: GlideScript/JavaScript, Business Rules, Client Scripts, UI Policies, UI Actions
- Secure REST/SOAP integrations (especially legacy systems)
- Platform admin: update sets, cloning, instance health, upgrades/patches, regression testing
- CAD or CIS knowledge (required); CSA is a plus
- iPaaS tools (Boomi, MuleSoft), workforce management (UKG)

### Prep Focus
Emphasize **development-heavy work with light admin**, plus how you handle integrations and upgrades. Be ready to **communicate technical concepts** clearly.

### Module Checklist

| Module | Key Tables | Key Flows | Story to Tell | Relevant Guide |
|--------|-----------|-----------|---------------|----------------|
| ITSM | `incident`, `problem`, `change_request` | Incident → problem → change | Technical resolution of recurring incidents | [ITSM Guide](../modules/itsm/itsm-guide/) |
| HRSD | `sn_hr_core_case`, `sn_hr_core_task`, `sn_hr_core_profile` | HR case → knowledge → resolution | Employee case workflow; confidentiality handling | [HRSD Guide](../modules/hrsd/hrsd-guide/) |
| ITOM | `em_event`, `em_alert`, `cmdb_ci`, `sys_mid_server` | Event → alert → correlation → incident | Noise reduction; alarm correlation | [ITOM Guide](../modules/itom/itom-guide/), [Discovery Guide](../modules/discovery/discovery-guide/) |

---

## Role Type 3: Platform Architect / Technical Specialist

**Typical JD Keywords:** Enterprise platform design, governance, architecture, troubleshooting, upgrades, capacity monitoring, solution design

### Key Concepts
- Enterprise ServiceNow platform design, management & support
- Scripting: JavaScript + Glide API
- Integrations: REST/SOAP + MID Server connectivity
- Architecture, governance, policies/standards, quality management
- Troubleshooting, upgrades, capacity/performance monitoring
- Solution design, documentation, continuous improvement

### Prep Focus
Discuss how you approach **shared infrastructure applications**, maintain **quality/compliance artifacts**, and balance **hands-on configuration with process/governance**. Focus on **solid platform ownership**.

### Platform Topics

| Topic | What to Know | Relevant Guide |
|-------|-------------|----------------|
| Platform Architecture | Instance types (PDI, dev, test, prod), nodes, clusters, MID Servers | [Cross-Cutting](../cross-cutting/#platform-architecture) |
| Governance | Update set standards, naming conventions, CAB process | [Cross-Cutting](../cross-cutting/#governance) |
| Quality Management | Unit/system/UAT/regression testing, documentation standards | [Cross-Cutting](../cross-cutting/#testing) |
| Troubleshooting | System logs, transaction logs, node health, performance monitoring | [Cross-Cutting](../cross-cutting/#troubleshooting) |
| Upgrades | Upgrade paths, regression testing, instance health checks | [Cross-Cutting](../cross-cutting/#upgrades) |
| Capacity Monitoring | Disk usage, transaction volume, concurrent users, response times | [Cross-Cutting](../cross-cutting/#monitoring) |

---

## Role Type 4: Technical Lead / Senior Developer

**Typical JD Keywords:** End-to-end delivery, stakeholder management, architecture, mentoring, strategic roadmap, CSA required + CIS/CAD preferred

### Core Concepts (Leadership + Technical)
- End-to-end project delivery (requirements → deployment → support)
- Stakeholder/vendor management, workshops, PMO collaboration
- Architecture & configuration of ITSM, ITOM, CMDB
- Leading development of workflows, Business Rules, UI Policies, integrations
- Strategic roadmap: upgrades, feature adoption, automation, post-implementation reviews
- Mentoring developers
- CSA required; CIS/CAD preferred; strong ITIL + Agile/Scrum

### Prep Focus
Shift into **technical leadership stories** — how you've guided design decisions, mentored others, run workshops, and driven upgrades or CMDB/ITOM improvements. Show you can **own delivery and influence direction**.

### Leadership Story Topics

| Topic | Story Elements | Example Angle | Relevant Guide |
|-------|---------------|---------------|----------------|
| Architecture Decisions | Requirements → options → recommendation → outcome | CMDB-based grouping vs manual assignment | [CMDB Guide](../modules/cmdb/cmdb-guide/) |
| Mentoring | Junior dev → code review → skill growth → delivery impact | Helped junior write first Business Rule | [Cross-Cutting](../cross-cutting/#mentoring) |
| Workshop Facilitation | Stakeholders → requirements → design → sign-off | CMDB data model workshop with business owners | [CMDB Guide](../modules/cmdb/cmdb-guide/) |
| Upgrade Leadership | Planning → regression testing → cutover → post-review | Led major upgrade with zero downtime | [Cross-Cutting](../cross-cutting/#upgrades) |
| CMDB/ITOM Improvement | Discovery gaps → reconciliation rules → data quality → impact | Reduced duplicate CIs by X% | [CMDB Guide](../modules/cmdb/cmdb-guide/), [Discovery Guide](../modules/discovery/discovery-guide/) |

---

## Role Type 5: Public Sector / Legacy Integration Specialist

**Typical JD Keywords:** Custom scoped applications, legacy integration (MID Server, JDBC/ODBC, SOAP), data migration, CSA required, government/public sector experience

### Key Modules & Concepts (Priority Order)

| Priority | Focus | Details | Relevant Guide |
|----------|-------|---------|----------------|
| 1 | **Custom Scoped Applications** | Data models, tables, forms, UI Policies, Business Rules, Scripting, JavaScript, GlideRecord, GlideAjax | [Cross-Cutting](../cross-cutting/#scoped-apps), [JavaScript Reference](../modules/ai/javascript-reference/) |
| 2 | **Legacy Integration** | MID Server, JDBC/ODBC, SOAP web services, legacy auth (basic auth, VPN), flat-file transfers | [Integration Guide](../cross-cutting/#integrations), [Discovery Guide](../modules/discovery/discovery-guide/#mid-server) |
| 3 | **Data Management** | Import Sets, Transform Maps, data cleansing, reconciliation, legacy data migration | [Cross-Cutting](../cross-cutting/#data-management) |
| 4 | **Platform Architecture** | Scope management, cross-scope access, scope protection policies, roles, ACLs, ServiceNow Studio, Flow Designer | [Cross-Cutting](../cross-cutting/#platform-architecture), [JavaScript Reference](../modules/ai/javascript-reference/#acls) |
| 5 | **Environment Management** | Update sets, version control, releases, upgrades, environment management, upgrade impact assessment | [Cross-Cutting](../cross-cutting/#update-sets--source-control) |
| 6 | **ITSM Foundation** | Incident, Problem, Change, Request, Knowledge (supporting role) | [ITSM Guide](../modules/itsm/itsm-guide/) |

### Prep Focus
Walk through **custom scoped application development** (end-to-end from data model to business logic), **legacy system integration** (MID Server, JDBC, SOAP), and **legacy data migration** (Import Sets, Transform Maps, data cleansing). CSA certification talking points are essential.

### Module Checklist

| Area | Key Concepts | Story to Tell | Relevant Guide |
|------|-------------|---------------|----------------|
| Scoped Apps | Table design, forms, UI Policies, Business Rules, Client Scripts, GlideRecord, GlideAjax | Custom app built from data model to deployment | [Cross-Cutting](../cross-cutting/#scoped-apps) |
| Legacy Integration | MID Server, JDBC/ODBC, SOAP, basic auth, VPN, flat-file | Integration between ServiceNow and legacy/on-prem system | [Discovery Guide](../modules/discovery/discovery-guide/#mid-server) |
| Data Migration | Import Sets, Transform Maps, coalesce, data cleansing, reconciliation | Legacy data migrated; handling duplicates and bad data | [Cross-Cutting](../cross-cutting/#data-management) |
| Platform Architecture | Scope management, cross-scope access, ACLs, scope protection | Secured scoped app; controlled cross-scope access | [Cross-Cutting](../cross-cutting/#platform-architecture) |
| Environment Mgmt | Update sets, version control, releases, upgrades | Moved changes dev → test → prod safely | [Cross-Cutting](../cross-cutting/#update-sets--source-control) |

---

## STAR Story Bank (Reusable Across All Roles)

Prepare 4–6 STAR (Situation, Task, Action, Result) stories that map across role types:

| Story | Situation | Task | Action | Result | Relevant Role Types |
|-------|-----------|------|--------|--------|---------------------|
| ITSM Delivery | High incident volume from email | Reduce noise | Built inbound email → incident Flow with auto-categorization | 40% fewer manual incidents | 1, 2 |
| HAM Asset Lifecycle | Assets not tracked from procurement | Lifecycle visibility | Configured HAM states, Discovery reconciliation, retirement workflow | 95% asset accuracy | 1, 4 |
| Integration | Legacy system needed incident data | Secure REST integration | Built OAuth 2.0 REST Message + MID Server for on-prem DB | Real-time sync, no mocks | 1, 2, 3, 5 |
| Update Sets/Git | Multiple devs overwriting each other | Source control | Set up Git source control, PR review, remote update sets | Zero deployment collisions | 2, 3, 4, 5 |
| CMDB Improvement | Duplicate CIs from Discovery | Data quality | Tuned IRE rules, created Dynamic CI Groups | 60% fewer duplicates | 3, 4, 5 |
| Mentoring | Junior dev struggling with GlideRecord | Skill gap | Code review sessions, pairing, documented patterns | Dev shipped first BR independently | 4, 5 |
| Scoped App Development | Business needed custom case tracking app | Build end-to-end scoped app | Designed table model, forms, UI Policies, Business Rules, GlideAjax lookup; deployed via update set | App in production, 50+ active users | 3, 5 |
| Legacy Data Migration | Legacy system data needed importing | Cleanse and import 5,000+ records | Built Import Sets + Transform Maps with coalesce, transform scripts for standardization | Zero duplicate records, clean data | 2, 5 |
| Platform Architecture / Scopes | Needed to secure custom app data from other scopes | Scope management + ACLs | Configured application scope, cross-scope access rules, table/field ACLs, scope protection policies | Secure multi-tenant app, passed security review | 3, 5 |

---

## Certification Talking Points

| Certification | Key Talking Points |
|---------------|-------------------|
| **CSA** (Certified System Administrator) | Platform navigation, user administration, data management, self-service, reporting, import/export, update sets |
| **CAD** (Certified Application Developer) | Application creation, table design, forms, client scripts, business rules, UI policies, workflow, App Engine Studio |
| **CIS** (Certified Implementation Specialist) | Module-specific implementation (ITSM, ITOM, CSM, etc.) |

**How to weave them in:** *"My CSA gives me the platform foundation — I know how update sets, cloning, and instance health work. My CAD means I can build applications end-to-end in Studio. I'm pursuing CIS for [ITSM/ITOM] to deepen implementation expertise."*

---

## Guide Cross-Reference Matrix

Use this matrix to find the relevant guide for each topic. All guides are in this repository.

| Topic Area | Primary Guide | Supporting Guides |
|------------|--------------|-------------------|
| **ITSM** | [ITSM Guide](../modules/itsm/itsm-guide/) | [Cross-Cutting](../cross-cutting/) |
| **CSM** | [CSM Guide](../modules/csm/csm-guide/) | [ITSM Guide](../modules/itsm/itsm-guide/) |
| **FSM** | [FSM Guide](../modules/fsm/fsm-guide/) | [ITSM Guide](../modules/itsm/itsm-guide/) |
| **HAM** | [HAM Guide](../modules/ham/ham-guide/) | [CMDB Guide](../modules/cmdb/cmdb-guide/), [Discovery Guide](../modules/discovery/discovery-guide/) |
| **SAM** | [SAM Guide](../modules/sam/sam-guide/) | [CMDB Guide](../modules/cmdb/cmdb-guide/) |
| **HRSD** | [HRSD Guide](../modules/hrsd/hrsd-guide/) | [ITSM Guide](../modules/itsm/itsm-guide/) |
| **ITOM** | [ITOM Guide](../modules/itom/itom-guide/) | [Discovery](../modules/discovery/), [Event Mgmt](../modules/eventmanagement/), [Service Mapping](../modules/servicemapping/) |
| **Discovery** | [Discovery Guide](../modules/discovery/discovery-guide/) | [MID Server](../modules/midserver/), [CMDB](../modules/cmdb/cmdb-guide/) |
| **Service Mapping** | [Service Mapping Guide](../modules/servicemapping/servicemapping-guide/) | [CMDB](../modules/cmdb/cmdb-guide/), [ITOM](../modules/itom/itom-guide/) |
| **Event Management** | [Event Management Guide](../modules/eventmanagement/eventmanagement-guide/) | [ITOM](../modules/itom/itom-guide/), [Metric Intelligence](../modules/metric-intelligence-hla/) |
| **CMDB** | [CMDB Guide](../modules/cmdb/cmdb-guide/) | [Discovery](../modules/discovery/), [HAM](../modules/ham/ham-guide/), [IRE](../cross-cutting/#cmdb) |
| **Integrations** | [Cross-Cutting: Integrations](../cross-cutting/#integrations) | [MID Server](../modules/midserver/), [JavaScript Reference](../modules/ai/javascript-reference/) |
| **Scripting** | [JavaScript Reference](../modules/ai/javascript-reference/) | [Cross-Cutting: Scripting](../cross-cutting/#scripting) |
| **Flow Designer** | [AI Guide: Flow Designer](../modules/ai/ai-guide/#flow-designer) | [Cross-Cutting: Workflows](../cross-cutting/#workflows) |
| **Service Catalog** | [Service Catalog Guide](../modules/catalog/catalog-guide/) | [ITSM Guide](../modules/itsm/itsm-guide/) |
| **Scoped Apps** | [Cross-Cutting: Scoped Apps](../cross-cutting/#scoped-apps) | [JavaScript Reference](../modules/ai/javascript-reference/) |
| **Platform Architecture** | [Cross-Cutting: Platform Architecture](../cross-cutting/#platform-architecture) | [Getting Started: Foundation](../getting-started/foundation/) |
| **Update Sets / Git** | [Cross-Cutting: Update Sets & Source Control](../cross-cutting/#update-sets--source-control) | [Getting Started: Foundation](../getting-started/foundation/) |
| **Testing** | [Cross-Cutting: Testing](../cross-cutting/#testing) | — |
| **Upgrades** | [Cross-Cutting: Upgrades](../cross-cutting/#upgrades) | — |
| **Governance** | [Cross-Cutting: Governance](../cross-cutting/#governance) | — |
| **AI / Now Assist** | [AI Guide](../modules/ai/ai-guide/) | [JavaScript Reference](../modules/ai/javascript-reference/) |

---

## Official Learning Resources

### Now Learning (Structured Training)
- [Certified System Administrator (CSA) path](https://nowlearning.com/) — Search "CSA" on Now Learning Portal
- [Certified Application Developer (CAD) path](https://nowlearning.com/) — Search "CAD" on Now Learning Portal
- [ITSM Fundamentals](https://nowlearning.com/) — Search "IT Service Management" on Now Learning Portal
- [ITOM Fundamentals](https://nowlearning.com/) — Search "IT Operations Management" on Now Learning Portal
- [Flow Designer Fundamentals](https://nowlearning.com/) — Search "Flow Designer" on Now Learning Portal
- [IntegrationHub Fundamentals](https://nowlearning.com/) — Search "IntegrationHub" on Now Learning Portal
- [App Engine Studio Fundamentals](https://nowlearning.com/) — Search "App Engine Studio" on Now Learning Portal

### Product Documentation (Technical Reference)
- [ServiceNow Product Documentation](https://docs.servicenow.com/) — Search "update sets", "cloning", "MID Server", "REST Message", "source control"
- [ServiceNow Product Documentation — CMDB](https://docs.servicenow.com/) → Search "CMDB", "identification reconciliation"
- [ServiceNow Product Documentation — HAM](https://docs.servicenow.com/) → Search "Hardware Asset Management"
- [ServiceNow Product Documentation — HRSD](https://docs.servicenow.com/) → Search "HR Service Delivery"
- [ServiceNow Product Documentation — ITOM](https://docs.servicenow.com/) → Search "IT Operations Management", "Discovery", "Event Management"

### Official Videos & Playlists
- [ServiceNow YouTube Channel](https://www.youtube.com/c/ServiceNow) — Search "ServiceNow update sets", "ServiceNow cloning", "ServiceNow MID Server", "ServiceNow Flow Designer"
- [CSA exam prep](https://www.youtube.com/results?search_query=servicenow+CSA+exam+prep)
- [CAD exam prep](https://www.youtube.com/results?search_query=servicenow+CAD+exam+prep)
- [ITSM demos](https://www.youtube.com/results?search_query=servicenow+ITSM+demo)
- [ITOM demos](https://www.youtube.com/results?search_query=servicenow+ITOM+demo)

---

## Gap-Fill Notes: Sections Added to Guides

Based on the interview themes above, the following sections should be verified/added to the relevant guides:

| Guide | Section to Verify/Add | Status |
|-------|----------------------|--------|
| [Cross-Cutting](../cross-cutting/) | Scoped Applications deep-dive | ⏳ Needs review |
| [Cross-Cutting](../cross-cutting/) | Legacy Integration patterns (MID Server, JDBC/ODBC, SOAP, flat-file) | ⏳ Needs review |
| [Cross-Cutting](../cross-cutting/) | Data Migration: Import Sets, Transform Maps, coalesce, data cleansing | ⏳ Needs review |
| [Cross-Cutting](../cross-cutting/) | Platform Architecture: instance types, scopes, cross-scope access, ACLs | ⏳ Needs review |
| [Cross-Cutting](../cross-cutting/) | Update Sets & Git: remote update sets, PR workflow, deployment hygiene | ⏳ Needs review |
| [Cross-Cutting](../cross-cutting/) | Testing: unit/system/UAT/regression, test frameworks | ⏳ Needs review |
| [Cross-Cutting](../cross-cutting/) | Upgrades: paths, regression testing, health checks, clone post-tasks | ⏳ Needs review |
| [Cross-Cutting](../cross-cutting/) | Governance: naming conventions, CAB, change advisory | ⏳ Needs review |
| [Cross-Cutting](../cross-cutting/) | Troubleshooting: logs, transaction logs, performance | ⏳ Needs review |
| [Cross-Cutting](../cross-cutting/) | Capacity Monitoring | ⏳ Needs review |
| [Cross-Cutting](../cross-cutting/) | Mentoring/Leadership patterns | ⏳ Needs review |
| [Discovery Guide](../modules/discovery/discovery-guide/) | MID Server deep-dive for legacy integration | ⏳ Needs review |
| [JavaScript Reference](../modules/ai/javascript-reference/) | ACLs and cross-scope access patterns | ⏳ Needs review |
| [CMDB Guide](../modules/cmdb/cmdb-guide/) | IRE rules tuning, Dynamic CI Groups, duplicate reduction | ⏳ Needs review |
| [ITSM Guide](../modules/itsm/itsm-guide/) | Email-to-incident Flow patterns, auto-categorization | ⏳ Needs review |
| [HAM Guide](../modules/ham/ham-guide/) | Discovery reconciliation to asset lifecycle | ⏳ Needs review |
| [ITOM Guide](../modules/itom/itom-guide/) | Event correlation, noise reduction, alert-to-incident | ⏳ Needs review |

> **Next Steps:** Review each "⏳ Needs review" item above and add missing content to the linked guides. Use the interview themes as a checklist for completeness.

---

*This guide replaces the previous date-specific interview schedule. All original interviews have been completed. Use the role-type framework above for future preparation.*