# Other — Enterprise Integration, Workforce, Legacy, ITIL & Agile

**Agent:** opencode  
**Date:** 2026-11-09  
**Section:** Other (cross-enterprise systems & methodologies)  
**Confidence:** verify  

---

## Purpose

Not every system a ServiceNow developer touches is a ServiceNow module. Enterprise environments run a mix of cloud iPaaS platforms, workforce-management suites, decades-old mainframe/midrange systems, and formal process frameworks. This guide covers the "Other" systems and concepts that show up in job postings, integration projects, and interviews alongside ServiceNow:

- **Boomi (Dell Boomi / AtomSphere)** — enterprise iPaaS for connecting apps
- **UKG** — workforce management / human capital management
- **Legacy middleware** — AS/400 (IBM i), DB2, and retail/supply-chain data extraction
- **ITIL** — IT service management process framework
- **Agile** — iterative software delivery methodology

For each item you'll find an ELI5 explanation, the business reason companies use it, key terms, the API/integration surface, and how it relates to ServiceNow.

## Free vs Paid — what you can actually touch

| Item | Free on ServiceNow PDI? | Paid / subscription needed? | What you can practice free |
|------|-------------------------|------------------------------|----------------------------|
| **ServiceNow PDI** (Personal Developer Instance) | ✅ Yes — completely free | No | Everything ServiceNow-native: HRSD, REST/SOAP inbound & outbound, MID Server config, Import Sets, Transform Maps, Scripted REST APIs, ITIL (ITSM module), Agile Development app, Jelly, Service Portal |
| **Boomi (Dell Boomi / AtomSphere)** | ❌ No | Paid enterprise iPaaS | Boomi offers a limited free trial, but no ongoing free tier. You can read Boomi's connector docs and learn the ServiceNow-side patterns (REST Message → Boomi web listener → target app) on PDI, then connect when you have a Boomi account |
| **UKG (Pro / Dimensions)** | ❌ No | Paid enterprise HCM / workforce management | No free tier. You can read UKG's API docs and build the ServiceNow-side inbound REST API / webhook receiver on PDI, but you need a real UKG customer account to test against |
| **AS/400 (IBM i) / DB2** | ❌ No | Paid legacy hardware + software | No free tier. You can practice the ServiceNow side (JDBC probe config, Import Sets, Transform Maps, DB2-for-i concepts) on PDI without the AS/400, then point it at a real DB2 when you have access |
| **ITIL framework** | ✅ Yes — public knowledge | No | ITIL concepts are free to study; practice incident/problem/change/CMDB end-to-end on PDI |
| **Agile / Scrum** | ✅ Yes — methodology | No | Practice Agile tracking in ServiceNow's Agile Development app on PDI |

**Bottom line:** Everything on the *ServiceNow side* of each integration can be built and tested free on a PDI. The external systems (Boomi, UKG, AS/400) require paid accounts — you learn their concepts and the ServiceNow integration patterns on PDI, then connect to the real systems when you have access to them.

---

## 1. Boomi (Dell Boomi / AtomSphere) — Enterprise iPaaS

### ELI5

Boomi is like a universal translator and courier for business software. Instead of writing custom code every time two applications need to share data (for example, "when a new hire is created in ServiceNow, create their record in Workday and provision their laptop in Jamf"), you use Boomi to visually draw the flow. Boomi moves the data, transforms field names, handles errors, and retries if a system is down.

### Why companies use it

- Connect cloud SaaS apps (Salesforce, ServiceNow, Workday, NetSuite, SAP) to each other and to on-prem systems without custom code for every connection
- Move data in real time or on a schedule (batch)
- Expose existing integrations as reusable APIs
- Reduce "point-to-point" spaghetti: one platform instead of N² custom connectors

### Key terms & background

| Term | Meaning |
|------|---------|
| iPaaS | Integration Platform as a Service — cloud-based integration middleware |
| Atom | Lightweight runtime engine that executes integration processes (can run in cloud or on-prem behind a firewall) |
| AtomSphere | Boomi's management/plane where you design, deploy, and monitor integrations |
| Connector | Pre-built adapter to a specific application (e.g., ServiceNow connector, Salesforce connector) |
| Process | The integration flow (source → transformations → destination) built in the low-code designer |
| Shape | Data structure definition for a source or destination (defines fields) |
| Map | Field-level transformation (e.g., map ServiceNow `u_employee_id` to Workday `Employee_ID`) |
| API Management | Publish, secure, and version integrations as REST/SOAP APIs |

### API / integration surface

- **AtomSphere API** — REST API to manage Boomi itself (deploy processes, check execution status, manage environments)
- **Connectors** — each connector exposes the target app's API (e.g., the ServiceNow connector uses ServiceNow's Table API / Import Set API)
- **Web listeners** — expose a Boomi process as an inbound REST/SOAP endpoint other systems can call
- **Execution records** — logs of every process run, with input/output data for debugging

