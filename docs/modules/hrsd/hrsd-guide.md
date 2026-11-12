# HRSD — Human Resources Service Delivery

**Agent:** opencode  
**Date:** 2026-11-08  
**Module:** HRSD (Human Resources Service Delivery)  
**App:** HR Core / HRSD  
**Confidence:** high  

---

## Contents

- [Purpose](#purpose)
- [Prerequisites & Setup](#prerequisites--setup)
- [Where to Find It](#where-to-find-it)
- [Certification Alignment Note](#certification-alignment-note)
- [Re-usable Code / Metadata](#re-usable-code--metadata)
- [Out-of-Box Features](#out-of-box-features)
- [Key Table Hierarchy](#key-table-hierarchy)
- [HR Lifecycle Events](#hr-lifecycle-events)
- [Employee Center](#employee-center)
- [Goals, Benefits & Key Metrics](#goals-benefits--key-metrics)
- [Core Concept Diagrams](#core-concept-diagrams)
- [HRSD Roles & Role Containment](#hrsd-roles--role-containment)

---

## Purpose

HRSD is built to provide a consumer-grade experience for employees. Unlike ITSM, which is designed for "fixing broken things," HRSD is designed for "managing life events." It provides a secure, confidential way for employees to interact with HR, using a separate data model to ensure that sensitive HR data (like salary or medical info) is not visible to IT admins.

---

---

## Prerequisites & Setup

Before HRSD can deliver its "consumer-grade HR life-event experience," the underlying platform and HR-specific configuration must be in place. The sections below cover the plugins, guided setup steps, system properties, cross-module dependencies, and ACLs that must be addressed before go-live.

### Plugins / Scoped Apps That Must Be Active

| Plugin / App | Plugin ID / Scope | Why It's Required |
|--------------|-------------------|-------------------|
| **HR Core / HRSD** | `sn_hr_core` (scoped app) | Core HRSD tables (`sn_hr_core_case`, `sn_hr_core_profile`, COE tables) and the HR module menu. Must be installed and activated. |
| **Service Catalog** | `com.sc` | HR Services are catalog items. Without the catalog, employees have no way to request HR services. |
| **Employee Center** | `com.snow.employeeservice.employee_center` | Provides the unified "front door" portal for HR, IT, and Legal. Required for the Employee Center intake flow. |
| **Workflow** | `com.snow.workflow` | Underpins Lifecycle Event journey orchestration and HR case workflows. |
| **Service Desk (CSM recommended)** | `com.snow.osd` / CSM | HR cases use SLAs, routing, and assignment rules from the CSM/Service Desk stack. Not strictly required but strongly recommended for SLA-driven case management. |
| **HR Analytics (optional)** | `sn_hr_analytics` | Pre-built HR dashboards and KPI tracking. Add later if HR reporting is needed. |

### Guided Setup Required

1. **Enable the HRSD module** — Install and activate the `sn_hr_core` scoped application from the ServiceNow Store (or request via your CSM). Verify it appears under `All > Human Resources`.
2. **Define HR Service Categories** — Navigate to `All > Human Resources > HR Services > Categories`. Create top-level categories (e.g., Payroll, Benefits, Time & Attendance, Employee Lifecycle) that will anchor your COE tables.
3. **Create COE (Center of Excellence) Tables** — For each category, create a COE table (e.g., `sn_hr_core_case_payroll`, `sn_hr_core_case_benefits`). These hold category-specific fields and security rules. COE tables extend `sn_hr_core_case`.
4. **Configure HR Profiles** — Navigate to `All > Human Resources > Employee Profiles`. Ensure the `sn_hr_core_profile` table is populated for all employees. HR Profiles hold sensitive data and must NOT be stored in `sys_user`.
5. **Set Up HR Services (Catalog)** — In `All > Service Catalog > HR Services`, create catalog items for each HR offering. Each service must map to exactly one COE table and one HR Service definition.
6. **Define HR Templates** — Create pre-fill templates for common requests (e.g., "New Hire Onboarding," "Benefits Enrollment," "Payroll Correction") to standardize case intake.
7. **Configure Lifecycle Events** — Navigate to `All > Human Resources > Lifecycle Events > Definitions`. Define event types (Onboarding, Offboarding, Transfer, etc.) and build journey templates that group tasks across departments (HR, IT, Facilities).
8. **Set Up Employee Center** — Navigate to `All > Employee Center > Portal`. Configure the taxonomy so HR services appear under the correct categories. Brand and configure the portal search and self-service experience.
9. **Define SLAs and Routing** — Create SLA definitions on `sn_hr_core_case` (and each COE table) so HR cases meet service-level targets. Configure assignment rules / assignment groups for each COE.

### System Properties to Consider

| Property | Purpose |
|----------|---------|
| `glide.hr.core.enable_employee_center` | Toggles Employee Center integration with HRSD. Verify it is `true`. |
| `glide.hr.core.case_management` | Controls case-management behavior on the HR case model. |
| `glide.case.management.sla` | Global SLA engine switch — ensure enabled if HR cases use SLAs. |
| `glide.sc.catalog.client_script` | Catalog client-side behavior; relevant if customizing HR service catalog items. |
| `hr.service.default_owner` | Default assignment group for HR services without explicit ownership. |
| `glide.user.default_department` | Used when auto-populating department on new HR Profiles. |

> **Tip:** Many HRSD behaviors are driven by metadata (services, templates, COE tables) rather than system properties. Check the properties above when HR cases are not routing, SLAs are not firing, or the Employee Center is not showing HR services.

### Cross-Module Dependencies

| Dependent Module | Direction | What It Provides to HRSD |
|------------------|-----------|--------------------------|
| **Service Catalog** | Inbound | HR Services are catalog items; intake flows from catalog → HR Service → HR Case. |
| **Employee Center** | Inbound | The unified portal UI; employees request HR services through it. |
| **CSM / Service Desk** | Bidirectional | SLAs, assignment groups, and case-management infrastructure for HR cases. |
| **Workflow / Flow Designer** | Inbound | Lifecycle Event orchestration and HR case task automation. |
| **HR Analytics** | Outbound | HRSD case and lifecycle data feeds HR dashboards and KPI tracking. |
| **CMDB** | Optional | Some Lifecycle Event tasks (e.g., IT asset provisioning) reference CIs in CMDB. Not a hard dependency for core HRSD. |

### ACLs Related to Core Tables

| Table | ACLs / Roles | Notes |
|-------|-------------|-------|
| `sn_hr_core_case` | `hr_case_agent`, `hr_case_admin`, `sn_hr_core_case` (table-level) | All HR case agents. Read/write controlled by COE-specific ACLs below. |
| `sn_hr_core_profile` | `hr_profile_agent`, `hr_profile_admin` | **Highly restricted.** Contains sensitive employee data (salary, benefits, medical). Never grant broad access. |
| `sn_hr_core_service` | `hr_service_agent`, `hr_service_admin` | HR Service definitions. HR admins only. |
| `sn_hr_core_case_payroll` (COE) | `hr_payroll_agent`, `hr_payroll_admin` | Payroll COE. Restricted to payroll team; prevents general HR agents from seeing salary data. |
| `sn_hr_core_case_benefits` (COE) | `hr_benefits_agent`, `hr_benefits_admin` | Benefits COE. Restricted to benefits team. |
| `sys_user` | Standard user ACLs (read) | HRSD reads `sys_user` for name/email/department but stores sensitive HR data in `sn_hr_core_profile`. |
| `sn_hr_le_case` | `hr_lifecycle_agent`, `hr_lifecycle_admin` | Lifecycle Event case records. |

> **Security rule of thumb:** COE tables must have tighter ACLs than the base `sn_hr_core_case` table. A general HR agent should be able to see the case header but not the payroll/benefits detail unless explicitly granted.

## HRSD Roles & Role Containment

ServiceNow roles can **contain** other roles. When a role contains another role, anyone with the containing role inherits all the capabilities of the contained role. This is the root cause of the most common HRSD security misconfiguration: the `admin` (System Administrator) role contains `sn_hr_core.admin` (HR Administrator) by default, so every IT admin can see sensitive HR data unless you break that containment.

### How role containment works

| Concept | Detail |
|---------|--------|
| **Role contains role** | If Role A contains Role B, a user with Role A automatically has Role B's capabilities. |
| **Grant flow** | Granting access to a role also grants access to every role that role contains (transitively). |
| **Where configured** | User Administration > Roles > open a role > **Contains Roles** tab > move roles between Available and Collection columns. |

### The default containment that creates an HR security risk

When the HR Core / HRSD plugin (`sn_hr_core`) activates:

- **HR Administrator (`sn_hr_core.admin`)** is contained in **System Administrator (`admin`)**.
- This means **every IT System Administrator automatically has full HR Administrator access** — they can view salary, medical info, and all HR cases/profiles via forms, lists, and UI.
- Only the HR Administrator (`sn_hr_core.admin`) can assign scoped HR roles.
- Lifecycle Events Administrator (`sn_hr_le.admin`) is also part of/contained in HR Admin (`sn_hr_core.admin`) when Lifecycle Events is active.

### Recommended end state (security best practice)

After HRSD system configuration is complete:

1. **Assign `sn_hr_core.admin` to at least two dedicated HR administrators.** The base system enforces a minimum admin count (property `sn_hr_core.min_admin_count`, default `2`) so you cannot accidentally delete your only HR admin.
   - If only one person has the HR admin role and that person is deactivated, no one can perform HR admin duties.
2. **Remove `sn_hr_core.admin` (and `sn_hr_le.admin`) from the `admin` role.** This prevents IT System Administrators from viewing sensitive HR information.
   - Navigate to **User Administration > Roles > admin > Contains Roles > Edit**.
   - Highlight `sn_hr_core.admin` (and `sn_hr_le.admin`) in the Contains Roles List and move them to the Collection column.
   - Click **Save**, then log out and log back in for the change to take effect.
3. **Re-point scheduled jobs.** The base system still requires a `admin` user to run scheduled jobs. Change the **Run as** field on each HR scheduled job to a dedicated user that has the HR admin role.
4. **Validate System user context.** The `system` user inherits `admin`. When you remove HR admin from `admin`, `system` loses HR admin access — validate any customizations/business rules that run as `system`.

### Key HRSD roles at a glance

| Role | What it can do | Contained in |
|------|---------------|--------------|
| `sn_hr_core.admin` (HR Administrator) | Assign any HR role; view/create/edit HR cases and HR profiles (incl. salary); access HR Administration, dashboards, reports; associate users to HR roles/groups/skills | `admin` (by default — remove after setup) |
| `sn_hr_le.admin` (Lifecycle Events Admin) | Manage Lifecycle Events groups, roles, UI config, dashboards; onboarding/offboarding journeys | `sn_hr_core.admin` |
| `sn_hr_pa.admin` (HR Performance Analytics Admin) | HR PA content packs, PA properties, Admin Console, dependency assessment | `sn_hr_core.admin` |
| `hr_case_agent` / `hr_case_admin` | HR case read/write on `sn_hr_core_case` | — |
| `hr_profile_agent` / `hr_profile_admin` | HR profile read/write on `sn_hr_core_profile` (sensitive: salary, benefits, medical) | — |

### Common HRSD role mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Leaving `sn_hr_core.admin` inside `admin` | Every IT admin can see salary and HR cases | Remove HR admin from `admin` after setup |
| Only one HR admin | No one can assign HR roles if that person leaves/is deactivated | Maintain ≥ 2 active HR admins (`sn_hr_core.min_admin_count`) |
| Storing sensitive HR data in `sys_user` | IT admins and broad roles can read private HR data | Use `sn_hr_core_profile` (HR Profile) instead |
| Forgetting scheduled-job `Run as` after removing HR admin from `admin` | HR scheduled jobs fail or lose access | Re-point Run as to a dedicated HR admin user |

---

### Breadcrumbs — What Needs to Be Enabled First

The order matters. Do not skip steps:

1. **Activate the HR Core / HRSD plugin** (`sn_hr_core`) — everything else depends on it.
2. **Verify Service Catalog is active** (`com.sc`) — HR services cannot exist without it.
3. **Enable Employee Center** (`com.snow.employeeservice.employee_center`) — required for the unified portal.
4. **Create HR Service Categories** — the top-level grouping for COE tables.
5. **Create COE Tables and their ACLs** — define the security boundary per category before any data lands.
6. **Create HR Services and map them to COEs** — the catalog → service → COE chain.
7. **Populate HR Profiles** — ensure every employee has a profile record.
8. **Configure Lifecycle Event definitions** — define journeys and their tasks.
9. **Set up Employee Center taxonomy** — surface HR services in the portal.
10. **Define SLAs and routing rules** — finalize the operational model for HR case handling.

Once these are in place, HRSD is ready for pilot and then full go-live.

---

## Where to Find It

| Breadcrumb | Path |
|------------|------|
| Module entry | All > Human Resources > ... |
| HR Cases | All > Human Resources > Cases > All |
| HR Profiles | All > Human Resources > Employee Profiles |
| Lifecycle Events | All > Human Resources > Lifecycle Events > All |
| Employee Center | All > Employee Center > Portal |

---

## Certification Alignment Note

HRSD does not have a dedicated mainline CIS exam. HRSD concepts are tested within:
- **CIS-CSM** (Domain 1: CSM foundational data model — 27%) — install base, entitlements, contracts overlap with HR case management
- **CSA** (Domain 5: Database Management and Platform Security — 30%) — data schema, access control, CMDB and CSDM overlap
- **CAD** (Domain 1: Designing and Creating an Application — 20%) — data model design for custom HR applications

For HRSD-specific preparation, ServiceNow recommends the HR Service Delivery Essentials training path on Now Learning.

---

## Re-usable Code / Metadata

### Scoped Application
HRSD lives in its own scope (`sn_hr_core`). This is critical for security.

### COE (Center of Excellence) Model
Instead of one giant table, HRSD uses **COEs**. Every HR service is mapped to a COE table (e.g., `sn_hr_core_case_payroll`).
- **Why?** It allows for specific security rules and fields per HR category without cluttering a single table.

### Re-usable metadata
- **HR Services:** The "Catalog Item" of HR. Defines the workflow and the COE it belongs to.
- **HR Templates:** Pre-fill case details for common requests.

---

## Out-of-Box Features

- **Case Management:** Tracking employee requests with tailored SLAs.
- **Lifecycle Events:** Orchestrating multi-department journeys (e.g., Onboarding requires IT for a laptop, Facilities for a desk, and HR for a contract).
- **Employee Center:** A single unified portal for HR, IT, and Legal requests.
- **HR Profiles:** A 360-degree view of the employee, separate from the `sys_user` record.

---

## Key Table Hierarchy

| Table | Purpose | Extends |
|-------|---------|---------|
| `sn_hr_core_case` | The base table for all HR cases | `task` |
| `sn_hr_core_profile` | Employee's private HR data | `sys_user` (via reference) |
| `sn_hr_core_service` | Definition of the HR service | `sys_user_group` (or custom) |
| `sn_hr_le_case` | Records for Lifecycle Event journeys | `sn_hr_core_case` |

---

## HR Lifecycle Events

Lifecycle Events are the "Killer Feature" of HRSD. They allow HR to group multiple tasks into one journey.

**Example: New Hire Onboarding**
1. **Pre-boarding:** Sign contract (HR Task).
2. **Day 1:** Issue laptop (IT Task).
3. **Week 1:** Benefits orientation (HR Task).

🚀 **Interview Insight:** When asked about Lifecycle Events, mention **"Journey Orchestration."** Explain that it ensures a consistent employee experience regardless of which department is performing the task.

---

## Employee Center

The Employee Center is the "Front Door." It moves away from separate portals (HR portal, IT portal) and provides a single search bar and a unified taxonomy.

---

## Goals, Benefits & Key Metrics

The business goal of HRSD is to give employees a consumer-grade, self-service way to manage HR life events, while giving HR teams a secure, SLA-driven case model for sensitive HR services.

|| Business Goal | Benefit | Example Key Metric | Example Value |
|----------------|-------------|--------------------|----------------|
|| Employee self-service adoption | Reduces HR service desk volume | Self-service adoption rate | ~60% of HR transactions via Employee Center |
|| HR case SLA attainment | Consistent service delivery | HR case SLA attainment | ≥ 90% of cases resolved within SLA |
|| Lifecycle journey completion | Coordinated employee experience | Lifecycle journey completion rate | ~100% within 30 days |
|| Benefits enrollment compliance | Reduce benefits errors | Benefits enrollment compliance rate | ≥ 95% |
|| HR CSAT | Employee satisfaction | HR CSAT | ≥ 4.5 / 5.0 |
|| Sensitive data exposure incidents | Privacy and compliance | Sensitive data exposure incidents | 0 critical findings |

**Example implementation targets:** ~90% HR case SLA attainment, ~60% self-service adoption, and ~100% lifecycle journey completion within defined windows.

---

## Core Concept Diagrams

### HR Lifecycle Event Journey Orchestration

```mermaid
flowchart TD
    Emp[Employee] --> Portal[Employee Center]
    Portal --> LE[Lifecycle Event Trigger]
    LE --> J[Onboarding Journey]
    J --> T1[HR Task Contract Paperwork]
    J --> T2[IT Task Laptop Access]
    J --> T3[HR Task Benefits Orientation]
    J --> T4[HR Task Payroll Setup]
    T1 --> C1[Task Completed]
    T2 --> C2[Task Completed]
    T3 --> C3[Task Completed]
    T4 --> C4[Journey Completed]

### HR Service to COE Data Segregation

```mermaid
graph TD
    HRSvc[HR Service Payroll] -->|maps to| COEpay[COE Table Payroll]
    HRSvc -->|maps to| COEben[COE Table Benefits]
    COEpay -->|restricts access| ACLE[COE ACLs]
    COEben -->|restricts access| ACLB[COE ACLs]
    HRSvc -->|flows to| HRCas[HR Case]

### Employee Center Request Intake Flow

```mermaid
flowchart LR
    Emp[Employee] --> EC[Employee Center]
    EC --> CAT[HR Service Catalog Item]
    CAT --> SVC[HR Service]
    SVC --> CAS[HR Case]
    CAS --> WFA[Workflow Task]
    WFA --> FUL[Fulfillment]
```

---

## ⚠️ ServiceNow Learning Warnings

- **Putting HR data in `sys_user`:** Never do this. Use the HR Profile. The `sys_user` table is too visible across the platform.
- **Ignoring COE security:** Forgetting to restrict access to the Payroll COE, allowing all HR agents to see salary data. Always verify ACLs on the specific COE table.
- **Over-complicating HR Services:** Creating 500 services when 20 categories would suffice. Keep the service catalog lean.
- **Bypassing the HR Case Model:** Trying to use standard `incident` tables for HR. HRSD requires the `sn_hr_core_case` hierarchy for the necessary privacy and COE logic.
- **Hard-coding User IDs in HR Workflows:** Always use references to the HR Profile to maintain data integrity as users move roles.

---

## SLAs, Dashboards & Workspaces

### SLA Support
- **task_sla usage**: HR cases use the Task SLA engine on `sn_hr_core_case` table. SLAs are defined per COE table (e.g., `sn_hr_core_case_payroll`, `sn_hr_core_case_benefits`) and trigger breach notifications, escalation paths, and SLA attainment reporting.
- **Module-specific SLA tables**: `sn_hr_core_case` (base), `sn_hr_core_case_payroll`, `sn_hr_core_case_benefits` (COEs). SLA policies are attached to service definitions and mapped through HR Service catalog items.
- **Typical metrics**: HR case SLA attainment ≥ 90%, average SLA breach time, escalation count per service category.

### OOTB Dashboards
- **HR Service Delivery Dashboard**: Displays case volume by category, SLA attainment rate, open cases by priority, and lifecycle journey completion status.

### OOTB Workspaces
- **HR Service Delivery Workspace**: `All > Human Resources > HR Service Delivery`. Breadcrumb: `All > Human Resources > HR Service Delivery`.

## Quiz

1. What is a COE in HRSD, and why is it used instead of a single table?
<details><summary>Answer</summary>Center of Excellence. It separates data into specific tables (e.g., Payroll, Benefits) to enable strict security and specific fields per category.</details>

2. What is the difference between an HR Profile and a User record?
<details><summary>Answer</summary>The User record (`sys_user`) is global and used for login/IT; the HR Profile is private and contains sensitive employment data.</details>

3. How does a Lifecycle Event differ from a standard HR Case?
<details><summary>Answer</summary>An HR Case is a single request; a Lifecycle Event is a journey consisting of multiple cases and tasks across different departments.</details>

---

---

## 🎓 Official Learning Resources

To avoid unofficial or outdated content, always use these validated official ServiceNow sources:

### 📺 Verified Videos & Playlists

### 🚀 Quick Start Guide
For those new to the module, we recommend starting with this official overview:
<div style="text-align: center; margin: 1.5rem 0;">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/hZ3pNnd6wP4" title="Human Resources Service Delivery Beginner Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
Fallback link: [Human Resources Service Delivery Official Overview](https://www.youtube.com/watch?v=hZ3pNnd6wP4)


- [ServiceNow Exchange: HRSD](https://www.youtube.com/playlist?list=PLkGSnjw5y2U6C0quY7-PyScOeP4mGZ78f)
- [ServiceNow Exchange: HR Service Delivery Academy](https://www.youtube.com/playlist?list=PLkGSnjw5y2U6Ud1dbR_94_zn-gTrytJQy)
- [ServiceNow Exchange: HRSD + ITSM + EC](https://www.youtube.com/playlist?list=PLkGSnjw5y2U4S7dJPF_oSg6_LaRs7tGUe)
- [Now Learning course (Introduction to HRSD)](https://learning.servicenow.com/lxp/en/hr-service-delivery/introduction-to-human-resources-service-delivery-hrsd?id=learning_course_prev&course_id=1343ed43c31f2518cfdf34ee05013189)

### 🚀 The Authoritative Path
1. **Now Learning (Structured Training)**
   - The only official source for certification paths and structured video courses.
   - [Go to Now Learning Portal](https://nowlearning.com/) $\rightarrow$ Search for "Human Resources Service Delivery"
   
2. **Product Documentation (Technical Reference)**
   - The definitive source for every table, field, and OOB behavior.
   - [ServiceNow Product Documentation](https://docs.servicenow.com/) $\rightarrow$ Search for "Human Resources Service Delivery"

---

## Related Guides

- [ITSM guide](./itsm-guide.md)
- [CMDB guide](./cmdb-guide.md)
- [HRSD getting-started](./../../getting-started/hrsd.md)

---
