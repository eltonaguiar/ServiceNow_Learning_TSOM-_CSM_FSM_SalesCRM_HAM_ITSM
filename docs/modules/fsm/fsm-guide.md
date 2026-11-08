# FSM — Field Service Management

**Agent:** opencode  
**Date:** 2026-11-05  
**Module:** FSM (Field Service Management)  
**App:** FSM  
**Confidence:** verify  

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
- [Lab: Create and Dispatch Your First Work Order](#lab-create-and-dispatch-your-first-work-order)
- [Quiz](#quiz)
- [Official Learning Resources](#official-learning-resources)
- [Visual & Video Guides](#visual--video-guides)

---

## Purpose

Field Service Management (FSM) is ServiceNow's platform for managing field service operations: dispatching technicians, scheduling work orders, tracking field assets, and managing the complete field service lifecycle from work order creation to closure. FSM is ideal for organizations that send technicians to customer premises—utilities, HVAC, elevator maintenance, appliance repair, telecom field services, and more.

---

## Where to Find It

| Breadcrumb | Path |
|------------|------|
| Module entry | All > Field Service Management > ... |
| Work Orders | All > Field Service Management > Work Orders > All |
| Tasks | All > Field Service Management > Tasks > All |
| Dispatch Board | All > Field Service Management > Dispatch > Dispatch Board |
| Agents | All > Field Service Management > Agents > All |
| Territories | All > Field Service Management > Administration > Territories |
| Skills | All > Field Service Management > Administration > Skills |
| Scheduling | All > Field Service Management > Administration > Scheduling |
| Administration | All > Field Service Management > Administration > ... |

**Tip:** If menus are missing, verify the `com.snc.field_service` plugin is active (System Definition → Plugins).

---

## Re-usable Code / Metadata

### Scoped Application

FSM ships as a scoped application (`com.snc.field_service`).

| Scope Aspect | Detail |
|--------------|--------|
| Scope name | `com.snc.field_service` |
| Tables | `wm_order`, `wm_task`, `wm_territory`, `wm_agent`, `wm_crew`, `wm_schedule_plan` |
| Roles | `wm_admin`, `wm_dispatcher`, `wm_agent`, `admin` |

### Meta Data Patterns

| Metadata Element | Example | Notes |
|------------------|---------|-------|
| Application menu | `sn_fsm.menu.main` | FSM left-nav root |
| Module | `sn_fsm.menu.work_orders` | Points to work order list |
| Choice list | `sn_fsm.work_order_state` | Draft, Scheduled, Dispatched, In Progress, Completed, Closed |
| UI Policy | `sn_fsm.policy.validate_schedule` | Validates scheduled start/end |
| Business Rule | `sn_fsm.rule.auto_dispatch` | Auto-assigns based on territory/skills |

### The re-usable metadata inventory

FSM runs on structures you build once and dispatch reuses thousands of times:

| Re-usable piece | What it is | Where it lives (breadcrumb) |
|-----------------|------------|------------------------------|
| **Work order & task templates** | Pre-built bundles of tasks (with parts, skills, and estimated duration) for a standard job — "install", "repair visit", "inspection". A dispatcher picks the template instead of composing tasks by hand. | All > Field Service > **Templates** |
| **Territories** | The geographic structure (`wm_territory`) that dispatch, coverage, and reporting all share. Territories nest, so a region defined once serves every schedule under it. | All > Field Service > **Territories** |
| **Skills & the skills matrix** | Skills and levels defined once (`sys_user_has_skill` on agents), matched by auto-assignment against each task's required skills. The matrix is the reusable asset; keep it current or dispatch quality decays silently. | All > Field Service > **Skills** · agent records |
| **Dynamic Scheduling configuration** | The reusable optimisation rules: task ordering and prioritisation, travel-time handling, unassignment/reassignment behaviour. Tuned once, applied to every auto-assignment run. | All > Field Service > **Dynamic Scheduling** |
| **Parts requirements & sourcing rules** | Standard parts lists per task type, plus the rules for which stockroom supplies them — defined per template, consumed by every work order created from it. | On the task template · All > Field Service > **Stockrooms** |
| **Agent schedules & calendars** | Shifts, availability, and time-off structures reused across weeks — dispatch only offers work inside these, so they are shared infrastructure, not per-order data. | All > Field Service > **Agent Schedules** |
| **Crews** | Standing multi-person teams (`wm_crew`) assignable as one unit, reused across orders instead of rebuilding the team each time. | All > Field Service > **Crews** |
| **Questionnaires / checklists** | Safety checks and completion forms defined once and attached to task types — every "gas work" task carries the same checklist. | All > Field Service > **Questionnaires** |
| **Appointment booking windows** | The bookable time windows and booking rules customers see, configured once per service/territory. | All > Field Service > **Appointment Booking** |

### Re-usable Code Snippets

#### Business Rule: Auto-assign Work Order by Territory and Skill

```javascript
(function rule(current, previous) {
    if (current.operation() == 'insert' && current.territory && !current.assigned_agent) {
        var gr = new GlideRecord('wm_agent');
        gr.addQuery('territory', current.territory);
        gr.addQuery('state', 'active');
        gr.addQuery('skills', current.required_skill);
        gr.query();
        if (gr.next()) {
            current.assigned_agent = gr.sys_id;
            current.state = 'dispatched';
            current.scheduled_start = new Date();
        }
    }
})(current, previous);
```

#### UI Policy: Validate Scheduled Dates

```javascript
(function rule(current) {
    if (current.scheduled_start && current.scheduled_end) {
        var start = new Date(current.scheduled_start);
        var end = new Date(current.scheduled_end);
        if (end <= start) {
            g_form.showErrorMsg('scheduled_end', 'End date must be after start date');
            g_form.setMandatory('scheduled_end', true);
        }
    }
    if (current.work_order_type == 'emergency') {
        g_form.setMandatory('priority', true);
        g_form.setMandatory('required_skill', true);
    } else {
        g_form.setMandatory('priority', false);
    }
})(current);
```

#### Script Include: FSM Helper

```javascript
var FSMHelper = Class.create();
FSMHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getAvailableAgents: function() {
        var territorySysId = this.getParameter('territorySysId');
        var skillSysId = this.getParameter('skillSysId');
        var gr = new GlideRecord('wm_agent');
        gr.addQuery('territory', territorySysId);
        gr.addQuery('state', 'active');
        if (skillSysId) {
            gr.addQuery('skills', skillSysId);
        }
        gr.query();
        var results = [];
        while (gr.next()) {
            results.push({
                sys_id: gr.getValue('sys_id'),
                name: gr.getValue('name'),
                email: gr.getValue('email'),
                phone: gr.getValue('phone')
            });
        }
        return JSON.stringify(results);
    },
    type: 'FSMHelper'
});
```

#### Business Rule: Set Estimated Duration

```javascript
(function rule(current, previous) {
    if (current.operation() == 'insert' && current.work_order_type && !current.estimated_duration) {
        var gr = new GlideRecord('sn_fsm_work_order_type');
        gr.addQuery('sys_id', current.work_order_type);
        gr.query();
        if (gr.next()) {
            current.estimated_duration = gr.getValue('default_duration');
        }
    }
})(current, previous);
```

---

## Out-of-Box Features

| Feature | Description | Where |
|---------|-------------|-------|
| Work Orders | Create and manage field service work orders | All > FSM > Work Orders |
| Tasks | Break work orders into tasks | All > FSM > Tasks |
| Dispatch Board | Visual map-based dispatching | All > FSM > Dispatch > Dispatch Board |
| Agents | Field technician profiles and skills | All > FSM > Agents |
| Territories | Geographic service areas | All > FSM > Administration > Territories |
| Skills | Skill definitions for matching | All > FSM > Administration > Skills |
| Scheduling | Constraint-based scheduling engine | All > FSM > Administration > Scheduling |
| Mobile App | Field technician mobile access | Now Mobile app |
| Travel Time | Automatic travel time calculation | Built into scheduling |
| Parts Management | Track parts used on work orders | All > FSM > Parts |

---

## Key Table Hierarchy

### Core Tables

| Table | Purpose | Extends | Key Fields |
|-------|---------|---------|------------|
| `wm_order` | Work order | `task` | `number`, `state`, `territory`, `scheduled_start`, `scheduled_end`, `assigned_agent` |
| `wm_task` | Work order task | `task` | `number`, `work_order`, `state`, `assigned_agent`, `skill` |
| `wm_agent` | Field technician | `sys_user` | `name`, `territory`, `skills`, `phone`, `email` |
| `wm_territory` | Geographic territory | `task` | `name`, `description`, `manager` |
| `wm_crew` | Crew/team of agents | `task` | `name`, `members` |
| `wm_schedule_plan` | Scheduling plan | `task` | `name`, `constraints`, `optimization_rules` |

### Table Relationships

```
wm_order (Work Order)
    │
    ├──► wm_task (many tasks per work order)
    ├──► wm_agent (assigned agent)
    ├──► wm_territory (service territory)
    │
wm_task
    │
    ├──► wm_order (parent work order)
    ├──► wm_agent (assigned technician)
    │
wm_agent
    │
    ├──► wm_territory (assigned territory)
    ├──► wm_crew (crew membership)
    │
wm_territory
    │
    ├──► wm_agent (agents in territory)
    ├──► wm_order (work orders in territory)
```

### CMDB Integration

| FSM Table | Maps to CMDB Table | Relationship |
|-----------|-------------------|--------------|
| `wm_agent` | `sys_user` | Extends |
| `wm_order` | Standalone | Not a CI |
| `wm_task` | Standalone | Not a CI |

---

## Integrations

| Integration | Direction | Purpose | Protocol |
|-------------|-----------|---------|----------|
| CSM | Inbound | Work orders created from CSM cases | Internal |
| ITSM | Inbound | Work orders created from incidents | Internal |
| Google Maps | Outbound | Travel time and route calculation | Google Maps API |
| Now Mobile | Outbound/Inbound | Field technician mobile app | Now Mobile |
| Parts Inventory | Outbound | Check/consume parts inventory | REST/Internal |
| Billing | Outbound | Push completed work orders to billing | REST/SFTP |
| GPS/Location | Inbound | Real-time agent location | Mobile/GPS |
| Calendar | Outbound | Sync work orders to calendar | iCal/Exchange |

---

## Key Fields

| Table | Field | Type | Why It Matters |
|-------|-------|------|----------------|
| `wm_order` | `number` | String | Auto-number; work order ID |
| `wm_order` | `state` | Choice | Draft → Scheduled → Dispatched → In Progress → Completed → Closed |
| `wm_order` | `work_order_type` | Choice | Installation, Repair, Maintenance, Inspection |
| `wm_order` | `territory` | Reference | Primary routing constraint |
| `wm_order` | `scheduled_start` | Date/Time | When work is scheduled to begin |
| `wm_order` | `scheduled_end` | Date/Time | When work is scheduled to end |
| `wm_order` | `assigned_agent` | Reference | Technician assigned |
| `wm_order` | `required_skill` | Reference | Required skill for the work |
| `wm_task` | `work_order` | Reference | Parent work order |
| `wm_task` | `state` | Choice | Task lifecycle state |
| `wm_task` | `skill` | Reference | Skill required for task |
| `wm_agent` | `territory` | Reference | Primary service territory |
| `wm_agent` | `skills` | Reference (M2M) | Skills the agent possesses |
| `wm_territory` | `name` | String | Territory name |

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| No territories defined | Work orders can't be scheduled | Create territories first |
| No skills assigned to agents | Skill matching fails | Add skills to agent profiles |
| Testing only as dispatcher | Agent experience untested | Test as agent in Now Mobile |
| Not setting scheduled dates | Scheduling engine can't place work | Always set start/end dates |
| Work order without territory | Order stays unassigned | Always assign territory |
| Ignoring travel time | Technician arrives late | Enable travel time calculation |
| Creating tasks without work order | Orphaned tasks | Always link task to work order |

---

## Lab: Create and Dispatch Your First Work Order

1. **Navigate** to All > Field Service Management > Work Orders > All
2. **Click New** and fill:
   - Work Order Type: Installation
   - Territory: Select existing (or create one first)
   - Required Skill: Select skill (e.g., "Fiber Installation")
   - Scheduled Start: Tomorrow 9:00 AM
   - Scheduled End: Tomorrow 11:00 AM
   - Priority: High
   - Short Description: Install fiber ONT at customer premises
3. **Submit** and note the work order number
4. **Open** the work order → change State to "Dispatched"
5. **Assign** an agent with matching skill and territory
6. **Create** a task under the work order:
   - Task Type: Installation
   - Assigned Agent: Same agent
   - Skill: Fiber Installation
7. **Change** task state to "In Progress" then "Completed"
8. **Change** work order state to "Completed"
9. **Verify** in Related Lists: Tasks, Parts, Time Entries


---

## 🎓 Official Learning Resources

Direct paths to official ServiceNow training for Field Service Management (FSM):

- **[Field Service Management (FSM) Learning Path](https://learning.servicenow.com/lxp/en/pages/now-learning-get-certified?id=amap_detail&achievement_id=a48e1d77dbc27f40de3cdb85ca96196e)** — The primary end-to-end training.
- **[Field Service Management (FSM) Course](https://learning.servicenow.com/lxp/en/field-service-management/field-service-management-fsm-fundamentals-on?id=learning_course_prev&course_id=fd03106f4737f910123f3975d36d4307)** — Focused on-demand training.

---

## 📺 Visual & Video Guides

### FSM Getting Started
<div style="text-align: center; margin: 1.5rem 0;">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/QJACgw0AHuc" title="FSM Getting Started" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

Fallback link: [FSM Getting Started](https://www.youtube.com/watch?v=QJACgw0AHuc)

---

## 🎓 Official Learning Resources

Direct paths to official ServiceNow training for Field Service Management (FSM):

- **[Field Service Management (FSM) Learning Path](https://learning.servicenow.com/lxp/en/pages/now-learning-get-certified?id=amap_detail&achievement_id=a48e1d77dbc27f40de3cdb85ca96196e)** — The primary end-to-end training.
- **[Field Service Management (FSM) Course](https://learning.servicenow.com/lxp/en/field-service-management/field-service-management-fsm-fundamentals-on?id=learning_course_prev&course_id=fd03106f4737f910123f3975d36d4307)** — Focused on-demand training.

---

## 📺 Visual & Video Guides

### FSM Getting Started
<div style="text-align: center; margin: 1.5rem 0;">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/QJACgw0AHuc" title="FSM Getting Started" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

Fallback link: [FSM Getting Started](https://www.youtube.com/watch?v=QJACgw0AHuc)
---

## Quiz

1. What is the difference between a work order, a task, and an assignment?
<details><summary>Answer</summary>Work Order = Overall job; Task = Specific action; Assignment = Link to tech.</details>

2. What are the three main scheduling constraints in FSM?
<details><summary>Answer</summary>Skills, Availability, Territory.</details>

3. Which table stores field technicians?
<details><summary>Answer</summary>sys_user (with wm_agent role).</details>

4. What happens if a work order has no territory?
<details><summary>Answer</summary>Cannot be automatically dispatched via territory-based rules.</details>

5. How does the dispatch board use the map?
<details><summary>Answer</summary>Shows real-time location of agents vs tasks.</details>

