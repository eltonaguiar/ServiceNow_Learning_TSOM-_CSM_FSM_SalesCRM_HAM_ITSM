---
layout: default
title: Service Catalog
---

# Service Catalog

**Audience:** admins building request experiences — the "store requests" side of ServiceNow.
**Why this page exists:** the catalog was the second-weakest topic in this guide — 76 mentions total, 30 of them
inside a single ITSM page, with no page of its own. The mechanics (record producers, variable sets, catalog
client scripts, fulfilment flows) were not taught anywhere.

## Contents

- [What the catalog is for](#what-the-catalog-is-for)
- [Catalog items vs record producers](#catalog-items-vs-record-producers)
- [Variables and variable sets](#variables-and-variable-sets)
- [Catalog client scripts](#catalog-client-scripts)
- [UI policies on catalog items](#ui-policies-on-catalog-items)
- [Fulfilment flows](#fulfilment-flows)
- [Retail and high-volume self-service](#retail-and-high-volume-self-service)
- [Common mistakes](#common-mistakes)
- [Interview questions](#interview-questions)

---

## What the catalog is for

The Service Catalog is the **self-service front end**. A user picks an item, fills in variables, submits, and
the platform creates a record and drives fulfilment.

The four moving parts:

| Part | What it is |
|---|---|
| **Catalog item** | A purchasable entry with variables, price, image, and fulfilment |
| **Record producer** | A catalog item that creates a specific record directly rather than a generic request |
| **Variable** | A question asked on the item (text, choice, reference, date, attachment…) |
| **Fulfilment** | What happens after submit — a Flow, a legacy Workflow, a catalog task, an approval |

## Catalog items vs record producers

This is the first question in most catalog interviews.

| | Catalog item | Record producer |
|---|---|---|
| Creates | A `sc_req_item` (RITM) plus a request | **The target record directly** — e.g. an `incident` |
| Cart | Yes — users can order several | No — single submit |
| Fulfilment | Flow/Workflow against the RITM | The target record's own lifecycle, or a flow on that table |
| Use when | You want a request trail, approvals, and cart behaviour | You want a *fast path* — "report an issue", "request access" — that lands as the real record |
| Typical example | "Standard Laptop Request" | "Report a Broken POS Terminal" → creates an incident |

**Rule of thumb:** if the user is *ordering something that needs a request lifecycle*, use a catalog item. If the
user is *reporting or declaring something that already has its own record type*, use a record producer.

The record producer's **"Creates a record"** setting is what decides which table it writes to. That is the whole
distinction — everything else follows from it.

## Variables and variable sets

Variables are the questions. A **variable set** is a reusable group of them.

| Variable type | Use for |
|---|---|
| Single-line text | Short free text |
| Multi-line text | Description, notes |
| Choice | A fixed list — **always consider a lookup table instead** if the list will grow |
| Reference | A pointer to another record — the most useful type |
| Lookup select box | Reference with a filter and a display field |
| Checkbox | Boolean |
| Date / Date-time | Scheduling |
| Attachment | Evidence, forms |
| Label | Section heading, no input |
| Container / split | Layout |

**Variable sets** are how you avoid rebuilding the same twelve questions on every item. Define once, attach to
many items. When a question changes, you change it in one place.

Ordering matters: a variable set's internal order is preserved, and the item's own variables interleave around it.
Users care about order far more than builders do — put the thing they must decide first at the top.

**Naming** is a real quality issue. `u_application` on twenty items is fine; `application`, `app`, `app_name` and
`u_app_choice` across those twenty items is a reporting problem forever.

## Catalog client scripts

Catalog client scripts run in the browser on the item form. Same three handlers as any client script:

```javascript
// onLoad — runs when the item form opens
function onLoad() {
    // hide a section until a choice is made
    g_form.setDisplay('justification', false);
}

// onChange — runs when a named variable changes
function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue === '') { return; }

    if (control.name === 'request_type') {
        if (newValue === 'hardware') {
            g_form.setMandatory('asset_tag', true);
            g_form.setDisplay('justification', true);
        } else {
            g_form.setMandatory('asset_tag', false);
            g_form.setDisplay('justification', false);
        }
    }
}

// onSubmit — runs before submit; return false to block
function onSubmit() {
    var qty = parseInt(g_form.getValue('quantity'), 10);
    if (qty > 25) {
        g_form.addErrorMessage('Orders above 25 units need a purchase request.');
        return false;
    }
    return true;
}
```

**`isLoading` matters.** `onChange` fires during form load with `isLoading === true`. Acting on that value means
your validation runs against the user's existing (possibly incomplete) data before they have touched anything.
That is the most common catalog client-script bug.

**`g_form` methods you will actually use:**

| Method | Purpose |
|---|---|
| `g_form.getValue(name)` / `setValue(name, v)` | Read/write a variable |
| `g_form.getReference(name, callback)` | Fetch a referenced record — **async** |
| `g_form.setMandatory(name, bool)` | Require a field |
| `g_form.setDisplay(name, bool)` | Show/hide |
| `g_form.setReadOnly(name, bool)` | Lock a field |
| `g_form.addErrorMessage(msg)` | Block with a message |
| `g_form.addInfoMessage(msg)` | Informational |
| `g_form.clearValue(name)` | Reset |

**`getReference` is asynchronous and this bites everyone.** You cannot use its return value directly:

```javascript
// WRONG — data is undefined at the next line
var user = g_form.getReference('requested_for');
g_form.setValue('department', user.department);

// RIGHT — use the callback
g_form.getReference('requested_for', function(user) {
    g_form.setValue('department', user.department);
});
```

## UI policies on catalog items

| | Catalog client script | Catalog UI policy |
|---|---|---|
| Written in | JavaScript | Configuration |
| Best for | Conditional logic, messages, multi-field rules | Simple mandatory / visible / read-only rules |
| Runs | onLoad, onChange, onSubmit | On load and on variable change |
| Maintenance | Code review needed | Editable by an admin |

**Prefer a UI policy for simple show/hide/mandatory**, and a client script only when you need logic the policy
cannot express. A UI policy with a catalog condition is maintainable by someone who does not read JavaScript,
which matters when you are not the only admin.

**Neither is security.** Client-side rules are bypassable. If a field must not be written, enforce it with an ACL
and a server-side check — see [Platform Cross-Cutting Skills](../../cross-cutting/).

## Fulfilment flows

After submit, the request must actually be fulfilled.

| Mechanism | Status | Use |
|---|---|---|
| **Flow Designer** (`sys_hub_flow`) | Current | Default choice for new items |
| Legacy Workflow (`wf_workflow`) | Maintained | Existing items; migrate when touched |
| Catalog task (`sc_task`) | Current | A human step inside a flow |
| Approval (`sysapproval_approver`) | Current | Manager or group approval |

A typical catalogue fulfilment flow:

```
Trigger: Service Catalog item submitted (or record created on sc_req_item)
  -> Look up the requester's manager
  -> Ask for approval
  -> Create Catalog Task(s) assigned to the fulfilment group
  -> Wait for task closure
  -> Update the RITM to Closed Complete
  -> Notify the requester
```

**Design rules worth stating out loud:**

- **Approvals before work, not after.** An approval that arrives after the laptop shipped is theatre.
- **One task per fulfilment team.** A single task assigned to three groups is a task nobody owns.
- **The RITM state is the user's view of progress.** If fulfilment happens outside the RITM, the user sees
  "work in progress" forever.
- **Do not put business logic in the catalog item.** Variables capture intent; the flow enforces it.

## Retail and high-volume self-service

A retailer with hundreds of stores and pharmacies has a specific shape of problem: **volume from many small
sites, high repetition, low tolerance for a bad form.**

What that changes:

| Pressure | Response |
|---|---|
| Thousands of near-identical tickets | Catalog items + record producers replace free-text tickets |
| Store staff have no time | Short forms, defaults pre-filled from the user's location |
| Repeated requests ("reset my handheld", "order receipt paper") | One-tap record producers; no cart, no approval |
| Deflection matters more than process purity | Knowledge articles surfaced *before* the form |
| Many sites, few admins | Variable sets and UI policies, not per-store scripts |

**The deflection story an interviewer wants:** measure how many incidents a month come from a repeatable
request, convert the top five to catalog items or record producers, then track the incident count for those
categories going down. That is a number you can defend, and it is the same argument as SAM reclamation —
remove demand rather than service it faster.

## Common mistakes

| Mistake | Consequence | Fix |
|---|---|---|
| `onChange` acting on `isLoading` | Validation fires on page load against half-filled data | `if (isLoading) return;` |
| Using `getReference` synchronously | Undefined value | Use the callback |
| Client-side mandatory as security | Users bypass it | ACL + server-side validation |
| Logic in the catalog item instead of the flow | Item becomes unmaintainable | Variables capture; flow enforces |
| One catalog item per store | Hundreds of near-duplicate items | One item + a location reference variable |
| Approval after fulfilment | Approval is meaningless | Approve before the task is created |
| Reusing `application` / `app` / `u_app` | Reporting impossible | One naming convention across items |

## Interview questions

1. **Catalog item vs record producer?** A catalog item creates a RITM in a cart with a request lifecycle; a
   record producer writes directly to a target table and skips the cart.
2. **When do you use a variable set?** When the same group of questions appears on multiple items — define once,
   attach many, change once.
3. **What does `isLoading` guard against?** `onChange` firing during form initialisation so logic does not run
   against incomplete data.
4. **How do you fetch a referenced record's field in a client script?** `g_form.getReference(name, callback)` —
   asynchronous, so the callback is mandatory.
5. **UI policy or client script?** UI policy for simple mandatory/visible/read-only; client script for logic a
   policy cannot express.
6. **How do you reduce ticket volume in a retail environment?** Convert the highest-frequency repeatable requests
   to catalog items/record producers, surface knowledge before the form, and measure the drop.

## Related

- [ITSM](../itsm/itsm-guide/) — the request/incident tables fulfilment writes to
- [GlideRecord & Server-Side Data Access](../scripting/gliderecord-guide/) — server-side validation for catalog
- [Platform Cross-Cutting Skills](../../cross-cutting/) — ACLs, Flow Designer, update sets
- [HRSD](../hrsd/hrsd-guide/) — employee-centre catalog patterns, the closest analogue to a store portal