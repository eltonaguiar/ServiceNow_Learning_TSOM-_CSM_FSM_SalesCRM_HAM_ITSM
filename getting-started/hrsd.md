---
layout: default
title: HRSD — Getting Started
---

# HRSD — Getting Started (2026)

**One line:** HR Service Delivery (HRSD) answers three questions on every employee interaction — *who is the employee, what do they need, what are they eligible for* — and ties them to one record: the HR case.

Back to the [guide index](./index.md) · [ITSM](./itsm.md) · [CSM](./csm.md) · [FSM](./fsm.md) · [TSOM](./tsom.md) · [Sales CRM](./sales-crm.md) · [HAM](./ham.md) · [Discovery](./discovery.md)

---

## 1. What you actually build

| Object | Table | Why it exists |
|---|---|---|
| HR Case | `sn_hr_core_case` | The central record; extends `task`, so SLA, assignment, state, and work notes behave like ITSM |
| HR Profile | `sn_hr_core_profile` | The employee's HR record — job, manager, department, location, hire date |
| HR Criteria | `sn_hr_criteria_matrix` | Rules that decide which HR skills/template apply based on employee attributes (department, location, job grade) |
| Lifecycle Event | `sn_hr_lifecycle_event` | Hire, terminate, promote, transfer — triggers automated HR tasks and case creation |
| HR Knowledge | `kb_knowledge` | HR policy articles employees can self-serve in the Employee Center |
| HR Skill | `sn_hr_skill` | Tags agents with expertise (payroll, benefits, onboarding) for skills-based routing |
| HR Template | `sn_hr_template` | Predefined case content for repeatable request types (new hire, address change) |

**The HRSD mindset:** like CSM, the *employee* is the subject and the case is the work. HRSD adds eligibility rules (criteria) and lifecycle automation (hire/terminate events) that ITSM doesn't have.

---

## 2. Out-of-the-box features

- **HR Case** — extends `task`, so assignment groups, SLAs, states (New → In Progress → Resolved → Closed), and work notes all work out of the box
- **Employee Center** — the employee-facing portal: browse HR services, submit cases, view knowledge, track case status
- **HR Criteria Matrix** — match employee attributes (department, location, job) to the right HR skill and case template automatically
- **Lifecycle Events** — hire, rehire, transfer, promote, terminate events auto-generate HR cases and tasks (onboarding task lists, offboarding checklists)
- **HR Knowledge Base** — policy articles with visibility rules (who can see what by role/department)
- **HR Skills + AWA** — route cases to agents with matching skills (payroll, benefits, visa) using Advanced Work Assignment
- **HR Templates** — prepopulate case fields for common request types so agents don't retype the same info
- **HR Dashboards** — case volume by category, time-to-resolve, open cases by department

---

## 3. Key table hierarchy

```
sn_hr_core_profile                     the employee's HR record
├── department, company, location      where they work
├── manager                            their people manager
├── job / job grade                    role and level
└── sn_hr_core_case (extends task)     HR cases for this employee
    ├── task_sla                       clock driven by entitlement/SLA definition
    ├── sn_hr_template                 template used to create this case
    ├── sn_hr_skill                    skill required to handle it
    └── kb_knowledge                   article used / written during resolution

sn_hr_criteria_matrix                  rules: employee attributes → HR skill/template
sn_hr_lifecycle_event                  hire / terminate / promote / transfer triggers
sn_hr_skill                            agent expertise tags for routing
```

Relationships that matter:
- `sn_hr_core_case.employee` → `sn_hr_core_profile` — every case belongs to an employee
- `sn_hr_core_case.category` → drives which HR skill and template apply via the criteria matrix
- `sn_hr_lifecycle_event` → generates cases/tasks automatically (onboarding = N tasks)

---

## 4. Reusable code and metadata

### 4.1 Business Rule — auto-assign payroll cases by skill

```javascript
// Name: HRSD - auto-assign payroll cases
// Table: sn_hr_core_case | When: before | Insert: true
(function executeRule(current, previous) {
  if (current.category == 'payroll' && current.assignment_group.nil()) {
    var gr = new GlideRecord('sn_hr_skill');
    gr.addQuery('name', 'Payroll');
    gr.query();
    if (gr.next()) {
      current.assign_to = gr.getValue('assignment_group');
    }
  }
})(current, previous);
```

