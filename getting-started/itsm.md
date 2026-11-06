---
layout: default
title: ITSM — Getting Started
---

# ITSM — Getting Started (2026)

**One line:** ITSM is the module that turns "something is broken" into a tracked, prioritised, SLA-bound record that survives audit — incident, problem, change, request.

Back to the [guide index](./index.md) · [CSM](./csm.md) · [FSM](./fsm.md) · [TSOM](./tsom.md) · [Sales CRM](./sales-crm.md) · [HAM](./ham.md)

---

## 1. What you actually build

| Record | Question it answers | Table |
|---|---|---|
| Incident | Something is broken — restore service | `incident` |
| Problem / Problem Task | Why does it keep breaking — remove the cause | `problem`, `problem_task` |
| Change / Change Task | What are we changing, who approved it, how do we back out | `change_request`, `change_task` |
| Request / Requested Item | A person asked for something from the catalogue | `sc_request`, `sc_req_item` |
| Knowledge | The answer we should not have to rediscover | `kb_knowledge` |
| SLA | The clock, and who owes what by when | `task_sla`, `contract_sla` |

All of them extend `task`. That single fact explains 80% of the module: assignment, priority, state, work notes, SLA and approvals are inherited, so if you learn `task` once you can read every ITSM record.

---

## 2. Out-of-the-box features worth knowing before you customise

- **Incident lifecycle + Major Incident** — `Incident > Create Major Incident` promotes a record, spawns a problem/change and opens a bridge; do not hand-roll this.
- **Problem tasks and known-error workflow** — `problem.known_error = true` plus a knowledge article is the OOTB "stop reopening the same incident" path.
- **Change models** (`change_model`, standard/normal/emergency), **change calendar**, **conflict detection**, **CAB workbench**, **test and validate** states.
- **Service Catalog** — `sc_cat_item`, variables, variable sets, two-step checkout, approval policies (`sysapproval_approver`).
- **SLA engine** — `contract_sla` + SLA definitions with start/stop/pause conditions; `task_sla` is the live clock. Retroactive start, pause on `On Hold`, breach workflows.
- **Assignment rules / Assignment Lookup Rules**, **Work Assignment** and **Advanced Work Assignment** for routing.
- **Agent Workspace**, **Service Operations Workspace**, **Configurable Workspace** — the 2026 default UI; list views are for admin work only.
- **Performance Analytics + Process Optimization** — OOTB dashboards for open incidents, MTTR, SLA attainment, backlog ageing.
- **Now Assist for ITSM** — case summarisation, resolution notes generation, similar-incident search (requires the AI licence, not a custom LLM integration).
- **Virtual Agent + AI Search** — deflection for password resets and status checks.

**Rule of thumb:** if a requirement can be met by a change model, an SLA definition or an assignment rule, do that instead of a Business Rule. Every script you add is a future upgrade conflict.

---

## 3. Key table hierarchy

```
task
├── incident                      (service restoration)
├── problem                       (root cause)
│   └── problem_task              (investigation work)
├── change_request                (planned change)
│   ├── change_task               (implementation / CAB work)
│   └── change_request_imac       (move/add/change bundle)
├── sc_request                    (catalogue request header)
│   └── sc_req_item               (one line item = one fulfilment task)
│       └── sc_task               (catalogue task, e.g. "ship laptop")
└── task_sla  → contract_sla      (the clock attached to any task)

Reference data
├── cmdb_ci                       (the thing that broke — CI class tree)
├── sys_user / sys_user_group     (who owns it)
├── cmn_location                  (where it is)
├── core_company                  (vendor / department)
└── kb_knowledge                  (articles, linked to CI and service)
```

Relationships that matter in interviews:

- `incident.cmdb_ci` → `cmdb_ci` — impact analysis and "which service is down".
- `incident.problem_id` → `problem` — many incidents, one root cause.
- `change_request` → `task_rel_task` / affected CIs — what a change touches.
- `sc_req_item.cat_item` → `sc_cat_item` — what was ordered.
- `task_sla.task` → any task — the SLA is generic, the definition is specific.

---

## 4. Reusable code and metadata

### 4.1 Business Rule — auto-link a major incident to an open problem (before update)

```javascript
// Name: Incident - link open problem by CI
// Table: incident | When: before | Update: true | Condition: current.major_incident == true && current.problem_id.nil()
(function executeRule(current, previous /*null when async*/) {
  var gr = new GlideRecord('problem');
  gr.addQuery('cmdb_ci', current.cmdb_ci);
  gr.addQuery('state', '!=', 4);          // 4 = closed
  gr.orderByDesc('sys_created_on');
  gr.setLimit(1);
  gr.query();
  if (gr.next()) {
    current.problem_id = gr.getUniqueValue();
    current.work_notes = 'Auto-linked to open problem ' + gr.getValue('number');
  }
})(current, previous);
```

### 4.2 Script Include — SLA health for a task (client-callable)

```javascript
var SlaHealth = Class.create();
SlaHealth.prototype = Object.extendsObject(AbstractAjaxProcessor, {

  // client: var ga = new GlideAjax('SlaHealth'); ga.addParam('sysparm_name','percentConsumed'); ...
  percentConsumed: function () {
    var taskId = this.getParameter('sysparm_task');
    var total = 0, used = 0;

    var sla = new GlideRecord('task_sla');
    sla.addQuery('task', taskId);
    sla.query();
    while (sla.next()) {
      var start = new GlideDateTime(sla.getValue('start_time'));
      var end   = new GlideDateTime(sla.getValue('planned_end_time'));
      if (!start.isValid() || !end.isValid()) continue;
      total += GlideDateTime.subtract(start, end).getNumericValue();       // ms
      used  += GlideDateTime.subtract(start, new GlideDateTime()).getNumericValue();
    }
    return total > 0 ? Math.round((used / total) * 100) : 0;
  },

  type: 'SlaHealth'
});
```

