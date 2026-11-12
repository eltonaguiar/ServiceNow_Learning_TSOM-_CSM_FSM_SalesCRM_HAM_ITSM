---
layout: default
title: Getting Started — six ServiceNow modules
---

# Getting Started — TSOM · CSM · FSM · Sales CRM · HAM · ITSM

Six modules, one page each, written for someone who has a Personal Developer Instance and an
interview next month. Every guide has the same five sections so you can compare modules
side by side:

1. **What you actually build** — the objects and the tables that hold them
2. **Out-of-the-box features** — what to use before you write a line of script
3. **Key table hierarchy** — the parent/child relationships that explain the module
4. **Reusable code and metadata** — copy-paste script includes, business rules, client
   scripts, ACL shapes, Flow outlines, and the `sys_*` records you will actually edit
5. **Integrations, a first lab, and the mistakes reviewers flag**

---

## Start with the foundation page

[`foundation.md`](./foundation.md) is the cross-cutting page: key system properties, metadata
breadcrumbs, guided setup vs configuration vs customization (and upgrade safety), the critical
foundation data per module, metrics with their source tables, OOTB dashboards, and the artefact set
the success packs say to build.

## The six guides

| Module | What it is for | Start here |
|---|---|---|
| **ITSM** | Incident → problem → change → request, with SLAs that survive an audit | [ITSM guide](./itsm.md) |
| **CSM** | Who the customer is, what they own, what they are entitled to | [CSM guide](./csm.md) |
| **FSM** | Dispatching a job to the right technician with the right parts | [FSM guide](./fsm.md) |
| **Sales CRM** | Lead → opportunity → quote → order → sold product and entitlement | [Sales CRM guide](./sales-crm.md) |
| **HAM** | Where every device is, who has it, what it cost, when it retires | [HAM guide](./ham.md) |
|| **Discovery** | What is actually on the network — MID Server scans, File-Based Discovery, and a CMDB you can trust | [Discovery guide](./discovery.md) ||
|| **HRSD** | HR cases, employee profiles, lifecycle events (hire/terminate), skills-based routing | [HRSD guide](./hrsd.md) ||
|| **Service Mapping** | Which CIs support a business service, and how they connect — pattern-based top-down service maps | [Service Mapping guide](./servicemapping.md) ||
| **TSOM** | Telecom network model, alarms, and service/customer impact | [TSOM guide](./tsom.md) |

---

## How the six fit together

```
Sales CRM  ── sells ──────────────►  sold product + install base + contract + entitlement
     │                                             │
     │                                             ├──► CSM   (case: "what am I owed?")
     │                                             └──► FSM   (work order: "fix/install it")
     │
CSM case ── escalates ──► ITSM incident ── changes ──► HAM (asset lifecycle, parts)
     │
     └── telco customer ──► TSOM (network CI → service → affected subscriber)
```

The single most useful thing to say in an interview: **these are not integrations between
products, they are one data model with several operational views.** Sales CRM fulfilment
writes the install base record that CSM reads and FSM dispatches against. Break that and you
are back to synchronising systems.

---

## Prerequisites (do these once)

- [ ] A Personal Developer Instance (PDI) — free, resets if idle, so keep notes in git.
- [ ] A git repo for your lab artefacts (update-set XML exports + screenshots).
- [ ] The plugins: ITSM (base), CSM, FSM, HAM (`sn_hamp`), Sales CRM / CPQ, TSOM (trial).
- [ ] A role that can create records in each module (`admin` on a PDI is fine).
- [ ] One demo narrative per module: *problem → what you built → what broke → how you fixed it*.

---

## Suggested order

1. **ITSM** — the vocabulary every other module inherits (`task`, SLA, assignment, approvals).
2. **CSM** — the same task model with a customer in front of it.
3. **FSM** — CSM plus a technician, a location and parts.
4. **HAM** — the asset facts behind both of the above.
5. **Sales CRM** — where the entitlement those modules rely on is actually created.
6. **TSOM** — the deepest CMDB work; do it last, on top of a CMDB you already understand.

---

## Where this content comes from

- Table names and object relationships are taken from ServiceNow product documentation for the
  current releases (Brazil/Zurich), including the
  [CRM data models](https://www.servicenow.com/docs/r/customer-relationship-management/crm-data-models.html)
  page and the
  [Telecom data model](https://www.servicenow.com/docs/r/telecom-service-ops/telecommunications-service-operations-management/telecom-data-model.html).
- Code samples are patterns, not vendor code. Create the record in an instance, export the
  update set, and review the XML — hand-written XML is for diffing, not importing.
- Longer module walkthroughs (ELI5 explanations, breadcrumbs, quizzes) live under
  [`docs/modules/`](../docs/modules/).
