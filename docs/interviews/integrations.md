# ServiceNow Integrations — Interview Prep Deep Dive

**Agent:** opencode  
**Date:** 2026-11-10  
**Module:** Integrations (REST, SOAP, MID Server, IntegrationHub, Flow Designer)  
**Confidence:** high  

---

## Contents

- [Purpose](#purpose)
- [Integration Types Overview](#integration-types-overview)
- [Inbound Integrations](#inbound-integrations)
- [Outbound Integrations](#outbound-integrations)
- [MID Server & Connectivity](#mid-server--connectivity)
- [IntegrationHub & Flow Designer](#integrationhub--flow-designer)
- [Collapsible Labs](#collapsible-labs)
- [Key Tables](#key-tables)
- [Common Mistakes](#common-mistakes)
- [Interview Talking Points](#interview-talking-points)
- [Official Learning Resources](#official-learning-resources)

---

## Purpose

ServiceNow integrates with external systems to exchange data, trigger workflows, and orchestrate cross-platform processes. For interview prep, you should be able to explain:

1. **Inbound** — external systems calling into ServiceNow (REST messages, email, inbound SOAP, JDBC)
2. **Outbound** — ServiceNow calling external systems (REST Message, SOAP, MID Server, IntegrationHub spokes)
3. **Middleware** — IntegrationHub, Flow Designer, Orchestration as the orchestration layer
4. **Connectivity** — MID Server for on-prem systems the cloud instance cannot reach directly

You should also be ready to walk through a real, free, working integration — not a mock, not Postman, not a webhook echo service — but an actual end-to-end integration between ServiceNow and another platform.

---

## Official Exam Alignment — CSA & CAD

This page maps to two official ServiceNow certification blueprints:

### CSA — Certified System Administrator (KB0011554, updated January 2026)
| Guide Section | CSA Domain | Exam Weight | What's Covered |
|---------------|------------|-------------|----------------|
| **MID Server & Connectivity** | Domain 5: Database Management and Platform Security — Data Schema, Application/Access Control, Importing Data | 30% | MID Server architecture, on-prem connectivity, ECC Queue |
| **IntegrationHub & Flow Designer** | Domain 4: Self Service & Automation — Knowledge Management, Service Catalog, Workflow Studio, Virtual Agent | 20% | Flow Designer, automation, integration patterns |
| **Inbound/Outbound Integrations** | Domain 6: Data Migration and Integration — UI Policies, Business Rules, System update sets, Scripting | 13% | REST/SOAP, inbound actions, import sets, scripting |

### CAD — Certified Application Developer (KB0011498)
| Guide Section | CAD Domain | Exam Weight | What's Covered |
|---------------|------------|-------------|----------------|
| **Outbound Integrations (REST/SOAP)** | Domain 5: Working with External Data — Import data, integrate to external data source using REST | 10% | REST callouts, Named Credentials, remote site settings |
| **IntegrationHub & Flow Designer** | Domain 4: Application Automation — Write, test, debug Workflow and Flow Designer, Script Includes | 20% | Flow Designer, subflows, application automation |
| **MID Server** | Domain 5: Working with External Data — Integrate to external data source | 10% | MID Server for on-prem connectivity |

**Official preparation courses (CSA):**
- Welcome to ServiceNow
- ServiceNow Administration Fundamentals

**Official preparation courses (CAD):**
- Welcome to ServiceNow
- Scripting in ServiceNow Fundamentals
- Application Development Fundamentals

**Exam guidance:** Questions are based on official ServiceNow training materials, the ServiceNow Product documentation site, and the ServiceNow developer site.

---

## Integration Types Overview

| Type | Direction | Protocol | Typical Use Case |
|------|-----------|----------|------------------|
| REST Message | Outbound | REST/JSON | Call Salesforce, Teams, AWS, Azure APIs |
| SOAP Message | Outbound | SOAP/XML | Legacy enterprise systems, older ERPs |
| Inbound REST | Inbound | REST/JSON | External systems create incidents, update CMDB |
| Inbound SOAP | Inbound | SOAP/XML | Legacy monitoring tools, mainframe adapters |
| MID Server | Both | Proprietary | On-prem servers, Active Directory, network devices |
| Email / Inbound Action | Inbound | SMTP/IMAP | Create incidents from email |
| JDBC | Both | JDBC | Read/write external databases directly |
| IntegrationHub Spoke | Outbound | REST/SOAP | Prebuilt connectors (ServiceNow, Salesforce, etc.) |
| Flow Designer | Both | Native | Low-code orchestration across systems |

---

## Inbound Integrations

### Inbound REST

External systems call ServiceNow via a table API or a scripted REST API.

| Component | Purpose |
|-----------|---------|
| Scripted REST API | Custom endpoints (`/api/now/table/incident` or custom `/api/sn_customerservice/...`) |
| Resource | Defines the HTTP method, relative path, and response |
| HTTP Method | GET, POST, PUT, DELETE |
| Auth | Basic auth, OAuth, API key, or no auth (not recommended for prod) |

### Email / Inbound Action

Email sent to a ServiceNow mailbox triggers an Inbound Action that parses the body and creates/updates records.

| Component | Purpose |
|-----------|---------|
| Inbound Email Action | Parses sender, subject, body; maps to fields |
| Mailbox | POP3/IMAP account ServiceNow polls |
| Action Condition | Only runs when conditions match (e.g., subject contains "INC") |

---

## Outbound Integrations

### REST Message (Outbound)

ServiceNow calls an external API. Configured under **System Web Services > Outbound > REST Message**.

| Field | Purpose |
|-------|---------|
| Name | Friendly name (e.g., "Salesforce API") |
| Endpoint | Base URL (`https://mycompany.my.salesforce.com/services/data/v58.0/`) |
| HTTP Method | GET, POST, PUT, PATCH, DELETE |
| Authentication | Basic, OAuth 2.0, API key, or none |
| Content Type | `application/json`, `application/xml`, `text/plain` |

### SOAP Message (Outbound)

ServiceNow calls a legacy SOAP endpoint. Configured under **System Web Services > Outbound > SOAP Message**.

| Field | Purpose |
|-------|---------|
| Name | Friendly name |
| Endpoint | WSDL URL or SOAP endpoint URL |
| SOAP Action | The SOAP action header |
| Authentication | Basic, WS-Security, or none |

---

## MID Server & Connectivity

The MID Server is a Java process installed inside your network that bridges ServiceNow (cloud) to on-prem systems the instance cannot reach directly.

| Use Case | Why MID Server |
|----------|----------------|
| Active Directory | Read users/groups from on-prem AD |
| Network Discovery | Scan internal IP ranges |
| File-Based Discovery | Read flat files on internal servers |
| PowerShell / SSH | Run commands on internal Windows/Linux hosts |
| Database JDBC | Query internal SQL Server/Oracle |

### MID Server Basics

| Concept | Description |
|---------|-------------|
| MID Server | Java process installed on a Windows/Linux host inside your network |
| ECC Queue | Message queue between ServiceNow instance and MID Server |
| Capability | What the MID Server can do (Discovery, Orchestration, Integration) |
| Load Balancing | Multiple MID Servers share work via a load balancer group |

---

## IntegrationHub & Flow Designer

### Flow Designer

No-code/low-code automation builder. Triggers on record events, schedules, or external calls. Actions flow left-to-right.

| Element | Purpose |
|---------|---------|
| Trigger | Starts the flow (record created, scheduled, API call) |
| Action | A step (create record, send email, call REST, update field) |
| Subflow | Reusable flow called from another flow |
| Condition | Branches the flow based on field values |

### IntegrationHub

Prebuilt and custom spokes that wrap external APIs into Flow Designer actions.

| Spoke | Purpose |
|-------|---------|
| ServiceNow REST | Call another ServiceNow instance |
| Salesforce | Create/update Salesforce records |
| Microsoft Teams | Post messages to Teams channels |
| Slack | Send Slack messages |
| Jira | Create Jira issues |
| ServiceNow Email | Send email from Flow Designer |

---

## Collapsible Labs

<details>
<summary><strong>Lab 1: ServiceNow → Microsoft Teams (free, no mock)</strong></summary>

**Goal:** Post a message to a Teams channel when a high-priority incident is created.

**Prerequisites:**
- A ServiceNow instance with Flow Designer active
- A Microsoft Teams team and channel
- A Teams Incoming Webhook connector (free, built into Teams)

**Steps:**

1. **Create the Teams webhook**
   - In Teams, go to your channel → `…` (More options) → **Connectors**
   - Search for **Incoming Webhook**, click **Add**
   - Give it a name (e.g., "ServiceNow Alerts"), upload an image, click **Create**
   - Copy the webhook URL. **Save it** — you cannot view it again.

2. **Create the Flow in ServiceNow**
   - Navigate to **Flow Designer > Flow Designer**
   - Click **New** → Name: "Notify Teams on High Priority Incident"
   - Table: `incident`
   - Trigger: **Record created**

3. **Add a condition**
   - Add **Condition** block
   - Condition: `Priority` is `1 - Critical` OR `2 - High`

4. **Add a REST Message action**
   - Add **Action** > **Core** > **REST Message**
   - Select or create a REST Message named "Teams Webhook"
   - HTTP Method: `POST`
   - Endpoint: Paste the Teams webhook URL
   - Content Type: `application/json`
   - Request Body (JSON):
     ```json
     {
       "text": "🚨 High Priority Incident: ${number} - ${short_description}",
       "themeColor": "FF0000"
     }
     ```

5. **Activate and test**
   - Click **Activate** (top right)
   - Create a Priority 1 or 2 incident in ServiceNow
   - Verify the message appears in the Teams channel within seconds

**Why this is free and real:** Teams Incoming Webhooks are a free, native Teams feature. No Postman, no webhook echo service, no paid license required beyond your existing ServiceNow and Teams access.

</details>

<details>
<summary><strong>Lab 2: ServiceNow → Salesforce (free developer org)</strong></summary>

**Goal:** Create a Salesforce Case when a ServiceNow incident is resolved.

**Prerequisites:**
- A ServiceNow instance with REST Message active
- A free Salesforce Developer Edition org (developer.salesforce.com)
- Connected App in Salesforce for OAuth

**Steps:**

1. **Set up Salesforce Connected App**
   - In Salesforce Setup, search **App Manager** → **New Connected App**
   - Enable OAuth Settings
   - Callback URL: `https://your-instance.service-now.com/oauth_redirect.do` (or use JWT bearer flow)
   - Selected OAuth Scopes: `Access and manage your data (api)`, `Perform requests on your behalf at any time (refresh_token, offline_access)`
   - Save, then note the **Consumer Key** and **Consumer Secret**

2. **Create a Salesforce OAuth REST Message in ServiceNow**
   - Navigate to **System OAuth > Application Registries > New**
   - Name: "Salesforce OAuth", Client ID: Consumer Key, Client Secret: Consumer Secret
   - Redirect URL: `https://login.salesforce.com/services/oauth2/authorize` / token URL: `https://login.salesforce.com/services/oauth2/token`
   - Create an OAuth profile record pointing to this registry

3. **Create the Outbound REST Message**
   - Navigate to **System Web Services > Outbound > REST Message > New**
   - Name: "Salesforce Case API"
   - Endpoint: `https://yourdomain.my.salesforce.com/services/data/v58.0/sobjects/Case`
   - Authentication: Select your OAuth profile
   - Create a **REST Message Function** named "Create Case"
     - HTTP Method: `POST`
     - Endpoint: `/services/data/v58.0/sobjects/Case` (relative)
     - Content Type: `application/json`

4. **Create the Flow**
   - Flow Designer → New → Table: `incident`, Trigger: **State changes to Resolved**
   - Add **REST Message** action: "Salesforce Case API" → "Create Case"
   - Request Body:
     ```json
     {
       "Subject": "ServiceNow Incident ${number}",
       "Description": "${description}",
       "Priority": "Medium",
       "Status": "New"
     }
     ```
   - Activate and test by resolving an incident

**Why this is free and real:** Salesforce Developer Edition is free. OAuth 2.0 is the real authentication flow used in production. No Postman, no echo service.

</details>

<details>
<summary><strong>Lab 3: ServiceNow → Slack (free, alternative to Teams)</strong></summary>

**Goal:** Send a Slack message when a change request is approved.

**Prerequisites:**
- ServiceNow instance with Flow Designer
- Slack workspace with permission to add apps
- Slack Incoming Webhook URL (free, api.slack.com)

**Steps:**
1. In Slack, go to **Apps → Manage → Custom Integrations → Incoming Webhooks** → **Add Configuration**
2. Select a channel, copy the webhook URL
3. ServiceNow Flow Designer → New flow, Table: `change_request`, Trigger: **Approval state changes to Approved**
4. Add REST Message action → POST to Slack webhook URL
5. Body: `{"text": "✅ Change Request ${number} approved: ${short_description}"}`
6. Activate and test

</details>

<details>
<summary><strong>Lab 4: Inbound REST — External system creates an Incident</strong></summary>

**Goal:** Allow an external monitoring tool to create incidents in ServiceNow via REST.

**Steps:**
1. Navigate to **System Web Services > Scripted REST APIs > New**
   - Name: "External Monitor API", API ID: `external_monitor`
2. Create a **Resource**:
   - Name: "Create Incident", HTTP Method: `POST`, Relative Path: `/incident`
   - Script (server-side):
     ```javascript
     (function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
       var gr = new GlideRecord('incident');
       gr.short_description = request.body.data.title;
       gr.description = request.body.data.details;
       gr.priority = request.body.data.priority || '3';
       gr.insert();
       response.setBody({number: gr.number, sys_id: gr.sys_id});
       response.setStatus(201);
     })(request, response);
     ```
3. Test with `curl` from your workstation:
   ```bash
   curl -X POST "https://your-instance.service-now.com/api/now/table/external_monitor/incident" \
     -H "Content-Type: application/json" \
     -H "Authorization: Basic <base64-credentials>" \
     -d '{"title":"Disk full","details":"Server /dev/sda1 at 98%","priority":"2"}'
   ```

</details>

---

## Key Tables

| Table | Purpose |
|-------|---------|
| `sys_rest_message` | Outbound REST Message definitions |
| `sys_rest_message_function` | Individual endpoints/functions within a REST Message |
| `sys_soap_message` | Outbound SOAP Message definitions |
| `sys_scripted_rest_api` | Inbound Scripted REST API definitions |
| `sys_scripted_rest_resource` | Individual resources/endpoints within an API |
| `sys_em_message` | ECC Queue messages (MID Server communication) |
| `sys_mid_server` | MID Server records |
| `sys_mid_server_capability` | MID Server capabilities (Discovery, Orchestration, etc.) |
| `sys_inbound_attachment` | Inbound email attachments |
| `sysimport_set_table` | Import set data (staging for data imports) |

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Hardcoding credentials in REST Message | Security audit failure, password rotation breaks integration | Use OAuth, OAuth 2.0, or ServiceNow credentials (secret store) |
| Not handling 401/403/429 responses | Flow fails silently on auth expiry or rate limiting | Add error-handling subflow; check `response.getStatusCode()` |
| Calling external API from client script | CORS errors, credentials exposed in browser | Always call from server-side (Business Rule, Flow, Script Include) |
| Forgetting MID Server capabilities | Discovery/Orchestration jobs never run on MID Server | Assign correct capabilities to the MID Server record |
| Using `no auth` on inbound REST in production | Unauthenticated external write access | Require API key or OAuth for all production inbound APIs |
| Not testing with `curl` first | Debugging in Flow Designer is slower | Verify the API works with `curl` before building the Flow |

---

## Interview Talking Points

**Q: "How would you integrate ServiceNow with Microsoft Teams?"**

A: "I’d use Flow Designer with a REST Message action posting to a Teams Incoming Webhook. The webhook is free and native to Teams — no mock services needed. I’d trigger on incident priority changes, format a JSON payload with the incident number and description, and POST it to the webhook URL. For authentication-sensitive scenarios, I’d use OAuth 2.0 instead of basic auth."

**Q: "How do you handle integrations with on-prem systems the cloud instance can’t reach?"**

A: "I’d install and configure a MID Server inside the customer’s network. The MID Server polls the ECC Queue for Discovery, Orchestration, or Integration jobs, executes them locally, and posts results back. I’d assign the appropriate capabilities (Discovery, Orchestration, SSH, PowerShell) based on the target systems."

**Q: "REST vs SOAP — when would you use each?"**

A: "REST for modern APIs (Salesforce, Teams, AWS, custom web services) — lighter weight, JSON-based, easier to debug. SOAP for legacy enterprise systems with WSDL contracts (older ERPs, mainframe adapters) — stricter contract, XML envelope, built-in error handling via SOAP faults."

---

## Official Learning Resources

### Now Learning (Structured Training)
- [ServiceNow IntegrationHub Fundamentals](https://nowlearning.com/) — Search "IntegrationHub" on Now Learning Portal
- [Flow Designer Fundamentals](https://nowlearning.com/) — Search "Flow Designer" on Now Learning Portal
- [REST and SOAP Web Services](https://nowlearning.com/) — Search "web services" on Now Learning Portal
- [MID Server Fundamentals](https://nowlearning.com/) — Search "MID Server" on Now Learning Portal

### Product Documentation (Technical Reference)
- [ServiceNow Product Documentation — Integrations](https://docs.servicenow.com/) → Search "REST Message", "SOAP Message", "MID Server", "IntegrationHub"
- [IntegrationHub Spokes documentation](https://docs.servicenow.com/) → Search "IntegrationHub spokes"
- [Flow Designer documentation](https://docs.servicenow.com/) → Search "Flow Designer"

### Official Videos & Playlists
- [ServiceNow YouTube Channel](https://www.youtube.com/c/ServiceNow) — Search "ServiceNow IntegrationHub", "ServiceNow Flow Designer", "ServiceNow MID Server"
- [Now Platform REST API overview](https://www.youtube.com/results?search_query=servicenow+rest+api+overview)
- [IntegrationHub Spoke demos](https://www.youtube.com/results?search_query=servicenow+integrationhub+spoke+demo)

---
