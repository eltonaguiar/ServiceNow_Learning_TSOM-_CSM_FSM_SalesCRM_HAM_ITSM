# Custom Scoped Application Development — Interview Prep

**Agent:** opencode  
**Date:** 2026-11-10  
**Module:** Application Development (Scoped Apps, App Engine Studio)  
**Confidence:** high  

---

## Contents

- [Purpose](#purpose)
- [Scoped Application Fundamentals](#scoped-application-fundamentals)
- [Data Models & Tables](#data-models--tables)
- [Forms & UI](#forms--ui)
- [Business Rules](#business-rules)
- [Client Scripts](#client-scripts)
- [UI Policies & UI Actions](#ui-policies--ui-actions)
- [GlideRecord & GlideAjax](#gliderecord--glideajax)
- [Application Scope & Cross-Scope Access](#application-scope--cross-scope-access)
- [ACLs & Scope Protection](#acls--scope-protection)
- [Collapsible Labs](#collapsible-labs)
- [Key Tables](#key-tables)
- [Common Mistakes](#common-mistakes)
- [Interview Talking Points](#interview-talking-points)
- [Official Learning Resources](#official-learning-resources)

---

## Purpose

Custom scoped application development is the core skill for a ServiceNow Developer. You should be able to design, build, and extend scoped applications end-to-end — from data model (tables, fields, relationships) through business logic (Business Rules, Client Scripts, UI Policies, UI Actions) to integration points (REST, GlideAjax).

A scoped application encapsulates its data, logic, and UI within a namespace (`com.yourcompany.appname`), preventing naming collisions and enabling controlled cross-scope access. This is the pattern behind every custom ServiceNow application.

---

## Scoped Application Fundamentals

### Application Scope

| Concept | Description |
|---------|-------------|
| **Scope** | A namespace that owns tables, fields, scripts, and UI elements within one application |
| **Scope name** | Format: `com.company.appname` (e.g., `com.court.casemanagement`) |
| **Cross-scope access** | Controlled via "Accessible from" (read) and "Accessible to" (write) settings on tables, scripts, and flows |
| **Scope protection** | Prevents other scopes from calling your scripts or reading your tables unless explicitly granted |

### App Engine Studio vs Classic

| | App Engine Studio | Classic (Application Menus & Modules) |
|---|---|---|
| **Interface** | Modern, visual, no-code-first | Legacy table-by-table configuration |
| **Best for** | New custom apps, rapid prototyping | Maintaining existing scoped apps |
| **Output** | Creates scoped app automatically | Requires manual scope creation |

---

## Data Models & Tables

### Table Creation Best Practices

| Field Type | Use Case |
|------------|----------|
| String | Names, descriptions, short text |
| Reference | Links to another table (e.g., `cmdb_ci`, `user`, `task`) |
| Choice | Dropdown with predefined values |
| Date/Time | Timestamps, due dates |
| Integer / Decimal | Numeric values, amounts |
| Glide Duration | Time intervals |
| HTML | Rich text content |

### Table Design Checklist

- [ ] Extend `task` if the record is work-related (incident-like)
- [ ] Set appropriate `Allow configuration` flag
- [ ] Configure access controls (ACLs) before adding data
- [ ] Add meaningful labels for every field
- [ ] Set `Dependent on` fields for conditional visibility
- [ ] Consider audit fields (`sys_created_on`, `sys_updated_on`, etc.)

---

## Forms & UI

### Form Design

| Element | Purpose |
|---------|---------|
| **Form layout** | Sections, tabs, field placement for user efficiency |
| **Dependent fields** | Show/hide fields based on other field values |
| **Mandatory fields** | Enforced via UI Policy or dictionary |
| **Read-only fields** | Enforced via UI Policy or ACL |
| **Related lists** | Show child records (e.g., tasks on a case) |

### UI Actions

| Type | When It Runs | Use Case |
|------|--------------|----------|
| **List** | On list view | Bulk actions on multiple records |
| **Form button** | On form, client-side | Submit, approve, reject |
| **Form link** | On form, client-side | Navigate to related page |
| **List choice** | List row context menu | Action on a single list row |

---

## Business Rules

### When to Use

| Timing | Runs | Use Case |
|--------|------|----------|
| **Before** | Before insert/update/delete | Validate, set defaults, modify fields before save |
| **After** | After insert/update/delete | Create related records, send notifications |
| **Async** | After commit | Send email, call external API (doesn't block user) |

### Business Rule Example

```javascript
(function rule(current, previous) {
    if (current.operation() == 'insert' && current.priority == '1') {
        current.assignment_group = 'Critical Incident Team';
        current.urgency = '1';
    }
})(current, previous);
```

**Key objects:** `current` (the record being saved), `previous` (the record before changes), `gs` (system APIs), `g_form` (client-side only, not available in BR).

---

## Client Scripts

### When to Use

| Type | Trigger | Use Case |
|------|---------|----------|
| **onLoad** | Form loads | Set defaults, hide fields, make fields read-only |
| **onChange** | Field value changes | Validate input, update dependent fields |
| **onSubmit** | Form submits | Final validation before save |
| **onCellEdit** | List cell edits | Validate inline edits |

### Client Script Example

```javascript
function onLoad(executionContext) {
    if (!gs.hasRole('admin')) {
        g_form.setReadOnly('cost_center', true);
    }
}

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (control.getName() == 'category' && newValue) {
        g_form.clearValue('subcategory');
    }
}
```

**Key objects:** `g_form` (form API), `g_user` (current user info), `g_scratchpad` (pass data between scripts).

---

## UI Policies & UI Actions

### UI Policies

Declarative form behavior — no JavaScript required:

| Setting | Purpose |
|---------|---------|
| **Mandatory** | Field required based on condition |
| **Read-only** | Field locked based on condition |
| **Visible** | Field shown/hidden based on condition |
| **Override** | Allow or prevent users from changing the setting |

### UI Actions

| Placement | Trigger | Use Case |
|-----------|---------|----------|
| **Form button** | User clicks button on form | Approve, reject, escalate |
| **Form link** | User clicks link on form | Open related record |
| **List choice** | User right-clicks list row | Action on selected row |
| **List button** | User clicks button on list | Bulk action |

---

## GlideRecord & GlideAjax

### GlideRecord (Server-Side)

```javascript
var gr = new GlideRecord('incident');
gr.addQuery('priority', '1');
gr.addQuery('state', '!=', 'closed');
gr.setLimit(10);
gr.query();
while (gr.next()) {
    gs.print(gr.number + ': ' + gr.short_description);
    gr.assignment_group = 'Critical Team';
    gr.update();
}
```

### GlideAjax (Server → Client Communication)

**Script Include (server):**

```javascript
var MyAppAjax = Class.create();
MyAppAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getRecordCount: function() {
        var table = this.getParameter('table');
        var gr = new GlideRecord(table);
        gr.query();
        return gr.getRowCount();
    },
    type: 'MyAppAjax'
});
```

**Client Script (calls server):**

```javascript
var ga = new GlideAjax('MyAppAjax');
ga.addParam('sysparm_name', 'getRecordCount');
ga.addParam('table', 'incident');
ga.getXML( function(response) {
    var count = response.responseXML.documentElement.getAttribute('answer');
    g_form.showFieldMsg('record_count', 'Total: ' + count, 'info');
});
```

---

## Application Scope & Cross-Scope Access

### Scope Configuration

| Setting | Purpose |
|---------|---------|
| **Accessible from** | Which scopes can READ this table/script |
| **Accessible to** | Which scopes can WRITE to this table/script |
| **Application scope** | The scope that owns the artifact |

### Example: Cross-Scope Access

If your app `com.court.casemanagement` has a table `x_court_case` and you want `com.snc.itsm` to read it:

1. Open `x_court_case` table record
2. Set **Accessible from** → `All scopes` or specific scope `com.snc.itsm`
3. Set **Accessible to** → `This application scope only` (or specific scopes)

---

## ACLs & Scope Protection

### ACL Structure

| Field | Purpose |
|-------|---------|
| **Type** | `record`, `field`, `table` |
| **Operation** | `read`, `write`, `create`, `delete`, `list` |
| **Object** | Table name or table.field |
| **Condition** | Script condition that must evaluate to true |
| **Script** | Advanced condition logic |

### ACL Evaluation Order

1. **None** → if no ACL matches, access denied (secure by default)
2. **First matching ACL wins** — most specific wins
3. **Role-based** — `admin`, `itil`, custom roles
4. **Condition-based** — `current.urgency == '1'` etc.

---

## Collapsible Labs

<details>
<summary><strong>Lab 1: Create a Scoped Application with a Custom Table</strong></summary>

**Goal:** Build a scoped application with a custom table, form, and basic business logic.

**Steps:**
1. Navigate to **System Applications > Studio** → **New Application**
2. Name: "Case Management Demo", Scope: `com.court.casemgmt`
3. Add a table: `x_court_case` with fields:
   - `case_number` (String, mandatory)
   - `case_type` (Choice: Civil, Criminal, Family)
   - `priority` (Choice: High, Medium, Low)
   - `assigned_judge` (Reference to `sys_user`)
   - `hearing_date` (Date/Time)
4. Create a form: Add sections, arrange fields, set dependent fields (e.g., show `hearing_date` only when `case_type` is not null)
5. Create a Business Rule: Before insert, auto-generate `case_number` if empty
6. Create a Client Script: onLoad, make `assigned_judge` read-only unless role is `admin`
7. Activate the application and test by creating a record

**Verify:** The table, form, business rule, and client script all work together.

</details>

<details>
<summary><strong>Lab 2: GlideRecord + GlideAjax Integration</strong></summary>

**Goal:** Build a server-side lookup that a client script calls via GlideAjax.

**Steps:**
1. Create a Script Include named `CourtCaseLookup`:
   ```javascript
   var CourtCaseLookup = Class.create();
   CourtCaseLookup.prototype = Object.extendsObject(AbstractAjaxProcessor, {
       getCaseCountByType: function() {
           var type = this.getParameter('case_type');
           var gr = new GlideRecord('x_court_case');
           gr.addQuery('case_type', type);
           gr.query();
           return gr.getRowCount();
       },
       type: 'CourtCaseLookup'
   });
   ```
2. Create a Client Script on `x_court_case` form:
   ```javascript
   function onChange(control, oldValue, newValue, isLoading) {
       if (control.getName() == 'case_type' && newValue) {
           var ga = new GlideAjax('CourtCaseLookup');
           ga.addParam('sysparm_name', 'getCaseCountByType');
           ga.addParam('case_type', newValue);
           ga.getXML(function(response) {
               var count = response.responseXML.documentElement.getAttribute('answer');
               g_form.showFieldMsg('case_type', 'Cases of this type: ' + count, 'info');
           });
       }
   }
   ```
3. Test: Change `case_type` on the form, verify the message appears.

</details>

<details>
<summary><strong>Lab 3: ACLs & Cross-Scope Access</strong></summary>

**Goal:** Configure table access control and cross-scope permissions.

**Steps:**
1. Create an ACL on `x_court_case`:
   - Type: `record`, Operation: `read`, Object: `x_court_case`
   - Condition: `current.case_type != 'Criminal'` or Role: `itil`
2. Create an ACL on `x_court_case.case_number`:
   - Type: `field`, Operation: `write`, Object: `x_court_case.case_number`
   - Role: `admin` only
3. Set cross-scope access on `x_court_case`:
   - Accessible from: `All scopes`
   - Accessible to: `This application scope only`
4. Test: Try reading/writing from a different scope application.

</details>

---

## Key Tables

| Table | Purpose |
|-------|---------|
| `sys_app` | Application scope definitions |
| `sys_app_scope` | Scope access rules |
| `sys_dictionary` | Table and field definitions |
| `sys_ui_form` | Form layouts |
| `sys_ui_section` | Form sections |
| `sys_script` | Business Rules, Script Includes, Client Scripts |
| `sys_ui_policy` | UI Policies |
| `sys_ui_policy_action` | UI Policy actions (set mandatory, read-only, visible) |
| `sys_ui_action` | UI Actions (buttons, links, menu items) |
| `sys_security_acl` | Access Control Lists |

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| No scope defined on custom table | Table not accessible from other apps | Set scope and cross-scope access explicitly |
| Business Rule running on every update | Performance issues, infinite loops | Add `if (current.operation() == 'insert')` guards |
| Using `g_form` in Business Rule | Script fails — `g_form` is client-side only | Use `current` and `gs` in BR; `g_form` only in Client Scripts/UI Policies |
| No ACLs on custom table | Default deny — nobody can see records | Create ACLs with appropriate roles/conditions |
| Hardcoding scope names in scripts | Breaks when app is cloned to different scope | Use `gs.getProperty('glide.app.scope')` or relative references |
| GlideAjax without error handling | Silent failures on server errors | Check `response.status` and handle errors |

---

## Interview Talking Points

**Q: "How do you design a custom scoped application?"**

A: "I start with the data model — identify what tables are needed, whether they extend `task` or stand alone, and what relationships exist. Then I define the application scope (`com.company.appname`) and configure cross-scope access so other apps can read/write as needed. I build forms with UI Policies for conditional behavior, add Business Rules for server-side logic, and Client Scripts for client-side validation. Finally, I secure everything with ACLs and test end-to-end."

**Q: "When do you use a Business Rule vs a Client Script vs a UI Policy?"**

A: "UI Policies for declarative form behavior (show/hide, mandatory, read-only). Client Scripts for client-side interactivity (field validation, dependent fields, onLoad defaults). Business Rules for server-side logic (auto-populate fields, create related records, enforce business rules across all access paths including imports and APIs)."

**Q: "How does GlideAjax work?"**

A: "GlideAjax lets client-side code call a server-side Script Include. The client sends parameters via `addParam`, the server executes a method in the Script Include and returns an XML response. I use it when I need server data (like a record count) without refreshing the form."

**Q: "What is scope protection and why does it matter?"**

A: "Scope protection ensures that tables, scripts, and flows in one application can't be accessed or modified by other applications unless explicitly allowed. It prevents naming collisions and security issues. I configure 'Accessible from/to' settings on tables and scripts, and use ACLs to enforce row- and field-level security."

---

## Official Learning Resources

### Now Learning (Structured Training)
- [Certified Application Developer (CAD) path](https://nowlearning.com/) — Search "CAD" on Now Learning Portal
- [App Engine Studio Fundamentals](https://nowlearning.com/) — Search "App Engine Studio" on Now Learning Portal
- [Application Development Fundamentals](https://nowlearning.com/) — Search "application development" on Now Learning Portal
- [Server-side Scripting](https://nowlearning.com/) — Search "GlideRecord" or "server-side scripting" on Now Learning Portal

### Product Documentation (Technical Reference)
- [ServiceNow Product Documentation — Application Development](https://docs.servicenow.com/) → Search "scoped application", "App Engine Studio"
- [ServiceNow Product Documentation — GlideRecord](https://docs.servicenow.com/) → Search "GlideRecord API reference"
- [ServiceNow Product Documentation — GlideAjax](https://docs.servicenow.com/) → Search "GlideAjax"
- [ServiceNow Product Documentation — ACLs](https://docs.servicenow.com/) → Search "access control lists"

### Official Videos & Playlists
- [ServiceNow YouTube Channel](https://www.youtube.com/c/ServiceNow) — Search "ServiceNow scoped application", "ServiceNow App Engine Studio", "ServiceNow GlideRecord", "ServiceNow Business Rule"
- [CAD exam prep](https://www.youtube.com/results?search_query=servicenow+CAD+exam+prep)
- [App Engine Studio demo](https://www.youtube.com/results?search_query=servicenow+app+engine+studio+demo)

---
