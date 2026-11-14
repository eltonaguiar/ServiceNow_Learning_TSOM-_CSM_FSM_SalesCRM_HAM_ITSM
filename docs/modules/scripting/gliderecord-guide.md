---
layout: default
title: GlideRecord & Server-Side Data Access
---

# GlideRecord & Server-Side Data Access

**Audience:** developers and admins who can already write a Business Rule and now need to query the database
correctly.
**Why this page exists:** GlideRecord was the single weakest topic in this guide — 97 mentions spread across 26
pages with no owning page, and **zero** occurrences of `addEncodedQuery`, `setWorkflow(false)` or `hasNext`.
Those are exactly the methods that separate "I have used GlideRecord" from "I know GlideRecord."

## Contents

- [What GlideRecord is](#what-gliderecord-is)
- [The four query forms](#the-four-query-forms)
- [Encoded queries](#encoded-queries)
- [Reading and writing records](#reading-and-writing-records)
- [setWorkflow(false) — and what it actually disables](#setworkflowfalse--and-what-it-actually-disables)
- [GlideAggregate](#glideaggregate)
- [Performance: the loop trap](#performance-the-loop-trap)
- [Pagination and limits](#pagination-and-limits)
- [Common mistakes](#common-mistakes)
- [Interview questions](#interview-questions)

---

## What GlideRecord is

`GlideRecord` is the server-side object that represents rows in a table. It is not an ORM and it is not lazy —
`query()` executes a database call. Everything you do with it runs on the server, inside the transaction, and
counts against the governor limits for that transaction.

```javascript
var gr = new GlideRecord('incident');   // 1. the table
gr.addQuery('active', true);            // 2. the filter
gr.query();                             // 3. the database call
while (gr.next()) {                     // 4. iterate the result set
    gs.info(gr.getValue('number'));
}
```

The four numbered steps matter, because almost every GlideRecord performance problem is a step executed in the
wrong place.

## The four query forms

| Form | Use when | Cost |
|---|---|---|
| `get(sysId)` | You have a sys_id | One row by primary key. Cheapest |
| `get('field', value)` | Exactly one row by a unique-ish field | One row, but not indexed unless the field is |
| `query()` + `next()` | Any result set | Full query; rows stream |
| `addEncodedQuery()` | You already have a filter string | Same as `addQuery`, different input format |

`get()` returns a boolean. Always check it.

```javascript
var gr = new GlideRecord('sys_user');
if (gr.get('user_name', 'jsmith')) {
    gs.info(gr.getValue('sys_id'));
} else {
    gs.info('no such user');
}
```

## Encoded queries

An **encoded query** is the string form of a list filter — the same thing you see in the URL when you filter a
list. `addEncodedQuery()` accepts it directly.

```javascript
var gr = new GlideRecord('incident');
gr.addEncodedQuery('active=true^priority<=2^assigned_toISEMPTY');
gr.query();
```

| Operator | Meaning |
|---|---|
| `^` | AND |
| `^OR` | OR |
| `^NQ` | New query (union) |
| `ORDERBY` / `ORDERBYDESC` | Sort |
| `IN` | value is one of a comma list |
| `STARTSWITH` / `ENDSWITH` / `LIKE` | String match |
| `ISEMPTY` / `ISNOTEMPTY` | Null checks |
| `>` `<` `>=` `<=` | Numeric/date comparison |
| `javascript:` | Server-side script condition — **avoid**, it defeats query optimisation |

**When to use it rather than `addQuery`:**

- You are copying a filter from a list or from `GlideFilter`
- You need `^NQ` (multiple independent queries in one call), which has no `addQuery` equivalent
- You are building a query from a stored filter or a user preference

**When not to:** for anything you build programmatically, `addQuery` is typed, safer, and easier to parameterise.
String concatenation into an encoded query is how injection-style bugs happen — a value containing `^` will
silently change the filter.

```javascript
// DANGEROUS: a title containing ^ breaks the query
gr.addEncodedQuery('short_description=' + userInput);

// SAFE: parameterised
gr.addQuery('short_description', userInput);
```

## Reading and writing records

```javascript
gr.getValue('field')      // string, always — null-safe
gr.field_name             // same value, but throws if the field does not exist
gr.setValue('field', v)   // write
gr.insert()               // insert, returns sys_id
gr.update()               // update the current record
gr.deleteRecord()         // delete the current record
gr.isValidRecord()        // did get() find anything
gr.isNewRecord()          // true before insert()
```

**Prefer `getValue()` over dot-notation** for anything defensive. `gr.field_name` on a field that does not exist
on that table raises an error at runtime; `getValue()` returns `null`. In a field-name-variable or
dictionary-driven context, `getValue` is the only safe option.

## setWorkflow(false) — and what it actually disables

`setWorkflow(false)` tells the platform **not to run the business logic that normally fires on a write to this
record**.

```javascript
var gr = new GlideRecord('incident');
gr.addQuery('state', 7);
gr.query();
while (gr.next()) {
    gr.setWorkflow(false);     // must be set per record, before update()
    gr.setValue('u_archive_flag', true);
    gr.update();
}
```

| `setWorkflow(false)` suppresses | It does **not** suppress |
|---|---|
| Business rules (before/after/async) | ACL checks — the current user still needs write access |
| Workflows and Flow Designer triggers | Audit fields — `sys_updated_on`/`sys_updated_by` still update |
| Approval engine | CMDB Identification & Reconciliation (IRE) — runs at the CMDB layer |
| Notifications and events | Calculated fields and data lookups |
| Script actions on write | Validation at the database schema level |

**Why it matters:** a bulk data fix at 10,000 records would otherwise fire 10,000 business rules. That is both a
correctness problem (rules written for one record at a time) and a performance problem.

**Why it is dangerous:** you are bypassing the rules that keep data consistent. Use it for migrations and
deliberate data correction, never as a shortcut because a rule is inconvenient. If a rule is wrong, fix the rule.

**The classic bug:** calling `setWorkflow(false)` once outside the loop. It applies to the **current record**, so
inside a `while (gr.next())` loop it must be set on each iteration.

## GlideAggregate

Use `GlideAggregate` when you need a **count, sum, average, min or max** — not the rows themselves.

```javascript
var ga = new GlideAggregate('incident');
ga.addQuery('active', true);
ga.addAggregate('COUNT', 'assignment_group');
ga.groupBy('assignment_group');
ga.query();
while (ga.next()) {
    gs.info(ga.getValue('assignment_group') + ': ' + ga.getAggregate('COUNT', 'assignment_group'));
}
```

| Method | Purpose |
|---|---|
| `addAggregate('COUNT'\|'SUM'\|'AVG'\|'MIN'\|'MAX', field)` | What to compute |
| `groupBy(field)` | Group the aggregate |
| `getAggregate(type, field)` | Read the result |
| `addHaving(...)` | Filter on the aggregate result |

**Why it matters:** counting with GlideRecord means fetching every row to count them. At 50,000 rows that is a
governor-limit failure. `GlideAggregate` asks the database to count, and returns one row per group.

```javascript
// WRONG — fetches every row to produce a number
var count = 0;
var gr = new GlideRecord('incident');
gr.query();
while (gr.next()) { count++; }

// RIGHT — the database counts
var ga = new GlideAggregate('incident');
ga.addAggregate('COUNT');
ga.query();
ga.next();
var count = ga.getAggregate('COUNT') || 0;
```

## Performance: the loop trap

**Never run a query inside a loop.** This is the single most common ServiceNow performance defect, and it is a
governor-limit failure waiting for volume.

```javascript
// WRONG: one query per assignment group
var groups = new GlideRecord('sys_user_group');
groups.query();
while (groups.next()) {
    var inc = new GlideRecord('incident');          // query #1, #2, #3 ...
    inc.addQuery('assignment_group', groups.getUniqueValue());
    inc.query();
    while (inc.next()) { /* ... */ }
}
```

```javascript
// RIGHT: one query, then group in memory
var counts = {};
var inc = new GlideRecord('incident');
inc.addQuery('active', true);
inc.query();
while (inc.next()) {
    var g = inc.getValue('assignment_group');
    counts[g] = (counts[g] || 0) + 1;
}
```

```javascript
// ALSO RIGHT: let the database group it
var ga = new GlideAggregate('incident');
ga.addQuery('active', true);
ga.addAggregate('COUNT', 'assignment_group');
ga.groupBy('assignment_group');
ga.query();
```

Other rules worth memorising:

- **Filter in the query, not in JavaScript.** `if (gr.state == 1) continue;` fetches rows you then discard.
- **Query only the fields you need** — use `addQuery`, not `SELECT *` habits; `GlideRecord` is wide by default.
- **`addIn()` for a set of values** instead of OR-ing many `addQuery` calls.

## Pagination and limits

```javascript
gr.setLimit(100);          // stop after 100 rows
gr.chooseWindow(0, 20);    // rows 0..20 — for paged UI
gr.orderBy('sys_created_on');
gr.orderByDesc('priority');
```

`setLimit()` protects the transaction from returning an unbounded result set. A query with no limit on a large
table is the classic cause of a slow Business Rule that passes in dev and times out in prod.

`chooseWindow(start, end)` is for paging, not for sampling — it still executes a windowed query.

## Common mistakes

| Mistake | Consequence | Fix |
|---|---|---|
| Query inside a loop | N+1 queries, governor limit failure | Query once, or `GlideAggregate` |
| `setWorkflow(false)` outside the loop | Only suppresses the first record | Call it per record |
| Counting with GlideRecord | Fetches every row | `GlideAggregate` |
| `gr.field` on unknown field | Runtime error | `gr.getValue('field')` |
| String-building an encoded query | Filter silently changes if a value contains `^` | `addQuery(field, value)` |
| No `setLimit` on an unbounded query | Slow or failing transaction | Always bound it |
| `setWorkflow(false)` to avoid a rule | Data written outside its invariants | Fix the rule |

## Interview questions

1. **Difference between `get()` and `query()`?** `get()` retrieves one record by sys_id or by a unique field and
   returns a boolean; `query()` executes a filter and lets you iterate.
2. **What does `setWorkflow(false)` do?** Suppresses business rules, workflows and approvals on the write. Does
   not suppress ACLs or audit fields. Applies per record.
3. **How do you count 50,000 records?** `GlideAggregate` with `addAggregate('COUNT')` — not a GlideRecord loop.
4. **How do you avoid the N+1 problem?** Query once and join in memory, or push the grouping into
   `GlideAggregate`.
5. **When would you use an encoded query?** When you already have a filter string — from a list, a stored
   filter, or `GlideFilter` — or when you need `^NQ`. Otherwise `addQuery`.
6. **Why is `getValue()` safer than dot-notation?** It returns `null` for a missing field instead of throwing,
   which matters when the field name is a variable.

## Related

- [Platform Cross-Cutting Skills](../../cross-cutting/) — scripting patterns, ACLs, integrations
- [JavaScript Reference](../ai/javascript-reference/) — GlideSystem, GlideAjax, GlideForm, GlideDateTime
- [ITSM](../itsm/itsm-guide/) — the tables these queries run against