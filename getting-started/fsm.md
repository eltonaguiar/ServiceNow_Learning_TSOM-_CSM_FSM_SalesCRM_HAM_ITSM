---
layout: default
title: FSM — Getting Started
---

# FSM — Getting Started (2026)

**One line:** FSM takes a job that cannot be done remotely, decides *who* should do it, *when*, and with *what parts*, then proves it happened.

Back to the [guide index](./index.md) · [CSM](./csm.md) · [ITSM](./itsm.md) · [TSOM](./tsom.md) · [Sales CRM](./sales-crm.md) · [HAM](./ham.md)

---

## 1. What you actually build

| Object | Table | Note |
|---|---|---|
| Work Order | `wm_order` | The job. Extends `task` — one order can contain many tasks |
| Work Order Task | `wm_task` | A unit of work by one person, one place, one time |
| Work Type | `wm_work_type` | Repair / install / survey — drives what the task asks for |
| State flows | `sf_work_order`, `sf_work_task` | The OOTB lifecycle definitions behind the states |
| Questionnaire | `wm_questionnaire` | Questions the technician must answer on site |
| Marketplace request | `marketplace_request` | Third-party contractor engagement (if enabled) |
| Schedule | `cmn_schedule` | When the technician/resource is available |
| Asset / part | `alm_asset`, `sn_install_base_item` | What is being serviced or consumed |

FSM does **not** own the customer data. Account, contact, install base, contract and entitlement all come from the CRM Foundation — FSM just consumes them. That is why a technician can arrive knowing exactly what the customer bought.

---

## 2. Out-of-the-box features

- **Scheduling Optimization** — travel-time-aware assignment by skills, territory, availability, priority and SLA.
- **Dispatch / scheduling board** — drag-and-drop reassignment, map view, travel windows.
- **Territories and qualifications** — who is allowed to do what, where.
- **Crew and multi-day jobs**, plus **work order templates** and table mapping from `case`, `incident`, `change` into `wm_order`.
- **Mobile agent app** (Now Mobile / FSM mobile) — offline-capable task list, checklists, signature, photos, parts consumption.
- **Inventory and transfer orders** — parts reserved on the task, consumed on close, stockroom replenishment via `alm_*`.
- **Task SLAs** — `task_sla` applies to work orders and tasks, with response and resolution targets.
- **Field Service Marketplace** — push a task to contracted vendors when your own crew is saturated.
- **Performance Analytics** — first-time fix, on-time arrival, travel ratio, utilisation.
- **Playbooks** — guide the dispatcher and the technician through the same process definition.

---

## 3. Key table hierarchy

```
wm_order (extends task)
├── wm_task (extends task)            the technician's actual job
│   ├── task_sla                      response / resolution clock
│   ├── wm_questionnaire              on-site checklist
│   ├── alm_asset / sn_install_base_item   what is serviced
│   └── marketplace_request           when outsourced
├── customer_account / customer_contact   from CRM Foundation
├── sn_install_base_item ──► cmdb_ci      the unit at the site
├── service_entitlement ──► contract_sla  what the customer is owed
└── cmn_location                      where to go

Supporting
├── wm_work_type                      what kind of job this is
├── cmn_schedule                      availability windows
├── sys_user_group (dispatch group)   who can take it
└── alm_stockroom / alm_transfer_order parts
```

Order vs task — the distinction interviewers probe:

- An **order** is the commitment ("fix the HVAC at site 12 this week").
- A **task** is the dispatchable unit ("technician A, Tuesday 09:00–11:00").
- Closing the last task does not automatically close the order unless the state flow is configured to do so — check `sf_work_order`.

---

## 4. Reusable code and metadata

### 4.1 Business Rule — copy skills from the CI to the task (before insert)

```javascript
// Name: FSM - seed required skills from CI
// Table: wm_task | When: before | Insert: true
(function executeRule(current, previous) {
  if (current.cmdb_ci.nil()) return;

  var ci = current.cmdb_ci.getRefRecord();
  var skills = ci.getValue('u_required_skills');       // comma-separated sys_ids
  if (!skills) return;

  skills.split(',').forEach(function (skillId) {
    var m2m = new GlideRecord('task_m2m_skill');        // OOTB skill mapping
    if (!m2m.get('task', current.getUniqueValue(), 'skill', skillId)) {
      m2m.initialize();
      m2m.task = current.getUniqueValue();
      m2m.skill = skillId;
      m2m.insert();
    }
  });
})(current, previous);
```

### 4.2 Script Include — find the nearest qualified technician

