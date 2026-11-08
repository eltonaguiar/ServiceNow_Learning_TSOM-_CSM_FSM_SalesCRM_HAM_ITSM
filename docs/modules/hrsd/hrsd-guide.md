# HRSD — Human Resources Service Delivery

**Agent:** opencode  
**Date:** 2026-11-08  
**Module:** HRSD (Human Resources Service Delivery)  
**App:** HR Core / HRSD  
**Confidence:** high  

---

## Contents

- [Purpose](#purpose)
- [Where to Find It](#where-to-find-it)
- [Re-usable Code / Metadata](#re-usable-code--metadata)
- [Out-of-Box Features](#out-of-box-features)
- [Key Table Hierarchy](#key-table-hierarchy)
- [HR Lifecycle Events](#hr-lifecycle-events)
- [Employee Center](#employee-center)
- [⚠️ ServiceNow Learning Warnings](#-servicenow-learning-warnings)
- [Quiz](#quiz)

---

## Purpose

HRSD is built to provide a consumer-grade experience for employees. Unlike ITSM, which is designed for "fixing broken things," HRSD is designed for "managing life events." It provides a secure, confidential way for employees to interact with HR, using a separate data model to ensure that sensitive HR data (like salary or medical info) is not visible to IT admins.

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

## ⚠️ ServiceNow Learning Warnings

- **Putting HR data in `sys_user`:** Never do this. Use the HR Profile. The `sys_user` table is too visible across the platform.
- **Ignoring COE security:** Forgetting to restrict access to the Payroll COE, allowing all HR agents to see salary data. Always verify ACLs on the specific COE table.
- **Over-complicating HR Services:** Creating 500 services when 20 categories would suffice. Keep the service catalog lean.
- **Bypassing the HR Case Model:** Trying to use standard `incident` tables for HR. HRSD requires the `sn_hr_core_case` hierarchy for the necessary privacy and COE logic.
- **Hard-coding User IDs in HR Workflows:** Always use references to the HR Profile to maintain data integrity as users move roles.

---

## Quiz

1. What is a COE in HRSD, and why is it used instead of a single table?
<details><summary>Answer</summary>Center of Excellence. It separates data into specific tables (e.g., Payroll, Benefits) to enable strict security and specific fields per category.</details>

2. What is the difference between an HR Profile and a User record?
<details><summary>Answer</summary>The User record (`sys_user`) is global and used for login/IT; the HR Profile is private and contains sensitive employment data.</details>

3. How does a Lifecycle Event differ from a standard HR Case?
<details><summary>Answer</summary>An HR Case is a single request; a Lifecycle Event is a journey consisting of multiple cases and tasks across different departments.</details>

---

## 🎓 Official Learning Resources

- **[HRSD Learning Path](https://learning.servicenow.com/lxp/en/human-resources/hr-service-delivery-implementation?id=learning_path_prev)** — The primary implementation path.

---

## 📺 Visual & Video Guides

### HRSD Overview
<div style="text-align: center; margin: 1.5rem 0;">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/S6Y_uK7r_Yc" title="HRSD Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
Fallback link: [HRSD Overview](https://www.youtube.com/watch?v=S6Y_uK7r_Yc)