### 4.3 Client Script — warn before closing an incident without resolution notes

```javascript
// Table: incident | Type: onSubmit
function onSubmit() {
  if (g_form.getValue('state') === '7' && g_form.getValue('close_notes') === '') {
    g_form.addErrorMessage('Close notes are required before resolving.');
    return false;
  }
}
```

### 4.4 ACL shape (scripted, table-level read condition)

```javascript
// Name: incident.read  | Type: record | Operation: read | Active: true
answer = gs.hasRole('itil') ||
         current.caller_id == gs.getUserID() ||
         current.opened_by == gs.getUserID();
```

### 4.5 Metadata you will actually touch

| Record | Table | Why |
|---|---|---|
| SLA definition | `contract_sla` | start/stop/pause conditions, schedule, workflow |
| Assignment rule | `sysrule_assignment` | route without code |
| Change model | `change_model` | states, approvals, lead time |
| Approval policy | `sys_approval_policy` (Flow Designer) | who signs off |
| Catalogue item | `sc_cat_item` | the thing users order |
| Variable set | `item_option_new_set` | shared form questions |
| Notification | `sysevent_email_action` | who gets told, when |

**Update-set shape** (abbreviated — this is the pattern, not a complete import):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<unload unload_date="2026-11-05 12:00:00">
  <sys_script action="INSERT_OR_UPDATE">
    <name>Incident - link open problem by CI</name>
    <collection>incident</collection>
    <when>before</when>
    <condition>current.major_incident==true&amp;&amp;current.problem_id.nil()</condition>
    <script><![CDATA[(function executeRule(current, previous) { /* see 4.1 */ })(current, previous);]]></script>
  </sys_script>
  <sys_properties action="INSERT_OR_UPDATE">
    <name>x_acme.itsm.problem_lookup_days</name>
    <type>integer</type>
    <value>90</value>
  </sys_properties>
</unload>
```

Create the record in the instance first, then export the update set — hand-written XML is for review and diffing, not for importing.

---

## 5. Integrations

| Direction | Pattern | Where it runs |
|---|---|---|
| Inbound | Email → `incident` (inbound email actions) | Platform |
| Inbound | REST `POST /api/now/table/incident` with a service account + ACL | Platform |
| Inbound | Monitoring tool → Event Management (`em_event`) → alert → incident | Platform + MID |
| Outbound | `RESTMessageV2` to a status page / Teams / Slack webhook | Platform |
| Outbound | Scheduled export (CSV/JSON) to a MID Server file target | MID Server |
| Both | IntegrationHub spoke (ServiceNow, Microsoft Teams, Jira, Slack, Azure) | Flow Designer |
| Directory | LDAP / SSO / SCIM for `sys_user` | Platform |
| Data | JDBC data source through MID Server → import set → transform map | MID Server |

Minimal outbound call (the pattern used in `servicenow-iplookup`):

```javascript
var req = new sn_ws.RESTMessageV2('IPInfo', 'Default GET');   // sys_rest_message record
req.setStringParameterNoEscape('ipaddress', '8.8.8.8');
var res = req.execute();
gs.info(res.getStatusCode() + ' ' + res.getBody());
```

Never hard-code credentials in the script — put them on the `sys_rest_message` record or a connection alias.

---

## 6. First lab (90 minutes, PDI)

1. Create an incident for a CI you own (`cmdb_ci`), set impact/urgency, watch priority calculate.
2. Add an SLA definition on `incident` (start: insert, pause: `On Hold`, stop: `Resolved`), then put the record on hold and confirm `task_sla` pauses.
3. Convert the incident to a problem, add two problem tasks, record a known error + knowledge article.
4. Create a normal change referencing the CI, move it through assess → authorise → scheduled → implement → review.
5. Add a catalogue item "Request access to app X", add an approval, order it, and walk the `sc_request → sc_req_item → sc_task` chain.
6. Open the Process Optimization / PA dashboard and find the SLA attainment number for what you just did.

---

## 7. Mistakes that get people rejected in interviews

- **Custom states on `incident`.** Extend with choices only if the customer signs off; breaking OOTB state values breaks every dashboard and SLA condition.
- **Business Rules where an SLA definition, assignment rule or Flow belongs.** Interviewers ask "why not a flow?" — have an answer.
- **Querying `task` instead of `incident`** and then wondering why catalogue tasks appear.
- **Skipping `setWorkflow(false)`** on bulk data loads → thousands of notifications.
- **Confusing `sc_request` with `sc_req_item`** — the request is the cart, the item is the thing being fulfilled.
- **Saying "SLA" when you mean "OLA"** — SLAs face the customer, OLAs and UCs are internal.

---

## 8. Where to go next

- `docs/modules/itsm/itsm-guide.md` in this repo for the longer walkthrough.
- HAM next if you are heading at ITAM (`alm_asset` extends the same task/CI thinking).
- CSM next if you want the customer-facing variant of the same pattern (`sn_customerservice_case` is a task too).
