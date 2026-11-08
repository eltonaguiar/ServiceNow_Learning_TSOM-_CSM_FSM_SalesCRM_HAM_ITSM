# ITSM — IT Service Management

**Agent:** opencode  
**Date:** 2026-11-05  
**Module:** ITSM (IT Service Management)  
**App:** ITSM  
**Confidence:** high  

---

## Contents

- [Purpose](#purpose)
- [Where to Find It](#where-to-find-it)
- [Re-usable Code / Metadata](#re-usable-code--metadata)
- [Out-of-Box Features](#out-of-box-features)
- [Key Table Hierarchy](#key-table-hierarchy)
- [Integrations](#integrations)
- [Key Fields](#key-fields)
- [Common Mistakes](#common-mistakes)
- [Deep Dive: A CSDM Map, End to End (SCCM Laptop Example)](#deep-dive-a-csdm-map-end-to-end-sccm-laptop-example)
- [Lab: Create and Resolve Your First Incident](#lab-create-and-resolve-your-first-incident)
- [Quiz](#quiz)
- [Official Learning Resources](#official-learning-resources)
- [Visual & Video Guides](#visual--video-guides)

---

## Purpose

IT Service Management (ITSM) is ServiceNow's flagship application for managing IT services. ITSM covers Incident, Problem, Change, Change Task, Knowledge, and Configuration Management. It is the reference implementation of the platform—every other module follows the same patterns. ITSM defines how IT receives, prioritizes, assigns, resolves, and reports on service disruptions and planned changes.

---

## Where to Find It

| Breadcrumb | Path |
|------------|------|
| Module entry | All > IT Service Management > ... |
| Incidents | All > Incident > All |
| Problems | All > Problem > All |
| Changes | All > Change > All |
| Change Tasks | All > Change > Tasks > All |
| Knowledge | All > Knowledge > All |
| Configuration Items | All > CMDB > CI List |
| Service Catalog | All > Service Catalog > All |
| Administration | All > ITSM > Administration > ... |

**Tip:** If menus are missing, verify the `com.snc.itsm` plugin is active (System Definition → Plugins).

---

## Re-usable Code / Metadata

### Scoped Application

ITSM ships as a scoped application (`com.snc.itsm`).

| Scope Aspect | Detail |
|--------------|--------|
| Scope name | `com.snc.itsm` |
| Tables | `incident`, `problem`, `change_request`, `change_task`, `task`, `task_sla` |
| Roles | `itil`, `sn_incident.read`, `sn_incident.write`, `sn_change.write`, `sn_problem.write`, `admin` |

### Meta Data Patterns

| Metadata Element | Example | Notes |
|------------------|---------|-------|
| Application menu | `sn_itsm.menu.main` | ITSM left-nav root |
| Module | `sn_itsm.menu.incidents` | Points to incident list |
| Choice list | `sn_itsm.incident_state` | New → In Progress → Resolved → Closed |
| UI Policy | `sn_itsm.policy.mandatory_fields` | Validates required fields |
| Business Rule | `sn_itsm.rule.auto_assign_incident` | Auto-assigns based on category |

### The re-usable metadata inventory

ITSM's scale comes from these shared objects — every process below is defined once and consumed by all the others:

| Re-usable piece | What it is | Where it lives (breadcrumb) |
|-----------------|------------|------------------------------|
| **Variable sets (Service Catalog)** | Groups of catalog variables (location picker, cost centre, justification…) defined once and attached to dozens of catalog items — the single highest-leverage reuse in the catalog. Items and record producers supply their own variables only for what is unique. | All > Service Catalog > **Variables** (Variable Sets) |
| **Catalog items, record producers & order guides** | The reusable intake patterns themselves: one record producer pattern creates incidents/requests from many forms; order guides bundle related items into one checkout. | All > Service Catalog > **Catalog Definitions** |
| **Task templates** | Pre-filled incident/change/problem templates (`sys_template` and process templates) so common work starts 90% complete — "password reset", "standard server patch". | All > System Definition > **Templates** |
| **Change models & standard changes** | Change models define the states, approvals, and tasks for a *class* of change; standard change templates are the pre-approved, reusable instances. A good standard-change library is most of a healthy change process. | All > Change > **Change Models** / **Standard Change** |
| **SLA definitions** | Clocks, conditions, and schedules defined once and attached to any task type — incident, case, work order all read the same definition style. | All > Service Level Management > **SLA Definitions** |
| **Assignment rules & on-call rotations** | Assignment rules route by category/group data; on-call schedules and rotations (`cmn_rota`) define who is reachable, reused by every escalation and major-incident page-out. | All > System Policy > **Assignment Rules** · All > On-Call Scheduling |
| **Approval rules** | Reusable approval logic (by amount, by group, by CI owner) consumed by change, catalog, and knowledge publishing alike. | All > System Policy > **Approvals** |
| **Flows, subflows & IntegrationHub spokes** | Flow Designer automation is the platform's shared library: a subflow like "create AD account" or a spoke action is built once and called from ITSM, CSM, HR — everywhere. | All > Process Automation > **Flow Designer** · **IntegrationHub** |
| **CMDB identification & reconciliation rules** | The IRE rule set (identifiers, reconciliation, de-duplication) that *all* data sources share — Discovery, connectors, imports. See the Discovery guide for the identifier deep treatment. | All > Configuration > **Identification/Reconciliation** |
| **Dynamic CI groups** | Query-defined CI collections (e.g. "all Windows 11 workstations") reused by change impact, reporting, and service mapping — the group definition is maintained once, membership stays current by itself. Worked end to end in this guide's CSDM deep dive below. | All > Configuration > **Dynamic CI Groups** |
| **Knowledge article templates** | Templates per article type (how-to, FAQ, policy) that keep thousands of articles consistent, plus the feedback loop that maintains them. | All > Knowledge > **Article Templates** |

### Re-usable Code Snippets

#### Business Rule: Auto-assign Incident by Category

```javascript
(function rule(current, previous) {
    if (current.operation() == 'insert' && current.category && !current.assignment_group) {
        var gr = new GlideRecord('cmn_Category');
        gr.addQuery('name', current.category);
        gr.query();
        if (gr.next() && gr.assignment_group) {
            current.assignment_group = gr.assignment_group;
        }
    }
})(current, previous);
```

#### UI Priority: Calculate Priority from Impact and Urgency

```javascript
(function rule(current) {
    if (current.impact && current.urgency) {
        var priorityMap = {
            '1|1': '1', '1|2': '1', '1|3': '2',
            '2|1': '1', '2|2': '2', '2|3': '3',
            '3|1': '2', '3|2': '3', '3|3': '4',
            '4|1': '3', '4|2': '4', '4|3': '5'
        };
        var key = current.impact + '|' + current.urgency;
        if (priorityMap[key]) {
            g_form.setValue('priority', priorityMap[key]);
        }
    }
})(current);
```

#### Script Include: ITSM Helper

```javascript
var ITSMHelper = Class.create();
ITSMHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getIncidentStats: function() {
        var gr = new GlideRecord('incident');
        gr.addQuery('state', '!=', 'closed');
        gr.query();
        var stats = {new: 0, in_progress: 0, on_hold: 0, total: 0};
        while (gr.next()) {
            var state = gr.getValue('state');
            if (state == '1') stats.new++;
            if (state == '2') stats.in_progress++;
            if (state == '3') stats.on_hold++;
            stats.total++;
        }
        return JSON.stringify(stats);
    },
    type: 'ITSMHelper'
});
```

#### Business Rule: SLA Pause/Resume on State Change

```javascript
(function rule(current, previous) {
    if (current.operation() == 'update' && current.state) {
        var oldState = previous.state;
        var newState = current.state;
        var gr = new GlideRecord('task_sla');
        gr.addQuery('task', current.sys_id);
        gr.addQuery('stage', 'in progress');
        gr.query();
        while (gr.next()) {
            if (newState == 'resolved' || newState == 'closed') {
                gr.pause();
            } else if (oldState == 'resolved' || oldState == 'closed') {
                gr.restart();
            }
            gr.update();
        }
    }
})(current, previous);
```

---

## Out-of-Box Features

| Feature | Description | Where |
|---------|-------------|-------|
| Incidents | Track broken things reported by users | All > Incident > All |
| Problems | Root cause of incidents | All > Problem > All |
| Changes | Planned changes to IT services | All > Change > All |
| Change Tasks | Tasks within a change | All > Change > Tasks |
| Knowledge Base | Articles for agents and users | All > Knowledge > All |
| Service Catalog | Service requests from catalog | All > Service Catalog > All |
| SLAs | Service Level Agreements | All > Service Level Management > SLA Definitions |
| CMDB | Configuration items and relationships | All > CMDB > CI List |
| Dashboards | ITSM performance dashboards | All > ITSM > Dashboards |

---


## 🔍 Process Deep Dives

### 🚨 Incident Management
- **Major Incident Management (MIM):** A separate process for high-impact outages. Includes a "Communication Plan" to update stakeholders.
- **Incident Tasks:** Breaking down a complex fix into smaller, assignable pieces.
- **On-Call / Escalations:** Using `cmn_rota` to ensure the right person is paged when an SLA is about to breach.
- **SLAs/OLAs:** Service Level Agreements (Customer) vs Operational Level Agreements (Internal Team).

🚀 **Interview Insight:** Focus on the **"Restore Service"** goal. Mention that Incident is about speed, while Problem is about the root cause.

### 🧩 Problem Management
- **Root Cause Analysis (RCA):** The process of finding the *why*.
- **KEDB (Known Error Database):** Publishing workarounds so Incident agents can resolve tickets faster without escalating.
- **Problem Tasks:** Investigating logs or testing a fix.
- **Permanent Fix vs Workaround:** A workaround restores service; a permanent fix prevents recurrence.

### ⚙️ Change Management
- **Change Types:**
  - **Standard:** Low risk, pre-approved (e.g., monthly patching).
  - **Normal:** Needs CAB approval, risk assessed.
  - **Emergency:** Fixes a critical outage; approved by ECAB.
- **CAB (Change Advisory Board):** The group that reviews and approves Normal changes.
- **Blackout windows:** Dates where no changes are allowed (e.g., Black Friday for retail).

### 📦 Request Fulfillment
- **Catalog Item:** The "Product" the user sees.
- **Record Producer:** A simple form that creates a record (Incident or Case).
- **RITM (Requested Item):** The actual order.
- **Catalog Task:** The work assigned to a team (e.g., "Configure Laptop").
- **Approval workflows:** Manager $	o$ Finance $	o$ Fulfillment.

### 📖 Knowledge Management
- **Knowledge Bases:** Separating "Public" (customer) from "Internal" (agent) knowledge.
- **Article versioning:** Tracking changes to a KB over time.
- **AI Search:** Using Natural Language Processing (NLP) to find the right article faster.


## Key Table Hierarchy

### Core Tables

| Table | Purpose | Extends | Key Fields |
|-------|---------|---------|------------|
| `incident` | Broken things reported by users | `task` | `number`, `title`, `category`, `state`, `priority`, `assignment_group`, `assigned_to`, `caller_id`, `cmdb_ci` |
| `problem` | Root causes of incidents | `task` | `number`, `short_description`, `state`, `priority`, `assignment_group`, `caused_by` |
| `change_request` | Planned changes | `task` | `number`, `short_description`, `state`, `type`, `start_date`, `end_date`, `assignment_group` |
| `change_task` | Tasks within a change | `task` | `number`, `change_request`, `state`, `assigned_to` |
| `task` | Base task table | `task` | `number`, `short_description`, `state`, `priority`, `assignment_group` |
| `task_sla` | SLA records | `task` | `task`, `sla`, `state`, `breach_time`, `pause_count` |
| `cmdb_ci` | Configuration items | `task` | `name`, `serial_number`, `asset_tag`, `location`, `status` |
| `kb_knowledge` | Knowledge articles | `task` | `short_description`, `text`, `workflow_state`, `kb_category` |

### Table Relationships

```
incident
    │
    ├──► cmdb_ci (affected CI)
    ├──► assignment_group (assigned group)
    ├──► assigned_to (assigned person)
    ├──► caller_id (who reported)
    ├──► problem (linked problem)
    │
problem
    │
    ├──► incident (related incidents)
    ├──► change_request (related change)
    │
change_request
    │
    ├──► change_task (tasks within change)
    ├──► change_task (parent/child changes)
    │
task_sla
    │
    ├──► incident/problem/change_request (task)
    ├──► sla (SLA definition)
    │
cmdb_ci
    │
    ├──► cmdb_rel_ci (relationships to other CIs)
    │
```

### CMDB Integration

| ITSM Table | Maps to CMDB Table | Relationship |
|------------|-------------------|--------------|
| `incident` | `cmdb_ci` | Affected CI |
| `change_request` | `cmdb_ci` | Affected CIs (multiple) |
| `problem` | `cmdb_ci` | Root cause CI |
| `kb_knowledge` | `cmdb_ci` | Related CI (optional) |

---

## Integrations

| Integration | Direction | Purpose | Protocol |
|-------------|-----------|---------|----------|
| Email | Inbound/Outbound | Create incidents from email, send notifications | Email/SMTP |
| Discovery (MID Server) | Inbound | Auto-discover servers, network devices | Discovery/MID Server |
| CMDB | Bidirectional | Link incidents/changes to CIs | Internal |
| Knowledge Base | Inbound | Publish articles for agents/users | Internal |
| Service Catalog | Outbound | Create incidents from catalog requests | Internal |
| Remote Table | Inbound | View external asset data | Remote Table API |
| REST Message | Outbound | Call external monitoring tools | REST/SOAP |
| Event Management | Inbound | Create incidents from monitoring alerts | EM |
| Chat | Inbound | Create incidents from chat (MS Teams, Slack) | Chat API |

---

## Key Fields

| Table | Field | Type | Why It Matters |
|-------|-------|------|----------------|
| `incident` | `number` | String | Auto-number; user-facing ID |
| `incident` | `short_description` | String | Mandatory; searchable summary |
| `incident` | `category` | Choice | Drives assignment and routing |
| `incident` | `state` | Choice | New → In Progress → Resolved → Closed |
| `incident` | `priority` | Choice | Drives SLA and escalation |
| `incident` | `assignment_group` | Reference | Routing; who works it |
| `incident` | `assigned_to` | Reference | Individual owner |
| `incident` | `caller_id` | Reference | Who reported it |
| `incident` | `cmdb_ci` | Reference | Affected configuration item |
| `incident` | `impact` | Choice | Business impact level |
| `incident` | `urgency` | Choice | How quickly needed |
| `incident` | `close_code` | Choice | Why resolved (required at close) |
| `incident` | `close_notes` | String | Required at close |
| `problem` | `caused_by` | Reference | Incident that caused problem |
| `change_request` | `type` | Choice | Standard, Normal, Emergency |
| `change_request` | `risk` | Choice | Risk level |
| `change_request` | `implementation_plan` | String | Required for normal changes |
| `task_sla` | `breach_time` | DateTime | When SLA expires |

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Creating incidents without categories | Form fields don't appear | Define categories first |
| Not setting assignment_group | Incidents never get worked | Always assign a group |
| Editing state without understanding SLA | SLA pauses/resumes incorrectly | Understand state→SLA mapping |
| Deleting demo users | Flows break that reference them | Never delete; deactivate |
| Testing as admin only | ACLs bypassed; "it works" means nothing | Test as actual user |
| Making assignment_group optional | Tickets orphaned | Always required |
| Not closing with close_code/notes | Reporting is incomplete | Enforce at close |
| Creating custom fields when OOB exists | Unnecessary complexity | Use existing fields first |

---

## Deep Dive: A CSDM Map, End to End (SCCM Laptop Example)

The Common Service Data Model (CSDM) framework connects raw configuration items (CIs) to the business and technical services that rely on them. When you use the Service Graph Connector for SCCM, it targets the **Design** and **Manage Technical Services** domains of the CSDM, primarily populating the technical physical layer (CIs) and occasionally mapping them to foundational elements like models and manufacturers.

Here is a practical, end-to-end example of how a laptop brought in via SCCM maps across the CSDM domains.

### The End-to-End Map

| CSDM Domain | Table Name | Example Data / Record Name | Managed By / Source |
|-------------|------------|----------------------------|---------------------|
| Foundation (Core Metadata) | `core_company`, `cmdb_hardware_product_model` | Manufacturer: Lenovo · Model: ThinkPad X1 Carbon Gen 11 | Automatically normalized by Hardware Asset Management (HAM) using data ingested by the SCCM connector |
| Design (What is planned) | `cmdb_ci_business_app` | SCCM Endpoint Management | Enterprise Architecture / IT Planning |
| Manage Technical Services (How IT supports it) | `cmdb_ci_query_service` (Technical Service), `service_offering` (Tech Service Offering), `cmdb_ci_service_group` (Dynamic CI Group) | Technical Service: Workplace Compute Support · Offering: Windows Device Support – Gold · Dynamic CI Group: All Windows 11 Workstations | IT Support / Desktop Engineering. The Dynamic CI Group uses a CMDB query to automatically bundle all Windows 11 CIs populated by SCCM |
| Sell / Consume (The Business view) | `cmdb_ci_service_auto` (Business Service), `service_offering` (Business Service Offering) | Business Service: Employee Digital Workspace · Offering: Standard Remote Employee Package | Product Owner / Business Units |
| Build (The Infrastructure CIs) | `cmdb_ci_computer` (or `cmdb_ci_laptop`), `cmdb_sam_sw_install` | CI Name: LAPTOP-US-RE89 · Serial: L3-XYZ123 · OS: Windows 11 Pro · Software: MS 365, Adobe Acrobat | Service Graph Connector for SCCM. This is where the raw data contract lands, using the Identification and Reconciliation Engine (IRE) to avoid duplicates |

### Visualizing the Relationships (Top-Down Object Model)

The map establishes relationships between these layers so that if SCCM reports a laptop is broken, IT instantly understands the downstream business impact:

```
 [Sell/Consume]    Business Service: Employee Digital Workspace
                          │
                          ▼
 [Sell/Consume]    Business Offering: Standard Remote Employee Package
                          │
                          ▼
 [Technical]       Technical Service Offering: Windows Device Support - Gold
                          │
                          ▼
 [Technical]       Dynamic CI Group: All Windows 11 Workstations
                          │ (Automatically groups via CMDB Query)
                          ▼
 [Build / SCCM]    Configuration Item (CI): LAPTOP-US-RE89 (Lenovo ThinkPad)
                          │
                          ▼
 [Foundation]      Product Model: ThinkPad X1 Carbon Gen 11 ──► Manufacturer: Lenovo
```

### Why This Mapping Matters for SCCM

- **Dynamic Scoping:** Rather than manually linking thousands of laptops to a technical service, the CSDM uses a Dynamic CI Group. This group queries the CMDB for any laptop where `discovery_source = SG-SCCM` and `os = Windows 11`.
- **Blast Radius Analysis:** When an incident ticket is opened against LAPTOP-US-RE89, the Service Desk can look upstream at the CSDM map to see that this affects the Windows Device Support – Gold offering and rolls up to the Employee Digital Workspace business service.

---

## Lab: Create and Resolve Your First Incident

1. **Navigate** to All > Incident > All
2. **Click New** and fill:
   - Short Description: Email server not responding
   - Category: Network
   - Subcategory: Email
   - Priority: High
   - Assignment Group: IT Service Desk
   - Caller ID: Select a user (create one if needed)
   - Configuration Item: Select an email server CI (or create one)
   - Description: Users cannot send or receive email since 2 AM
3. **Submit** and note the incident number
4. **Open** the incident → change State to "In Progress"
5. **Add** a work note: "Investigating SMTP server connectivity"
6. **Assign** to yourself (or a test user) in Assigned To
7. **Change** State to "Resolved"
8. **Fill** Close Code: "Resolved by IT"
9. **Fill** Close Notes: "Restarted SMTP service; issue resolved"
10. **Change** State to "Closed"
11. **Verify** in Related Lists: Task SLA, Tasks, Approvals, Knowledge, Comments


---

## 🎓 Official Learning Resources

Direct paths to official ServiceNow training for IT Service Management (ITSM):

- **[IT Service Management (ITSM) Learning Path](https://learning.servicenow.com/lxp/en/it-service-management/it-service-management-itsm-implementer?id=learning_path_prev&path_id=7f7c2b24db1e7300de3cdb85ca961931)** — The primary end-to-end training.
- **[IT Service Management (ITSM) Course](https://learning.servicenow.com/lxp/en/it-service-management/it-service-management-itsm-fundamentals?id=learning_path_prev&path_id=c77ce43d1b39ac9868ad53de1d4bcb7d)** — Focused on-demand training.

---

## 📺 Visual & Video Guides

### ITSM Demo
<div style="text-align: center; margin: 1.5rem 0;">
  <iframe width="560" height="315" src=" title="ITSM Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

Fallback link: [ITSM Demo]()

---

## 🎓 Official Learning Resources

Direct paths to official ServiceNow training for IT Service Management (ITSM):

- **[IT Service Management (ITSM) Learning Path](https://learning.servicenow.com/lxp/en/it-service-management/it-service-management-itsm-implementer?id=learning_path_prev&path_id=7f7c2b24db1e7300de3cdb85ca961931)** — The primary end-to-end training.
- **[IT Service Management (ITSM) Course](https://learning.servicenow.com/lxp/en/it-service-management/it-service-management-itsm-fundamentals?id=learning_path_prev&path_id=c77ce43d1b39ac9868ad53de1d4bcb7d)** — Focused on-demand training.

---

## 📺 Visual & Video Guides

### ITSM Demo
<div style="text-align: center; margin: 1.5rem 0;">
  <iframe width="560" height="315" src=" title="ITSM Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

Fallback link: [ITSM Demo]()
---

## Quiz

1. What fields determine incident priority, and where is that matrix defined?
<details><summary>Answer</summary>Impact and Urgency; defined in the Priority Lookup table.</details>

2. What record type implements an SLA on a given incident?
<details><summary>Answer</summary>SLA Definition</details>

3. Name three things that break if you reorder state values.
<details><summary>Answer</summary>Workflows, Reporting, State-based scripts.</details>

4. What is the difference between an incident and a problem?
<details><summary>Answer</summary>Incident = Restoration of service; Problem = Root cause identification.</details>

5. What field determines which assignment group gets the incident?
<details><summary>Answer</summary>Assignment Group field.</details>

---

---

## 🎓 Official Learning Resources

**Important:** ServiceNow does not host full-length structured training courses on YouTube. To avoid unofficial or outdated community content, always use the following authoritative sources:

1. **Now Learning (Structured Training)**
   - The only official source for certification paths, badges, and structured video courses.
   - [Go to Now Learning Portal](https://nowlearning.servicenow.com/) $\rightarrow$ Search for the module name.
   
2. **Product Documentation (Technical Reference)**
   - The absolute source of truth for every table, field, and OOB behavior.
   - [ServiceNow Product Documentation](https://docs.servicenow.com/) $\rightarrow$ Search for the module name.