### How it connects to ServiceNow

- Boomi offers a **ServiceNow connector** that authenticates via OAuth2/basic auth and performs CRUD on ServiceNow tables (insert, update, query, delete)
- Common pattern: ServiceNow REST Message → Boomi web listener → Boomi process → target app (or reverse)
- Boomi can listen to ServiceNow Import Sets or poll ServiceNow tables for changes

### Common mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Hard-coding credentials | Integration breaks when passwords rotate | Use Connection & Credential Aliases / secrets management |
| No error handling | One bad record stops the whole batch | Add Try/Catch shapes and route errors to a dead-letter process |
| Mapping every field blindly | Target system rejects unknown/mismatched fields | Map only required fields; validate shapes before deploy |
| Running high-volume syncs synchronously | Atom timeouts / memory crashes | Use batching, Data Stream processing, or chunked queries |

### Mini lab: Conceptual Boomi → ServiceNow sync

1. Create a Boomi **Process** with a **ServiceNow Connector** operation (Query)
2. Set the source shape to a Boomi **Web Listener** (inbound REST trigger)
3. Map the incoming JSON (e.g., `employeeNumber`, `email`) to ServiceNow `u_employee_id` / `email` fields on the `user` table
4. Deploy to an Atom, note the web listener URL, and call it from an external system
5. Check Boomi **Execution Records** to confirm the ServiceNow insert succeeded

### Quiz

1. What is an Atom in Boomi?
2. Name one way Boomi connects to ServiceNow.
3. What's the difference between a Shape and a Map?

<details><summary>Answer</summary>
1. A lightweight runtime engine that executes integration processes (can run in cloud or on-prem).<br>
2. Via the Boomi ServiceNow connector (CRUD on ServiceNow tables) or by exposing a Boomi web listener that ServiceNow's REST Message calls.<br>
3. A Shape defines a data structure (fields); a Map transforms fields from one shape to another.
</details>

---

## 2. UKG — Workforce & Human Capital Management

### ELI5

UKG (Ultimate Kronos Group) is software that companies use to manage their people: tracking when hourly employees clock in and out, building work schedules, calculating overtime, managing time-off requests, and running payroll. If you've ever used a badge or a mobile app to punch a time clock at a retail store, hospital, or warehouse, that data likely flows through a UKG system.

### Why companies use it

- Track time & attendance for hourly and salaried workers
- Build schedules that match labor demand (retail shifts, nurse staffing, warehouse waves)
- Enforce labor-law and union rules (overtime, meal breaks, minor work restrictions)
- Process payroll and manage benefits (UKG Pro = HCM/payroll; UKG Dimensions = workforce management/timekeeping)

### Key terms & background

| Term | Meaning |
|------|---------|
| UKG Pro | UKG's Human Capital Management (HCM) suite — core HR, payroll, benefits, talent |
| UKG Dimensions | UKG's workforce management platform — timekeeping, scheduling, absence, labor analytics |
| Timekeeper | Employee who records time (punch in/out, breaks) |
| Accrual | Balance of earned time-off (vacation, sick) that builds up over time |
| Labor allocation | Assigning worked hours to cost centers, jobs, or projects |
| Punch | A single clock-in or clock-out event |

### API / integration surface

- **UKG Pro API** — REST API for employee data, jobs, pay, time-off, benefits (OAuth2)
- **UKG Dimensions API** — REST API for timecards, schedules, punches, and labor data
- **Webhooks** — notify external systems when timecards are approved or schedules change
- **SFTP / flat-file batch** — traditional bulk exchange (legacy customers still use nightly CSV extracts)

### How it connects to ServiceNow

- ServiceNow HRSD (Human Resource Service Delivery) often integrates with UKG Pro: new hires created in UKG flow into ServiceNow as HR cases/employee records, and vice versa
- ServiceNow can poll UKG Dimensions for approved timecards to feed into project costing or field-service billing
- Common pattern: UKG webhook → ServiceNow Inbound REST API → create/update HR case or task

### Common mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Treating a "punch" as final | Timecards get adjusted after approval | Reconcile against the final approved timecard, not the raw punch |
| Ignoring time zones | Shifts appear off by several hours | Store and compare in UTC; convert for display |
| Syncing every field | Massive payloads, slow integrations | Sync only fields that changed (delta) |
| Missing accrual rules | Employees show wrong PTO balances | Sync accrual balances, not just timecodes |

### Mini lab: Conceptual UKG → ServiceNow flow

1. Configure a UKG Dimensions webhook for "timecard approved"
2. Point the webhook at a ServiceNow Inbound REST API (Scripted REST API)
3. In ServiceNow, map the UKG timecard fields to an `hr_case` or custom `u_timecard` table
4. Create a ServiceNow Business Rule to auto-assign the case to Payroll when total hours > 40 (overtime flag)
5. Verify by approving a timecard in UKG and confirming the ServiceNow case appears