### 4.2 Script Include — lookup the right HR template by category

```javascript
var HrTemplate = Class.create();
HrTemplate.prototype = {
  initialize: function () {},
  findByCategory: function (category) {
    var gr = new GlideRecord('sn_hr_template');
    gr.addQuery('category', category);
    gr.addQuery('active', true);
    gr.orderByDesc('sys_created_on');
    gr.setLimit(1);
    gr.query();
    return gr.next() ? gr.getUniqueValue() : null;
  },
  type: 'HrTemplate'
};
```

### 4.3 Client Script — show manager field only for termination cases

```javascript
// Table: sn_hr_core_case | Type: onChange | Field: category
function onChange(control, oldValue, newValue, isLoading) {
  if (isLoading) return;
  g_form.setDisplay('u_manager_notification', newValue == 'termination');
  if (newValue !== 'termination') g_form.clearValue('u_manager_notification');
}
```

### 4.4 Metadata you will actually touch

| Record | Table | Why |
|---|---|---|
| HR Case category | `sn_hr_core_category` | case types (onboarding, offboarding, payroll, benefits) |
| HR Criteria record | `sn_hr_criteria_matrix` | employee attributes → HR skill + template |
| Lifecycle event | `sn_hr_lifecycle_event` | hire/terminate/promote automation triggers |
| HR Skill | `sn_hr_skill` | agent expertise for skills-based routing |
| HR Template | `sn_hr_template` | prepopulated case content per category |
| SLA definition | `contract_sla` | the clock behind HR case SLAs |
| Knowledge category | `kb_category` | HR policy article visibility |

---

## 5. Integrations

| Direction | Pattern | Notes |
|---|---|---|
| UKG Pro / Dimensions | Inbound REST API / webhooks | new hires, terminations, time-off flow into HRSD as HR cases |
| Workday / SAP HCM | Inbound REST or MID Server JDBC | employee master data keeps HR Profile in sync |
| Benefits admin | Outbound RESTMessageV2 | enroll/change benefits when HR case resolves |
| Identity / SSO | SCIM or SAML | provision Employee Center access when hired |
| Payroll system | Outbound REST / flat file | send approved time-off and salary changes |

**Common pattern:** UKG webhook → ServiceNow Scripted REST API → create HR case → assign to Payroll skill → SLA starts.

---

## 6. First lab (90 minutes, PDI)

1. Create an HR Profile (employee record) with department, manager, job grade.
2. Create HR Case categories: Onboarding, Offboarding, Payroll, Benefits.
3. Create HR Criteria records mapping department+location → HR skill (e.g., "Finance + NY → Payroll NY").
4. Create an HR Template for "New Hire Onboarding" prepopulating category, skill, and description.
5. Open an HR Case from the employee as an onboarding request; watch the criteria pick the skill/template.
6. Create a Lifecycle Event (hire) and confirm it auto-generates onboarding tasks.
7. Publish an HR knowledge article ("How to request time off") and confirm it appears in Employee Center search.

---

## 7. Mistakes that get flagged in review

- **Using `incident` for HR issues.** HR cases live on `sn_hr_core_case`; mixing them with ITSM incidents breaks HR data segregation and reporting.
- **Skipping HR Criteria.** Without criteria, every case needs manual skill/template assignment — defeats the purpose of HRSD automation.
- **Hard-coding assignment groups.** Use HR Skills + AWA so routing follows employee attributes, not names.
- **Ignoring Lifecycle Events.** Hire/terminate automation is HRSD's headline feature; demo it in interviews.
- **Employee Center visibility wrong.** HR knowledge articles need the right `kb_category` visibility or employees can't find them.

---

## 8. Where to go next

- [CSM](./csm.md) — the same case/task model with a customer instead of an employee
- [ITSM](./itsm.md) — incident/problem/change that HR cases may escalate into
- Longer walkthrough: `docs/modules/hrsd/hrsd-guide.md`