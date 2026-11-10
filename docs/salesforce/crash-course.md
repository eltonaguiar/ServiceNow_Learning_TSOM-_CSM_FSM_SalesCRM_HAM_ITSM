# Salesforce Technical Training — ELI5 Crash Course

**Agent:** opencode  
**Date:** 2026-11-10  
**Platform:** Salesforce  
**Audience:** Complete beginners — no prior Salesforce experience assumed  
**Confidence:** high  

<p class="meta" style="margin-bottom: 24px;"><a href="../../index.md">← Back to ServiceNow Module Guides</a> · Separate track from ServiceNow</p>

---

## Contents

- [What Is Salesforce?](#what-is-salesforce)
- [The Big Picture: Objects, Records, Fields](#the-big-picture-objects-records-fields)
- [Navigation: Where Things Live](#navigation-where-things-live)
- [Users, Profiles, Roles & Security](#users-profiles-roles--security)
- [Data Integrity & Relationships](#data-integrity--relationships)
- [Automation: Flow, Process Builder, Workflow](#automation-flow-process-builder-workflow)
- [Code: Apex, Visualforce, LWC](#code-apex-visualforce-lwc)
- [Integration: APIs & External Systems](#integration-apis--external-systems)
- [Troubleshooting & Performance](#troubleshooting--performance)
- [Design Considerations](#design-considerations)
- [Out-of-the-Box Features to Know](#out-of-the-box-features-to-know)
- [Official Salesforce Learning Resources](#official-salesforce-learning-resources)

---

## What Is Salesforce?

Salesforce is a **cloud-based Customer Relationship Management (CRM) platform**. Think of it as a giant shared spreadsheet in the cloud that companies use to track:

- **Customers** (who they are, what they bought, when they last called)
- **Sales deals** (opportunities, quotes, contracts)
- **Support cases** (tickets, issues, resolutions)
- **Marketing campaigns** (emails, ads, events)

Everything lives in one place, so sales, service, and marketing teams all see the same customer data.

**ELI5 analogy:** Imagine a school where every student has one folder. The folder has their grades, attendance, parent contact info, and notes from teachers. Every teacher can open the same folder. Salesforce is that folder system, but for businesses and their customers.

---

## The Big Picture: Objects, Records, Fields

Salesforce organizes data in three layers:

| Layer | What It Is | Real-World Example |
|-------|-----------|-------------------|
| **Object** | A type of thing you track (like a table in a database) | Account, Contact, Opportunity, Case |
| **Record** | One specific instance of an object (like a row) | "Acme Corp" (an Account record) |
| **Field** | One piece of data about that instance (like a column) | Phone number, Industry, Annual Revenue |

### Standard vs Custom Objects

- **Standard Objects:** Come with Salesforce out of the box (Account, Contact, Lead, Opportunity, Case, User)
- **Custom Objects:** You build them for your business needs (e.g., "Property Listing," "Course Enrollment")

---

## Navigation: Where Things Live

Salesforce uses **Setup** for administration and **App Launcher** for end users. Here are the breadcrumb paths you'll use most:

| Task | Breadcrumb Path |
|------|----------------|
| Home / Dashboard | Home tab |
| App Launcher (all apps) | App Launcher (9-dot grid) > [App Name] |
| Object Manager (create/edit objects & fields) | Setup > Object Manager > [Object Name] |
| Fields & Relationships | Setup > Object Manager > [Object] > Fields & Relationships |
| Page Layouts | Setup > Object Manager > [Object] > Page Layouts |
| Profiles | Setup > Profiles > [Profile Name] |
| Permission Sets | Setup > Permission Sets > [Permission Set Name] |
| Roles | Setup > Roles > Roles |
| Users | Setup > Users > Users |
| Flows | Setup > Flows |
| Apex Classes | Setup > Apex Classes |
| Visualforce Pages | Setup > Visualforce Pages |
| Lightning Components (LWC) | Setup > Lightning Components |
| Remote Site Settings (API callouts) | Setup > Remote Site Settings |
| Named Credentials | Setup > Named Credentials |
| Connected Apps (OAuth) | Setup > App Manager > Connected Apps |
| Debug Logs | Setup > Debug Logs |
| System Log / Apex Logs | Setup > Monitor > Logs > Debug Logs |
| Optimizer | Setup > Optimizer |

**ELI5:** Setup is the "control room" where admins and developers configure everything. App Launcher is where regular users click to open their apps.

---

## Users, Profiles, Roles & Security

### Users

A **User** is a person who logs into Salesforce. Each user needs:
- A username (email format)
- A profile
- A role (optional, for sharing)
- A license (determines what they can do)

| License Type | What It's For |
|-------------|---------------|
| Salesforce | Full CRM access (sales, service, custom apps) |
| Salesforce Platform | Custom apps, no standard CRM objects |
| Chatter Free | Collaboration only |
| External Identity | Customers/partners logging in via Experience Cloud |

### Profiles

A **Profile** controls what a user can **see and do**:
- Object permissions (read, create, edit, delete)
- Field permissions
- Page layouts
- Apps and tabs visible
- Login hours and IP ranges

**Best practice:** Don't give everyone "System Administrator." Use the least permissive profile that lets them do their job.

### Permission Sets

**Permission Sets** grant *additional* access on top of a profile. Use them instead of creating a new profile for every small exception.

**Example:** A Sales user needs edit access to a custom "Commission" object. Instead of changing their whole profile, assign a "Commission Edit" Permission Set.

### Roles

**Roles** control **record-level sharing** (who can see which records). Roles form a hierarchy — people higher up can see records owned by people below them.

| Concept | Controls |
|---------|----------|
| Profiles | What you can do (object/field level) |
| Permission Sets | Extra access beyond profile |
| Roles | Which records you can see (org-wide sharing + hierarchy) |
| Org-Wide Defaults | Baseline record visibility (Private, Public Read Only, Public Read/Write) |

---

## Data Integrity & Relationships

### Relationship Types

| Relationship | What It Means | Example |
|-------------|--------------|---------|
| **Lookup** | Loose association; child can exist without parent | Case → Account (contact's company) |
| **Master-Detail** | Tight association; child cannot exist without parent; deleting parent deletes child | Opportunity → Opportunity Line Item |
| **Hierarchical** | Self-lookup on User (manager) | User → Manager |

### Roll-Up Summary Fields

Only available on **Master-Detail** relationships. Automatically calculate values from child records on the parent.

| Type | What It Does |
|------|--------------|
| SUM | Adds up a number field from all children |
| COUNT | Counts how many child records exist |
| MIN / MAX | Finds smallest/largest value among children |

### Data Integrity Best Practices

| Practice | Why It Matters |
|----------|---------------|
| Required fields | Prevent missing critical data |
| Unique fields | Prevent duplicate records (e.g., email) |
| Validation rules | Block bad data at save time |
| Dependent picklists | Ensure valid combinations (Country → State) |
| Record types | Different page layouts and picklist values by business process |

---

## Automation: Flow, Process Builder, Workflow

### Flow (The Modern Standard)

**Flow** is Salesforce's no-code/low-code automation tool. It replaces Workflow Rules and Process Builder (both are being retired).

| Flow Type | When It Runs | Use Case |
|-----------|-------------|----------|
| Screen Flow | User clicks a button | Guided data entry, wizard-style forms |
| Record-Triggered Flow | Record created/updated | Auto-update fields, create related records |
| Scheduled-Triggered Flow | On a schedule | Nightly data cleanup, batch emails |
| Platform Event Flow | Event received | React to external system events |

### When to Code vs. When to Flow

| Use Flow | Use Apex (Code) |
|----------|-----------------|
| Field updates, record creation | Complex logic with loops and collections |
| Simple email alerts | Callouts to external APIs (not supported in Flow easily) |
| UI screens for data entry | Bulk processing of 10,000+ records |
| Approval processes | Custom calculations beyond formula fields |

---

## Code: Apex, Visualforce, LWC

### Apex

**Apex** is Salesforce's proprietary programming language (similar to Java). It runs on the server side.

| Concept | What It Is | Example |
|---------|-----------|---------|
| Class | A container for methods and logic | `public class CaseHandler { ... }` |
| Trigger | Code that runs before/after record save | `trigger CaseTrigger on Case (before insert) { ... }` |
| SOQL | Salesforce Object Query Language (like SQL) | `SELECT Id, Name FROM Account WHERE Industry = 'Technology'` |
| DML | Data Manipulation Language (insert, update, delete) | `insert newCase;` |
| Governor Limits | Runtime limits to prevent hogging shared resources | 100 SOQL queries per transaction, 10,000 records per DML |

### Apex Example (ELI5)

```apex
// When a new Case is created, automatically assign it to the right team
trigger CaseAutoAssign on Case (before insert) {
    for (Case c : Trigger.new) {
        if (c.Origin == 'Phone' && c.Priority == 'High') {
            c.OwnerId = '00Gxx000000ABCDE'; // Escalation Team
        }
    }
}
```

**"In plain English":** Before saving a new case, look at every case being saved. If it came in by phone and is high priority, assign it to the escalation team automatically.

### Visualforce

**Visualforce** is an older UI framework (HTML-like tags with Apex controllers). It's still used for:
- Custom PDF rendering (quotes, invoices)
- Pages that need precise layout control
- Legacy functionality not yet moved to Lightning

```xml
<apex:page controller="CaseController">
    <apex:form>
        <apex:pageBlock title="Create Case">
            <apex:inputField value="{!case.Subject}"/>
            <apex:inputField value="{!case.Priority}"/>
            <apex:commandButton value="Save" action="{!saveCase}"/>
        </apex:pageBlock>
    </apex:form>
</apex:page>
```

### Lightning Web Components (LWC)

**LWC** is the modern UI framework (JavaScript + HTML). It's the standard for building custom UI in Salesforce Lightning Experience.

| File | Purpose |
|------|---------|
| `component.js` | Logic (wire services, event handlers, Apex calls) |
| `component.html` | UI template (Lightning Design System) |
| `component.js-meta.xml` | Configuration (where the component can be used) |

```javascript
// Simple LWC that displays a greeting
import { LightningElement, api } from 'lwc';
export default class Greeting extends LightningElement {
    @api name; // public property
}
```

```html
<template>
    <lightning-card title="Hello">
        <p>Welcome, {name}!</p>
    </lightning-card>
</template>
```

### When to Use Each

| Technology | Best For |
|------------|----------|
| **Flow** | Simple automation, no-code preferred |
| **Apex** | Complex logic, bulk data, API callouts, triggers |
| **Visualforce** | PDF generation, legacy pages, precise layout |
| **LWC** | Custom UI, Lightning Experience pages, components |

---

## Integration: APIs & External Systems

Salesforce integrates with other systems via APIs. Here are the main approaches:

| Integration Type | Protocol | Use Case |
|-----------------|----------|----------|
| **REST API** | REST/JSON | Modern web/mobile integrations, real-time data |
| **SOAP API** | SOAP/XML | Legacy enterprise systems |
| **Bulk API** | REST/CSV | Loading millions of records |
| **Streaming API** | CometD/Pub-Sub | Real-time notifications when data changes |
| **Outbound Message** | SOAP | Send data to external system when record changes |
| **Named Credentials** | — | Securely store endpoint URLs and auth (no hardcoded passwords) |
| **Named Credentials + External Credentials** | — | OAuth 2.0 for external system authentication |

### Named Credentials (Best Practice)

Instead of hardcoding a URL and password in Apex:

```apex
// BAD - don't do this
HttpRequest req = new HttpRequest();
req.setEndpoint('https://api.example.com/data');
req.setHeader('Authorization', 'Bearer hardcoded_token');

// GOOD - use Named Credential
HttpRequest req = new HttpRequest();
req.setEndpoint('callout:MyExternalAPI/data'); // Named Credential handles auth
```

### Remote Site Settings

Before Salesforce can call an external API, you must add the external URL to **Remote Site Settings** (Setup > Remote Site Settings). Otherwise, the callout will be blocked.

**Exception:** If you use Named Credentials, you don't need Remote Site Settings.

---

## Troubleshooting & Performance

### Common Issues & Where to Look

| Symptom | Where to Check |
|---------|---------------|
| Apex code not running as expected | Setup > Debug Logs (set trace flags on users) |
| Flow errors | Setup > Flow > [Flow] > Debug / Fault paths |
| Record not saving (validation rule) | Setup > Object Manager > [Object] > Validation Rules |
| User can't see a field | Setup > Profiles > [Profile] > Field-Level Security |
| Slow page load | Setup > Optimizer > Page Load Performance |
| API callout failing | Setup > Remote Site Settings / Named Credentials |
| Governor limit exceeded | Debug Logs show which limit was hit |

### Debug Logs

1. Setup > Debug Logs > New
2. Select the user to trace
3. Set expiration and log level (Finest for maximum detail)
4. Perform the action in Salesforce
5. Download and read the log

### Governor Limits (Salesforce's "Speed Limits")

| Limit | Default | What It Means |
|-------|---------|---------------|
| SOQL queries | 100 per transaction | Don't query in a loop |
| DML rows | 10,000 per transaction | Bulkify your code |
| Heap size | 6 MB (sync) / 12 MB (async) | Don't load too much into memory |
| Callouts | 100 per transaction | Batch external API calls |
| CPU time | 10,000 ms (sync) / 60,000 ms (async) | Avoid inefficient loops |

---

## Governor Limits Deep Dive — Why They Exist and How to Handle Them

Salesforce runs on **multi-tenant architecture**: thousands of customers share the same servers. Without limits, one customer's inefficient code could slow down everyone else's org. Governor limits are Salesforce's way of guaranteeing fair resource usage. If you exceed a limit, Salesforce throws a runtime exception (`LimitException`) and your code stops.

**ELI5 analogy:** Think of governor limits like speed limits on a highway. They exist so one driver can't endanger everyone else. If you go too fast, you get pulled over (the exception fires).

Below is each major limit, why it exists, and concrete best practices to stay under it.

---

### 1. SOQL Queries — 100 per Transaction (Sync)

**Why it exists:** Every SOQL query hits the database. Database is the most expensive resource in a multi-tenant system. If every trigger fired 500 queries, the database would collapse.

**Common violation:** Querying inside a `for` loop.

```apex
// BAD — querying inside a loop
for (Case c : Trigger.new) {
    Account a = [SELECT Id, Name FROM Account WHERE Id = :c.AccountId]; // 1 query per record!
}
```

**Best practice:** Collect IDs first, query once, then process in memory.

```apex
// GOOD — bulkified
Set<Id> accountIds = new Set<Id>();
for (Case c : Trigger.new) {
    if (c.AccountId != null) accountIds.add(c.AccountId);
}
Map<Id, Account> accountMap = new Map<Id, Account>(
    [SELECT Id, Name FROM Account WHERE Id IN :accountIds] // 1 query total
);
for (Case c : Trigger.new) {
    Account a = accountMap.get(c.AccountId);
    // use a...
}
```

**Additional tips:**
- Use **selective queries**: filter on indexed fields (`Id`, `Name`, `CreatedDate`, custom fields marked External ID or Unique).
- Don't query fields you don't need.
- In triggers, always assume `Trigger.new` can contain 200 records (the max batch size).

---

### 2. DML Rows — 10,000 per Transaction

**Why it exists:** Writing records (insert, update, delete, undelete) locks rows and writes to disk. Too many DML operations in one transaction can lock the database and block other users.

**Common violation:** Calling `insert` or `update` inside a loop.

```apex
// BAD — DML inside a loop
for (Contact con : contactList) {
    update con; // 1 DML statement per record!
}
```

**Best practice:** Collect records into a list, then do one DML call on the whole list.

```apex
// GOOD — bulkified
List<Contact> toUpdate = new List<Contact>();
for (Contact con : contactList) {
    con.Phone = '(555) 000-0000';
    toUpdate.add(con);
}
update toUpdate; // 1 DML statement total
```

---

### 3. Heap Size — 6 MB Synchronous / 12 MB Asynchronous

**Why it exists:** Heap is the memory your code uses while running. If one transaction hogs 2 GB of RAM, other transactions on the same server get starved.

**Common violation:** Loading massive query results into memory, or building huge strings/collections.

**Best practices:**
- Query only the fields you need (`SELECT Id, Name` not `SELECT *` equivalent).
- Use `LIMIT` on queries that might return many rows.
- Process large volumes asynchronously (Batch Apex, Queueable) where the heap limit doubles to 12 MB.
- Avoid storing large collections (Lists, Maps, Sets) of unnecessary data.
- Set variables to `null` when you're done with them to free memory.

---

### 4. Callouts — 100 per Transaction

**Why it exists:** Callouts (HTTP requests to external systems) are slow and depend on network availability. If one transaction makes 500 callouts, it ties up a thread for minutes.

**Common violation:** Calling an external API inside a loop.

```apex
// BAD — callout inside a loop
for (Account a : accounts) {
    Http http = new Http();
    HttpRequest req = new HttpRequest();
    req.setEndpoint('callout:MyAPI/data/' + a.Id);
    req.setMethod('GET');
    http.send(req); // 1 callout per record!
}
```

**Best practices:**
- Use **Named Credentials** (never hardcode URLs/passwords).
- Make callouts **asynchronous** (`@future(callout=true)`, Queueable, or Batch Apex).
- Batch external requests where possible (one API call that handles multiple records).
- Set `Remote Site Settings` or use Named Credentials (which bypasses that requirement).

---

### 5. CPU Time — 10,000 ms Sync / 60,000 ms Async

**Why it exists:** CPU is shared across all tenants on a server. One runaway loop could monopolize the CPU.

**Common violation:** Nested loops, complex string manipulation in triggers, inefficient sorting.

**Best practices:**
- Avoid nested loops (`for` inside `for` inside `for`).
- Use Maps for lookups instead of looping to find a match.
- Keep trigger logic minimal — delegate to helper classes.
- Move heavy processing to asynchronous code (Batch Apex, Queueable) where the limit is 6x higher.

---

### 6. Other Limits to Know

| Limit | Default | Context |
|-------|---------|---------|
| Apex classes/triggers | 1 million characters | Code size limit |
| Test methods | Must cover 75%+ of code | Deployment requires test coverage |
| Email (single) | 5,000 per day | `Messaging.SingleEmailMessage` |
| Email (mass) | 10 per day | `Messaging.MassEmailMessage` |
| Scheduled jobs | 100 concurrent | `@future`, Queueable, Batch Apex |
| Batch Apex batch size | 200 default | Max 2,000 records per batch |
| Flow interviews | Varies by edition | Flow can also hit limits |

---

## How to Monitor Governor Limits in Real Time

**Debug Logs:**
1. Setup > Debug Logs > New
2. Select the user to trace
3. Set log level to `Finest`
4. Run the operation
5. Download the log and search for `FATAL_ERROR` or `System.LimitException`

**Apex Limits Class:**
```apex
// Check how close you are to limits during execution
Integer queriesUsed = Limits.getQueries();
Integer queriesLimit = Limits.getLimitQueries();
System.debug('SOQL queries used: ' + queriesUsed + ' of ' + queriesLimit);

Integer dmlUsed = Limits.getDmlRows();
Integer dmlLimit = Limits.getLimitDmlRows();
```

**Best practice:** Add `System.debug` statements in development to catch limit issues before they hit production.

---

## Design Considerations

### Before You Build

| Question | Why It Matters |
|----------|---------------|
| Can Flow do this instead of code? | Flows are easier to maintain; code requires test classes |
| Will this scale to 1M+ records? | Governor limits apply; bulkify everything |
| Who needs to see this data? | Roles, OWD, sharing rules affect design |
| What happens if the external system is down? | Error handling, retry logic, fallback behavior |
| Is this data sensitive? | Field-level security, encryption, shield platform encryption |
| Will users adopt this? | Keep UI simple, use Lightning Design System |

### Security Design

| Consideration | Implementation |
|--------------|----------------|
| Least privilege | Users get minimum access needed |
| Field-level security | Hide salary, SSN, etc. from non-HR |
| Sharing rules | Extend access, never restrict below OWD |
| Apex sharing | `with sharing` / `without sharing` keywords |
| Named Credentials | Never hardcode passwords or tokens |
| Input validation | Validation rules + Apex validation |

### Performance Design

| Consideration | Implementation |
|--------------|----------------|
| Bulkify triggers | Handle `Trigger.new` as a collection, not record-by-record |
| Avoid SOQL in loops | Collect IDs first, query once, process in memory |
| Use selective queries | Filter on indexed fields (Id, Name, created date, custom indexed) |
| Platform Cache | Cache frequently accessed data |
| Asynchronous processing | @future, Queueable, Batch Apex for long-running tasks |

---

## Out-of-the-Box Features to Know

| Feature | What It Does | Where |
|---------|-------------|-------|
| **Record Types** | Different page layouts, picklist values, and business processes per object | Setup > Object Manager > [Object] > Record Types |
| **Formula Fields** | Read-only calculated fields (no code) | Setup > Object Manager > [Object] > Fields & Relationships > New > Formula |
| **Roll-Up Summary** | Aggregate child records on parent (Master-Detail only) | Setup > Object Manager > [Parent] > Fields & Relationships |
| **Validation Rules** | Block invalid data at save | Setup > Object Manager > [Object] > Validation Rules |
| **Approval Processes** | Multi-step record approval with email notifications | Setup > Approval Processes |
| **Sandboxes** | Copies of production for development/testing | Setup > Sandboxes |
| **Change Sets** | Move configuration between orgs | Setup > Deploy > Change Sets |
| **Salesforce CLI** | Command-line tool for developers | developer.salesforce.com/tools/sfdxcli |
| **Developer Console** | Built-in IDE for Apex, Visualforce, queries | Developer Console (from gear menu) |

---

## Official Salesforce Learning Resources

### Trailhead (Free, Official Training)

Trailhead is Salesforce's free, gamified learning platform. Start here:

| Trail | What You'll Learn | Link |
|-------|------------------|------|
| **Admin Beginner** | Objects, fields, users, security, automation | https://trailhead.salesforce.com/trails/sfx_admin_beginner |
| **Developer Beginner** | Apex, Visualforce, LWC basics | https://trailhead.salesforce.com/trails/sfx_dev_beginner |
| **Data Management** | Import, export, data quality, Dataloader | https://trailhead.salesforce.com/trails/data_management |
| **Integration** | APIs, Named Credentials, callouts | https://trailhead.salesforce.com/trails/apex_integration_services |
| **Lightning Web Components** | Build modern UI components | https://trailhead.salesforce.com/trails/lightning_web_components_basics |
| **Security** | Profiles, roles, sharing, field-level security | https://trailhead.salesforce.com/trails/force_com_security |

### Official Documentation

| Resource | What It Covers | Link |
|----------|---------------|------|
| **Salesforce Help** | End-user and admin documentation | https://help.salesforce.com/ |
| **Salesforce Developer Docs** | Apex, Visualforce, LWC, APIs | https://developer.salesforce.com/docs/ |
| **Apex Developer Guide** | Apex language, triggers, governor limits | https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/ |
| **LWC Developer Guide** | Lightning Web Components | https://developer.salesforce.com/docs/component-library/documentation/en/lwc |
| **Salesforce CLI** | Command-line development tool | https://developer.salesforce.com/tools/sfdxcli |

### Official Salesforce YouTube

| Channel / Series | What It Covers | Link |
|------------------|---------------|------|
| **Salesforce Developers** | Apex, LWC, APIs, platform deep dives | https://www.youtube.com/c/SalesforceDevelopers |
| **Salesforce Admins** | Admin tutorials, Flow, security | https://www.youtube.com/c/SalesforceAdmins |
| **Salesforce** | General product announcements and tutorials | https://www.youtube.com/c/Salesforce |
| **Trailhead** | Guided learning walks | https://www.youtube.com/c/Trailhead |

### Key Videos to Start With

| Topic | Search Term on YouTube |
|-------|----------------------|
| Salesforce for absolute beginners | "Salesforce CRM tutorial for beginners" |
| Apex fundamentals | "Salesforce Apex tutorial for beginners" |
| Lightning Web Components | "Salesforce LWC tutorial" |
| Salesforce integration | "Salesforce REST API integration tutorial" |
| Flow automation | "Salesforce Flow builder tutorial" |
| Debug logs & troubleshooting | "Salesforce debug logs tutorial" |

---

## Quick Start Checklist (Your First Week)

- [ ] Create a free Salesforce Developer Org (developer.salesforce.com/signup)
- [ ] Complete Trailhead "Admin Beginner" trail
- [ ] Complete Trailhead "Developer Beginner" trail
- [ ] Create a custom object with fields and relationships
- [ ] Build a Record-Triggered Flow
- [ ] Write a simple Apex trigger and test class
- [ ] Build a basic LWC component
- [ ] Set up Named Credentials and make a REST callout
- [ ] Review Debug Logs for a failed operation

---