### Quiz

1. What's the difference between UKG Pro and UKG Dimensions?
2. What is a "punch"?
3. Name one integration pattern between UKG and ServiceNow.

<details><summary>Answer</summary>
1. UKG Pro = HCM/payroll/core HR; UKG Dimensions = workforce management (timekeeping, scheduling, absence).<br>
2. A single clock-in or clock-out event recorded by a timekeeper.<br>
3. UKG webhook → ServiceNow Inbound REST API → create/update HR case or task (or ServiceNow polling UKG Dimensions API for approved timecards).
</details>

---

## 3. Legacy Middleware — AS/400 (IBM i), DB2 & Retail/Supply-Chain Data

### ELI5

The AS/400 (now called IBM i) is a business computer that's been around since the 1980s. It's incredibly reliable and still runs the back office of many retailers, distributors, manufacturers, and banks. It uses the DB2 database and programs written in RPG or COBOL. "Legacy middleware" is the software that bridges these old systems to modern ones — pulling inventory and order data out of the AS/400 and pushing it into ServiceNow, a data warehouse, or an e-commerce site.

### Why companies use it

- Stability: IBM i systems can run for years without rebooting; they handle massive transaction volumes
- Existing investment: decades of business logic (pricing, allocation, replenishment) live in RPG/COBOL programs
- Retail & supply chain: many chains run store inventory, distribution-center management, and purchase-order processing on AS/400
- Companies modernize around it rather than replace it, because the core logic is proven and hard to replicate

### Key terms & background

| Term | Meaning |
|------|---------|
| AS/400 | IBM midrange computer line (1988); now marketed as IBM i running on Power Systems |
| IBM i | The current operating system name for AS/400 successors |
| DB2 | IBM's relational database; "DB2 for i" is the database built into IBM i |
| RPG / RPGLE | Report Program Generator — the dominant language for business apps on IBM i |
| COBOL | Older business language still present on many AS/400 estates |
| Middleware | Software connecting legacy systems to modern apps (IBM MQ, WebSphere IIB/ACE, MFT) |
| ECC Queue | (ServiceNow concept) Mid Server queue for probes — relevant when a MID Server reaches into an AS/400 |
| Flat file / CSV | The lowest-common-denominator way legacy systems export data |
| SQL over JDBC/ODBC | Modern way to query DB2 for i from external applications |

### API / integration surface

- **DB2 for i via JDBC/ODBC** — query DB2 tables directly from Java/Python/.NET; read inventory, orders, customers
- **IBM MQ** — message queuing; legacy apps drop messages onto queues that modern systems consume
- **WebSphere IIB / ACE (App Connect Enterprise)** — enterprise service bus that transforms and routes messages between AS/400 and modern systems
- **MI (Machine Interface) / APIs** — IBM i system APIs for program calls (e.g., calling an RPG program with parameters)
- **SFTP / batch files** — nightly extracts of inventory, sales, and supply-chain data to CSV/flat files

### How it connects to ServiceNow

- ServiceNow MID Server can run JDBC probes against DB2 for i to pull inventory or asset data into the CMDB (`cmdb_ci` / `alm_asset`)
- Import Sets + Transform Maps load flat-file extracts (from AS/400 nightly dumps) into ServiceNow tables
- ServiceNow REST inbound APIs let an AS/400 middleware layer (WebSphere ACE) push order/shipment updates into ServiceNow tasks or inventory records
- Common retail pattern: AS/400 → nightly CSV → ServiceNow Import Set → `cmdb_ci` / `inv_*` / custom supply-chain table

### Common mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Treating DB2 for i like a modern SQL DB | Date formats, packed-decimal fields, EBCDIC encoding break queries | Learn DB2-for-i quirks (date formats, zoned/packed decimals, CCSID/EBCDIC) |
| Pulling full tables nightly | Long runtimes, timeouts, table locks | Use delta/changed-record queries or message queues |
| Ignoring file locks | AS/400 job holds an exclusive lock, extract fails | Coordinate with the AS/400 admin; extract during batch window |
| Mapping legacy codes directly | Cryptic RPG status codes (e.g., "01", "99") are meaningless in ServiceNow | Add a lookup/translation table in the Transform Map |

### Mini lab: Conceptual AS/400 inventory → ServiceNow CMDB

1. Identify the DB2 for i table holding inventory (e.g., `ITEMMAST` with item number, description, quantity on hand, warehouse)
2. Configure a ServiceNow MID Server with JDBC access to DB2 for i
3. Create a ServiceNow JDBC probe/query to pull changed items (where `last_modified > last_run`)
4. Load results into an Import Set table
5. Build a Transform Map: `ITEMNUMBER` → `cmdb_ci.name`, `QTY_ON_HAND` → `u_stock_level`, `WAREHOUSE` → `location`
6. Run the import and verify inventory items appear in the ServiceNow CMDB

