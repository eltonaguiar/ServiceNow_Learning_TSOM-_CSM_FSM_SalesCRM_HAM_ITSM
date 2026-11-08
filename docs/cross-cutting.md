# Cross-Cutting Platform Skills

**Agent:** opencode  
**Date:** 2026-11-08  
**Scope:** Platform Admin, Development, and Integration  
**Confidence:** high  

---

## Contents

- [Integrations](#integrations)
- [Scripting](#scripting)
- [Flow Designer](#flow-designer)
- [Platform Administration](#platform-administration)
- [Quiz](#quiz)

---

## Integrations

Integrations are how ServiceNow talks to the rest of the enterprise.

### The Integration Toolset
| Tool | When to use | Key Concept |
|-------|--------------|-------------|
| **Import Sets** | Bulk data loading (Excel, CSV) | Staging table $	o$ Transform Map $	o$ Target |
| **REST Message** | Real-time outbound calls | Endpoint, HTTP Method, Auth, JSON Parsing |
| **Scripted REST API** | Allow external systems to call SN | Custom endpoints, Request/Response handling |
| **IntegrationHub** | Low-code integrations | Spokes, Actions, Connection & Credential Aliases |
| **MID Server** | Accessing internal network data | Java agent, ECC Queue, Probe/Sensor |

🚀 **Interview Insight:** If asked about "Integration Patterns," discuss the difference between **Asynchronous** (Import Sets/Queues) and **Synchronous** (REST API) calls. Mention that **MID Servers** are essential for any on-prem data source.

---

## Scripting

The "Pro-Code" side of the platform.

### Server-Side Scripting
- **Business Rules:** Triggered by database operations.
  - `before`: Validate/modify data before it hits the DB.
  - `after`: Trigger subsequent actions (e.g., create a task).
  - `async`: Long-running tasks (emails, integrations).
- **Script Includes:** Reusable, object-oriented libraries. The only way to write DRY (Don't Repeat Yourself) code.
- **Scheduled Jobs:** Periodic execution of scripts.

### Client-Side Scripting
- **Client Scripts:** Run in the browser.
  - `onLoad`, `onChange`, `onSubmit`.
- **UI Policies:** Declarative logic to show/hide or make fields mandatory.
- **GlideAjax:** The bridge between Client and Server. *Always* use GlideAjax instead of `getReference()` to avoid freezing the browser.

---

## Flow Designer

The modern replacement for Workflow.

- **Triggers:** Record-based, Schedule-based, or API-based.
- **Actions:** The discrete "steps" in a flow.
- **Subflows:** Encapsulated logic called by multiple flows.
- **Data Stream Actions:** Processing large API payloads in batches to avoid memory crashes.

---

## Platform Administration

The "Guardrails" of the instance.

- **Update Sets:** The vehicle for moving changes between Dev $	o$ Test $	o$ Prod.
- **ACLs (Access Control Lists):** The security layer. `Role` $	o$ `Operation` $	o$ `Table`.
- **Cloning:** Copying Prod data back to Dev to refresh test data.
- **System Properties:** Global variables used to control behavior without changing code.

---

## Quiz

1. When should you use a Script Include instead of a Business Rule?
<details><summary>Answer</summary>When the logic needs to be reused across multiple parts of the platform (e.g., called by both a UI Action and a Flow).</details>

2. What is the purpose of a MID Server in an integration?
<details><summary>Answer</summary>It acts as a proxy, allowing the ServiceNow Cloud instance to communicate with servers behind a corporate firewall.</details>

3. What is the difference between a Before and After Business Rule?
<details><summary>Answer</summary>A 'Before' rule modifies the record before it is saved to the DB; an 'After' rule acts on the record after it is saved, often to update related records.</details>

4. Why is GlideAjax preferred over g_form.getReference()?
<details><summary>Answer</summary>GlideAjax is asynchronous, meaning it doesn't lock the browser UI while waiting for the server to respond.</details>