```javascript
var FsmDispatch = Class.create();
FsmDispatch.prototype = {
  initialize: function () {},

  nearest: function (taskId) {
    var task = new GlideRecord('wm_task');
    if (!task.get(taskId)) return null;

    var gr = new GlideRecord('sys_user');
    gr.addActiveQuery();
    gr.addQuery('sys_user_grmember.group', task.assignment_group);  // in the dispatch group
    gr.query();

    var best = null, bestDistance = Number.MAX_VALUE;
    while (gr.next()) {
      var d = this._distanceKm(task.location, gr.getValue('location'));
      if (d !== null && d < bestDistance) { bestDistance = d; best = gr.getUniqueValue(); }
    }
    return best;
  },

  _distanceKm: function (fromId, toId) {
    if (!fromId || !toId) return null;
    var a = new GlideRecord('cmn_location'); if (!a.get(fromId)) return null;
    var b = new GlideRecord('cmn_location'); if (!b.get(toId))   return null;
    // cmn_location carries latitude/longitude; haversine kept short here
    var toRad = Math.PI / 180;
    var dLat = (b.latitude - a.latitude) * toRad;
    var dLon = (b.longitude - a.longitude) * toRad;
    var h = Math.sin(dLat / 2) ** 2 +
            Math.cos(a.latitude * toRad) * Math.cos(b.latitude * toRad) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(h));
  },

  type: 'FsmDispatch'
};
```

### 4.3 Client Script — require a close code before the technician closes

```javascript
// Table: wm_task | Type: onSubmit
function onSubmit() {
  if (g_form.getValue('state') === '3' && g_form.getValue('u_close_code') === '') {
    g_form.addErrorMessage('A close code is required to complete this task.');
    return false;
  }
}
```

### 4.4 Table map from a case to a work order (OOTB, no code)

`All > Field Service > Template Management > Table Mapping` → Source Table `sn_customerservice_case`, Target Table `wm_order`, map `account`, `contact`, `location`, `short_description`, `priority`. This is the OOTB way to turn a customer case into a dispatch — do not script it.

### 4.5 Metadata you will actually touch

| Record | Table | Why |
|---|---|---|
| Work order model | `cmdb_workorder_product_model` | reusable job template |
| Work type | `wm_work_type` | checklist and duration defaults |
| Qualification / skill | `wm_qualification`, `task_m2m_skill` | who is allowed |
| Territory | `wm_territory` | coverage area |
| Dispatch group | `sys_user_group` | routing bucket |
| Schedule | `cmn_schedule` | availability |
| SLA definition | `contract_sla` | response/resolution targets |

---

## 5. Integrations

| Direction | Pattern | Notes |
|---|---|---|
| Mobile | Now Mobile / FSM agent app | offline queue syncs on reconnect |
| Maps / routing | location lat-long on `cmn_location` | Scheduling Optimization uses travel time |
| Inventory | `alm_stockroom`, transfer orders | parts reserved and consumed on task close |
| ERP | IntegrationHub spoke (SAP/Oracle) | parts and pricing |
| CRM | native — same `customer_account` records | no integration needed |
| Outbound | `RESTMessageV2` to a vendor dispatch API | returns vendor reference on the task |
| Calendar | Microsoft 365 / Google Calendar spoke | technician availability |
| Contractors | Field Service Marketplace | `marketplace_request` |

---

## 6. First lab (90 minutes, PDI)

1. Activate FSM, create a work type "Install – network switch" and a work order template.
2. Create a work order for an account with an install base item and a location.
3. Let the OOTB business rule create the first `wm_task`; add a second task for a different day.
4. Add two skills to the CI and confirm they land on the task via the business rule above.
5. Configure a dispatch group and an AWA-style assignment; assign the task.
6. Close the task with a close code and questionnaire answer, then check whether the order auto-closes.
7. Open the FSM Overview dashboard and read work orders by priority + task SLA by stage.

---

## 7. Mistakes that get flagged in review

- **Creating orders without tasks.** Nothing is dispatchable; the board stays empty.
- **Using `incident` for field work.** Incident has no location/crew/parts model.
- **Putting customer data on `wm_order`.** It is already on the account/contact — duplicating it guarantees drift.
- **Ignoring travel time.** Utilisation looks great, on-time arrival is terrible.
- **Scripting the case→work-order conversion** when table mapping exists.
- **Assuming one task = one order.** Multi-visit jobs need several tasks or the crew model.

---

## 8. Where to go next

- [HAM](./ham.md) — the parts and assets FSM consumes.
- [CSM](./csm.md) — where the case that becomes a work order starts.
- Longer walkthrough: `docs/modules/fsm/fsm-guide.md`.