### Quiz

1. What is DB2 for i?
2. Name two ways to get data out of an AS/400.
3. Why do retailers still run AS/400?

<details><summary>Answer</summary>
1. IBM's relational database built into the IBM i (AS/400) operating system.<br>
2. JDBC/ODBC SQL queries; IBM MQ messages; WebSphere ACE message flows; SFTP/flat-file batch extracts.<br>
3. Stability, huge transaction throughput, and decades of proven retail/supply-chain business logic that is costly and risky to replace.
</details>

---

## 4. ITIL — IT Service Management Framework

### ELI5

ITIL (Information Technology Infrastructure Library) is a playbook for how a company should run its IT department like a service business. Instead of every team fixing computers however they want, ITIL defines standard ways to handle incidents (something broke), problems (why it keeps breaking), changes (updating systems), and service requests (someone needs a new laptop). ServiceNow is built to support ITIL processes — incident, problem, change, knowledge, and CMDB are all ITIL concepts.

### Why companies use it

- Standardize how IT delivers and supports services across teams
- Improve service quality and reduce downtime
- Align IT work with business priorities
- Meet audit/compliance requirements (change approvals, incident records, problem root-cause)

### Key terms & background

| Term | Meaning |
|------|---------|
| ITIL | Information Technology Infrastructure Library — IT service management best-practice framework |
| ITIL 4 | Current version; introduces the Service Value System (SVS) and Service Value Chain |
| Service Value Chain | Six activities: Plan, Improve, Engage, Design & Transition, Obtain/Build, Deliver & Support |
| Practice | A way of working to achieve an objective (ITIL 4 has 34 practices; ITIL v3 had 26 processes) |
| Incident | Unplanned interruption to a service or reduction in quality (goal: restore service fast) |
| Problem | Root cause of one or more incidents (goal: prevent recurrence) |
| Change Enablement | Controlling changes to services to minimize risk (ITIL 4 renamed "Change Management") |
| Service Desk | Single point of contact between users and IT |
| CMDB | Configuration Management Database — record of IT assets and their relationships |
| SLA | Service Level Agreement — promised response/resolution times |
| KEDB | Known Error Database — documented problems with workarounds |

### ITIL v3 Service Lifecycle (still referenced)

1. **Service Strategy** — what services to offer and how to fund them
2. **Service Design** — design services, processes, and technology
3. **Service Transition** — build, test, and move services into production
4. **Service Operation** — day-to-day delivery (incident, problem, event, access, request fulfillment)
5. **Continual Service Improvement (CSI)** — ongoing improvement based on metrics

### How it connects to ServiceNow

- ServiceNow ITSM module is essentially an ITIL implementation platform:
  - Incident → ITIL Incident Management
  - Problem → ITIL Problem Management
  - Change Request → ITIL Change Enablement
  - Change Task → change implementation tasks
  - Knowledge Base → ITIL Knowledge Management
  - CMDB → ITIL Service Asset & Configuration Management
  - SLA definitions → ITIL service levels
- Common interview question: "How does ServiceNow support ITIL?" → map the modules above

### Common mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Treating every incident as a problem | Problem queue flooded with one-off tickets | Open problems only for recurring root-cause analysis |
| No change approvals | Unauthorized changes break production | Enforce Change Enablement workflow with CAB approvals |
| Stale CMDB | CMDB doesn't match reality, impact analysis is wrong | Run Discovery + reconcile regularly; assign data owners |
| Ignoring SLAs | Teams miss response targets; business complains | Define and automate SLA workflows in ServiceNow |

### Mini lab: ITIL incident → problem → change in ServiceNow

1. Create an `incident` (login broken for 3 users) and set State = "In Progress"
2. Resolve the incident with a workaround (reset passwords) and close it
3. Notice the same issue happened twice this week → create a `problem` linked to the incidents
4. Investigate and document root cause in the problem (e.g., faulty LDAP group) → add to KEDB
5. Propose a `change request` to fix the LDAP group permanently → route through Change Enablement approval
6. After approval, implement and close the change; link it back to the problem

### Quiz

1. What's the difference between an incident and a problem?
2. What does Change Enablement replace in ITIL 4 terminology?
3. Name two ServiceNow tables that map to ITIL practices.

<details><summary>Answer</summary>
1. Incident = unplanned interruption; restore service fast. Problem = root cause behind one or more incidents; prevent recurrence.<br>
2. Change Management (renamed to Change Enablement in ITIL 4).<br>
3. `incident` (Incident Management), `problem` (Problem Management), `change_request` (Change Enablement), `cmdb_ci` (Service Asset & Configuration Management).
</details>

---

## 5. Agile — Iterative Software Delivery

