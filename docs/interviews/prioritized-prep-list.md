# ServiceNow Interview Prep — Prioritized by Interview Order

**Agent:** opencode  
**Date:** 2026-11-10  
**Purpose:** Interview preparation roadmap  
**Confidence:** high  

---

## Contents

- [How to Use This List](#how-to-use-this-list)
- [Cross-Cutting Core (Do First)](#cross-cutting-core-do-first)
- [Interview 1 — Tomorrow Morning (ITSM + HAM focus)](#interview-1-tomorrow-morning-itsm--ham-focus)
- [Interview 2 — Same Day Afternoon (ITSM + HRSD + ITOM focus)](#interview-2-same-day-afternoon-itsm--hrsd--itom-focus)
- [Interview 3 — Next Day (Platform Architecture & Governance focus)](#interview-3-next-day-platform-architecture--governance-focus)
- [Interview 4 — Following Day (Technical Lead, CMDB + ITOM focus)](#interview-4-following-day-technical-lead-cmdb--itom-focus)
- [Interview 5 — Court Services / City of Toronto (Systems Integrator 1, ServiceNow Developer)](#interview-5-court-services--city-of-toronto-systems-integrator-1-servicenow-developer)
- [STAR Story Bank](#star-story-bank)
- [Certification Talking Points](#certification-talking-points)
- [Official Learning Resources](#official-learning-resources)

---

## How to Use This List

This list is ordered by interview date and priority within each interview. Cross-cutting themes appear in nearly every JD, so they are tackled first. Each interview section lists the modules, core concepts, and the specific stories you should be ready to tell.

**Suggested order of attack:**
1. Cross-Cutting Core (today)
2. Interview 1 prep (tonight / tomorrow morning)
3. Interview 2 prep (same day, between interviews)
4. Interview 3 prep (next day)
5. Interview 4 prep (following day)

---

## Cross-Cutting Core (Do First)

These appear in nearly every JD. Master them before module-specific deep dives.

| Theme | What to Know | Interview Angle |
|-------|-------------|-----------------|
| **ITSM core processes** | Incident → Problem → Change → Request → Knowledge lifecycle; SLA/OLA; assignment groups; priority matrix | "Restore service" vs "root cause" distinction; speed vs thoroughness |
| **Integrations** | REST/SOAP outbound; inbound REST; MID Server; IntegrationHub spokes; Flow Designer | Real integration examples (Teams, Salesforce) — not mocks |
| **Scripting fundamentals** | Business Rules, Client Scripts, UI Policies, UI Actions, GlideRecord, GlideAjax, GlideSystem | When to use each; server-side vs client-side; performance implications |
| **Flow Designer / Workflow** | No-code/low-code automation; triggers, actions, subflows, conditions | Preference for low-code where possible; when to script instead |
| **CMDB + HAM/SAM + Discovery** | cmdb_ci, cmdb_rel_ci, asset lifecycle, Discovery schedules, MID Server | Your existing strength — lead with this |
| **Update sets, testing, documentation** | 3 types of update sets; source control/Git; unit/system/UAT testing; technical documentation | Deployment hygiene; clone post-tasks |
| **CSA/CAD + ITIL/Agile** | CSA/CAD talking points; ITIL process awareness; Agile/Scrum ceremonies | Certification credibility; process discipline |

---

## Interview 1 — Tomorrow Morning

**Role:** ServiceNow Developer, 6-month contract, hybrid  
**Key modules (priority order):**
1. ITSM (Incident, Problem, Change, Request, Knowledge)
2. HAM (Hardware Asset Management) + asset lifecycle
3. CSM (Customer Service Management)
4. FSM (Field Service Management)
5. Sales CRM and TSOM — OOTB config + light customization

### Core Concepts to Brush Up
- ServiceNow Studio + Workflow Studio / Flow Designer (no-code/low-code workflows)
- Forms, UI Actions, Business Rules, Client Scripts, scheduled jobs
- Reports & dashboards
- REST/SOAP integrations + MID Server basics
- Unit / system / UAT testing + technical documentation
- CSA + CAD talking points

### Prep Focus
Be ready to walk through how you've **configured or extended ITSM + HAM** with a mix of OOTB and light scripting. They care about **practical delivery** on those specific modules.

### Module Prep Checklist

| Module | Key Tables | Key Flows | Story to Tell |
|--------|-----------|-----------|---------------|
| ITSM | `incident`, `problem`, `change_request`, `task_sla`, `kb_knowledge` | Incident creation → resolution → problem → change | How you reduced incident volume or improved resolution time |
| HAM | `alm_asset`, `alm_hardware`, `ast_contract`, `alm_asset_model` | Procurement → assignment → retirement | Asset lifecycle you managed; discovery-to-asset reconciliation |
| CSM | `sn_customerservice_case`, `customer_account`, `sn_customerservice_entitlement` | Case creation → entitlement check → resolution | Customer-facing case workflow |
| FSM | `wm_order`, `wm_task`, `wm_agent`, `wm_territory` | Work order creation → dispatch → completion | Technician dispatch and parts management |
| Sales CRM | `sn_sales_opportunity`, `sn_sales_account`, `sn_sales_quote` | Lead → opportunity → quote → order | Sales pipeline automation |

---

## Interview 2 — Same Day Afternoon

**Role:** ServiceNow Developer, HR pre-screen  
**Key modules:**
1. ITSM
2. HRSD (HR Service Delivery)
3. ITOM (Discovery, Event Management, or related operational modules)

### Core Concepts
- Flow Designer + IntegrationHub + Service Portal
- Custom apps: GlideScript / JavaScript, Business Rules, Client Scripts, UI Policies, UI Actions
- Secure REST/SOAP integrations (especially linking legacy systems)
- Platform admin (update sets, cloning, instance health, upgrades/patches, regression testing) — ~20% of the role
- CAD or CIS knowledge (required); CSA is a plus
- Boomi / UKG / retail-legacy experience (assets)

### Prep Focus
Emphasize **development-heavy work (80%) with light admin**, plus how you handle integrations and upgrades. HR screen will test **communication of technical concepts** and basic fit.

### Module Prep Checklist

| Module | Key Tables | Key Flows | Story to Tell |
|--------|-----------|-----------|---------------|
| ITSM | `incident`, `problem`, `change_request` | Incident → problem → change | Technical resolution of recurring incidents |
| HRSD | `sn_hr_core_case`, `sn_hr_core_task`, `sn_hr_core_profile` | HR case → knowledge article → resolution | Employee case workflow; confidentiality handling |
| ITOM | `em_event`, `em_alert`, `cmdb_ci`, `sys_mid_server` | Event → alert → correlation → incident | Noise reduction; alarm correlation |

---

## Interview 3 — Next Day

**Role:** Intermediate Technology Specialist, ServiceNow Developer  
**Focus:** Enterprise ServiceNow platform design, management & support (more platform-oriented than module-specific)

### Key Concepts
- Enterprise ServiceNow platform design, management & support
- Scripting: JavaScript + Glide API (Jelly mentioned)
- Integrations: REST/SOAP + Mid Server connectivity
- Architecture, governance, policies/standards, quality management
- Troubleshooting, upgrades, capacity/performance monitoring
- Solution design, documentation, and continuous improvement

### Prep Focus
Be ready to discuss how you approach **shared infrastructure applications**, maintain **quality/compliance artifacts**, and balance **hands-on configuration with process/governance**. Less about one specific module and more about **solid platform ownership**.

### Platform Topics to Review

| Topic | What to Know |
|-------|-------------|
| Platform architecture | Instance types (PDI, dev, test, prod), nodes, clusters, mid servers |
| Governance | Update set standards, naming conventions, change advisory board (CAB) process |
| Quality management | Unit testing, system testing, UAT, regression testing, documentation standards |
| Troubleshooting | System logs, transaction logs, node health, performance monitoring |
| Upgrades | Upgrade paths, regression testing before/after, instance health checks |
| Capacity monitoring | Disk usage, transaction volume, concurrent users, response times |

---

## Interview 4 — Following Day

**Role:** ServiceNow Technical Lead  
**Key modules:** ITSM, ITOM, CMDB, App Engine

### Core Concepts (Leadership + Technical)
- End-to-end project delivery (requirements → deployment → support)
- Stakeholder/vendor management, workshops, PMO collaboration
- Architecture & configuration of ITSM, ITOM, CMDB
- Leading development of workflows, Business Rules, UI Policies, integrations
- Strategic roadmap: upgrades, feature adoption, automation, post-implementation reviews
- Mentoring developers
- CSA required; CIS/CAD preferred; strong ITIL + Agile/Scrum

### Prep Focus
Shift into **technical leadership stories** — how you've guided design decisions, mentored others, run workshops, and driven upgrades or CMDB/ITOM improvements. They want someone who can **own delivery and influence direction**.

### Leadership Story Bank

| Topic | Story Elements | Example Angle |
|-------|---------------|---------------|
| Architecture decisions | Requirements → options → recommendation → outcome | Why you chose CMDB-based grouping over manual assignment |
| Mentoring | Junior developer → code review → skill growth → delivery impact | How you helped a junior dev write their first Business Rule |
| Workshop facilitation | Stakeholders → requirements → design → sign-off | How you ran a CMDB data model workshop with business owners |
| Upgrade leadership | Planning → regression testing → cutover → post-implementation review | How you led a Zurich→Yokohama upgrade with zero downtime |
| CMDB/ITOM improvement | Discovery gaps → reconciliation rules → data quality → impact analysis | How you reduced duplicate CIs by X% |

---

## Interview 5 — Court Services / City of Toronto (Systems Integrator 1, ServiceNow Developer)

**Role:** Systems Integrator 1 (ServiceNow Developer), Mid-Level  
**Organization:** Court Services / City of Toronto (public sector)  
**Location:** Toronto South Court, 92 Front Street East — Hybrid Mon–Fri, 35 hrs/week  
**Duration:** 12-month full-time temporary vacancy  
**Salary:** $52.38 – $57.39/hr  
**Posted:** Oct 5 – Oct 20, 2026  
**Certification required:** ServiceNow Certified System Administrator (CSA) or equivalent

### Key Modules & Concepts (Priority Order)

| Priority | Focus | Details |
|----------|-------|---------|
| 1 | **Custom Scoped Applications** | Data models, tables, forms, UI Policies, Business Rules, Scripting, JavaScript, GlideRecord, GlideAjax |
| 2 | **Legacy Integration** | MID Server, JDBC/ODBC, SOAP web services, legacy authentication (basic auth, VPN), flat-file transfers |
| 3 | **Data Management** | Import Sets, Transform Maps, data cleansing, reconciliation, legacy data migration |
| 4 | **Platform Architecture** | Scope management, cross-scope access, scope protection policies, roles, ACLs, ServiceNow Studio, Flow Designer |
| 5 | **Environment Management** | Update sets, version control, releases, upgrades, environment management, upgrade impact assessment |
| 6 | **ITSM Foundation** | Incident, Problem, Change, Request, Knowledge (supporting role) |

### Prep Focus

Be ready to walk through **custom scoped application development** (end-to-end from data model to business logic), **legacy system integration** (MID Server, JDBC, SOAP), and **legacy data migration** (Import Sets, Transform Maps, data cleansing). CSA certification talking points are essential — this is a hard requirement.

### Module Prep Checklist

| Area | Key Concepts | Story to Tell |
|------|-------------|---------------|
| Scoped Apps | Table design, forms, UI Policies, Business Rules, Client Scripts, GlideRecord, GlideAjax | Custom app you built from data model to deployment |
| Legacy Integration | MID Server, JDBC/ODBC, SOAP, basic auth, VPN, flat-file | Integration you built between ServiceNow and a legacy/on-prem system |
| Data Migration | Import Sets, Transform Maps, coalesce, data cleansing, reconciliation | Legacy data you migrated into ServiceNow, how you handled duplicates and bad data |
| Platform Architecture | Scope management, cross-scope access, ACLs, scope protection | How you secured a scoped app and controlled cross-scope access |
| Environment Mgmt | Update sets, version control, releases, upgrades | How you moved changes from dev → test → prod safely |

---

## STAR Story Bank


Prepare 4–6 STAR (Situation, Task, Action, Result) stories that map across interviews:

| Story | Situation | Task | Action | Result | Relevant Interviews |
|-------|-----------|------|--------|--------|-------------------|
| ITSM delivery | High incident volume from email | Reduce noise | Built inbound email → incident Flow with auto-categorization | 40% fewer manual incidents | Interview 1, 2 |
| HAM asset lifecycle | Assets not tracked from procurement | Lifecycle visibility | Configured HAM states, Discovery reconciliation, retirement workflow | 95% asset accuracy | Interview 1, 4 |
| Integration | Legacy system needed incident data | Secure REST integration | Built OAuth 2.0 REST Message + MID Server for on-prem DB | Real-time sync, no mocks | Interview 1, 2, 3 |
| Update sets/Git | Multiple devs overwriting each other | Source control | Set up Git source control, PR review, remote update sets | Zero deployment collisions | Interview 2, 3, 4 |
| CMDB improvement | Duplicate CIs from Discovery | Data quality | Tuned IRE rules, created Dynamic CI Groups | 60% fewer duplicates | Interview 4, 5 |
| Mentoring | Junior dev struggling with GlideRecord | Skill gap | Code review sessions, pairing, documented patterns | Dev shipped first BR independently | Interview 4, 5 |
| Scoped App Development | Business needed a custom case tracking app | Build end-to-end scoped app | Designed table model, forms, UI Policies, Business Rules, GlideAjax lookup; deployed via update set | App in production, 50+ active users | Interview 3, 5 |
| Legacy Data Migration | Legacy court system data needed importing | Cleanse and import 5,000+ records | Built Import Sets + Transform Maps with coalesce, transform scripts for data standardization, prevented duplicates | Zero duplicate records, clean data in ServiceNow | Interview 2, 5 |
| Platform Architecture / Scopes | Needed to secure custom app data from other scopes | Scope management + ACLs | Configured application scope, cross-scope access rules, table and field ACLs, scope protection policies | Secure multi-tenant app, passed security review | Interview 3, 5 |

---

## Certification Talking Points

| Certification | Key Talking Points |
|---------------|-------------------|
| **CSA** (Certified System Administrator) | Platform navigation, user administration, data management, self-service, reporting, import/export, update sets |
| **CAD** (Certified Application Developer) | Application creation, table design, forms, client scripts, business rules, UI policies, workflow, App Engine Studio |
| **CIS** (Certified Implementation Specialist) | Module-specific implementation (ITSM, ITOM, CSM, etc.) |

**How to weave them in:** "My CSA gives me the platform foundation — I know how update sets, cloning, and instance health work. My CAD means I can build applications end-to-end in Studio. I'm pursuing CIS for [ITSM/ITOM] to deepen implementation expertise."

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

### Official Videos & Playlists
- [ServiceNow YouTube Channel](https://www.youtube.com/c/ServiceNow) — Search "ServiceNow update sets", "ServiceNow cloning", "ServiceNow MID Server", "ServiceNow Flow Designer"
- [CSA exam prep](https://www.youtube.com/results?search_query=servicenow+CSA+exam+prep)
- [CAD exam prep](https://www.youtube.com/results?search_query=servicenow+CAD+exam+prep)
- [ITSM demos](https://www.youtube.com/results?search_query=servicenow+ITSM+demo)

---
