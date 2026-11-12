# JavaScript Reference — Glide APIs & Scripting Patterns

**Agent:** opencode  
**Date:** 2026-11-12  
**Module:** AI (platform scripting reference)  
**App:** Now Platform  
**Confidence:** high

---

## Contents

- [Purpose](#purpose)
- [GlideRecord — Server-Side Record Queries](#gliderecord--server-side-record-queries)
- [GlideSystem — System Utilities](#glidesystem--system-utilities)
- [GlideAjax — Client-to-Server Bridge](#glideajax--client-to-server-bridge)
- [GlideForm — Client-Side Form Manipulation](#glideform--client-side-form-manipulation)
- [Business Rule — Server-Side Data Logic](#business-rule--server-side-data-logic)
- [Script Include — Reusable Server-Side Library](#script-include--reusable-server-side-library)
- [UI Policy — Declarative Form Logic](#ui-policy--declarative-form-logic)
- [UI Action — Client/Server Button](#ui-action-client-server-button)
- [Scheduled Job — Periodic Execution](#scheduled-job--periodic-execution)
- [GlideDateTime — Date/Time Manipulation](#glidedatetime-date-time-manipulation)
- [GlideAggregate — Aggregation Queries](#glideaggregate--aggregation-queries)
- [GlideUser — User Information](#glideuser--user-information)
- [GlideAttachment — File Attachments](#glideattachment--file-attachments)
- [GlideEmailOutbound — Sending Email](#glideemailoutbound--sending-email)
- [GlideSysAttachment — Alternative Attachment API](#glidesysattachment--alternative-attachment-api)
- [GlideFilter — Record Filter Evaluation](#glidefilter--record-filter-evaluation)
- [GlideDate — Date-Only Operations](#glidedate--date-only-operations)
- [GlideDuration — Time Duration](#glideduration--time-duration)
- [GlideTime — Time-Only Operations](#glidetime--time-only-operations)
- [GlideSysLog — System Logging](#glidesyslog--system-logging)
- [GlideSession — Session Information](#glidesession--session-information)
- [GlideDBObjectManager — Database Operations](#glidedbobjectmanager--database-operations)
- [GlideSystem Properties — Common Properties](#glidesystem-properties--common-properties)
- [Client Script Types](#client-script-types)
- [Business Rule Types](#business-rule-types)
- [Common Scripting Patterns](#common-scripting-patterns)
- [Related Guides](#related-guides)
- [Official Learning Resources](#official-learning-resources)

---

## Purpose

This page consolidates the ServiceNow platform JavaScript reference patterns into a coding-focused reference for platform scripting. It covers the Glide APIs (GlideRecord, GlideSystem, GlideAjax, GlideForm, etc.) plus Business Rules, Script Includes, UI Policies, UI Actions, and Scheduled Jobs — the core scripting surface area tested in ServiceNow CSA/CAD interviews and used daily by ServiceNow developers.

Use this page when you need a copy-pasteable code pattern for a specific Glide API or scripting construct.

---

## GlideRecord — Server-Side Record Queries

```javascript
// Basic query
var gr = new GlideRecord('incident');
gr.addQuery('priority', '1');
gr.addQuery('state', '!=', '6'); // not Resolved
gr.orderBy('sys_created_on');
gr.setLimit(50);
gr.query();

while (gr.next()) {
  gs.print(gr.number + ' - ' + gr.short_description);
}

// Insert a new record
var grNew = new GlideRecord('incident');
grNew.initialize();
grNew.short_description = 'AI-generated incident';
grNew.description = 'Drafted by Now Assist Skill Kit';
grNew.priority = '3';
grNew.insert();

// Update existing record
var grUpd = new GlideRecord('incident');
grUpd.get('SYSTEM_ID_HERE');
grUpd.work_notes = 'Resolution drafted via AI Skill Kit';
grUpd.update();

// Delete record
var grDel = new GlideRecord('incident');
grDel.get('SYSTEM_ID_HERE');
grDel.deleteRecord();
```

**Key methods:** `get()`, `insert()`, `update()`, `deleteRecord()`, `query()`, `next()`, `addQuery()`, `orderBy()`, `setLimit()`, `initialize()`

---

## GlideSystem — System Utilities

```javascript
// Current user info
gs.getUserID();           // Returns current user's sys_id
gs.getUserName();         // Returns current user's display name
gs.getUserByID('sys_id'); // Returns GlideUser object

// Logging
gs.info('Informational message');
gs.warn('Warning message');
gs.error('Error message');
gs.debug('Debug message');
gs.print('Debug output (visible in background scripts)');

// Date/time
gs.nowDateTime();         // Current date/time in system format
gs.daysAgo(7);            // Date 7 days ago
gs.minutesAgo(30);        // Date 30 minutes ago

// Property access
gs.getProperty('glide.ui.timezone');
gs.getSession().putProperty('temp.key', 'value');
```

---

## GlideAjax — Client-to-Server Bridge

**Client Script (asynchronous — never blocks the UI):**

```javascript
function onSubmit() {
  var ga = new GlideAjax('MyScriptInclude');
  ga.addParam('sysparm_name', 'getIncidentCount');
  ga.addParam('sysparm_category', g_form.getValue('category'));
  ga.getXML(function(response) {
    var answer = ga.getAnswer();
    g_form.addInfoMessage('Incident count: ' + answer);
  });
}
```

**Server-side Script Include:**

```javascript
var MyScriptInclude = Class.create();
MyScriptInclude.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  getIncidentCount: function() {
    var category = this.getParameter('sysparm_category');
    var gr = new GlideRecord('incident');
    gr.addQuery('category', category);
    gr.query();
    return gr.getRowCount();
  },
  type: 'MyScriptInclude'
});
```

**Important:** Always use GlideAjax instead of `g_form.getReference()` to avoid freezing the browser UI while waiting for server response.

---

## GlideForm — Client-Side Form Manipulation

```javascript
// Client Script - onLoad
function onLoad() {
  // Set field value
  g_form.setValue('priority', '3');
  
  // Make field mandatory
  g_form.setMandatory('short_description', true);
  
  // Show/hide field
  g_form.setDisplay('work_notes', true);
  
  // Set field read-only
  g_form.setReadOnly('number', true);
  
  // Add info message
  g_form.addInfoMessage('AI features enabled for this form');
}

// Client Script - onChange
function onChange() {
  var category = g_form.getValue('category');
  if (category === 'software') {
    g_form.setMandatory('u_software_version', true);
  }
}

// Client Script - onSubmit
function onSubmit() {
  if (!g_form.getValue('cmdb_ci')) {
    g_form.addErrorMessage('Please select a Configuration Item before submitting');
    return false;
  }
}
```

---

## Business Rule — Server-Side Data Logic

```javascript
// Before Business Rule on incident table
(function executeRule(current, previous) {
  // Auto-assign based on category
  if (current.category === 'network' && current.assignment_group.nil()) {
    current.assignment_group = 'Network Team';
  }
  
  // Set priority based on impact and urgency
  if (current.impact === '1' && current.urgency === '1') {
    current.priority = '1';
  }
  
  // Log AI-generated changes
  if (current.u_ai_generated === true) {
    gs.info('Incident ' + current.number + ' was AI-generated');
  }
})(current, previous);
```

---

## Script Include — Reusable Server-Side Library

```javascript
var AIHelper = Class.create();
AIHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  summarizeIncident: function(incidentSysId) {
    var gr = new GlideRecord('incident');
    if (!gr.get(incidentSysId)) return 'Incident not found';
    
    var summary = 'Incident ' + gr.number + ': ' + gr.short_description;
    summary += '\nState: ' + gr.getDisplayValue('state');
    summary += '\nPriority: ' + gr.getDisplayValue('priority');
    summary += '\nWork notes: ' + gr.work_notes;
    
    return summary;
  },
  
  getRelatedIncidents: function(ciSysId, limit) {
    var gr = new GlideRecord('incident');
    gr.addQuery('cmdb_ci', ciSysId);
    gr.orderByDesc('sys_created_on');
    gr.setLimit(limit || 10);
    gr.query();
    
    var results = [];
    while (gr.next()) {
      results.push({
        number: gr.number,
        short_description: gr.short_description,
        state: gr.getDisplayValue('state')
      });
    }
    return JSON.stringify(results);
  },
  
  type: 'AIHelper'
});
```

---

## UI Policy — Declarative Form Logic

UI Policies provide declarative (no-code) logic to show/hide fields, set mandatory, or set read-only based on conditions. Example:

- **Condition:** `category` is `software`
- **Action:** Set `u_software_version` to mandatory
- **Action:** Set `u_license_type` to visible

---

## UI Action — Client/Server Button

```javascript
// UI Action on incident table - client script
function onClick(control) {
  var ga = new GlideAjax('AIHelper');
  ga.addParam('sysparm_name', 'summarizeIncident');
  ga.addParam('sysparm_incident_sys_id', g_form.getUniqueValue());
  ga.getXML(function(response) {
    var summary = ga.getAnswer();
    g_form.addInfoMessage(summary);
  });
}

// UI Action server script (runs on server)
var incident = new GlideRecord('incident');
incident.get(current.sys_id);
incident.work_notes = 'AI summary generated at ' + gs.nowDateTime();
incident.update();
```

---

## Scheduled Job — Periodic Execution

```javascript
// Scheduled Job script (server-side)
var gr = new GlideRecord('incident');
gr.addQuery('state', '!=', '6'); // not Resolved
gr.addQuery('priority', '1');
gr.query();

while (gr.next()) {
  gs.log('P1 incident still open: ' + gr.number);
  // Could trigger AI summarization or escalation
}
```

---

## GlideDateTime — Date/Time Manipulation

```javascript
var gdt = new GlideDateTime();
gs.print(gdt.getValue());           // Current date/time
gs.print(gdt.getDisplayValue());    // Human-readable format

var gdtFuture = new GlideDateTime();
gdtFuture.addDaysUTC(7);
gs.print(gdtFuture.getDisplayValue()); // 7 days from now

var diff = gdtFuture.getDifference(gdt);
gs.print('Days difference: ' + diff.getDayPart());
```

---

## GlideAggregate — Aggregation Queries

```javascript
var grAgg = new GlideAggregate('incident');
grAgg.addQuery('state', '!=', '6');
grAgg.groupBy('priority');
grAgg.count('sys_id');
grAgg.query();

while (grAgg.next()) {
  gs.print('Priority ' + grAgg.priority + ': ' + grAgg.getAggregate('COUNT', 'sys_id') + ' incidents');
}
```

---

## GlideUser — User Information

```javascript
var user = gs.getUser();
gs.print(user.getUserName());       // Display name
gs.print(user.getUserID());         // sys_id
gs.print(user.getDepartment());     // Department
gs.print(user.getCompany());        // Company
gs.print(user.hasRole('admin'));    // Boolean role check
gs.print(user.getMemberOfGroups()); // Groups user belongs to
```

---

## GlideAttachment — File Attachments

```javascript
// Add attachment to record
var ga = new GlideAttachment();
ga.write('incident', 'SYSTEM_ID', 'resolution_notes.txt', 'text/plain', 'AI-generated resolution notes');

// Retrieve attachments
var attachments = new GlideAttachment();
var attachmentList = attachments.get('incident', 'SYSTEM_ID');
```

---

## GlideEmailOutbound — Sending Email

```javascript
var email = new GlideEmailOutbound();
email.setTo('user@example.com');
email.setSubject('AI-generated incident summary');
email.setBody('Your incident has been processed by AI Skill Kit.');
email.send();
```

---

## GlideSysAttachment — Alternative Attachment API

```javascript
var gsa = new GlideSysAttachment();
gsa.writeContent('incident', 'SYSTEM_ID', 'ai_draft.txt', 'Draft resolution notes from AI', 'text/plain');
```

---

## GlideFilter — Record Filter Evaluation

```javascript
var gf = new GlideFilter();
var gr = new GlideRecord('incident');
gr.get('SYSTEM_ID');

if (gf.match(gr, 'priority=1^state!=6')) {
  gs.print('Record matches filter criteria');
}
```

---

## GlideDate — Date-Only Operations

```javascript
var gd = new GlideDate();
gs.print(gd.getValue());       // Current date
gs.print(gd.getDisplayValue()); // Human-readable date
gd.addDays(30);
gs.print(gd.getDisplayValue()); // 30 days from now
```

---

## GlideDuration — Time Duration

```javascript
var gd = new GlideDuration();
gd.setValue(3600); // 1 hour in seconds
gs.print(gd.getDisplayValue()); // Human-readable duration
```

---

## GlideTime — Time-Only Operations

```javascript
var gt = new GlideTime();
gs.print(gt.getValue());       // Current time
gs.print(gt.getDisplayValue()); // Human-readable time
```

---

## GlideSysLog — System Logging

```javascript
gs.log('Custom log message');           // System log
gs.print('Debug output');               // Background script output
gs.info('Info message');                // Info level
gs.warn('Warning message');             // Warning level
gs.error('Error message');              // Error level
```

---

## GlideSession — Session Information

```javascript
var session = gs.getSession();
gs.print(session.getUserID());          // Current user sys_id
gs.print(session.getClientBrowser());   // Browser info
gs.print(session.getClientIPAddress()); // Client IP
gs.print(session.getLanguage());        // Session language
```

---

## GlideDBObjectManager — Database Operations

```javascript
var dbom = new GlideDBObjectManager();
var count = dbom.getRecordCount('incident');
gs.print('Total incidents: ' + count);
```

---

## GlideSystem Properties — Common Properties

| Property | Description | Example Value |
|----------|-------------|---------------|
| `glide.ui.timezone` | System timezone | `America/Toronto` |
| `glide.ui.date_format` | Date display format | `yyyy-MM-dd` |
| `glide.ui.time_format` | Time display format | `HH:mm` |
| `glide.smtp.server` | SMTP mail server | `smtp.example.com` |
| `glide.basetime.date` | Base time reference | `1970-01-01` |

---

## Client Script Types

| Type | When It Runs | Use Case |
|------|-------------|----------|
| `onLoad` | Form loads | Set defaults, show/hide fields |
| `onChange` | Field value changes | Dynamic field behavior |
| `onSubmit` | Form submits | Validation before save |
| `onCellEdit` | List cell edits | Inline list editing |

---

## Business Rule Types

| Type | When It Runs | Use Case |
|------|-------------|----------|
| `before` | Before DB write | Validate/modify data |
| `after` | After DB write | Trigger subsequent actions |
| `async` | After commit | Long-running tasks (emails, integrations) |

---

## Common Scripting Patterns

**Async vs Sync:** Always prefer asynchronous patterns (GlideAjax, async Business Rules) to avoid blocking the UI thread.

**Error Handling:** Wrap GlideRecord operations in try/catch blocks for production code.

**Null Checks:** Always check `gr.get()` returns true before accessing fields on a GlideRecord.

**Display Values:** Use `getDisplayValue()` for reference fields to show human-readable labels instead of sys_ids.

---

## Performance Tweaks & Debugging — JavaScript / Server-Side

ServiceNow server-side JavaScript (business rules, script includes, transform scripts, scheduled jobs) runs on the platform's Rhino/Nashorn JVM. Poorly written scripts can slow down form saves, imports, and the entire instance.

### GlideRecord Performance

| Problem | Symptom | Fix |
|---------|---------|-----|
| `get()` without `setLimit()` | Query scans entire table | Always add `setLimit(1)` when checking existence: `gr.addQuery('serial_number', 'SN-123'); gr.setLimit(1); gr.query();` |
| Selecting all fields | `gr.query()` loads every column | Use `gr.addQuery()` + `gr.setLimit()` + only access needed fields; or use `gr.getValue()` selectively |
| Dot-walking in queries | `model.cpu_type = 'Xeon'` forces table join | Query `cmdb_model` first, collect sys_ids, then query target table with `model IN [sys_ids]` |
| Looping with individual queries | N+1 query problem in for-loops | Use `addQuery('sys_id', 'IN', idList)` with a single query instead of querying inside a loop |
| No index on filtered field | Full table scan on large tables | Add database index on frequently filtered fields (Dictionary → Indexed = true) |

### Business Rule Performance

| Problem | Symptom | Fix |
|---------|---------|-----|
| `before` rule doing heavy work | Form save feels slow | Move long-running work to an `async` business rule |
| Rule fires on every field change | Unnecessary DB writes | Use `current.field.changes()` to only act when relevant fields change |
| `after` rule calling external API | Save waits for API response | Use `async` type instead — the API call won't block the user |
| Multiple rules on same table | Unpredictable execution order | Set `Order` field; lower numbers run first |

### Client Script Performance

| Problem | Symptom | Fix |
|---------|---------|-----|
| Heavy logic in `onLoad` | Form takes long to render | Defer non-critical work; use `g_form.showFieldMsg()` sparingly |
| `onChange` firing on every keystroke | UI lag during typing | Check `g_form.getControl('field').value` changed meaningfully before acting |
| Synchronous GlideAjax | Browser freezes during call | Always use asynchronous GlideAjax with callback |

### Debugging Server-Side JavaScript

| Tool | What It Shows | How to Access |
|------|--------------|---------------|
| **System Logs** (`sys_log`) | `gs.print()`, `gs.error()`, `gs.info()` output | All > System Logs > System Logs |
| **Business Rule execution** | Which rules fired, in what order | Add `gs.print('BR ' + current.number + ' running')` at the top of each rule |
| **ECC Queue** | MID Server probe/sensor results | MID Server > ECC Queue (for integration/Discovery issues) |
| **Thread Dump** | Long-running threads blocking | System Diagnostics > Thread Dump (admin only) |
| **Node Stats** | Instance CPU/memory pressure | System Diagnostics > Stats > Stats |

### Quick Performance Wins

1. **Always use `setLimit()`** — especially on existence checks (`setLimit(1)`)
2. **Prefer `async` business rules** — for emails, REST calls, and integrations that don't block the user
3. **Guard with `.changes()`** — only run logic when the relevant field actually changed
4. **Avoid dot-walks in queries** — join in code instead of forcing SQL joins
5. **Add indexes on filter fields** — `name`, `serial_number`, `data_source`, `install_status` on `cmdb_ci`
6. **Profile with `gs.print()`** — log timestamps before/after slow operations to identify bottlenecks

---

### Cross-Reference

- **[CMDB Guide → Security & ACLs](../cmdb/cmdb-guide.md#security--acls-for-cmdb)** — Access Control rules that gate who can read/write CMDB tables and fields
- **[CMDB Guide → Performance Tweaks & Debugging](../cmdb/cmdb-guide.md#performance-tweaks--debugging-for-cmdb)** — CMDB-specific query optimization, index guidance, and IRE debugging

---


## Related Guides

- **[AI Platform Guide](./ai-guide.md)** — AI-native tiers, Now Assist, Predictive Intelligence, Virtual Agent, AI Agents, NASK, governance, cost management
- **[ITSM Guide](../itsm/itsm-guide/)** — Incident, Problem, Change, Request, Knowledge lifecycle
- **[Custom Application Development Interview Prep](../../interviews/custom-application-development/)** — Scoped apps, Business Rules, Client Scripts, GlideRecord, GlideAjax

---

## Official Learning Resources

- [ServiceNow JavaScript API Reference](https://developer.servicenow.com/dev.do#!/reference/api)
- [GlideRecord API](https://developer.servicenow.com/dev.do#!/reference/api/newyork/server/r_GlideRecordAPI)
- [GlideAjax API](https://developer.servicenow.com/dev.do#!/reference/api/newyork/server/r_GlideAjaxAPI)
- [GlideForm API](https://developer.servicenow.com/dev.do#!/reference/api/newyork/client/c_GlideFormAPI)
- [Business Rules](https://docs.servicenow.com/cdo?topic=com.servicenow.doc.doc_apis/b_apis/business_rules.html)
- [Script Includes](https://docs.servicenow.com/cdo?topic=com.servicenow.doc.doc_apis/b_apis/script_includes.html)

---

*Part of the ServiceNow Module Guides. Verify specifics against your instance's entitlements, release, and official ServiceNow documentation.*