### ELI5

Agile is a way of building software in small, repeated cycles instead of one giant "big bang" release. A team picks a small chunk of the most important work, builds and tests it in a short window (usually 1–4 weeks called a Sprint), shows it to stakeholders, gets feedback, and then plans the next chunk. It's the opposite of Waterfall, where you plan everything upfront, build for months, and release once at the end.

### Why companies use it

- Deliver working software faster and more frequently
- Adapt to changing requirements without restarting the whole project
- Get customer/stakeholder feedback early and often
- Reduce risk: if something is wrong, you find it in weeks, not months

### Key terms & background

| Term | Meaning |
|------|---------|
| Agile Manifesto | 2001 statement: individuals & interactions over processes/tools; working software over documentation; customer collaboration over negotiation; responding to change over following a plan |
| Scrum | Most common Agile framework: fixed-length Sprints, defined roles and ceremonies |
| Kanban | Flow-based Agile: visualize work on a board, limit work-in-progress, pull as capacity allows |
| Sprint | Time-boxed iteration (commonly 2 weeks) in Scrum |
| Product Owner | Owns the Product Backlog; decides what to build and in what order |
| Scrum Master | Facilitates Scrum; removes impediments; coaches the team |
| Development Team | Cross-team that designs, builds, tests the product increment |
| Product Backlog | Prioritized list of all desired work (user stories, bugs, tech debt) |
| Sprint Backlog | Subset of the Product Backlog committed to for the current Sprint |
| User Story | Small, user-valued piece of work: "As a [role], I want [goal] so that [benefit]" |
| Story Point | Relative estimate of effort/complexity (not hours) |
| Velocity | How many story points a team completes per Sprint (used for forecasting) |
| Increment | The sum of all completed backlog items at the end of a Sprint |

### Scrum ceremonies & artifacts

| Ceremony | Purpose | Frequency |
|----------|---------|-----------|
| Sprint Planning | Select backlog items for the Sprint and define the Sprint Goal | Start of each Sprint |
| Daily Standup | 15-min sync: what I did, what I'll do, blockers | Daily |
| Sprint Review | Demo the Increment to stakeholders; get feedback | End of each Sprint |
| Sprint Retrospective | Team reflects on process; identifies improvements | End of each Sprint |

| Artifact | Meaning |
|----------|---------|
| Product Backlog | All work, ordered by value |
| Sprint Backlog | Work committed for this Sprint |
| Increment | Potentially shippable product at end of Sprint |

### How it connects to ServiceNow

- ServiceNow has an **Agile Development** application (formerly Project Portfolio / Agile) for managing backlogs, sprints, and stories inside ServiceNow
- DevOps teams use ServiceNow to track defects (`change_request`, `problem`, custom `u_agile_story` tables) and link them to CI/CD pipelines
- ServiceNow's own development and many customer implementations run on Agile/Scrum
- Common pattern: Jira/ADO for team-level Agile, ServiceNow for enterprise portfolio/ITSM; integrated via APIs or middleware (e.g., Boomi)

### Common mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| "Agile" but no backlog prioritization | Team works on low-value items | Product Owner must own and order the backlog |
| Two-week "Sprints" that never ship | Waterfall in disguise | Every Sprint must produce a potentially shippable Increment |
| Skipping retrospectives | Same blockers repeat every Sprint | Hold retrospectives; act on at least one improvement |
| Story points as hours | Points become a deadline weapon | Points are relative complexity, not time commitments |

### Mini lab: Run one Scrum Sprint

1. **Product Backlog:** write 5 user stories (e.g., "As a ServiceNow admin, I want an import set for UKG timecards so I can sync workforce data")
2. **Sprint Planning:** pull the top 3 stories into the Sprint Backlog; set a 2-week Sprint Goal
3. **Daily Standup:** 15 minutes; surface blockers (e.g., "waiting on UKG API credentials")
4. **Build:** deliver the import set + transform map; demo it
5. **Sprint Review:** show working import to stakeholders; capture feedback
6. **Sprint Retrospective:** pick one process improvement for next Sprint

### Quiz

1. What are the four values of the Agile Manifesto?
2. What is a User Story format?
3. Name two Scrum ceremonies.

<details><summary>Answer</summary>
1. Individuals & interactions over processes & tools; working software over comprehensive documentation; customer collaboration over contract negotiation; responding to change over following a plan.<br>
2. "As a [role], I want [goal] so that [benefit]."<br>
3. Sprint Planning, Daily Standup, Sprint Review, Sprint Retrospective (any two).
</details>

---

## How These Fit With ServiceNow

| "Other" item | ServiceNow connection point | Typical integration direction |
|--------------|----------------------------|------------------------------|
| Boomi | ServiceNow Connector / Inbound REST API | Bidirectional (ServiceNow ↔ Boomi ↔ other apps) |
| UKG | HRSD / Inbound REST API / webhooks | UKG → ServiceNow (timecards, employees, time-off) |
| AS/400 + DB2 | MID Server JDBC / Import Sets / CMDB | AS/400 → ServiceNow (inventory, assets, orders) |
| ITIL | ITSM module (incident, problem, change, CMDB) | ServiceNow IS the ITIL platform |
| Agile | ServiceNow Agile Development / DevOps | ServiceNow tracks Agile work and defects |

---

## 6. ServiceNow Integration Breadcrumbs — REST/SOAP APIs & MID Server

### ELI5

ServiceNow is rarely an island. It needs to send data out (e.g., "create a ticket in Jira when an incident is raised") and receive data in (e.g., "create an incident when a monitoring alert fires"). ServiceNow provides menu paths — breadcrumbs — that admins and developers use to configure these connections without writing everything from scratch.

### Key breadcrumbs (where to click in ServiceNow)

| Breadcrumb | Path | What you configure there |
|------------|------|--------------------------|
| System Web Services | System Web Services → ... | REST and SOAP message definitions, inbound and outbound |
| REST Message | System Web Services → REST Messages | Outbound REST calls: endpoint, HTTP method, auth, headers, body |
| SOAP Message | System Web Services → SOAP Messages | Outbound SOAP calls: WSDL, endpoint, operation, envelope |
| Inbound REST (Scripted REST APIs) | System Web Services → Scripted REST APIs | Expose ServiceNow data as a REST endpoint others can call |
| Message Inbound / Outbound | System Web Services → Inbound/Outbound | Web service inbound/outbound records (legacy SOAP/REST) |
| MID Servers | MID Server → MID Servers | Install, configure, and monitor Mid Server instances |
| ECC Queue | MID Server → ECC Queue | View Mid Server probe/sensor commands and results |
| Import Sets | System Import Sets → ... | Load flat-file/CSV data (often from legacy extracts) into staging tables |
| Transform Maps | System Import Sets → Transform Maps | Map imported fields to target tables (e.g., CMDB) |

### Inbound REST (Scripted REST API) vs Table API

When should you use Inbound REST (Scripted REST API) vs the Table API?

**Table API** is ServiceNow's native, low-level CRUD interface for tables. It's ideal for:
- Direct table operations (create, read, update, delete records)
- Simple, well-understood data transformations
- When you need to work with tables that aren't exposed via REST
- Internal ServiceNow applications where you already have table references

**Inbound REST (Scripted REST API)** is a higher-level, RESTful endpoint that exposes ServiceNow data to external systems. Use it when you need to:
- Let external applications (other SaaS, legacy systems, custom code) call ServiceNow data
- Build webhooks or event-driven integrations
- Provide a stable, versioned contract for third-party integrations
- Decouple your ServiceNow instance from direct table access

**Practical example:**
A monitoring system needs to receive alerts when a server's CPU usage exceeds 90% and create a ServiceNow incident automatically.

- **Table API approach:** The monitoring script queries the `incident` table directly (or uses a script include that does) and creates records. This couples the integration to a specific table and requires the external system to know the table structure.
- **Inbound REST approach:** You create a Scripted REST API on the `incident` table (or a custom table) that accepts a POST request with alert data, validates it, and creates the incident. The external system calls this REST endpoint instead of knowing about ServiceNow tables.

**Why choose one over the other:**
| Aspect | Table API | Inbound REST (Scripted REST API) |
|--------|-----------|----------------------------------|
| Abstraction | Low-level, direct table access | High-level, RESTful endpoint |
| Coupling | Tightly couples to specific tables | Loose coupling — external systems call your API |
| Security | Requires careful table-level permissions | Can enforce API-level auth (OAuth2, API keys) |
| Versioning | Table schema changes break consumers | API versioning is explicit in the REST contract |
| Scalability | Can hit table limits with high volume | Stateless, can be scaled horizontally |
| Use case | Internal ServiceNow app logic | External integrations, webhooks, third-party systems |

**Comparison table**

| Feature | Table API | Inbound REST (Scripted REST API) |
|---------|-----------|----------------------------------|
| Primary purpose | CRUD on ServiceNow tables | Expose data to external callers |
| Authentication | Table/record-level permissions | API-level (OAuth2, API key, basic auth) |
| Request format | Direct table queries | JSON/REST payloads |
| Response format | Record objects | JSON with custom structure |
| Scalability | Limited by table capacity | Horizontally scalable, stateless |
| Coupling | Tight (depends on table schema) | Loose (external system defines its own payload) |
| Ideal for | Internal ServiceNow integrations | Third-party systems, webhooks, external apps |

**When to use each:**
- **Use Table API** when building internal ServiceNow applications, performing bulk data operations, or when the integration only needs to read/write a few specific tables.
- **Use Inbound REST** when you need to integrate with external systems (other SaaS, legacy mainframes, custom code) that should be able to call ServiceNow data without knowing the internal table structure.

### REST APIs — outbound vs inbound

Direction | Purpose | Key config
----------|----------|------------|
Outbound REST Message | ServiceNow calls an external API | `System Web Services → REST Messages` → New → set endpoint, method, auth |
Inbound Scripted REST API | External system calls ServiceNow | `System Web Services → Scripted REST APIs` → create API, define resources/HTTP methods, return JSON |

### MID Server connectivity

Concept | What it is | Why it matters
--------|------------|------------|
MID Server | Java agent installed inside your network | Lets the cloud ServiceNow instance reach on-prem systems behind firewalls
ECC Queue | Queue of commands sent to / received from MID Servers | Where you see probe execution status (Running / Completed / Error)
Probe | Definition of what the MID Server should do | E.g., JDBC query, SSH command, SNMP scan, directory lookup
Sensor | Processes the MID Server's response back into ServiceNow | Turns raw probe output into CMDB records, events, etc.
JDBC Probe | Queries a database (e.g., DB2 for i, SQL Server) via MID Server | Used for legacy middleware extraction (AS/400 inventory → CMDB)

### Common mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Hard-coding credentials in REST messages | Breaks when passwords or tokens rotate | Use **credential aliases** — one ServiceNow credential record referenced by many REST messages; rotate the password/token in one place, not every integration. OAuth2 is an alternative (scoped, time-limited access) but its tokens still expire, so you still want aliases for centralized management. |
| No MID Server for on-prem targets | Connection refused / timeout | Install a MID Server inside the target network |
| Ignoring ECC Queue errors | Integration silently fails | Monitor ECC Queue → State = Error, inspect output |
| Calling inbound API without auth | 401 Unauthorized | Add basic auth, API key, or OAuth token to the request |
| Synchronous outbound call too long | Transaction timeout | Use asynchronous outbound (Execution Queue) for long calls |

### Mini lab: Call an external REST API from ServiceNow

1. Go to **System Web Services → REST Messages → New**
2. Name: "Get UKG Timecards"; Endpoint: `https://api.ukg.com/dimensions/timecards`
3. Set HTTP method: GET; Auth: Basic (enter username/password or use credential alias)
4. Add a header `Accept: application/json`
5. Click **Test** and confirm a 200 response with JSON body
6. (Optional) Create a **Scripted REST API** under **System Web Services → Scripted REST APIs** to expose a ServiceNow table as JSON to external callers

### Quiz

1. Where do you configure an outbound REST Message?
2. What does the ECC Queue show?
3. Why do you need a MID Server for on-prem systems?

<details><summary>Answer</summary>
1. **System Web Services → REST Messages**.<br>
2. Commands sent to / received from MID Servers (probe/sensor state, input/output).<br>
3. ServiceNow is cloud; a MID Server runs inside your network so it can reach databases, mainframes, and APIs behind your firewall.
</details>

---

## 7. Jelly in ServiceNow

### ELI5

Jelly is ServiceNow's XML-based scripting language. It's used mainly to render the **Service Portal** — the customer/employee-facing website where users browse the service catalog, view knowledge articles, and submit requests. Think of Jelly as HTML with superpowers: it lets you embed ServiceNow logic (GlideRecord queries, variables, conditions) directly inside XML markup that gets turned into the pages users see.

### Is Jelly for Service Portal or Workspaces?

| Platform | Uses Jelly? | Notes |
|----------|-------------|-------|
| **Service Portal** | ✅ Yes | Primary use case. Jelly is used in portal widgets, pages, and headers/footers to render dynamic content. |
| **Workspace (Agent Workspace / now experience)** | ❌ Largely no | Workspaces are built with **Vue.js** (SPA framework), not Jelly. Configuration is JSON-based (pages, panels, views), not Jelly XML. |
| Legacy UI (11.x / old interface) | ✅ Yes | Older ServiceNow UI used Jelly heavily for list views, forms, and UI pages. |

### Key terms

| Term | Meaning |
|------|---------|
| Jelly | XML-based templating/scripting language in ServiceNow |
| Widget | A reusable Service Portal building block; can contain Jelly, HTML, CSS, and client/script includes |
| Client Script | Runs in the browser (not Jelly; standard JavaScript) within Service Portal |
| Server Script | Runs on the server within a widget; has access to GlideRecord, current, etc. |
| `g_user`, `current`, `glide` | Common Jelly/global objects available in portal server scripts |

### Jelly example

Here's a simple Jelly snippet used inside a Service Portal widget to greet the logged-in user and list their open incidents:

```xml
<j:jelly trim="true" xmlns:j="jelly:core" xmlns:g="glide">
  <j:if test="${!gs.hasRole('admin')}">
    <div class="alert alert-info">
      Welcome, <span>${g_user.getDisplayName()}</span>. Here are your open incidents:
    </div>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Number</th>
          <th>Short Description</th>
          <th>State</th>
        </tr>
      </thead>
      <tbody>
        <j:forEach var="inc" items="${current.incidentList}">
          <tr>
            <td>${inc.number}</td>
            <td>${inc.short_description}</td>
            <td>${inc.state.display_value}</td>
          </tr>
        </j:forEach>
      </tbody>
    </table>
  </j:if>
</j:jelly>
```

### How it connects to ServiceNow

- Service Portal widgets use Jelly for **server-side rendering** before the page reaches the browser
- Client-side interactivity in portals uses regular JavaScript / AngularJS (older portals) or vanilla JS + Service Portal APIs
- Workspaces (the modern agent experience) do **not** use Jelly; they're Vue.js apps driven by JSON page configs
- If you're maintaining an older ServiceNow implementation (pre-Entity Service Portal), you'll see far more Jelly in UI pages, list views, and form overlays

### Common mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Using Jelly in a Workspace panel | Doesn't render; Workspace expects Vue/JSON | Use Workspace page config (JSON) or a Service Portal page embedded via iframe if needed |
| Putting heavy logic in Jelly | Slow portal page loads | Move business logic to a Server Script or Script Include; keep Jelly for presentation |
| Forgetting `trim="true"` | Extra whitespace breaks layout | Add `trim="true"` to the `<j:jelly>` tag |
| Exposing raw GlideRecord without limits | Performance / security risk | Always add `.setLimit()` and check roles (`gs.hasRole()`) |

### Mini lab: Show user's name in a Service Portal widget

1. Go to **Service Portal → Widgets → New**
2. In the **Server Script** field, write logic to fetch `gs.getUser().getDisplayName()`
3. In the **HTML** template, use Jelly: `<h1>Hello, ${user_name}</h1>`
4. Add the widget to a portal page and preview it as a logged-in user
5. Verify the name displays correctly

### Quiz

1. Is Jelly used in Agent Workspace?
2. What is Jelly primarily used for in ServiceNow today?
3. Name one object available in Jelly/server scripts.

<details><summary>Answer</summary>
1. No — Workspaces use Vue.js/JSON config, not Jelly.<br>
2. Rendering Service Portal pages/widgets (server-side templates with embedded ServiceNow logic).<br>
3. `g_user` (current user), `gs` (GlideSystem), `current` (current record), or `glide` (Glide object).
</details>

---

## How These Fit With ServiceNow

| "Other" item | ServiceNow connection point | Typical integration direction |
|--------------|----------------------------|------------------------------|
| Boomi | ServiceNow Connector / Inbound REST API | Bidirectional (ServiceNow ↔ Boomi ↔ other apps) |
| UKG | HRSD / Inbound REST API / webhooks | UKG → ServiceNow (timecards, employees, time-off) |
| AS/400 + DB2 | MID Server JDBC / Import Sets / CMDB | AS/400 → ServiceNow (inventory, assets, orders) |
| ITIL | ITSM module (incident, problem, change, CMDB) | ServiceNow IS the ITIL platform |
| Agile | ServiceNow Agile Development / DevOps | ServiceNow tracks Agile work and defects |
| ServiceNow Integrations | System Web Services, MID Server, ECC Queue | Outbound REST/SOAP / Inbound Scripted REST APIs |
| Jelly | Service Portal widgets (server-side rendering) | Portal pages display ServiceNow data to end users |

---

## Quick Glossary (All Sections)

| Term | Plain-English meaning |
|------|----------------------|
| iPaaS | Cloud service that connects other applications |
| Atom | Boomi's integration runtime engine |
| UKG Pro | HR/payroll suite |
| UKG Dimensions | Timekeeping/scheduling suite |
| AS/400 / IBM i | Legacy midrange business computer |
| DB2 | Database on IBM i and other IBM platforms |
| RPG / COBOL | Legacy programming languages on AS/400 |
| ITIL | Framework for managing IT as a service |
| Incident | "Something broke — fix it fast" |
| Problem | "Why does this keep breaking?" |
| Change Enablement | Controlled approval of changes to production |
| Agile | Build in small cycles, get feedback often |
| Sprint | Fixed-length work cycle (1–4 weeks) |
| User Story | Small piece of user-valued work |
| MID Server | Java agent reaching on-prem systems for ServiceNow |
| ECC Queue | Queue of Mid Server probe/sensor commands |
| Scripted REST API | Expose ServiceNow data as REST for external callers |
| Jelly | XML templating language for Service Portal |
| Service Portal | Customer/employee-facing website (uses Jelly) |
| Workspace / Agent Workspace | Modern agent UI (Vue.js, not Jelly) |

---

*Prepared for the ServiceNow Module Guides "Other" section. Verify specifics against each vendor's official documentation and your own environment.*
