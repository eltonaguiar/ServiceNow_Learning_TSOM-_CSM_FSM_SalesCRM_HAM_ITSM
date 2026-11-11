# ServiceNow Service Mapping — Application Service Discovery

**Agent:** opencode  
**Date:** 2026-11-10  
**Module:** Service Mapping  
**App:** IT Operations Management (ITOM) / Service Mapping  
**Confidence:** high  

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
- [Deep Dive: Service Mapping — Automated or Manual?](#deep-dive-servicemapping-automated-or-manual)
- [Lab: Create Your First Mapped Application Service](#lab-create-your-first-mapped-application-service)
- [Quiz](#quiz)
- [Official Learning Resources](#official-learning-resources)
- [Visual & Video Guides](#visual--video-guides)

---

## Purpose

ServiceNow Service Mapping automatically discovers which configuration items (CIs) support a particular business application service, and maps the relationships between them. It answers the question: *"If this server or database goes down, which business service is affected?"*

Service Mapping does not normally require you to create every CI and relationship by hand. You configure an application service, define an entry point (URL, hostname, or IP), and let pattern-based discovery — powered by horizontal Discovery and the MID Server — identify the infrastructure, applications, and dependencies, then generate the service map stored in the CMDB.

---

## Where to Find It

| Breadcrumb | Path |
|------------|------|
| Module entry | All > Service Mapping > ... |
| Application Services | All > Service Mapping > Application Services > All |
| Service Maps | All > Service Mapping > Service Maps > All |
| Maps | All > Service Mapping > Maps > All |
| Administration | All > Service Mapping > Administration > ... |

**Tip:** Service Mapping is an ITOM application. Verify the `com.snc.service_mapping` plugin is active (System Definition → Plugins). Discovery (`com.snc.discovery.core`) and a MID Server are required prerequisites.

## Prerequisites & Setup

### Plugins and Scoped Apps
- **Service Mapping**: `com.snc.service_mapping` — scoped app for ITOM; must be activated in System Definition → Plugins
- **Discovery Core**: `com.snc.discovery.core` — required as upstream discovery engine
- **MID Server**: `com.snc.mid_server` — agent executing Discovery probes inside your network
- **Pattern Designer Enhancements**: Shared libraries for pattern customization
- **CMDB CI Class Models**: `sn_cmdb_ci_class` (version 1.69.0+) for telecom-style inventory models

### Guided Setup Requirements
1. **Install Service Mapping Plus** (`sn_sm_scoped_app`) if you have admin role for automated suggestions
2. **Install and configure MID Server** — validate it on all target hosts (All > MID Server > Servers)
3. **Configure credentials** — host credentials per OS/application, SNMP community credentials for network devices
4. **Define Application Services** — create an application service record (e.g., "Online Banking") with entry point URL/IP/hostname (All > Service Mapping > Application Services > All)
5. **Create or run discovery schedule** targeting the entry point's host (All > Discovery > Discovery Schedules)
6. **Verify MID Server capabilities** — assign SSH/WMI/SNMP/Cloud Provisioning as needed (All > MID Server > Servers > Capabilities)

### System Properties to Consider
- `sa.topdown.enablecmdbbasedmapping` — enables CMDB-based mapping instead of MID Server (default false)
- `glide.service_mapping.computation_depth` — max map depth (default 3000)
- `sa.max_relations_in_service` — max CI relations per service (default 5000)
- `snsmscopedapp.app.svcbytags.maxcandidatesperfamily` — tag-based candidate limit (default 200)
- `sn_sm_scopedapp.max_valid_discovery_period_in_days` — days a host stays valid for candidate generation (default 1000)

### Cross-Module Dependencies
- **Discovery**: Must produce CIs in `cmdb_ci`, `cmdb_ci_server`, `cmdb_ci_appl` via horizontal discovery
- **CMDB**: Stores mapped CIs and relationships (`cmdb_rel_ci`); identification rules prevent duplicates
- **ITOM**: Service Mapping consumes discovered CIs for impact analysis and asset matching
- **TSOM**: Uses Service Mapping maps to trace dependencies from infrastructure to business services

### ACLs Related to Core Tables
- `service_mapping_admin` role sets up Service Mapping application
- `itil`, `admin`, `sm_admin` roles for configuration and maintenance
- `mid_server` role on instance side for MID Server service account
- ACLs on `cmdb_ci_service_discovered`, `cmdb_rel_ci`, `cmdb_ci_server`, `cmdb_ci_appl`

### Breadcrumbs — What Needs to Be Enabled First
1. **MID Server** — Install, validate, and confirm "Up" status (All > MID Server > Servers)
2. **Credentials** — Configure host credentials with appropriate permissions (All > Service Mapping > Administration > Credentials)
3. **Application Service** — Create/select the business service record with entry point (All > Service Mapping > Application Services > All)
4. **Discovery Schedule** — Run discovery against the entry point's host (All > Discovery > Discovery Schedules)
5. **Map Generation** — Generate the service map and verify relationships (All > Service Mapping > Maps > All)

---

## Official Exam Alignment — CIS-Service Mapping

This guide maps to the **Certified Implementation Specialist – Service Mapping (CIS-SM)** exam blueprint (ServiceNow University, KB0011558). Exam weightings shown are the official domain percentages.

| Guide Section | CIS-SM Domain | Exam Weight | What's Covered |
|---------------|-----------------|-------------|----------------|
| **Deep Dive: Pattern-Based Discovery** | Domain 1: Service Mapping Pattern Design — Pattern Designer, Operations, Scripting, Application Identification and Connection | 30% | Pattern design, match/parse operations, identification and connection sections |
| **Step 1–6 Worked Example** | Domain 2: Service Mapping Configuration — Setup and Configuration, Service Configuration, Process Flow | 20% | Entry points, CI types, credentials, service maps, schedules, service groups |
| **Discovery Comparison Table** | Domain 3: Discovery Configuration — Discovery Setup, Process Flow, Troubleshooting | 15% | Discovery behaviors, clusters, MID Servers, PCIE phases |
| **Discovery Methods Table** | Domain 4: Machine Learning — Service Mapping Methods, ML Powered Mapping | 10% | Top-down, traffic-based, tag-based, predictive intelligence |
| **CMDB Tables Section** | Domain 5: Configuration Management Database — CI Class Management, Identification and Reconciliation | 15% | CI Class Manager, CMDB Health, identification and reconciliation rules |
| **Deep Dive: Interview Answer / Infrastructure Changes** | Domain 6: Service Mapping Engagement Readiness — Scoping, Planning, Operationalizing IT | 10% | Service definition, shared services, licensing, KPIs, benefits |

**Official preparation courses:**
- Welcome to ServiceNow
- ServiceNow Administration Fundamentals
- ServiceNow Platform Implementation
- Get Started with Now Create
- ITOM Overview
- Service Mapping Fundamentals
- Service Mapping Advanced
- Service Mapping Extras

**Additional recommended resources:**
- Common Service Data Model (CSDM) Fundamentals
- Configuration Management Database (CMDB) Fundamentals
- MID Server Fundamentals
- Discovery Fundamentals
- Event Management Fundamentals

**Exam guidance:** Questions are based on official ServiceNow training materials, the ServiceNow Product documentation site, and the ServiceNow developer site.

---

## Horizontal Discovery vs Top-Down Service Mapping Diagram

```mermaid
graph TD
    subgraph "Horizontal Discovery - 'What exists on the network?'"
        A["MID Server"] --> B["Scan IP Range"]
        B --> C["Discover CIs"]
        C --> D["cmdb_ci, cmdb_ci_server, cmdb_ci_appl"]
        D --> E["Standalone CIs"]
    end
    
    subgraph "Top-Down Service Mapping - 'Which CIs support this service?'"
        F["Application Service"] --> G["Entry Point: URL/IP"]
        G --> H["Pattern-Based Discovery"]
        H --> I["Follow Dependencies"]
        I --> J["cmdb_ci_service_discovered"]
        J --> K["cmdb_rel_ci Relationships"]
    end
    
    E -.->|feed data| J
    
    style A fill:#e58a8a,color:#fff
    style F fill:#4cc38a,color:#000
    style J fill:#0a0d10,stroke:#e5b567
    style K fill:#0a0d10,stroke:#e5b567

    note right of A: Horizontal Discovery runs independently
    note right of F: Service Mapping starts from a business service
    note right of E: CIs discovered by Horizontal Discovery are consumed by Service Mapping
```

**Exam focus:** The distinction between horizontal Discovery (what exists) and top-down Service Mapping (which components support a service) is a core concept tested across multiple domains.

---

## Online Banking Service Map Example

```mermaid
graph TD
    subgraph "Application Service"
        svc[Online Banking Service<br/>cmdb_ci_service_discovered]
    end
    
    subgraph "Web Tier"
        f5[F5 Load Balancer]
        web[WEB01 - IIS<br/>cmdb_ci_appl]
        web_server[WEB01 Host<br/>cmdb_ci_server]
    end
    
    subgraph "Application Tier"
        app[APP01 - Tomcat<br/>cmdb_ci_appl]
        app_server[APP01 Host<br/>cmdb_ci_server]
    end
    
    subgraph "Database Tier"
        db[DB01 - SQL Server<br/>cmdb_ci_appl]
        db_server[DB01 Host<br/>cmdb_ci_server]
    end

    svc --> f5
    f5 --> web
    web --> web_server
    web --> app
    app --> app_server
    app --> db
    db --> db_server

    style svc fill:#4cc38a,color:#000
    style f5 fill:#e5b567,color:#000
    style web fill:#10141a
    style app fill:#10141a
    style db fill:#10141a

    linkStyle default stroke:#4cc38a,stroke-width:2px

    note right of svc: Entry point: https://online.mybank.com
    note right of web: Pattern identifies IIS, app pools, websites, listening ports
    note right of app: Pattern identifies outbound connections to 10.10.2.30:8080
    note right of db: Pattern identifies SQL Server instance on 10.10.3.40:1433
```

**Exam focus:** Service configuration, entry points, CI types, service maps, service groups (20% of CIS-SM exam).

---

## Re-usable Code / Metadata

### Scoped Application

Service Mapping ships as part of the ITOM scoped application surface.

| Scope Aspect | Detail |
|--------------|--------|
| Scope | `com.snc.service_mapping` (ITOM scope) |
| Key tables | `cmdb_ci_service_discovered`, `cmdb_rel_ci`, `cmdb_ci`, `cmdb_ci_appl`, `cmdb_ci_server` |
| Roles | `itil`, `admin`, `sm_admin` (Service Mapping admin) |

### Re-usable Metadata Inventory

| Re-usable piece | What it is | Where it lives (breadcrumb) |
|-----------------|------------|------------------------------|
| **Application Service** | The business service record you map (e.g. "Online Banking") | All > Service Mapping > Application Services > All |
| **Service Mapping Patterns** | Preconfigured identification and connection patterns for IIS, Tomcat, SQL Server, etc. | All > Discovery > Discovery Definition > Patterns |
| **MID Server** | The agent that executes Discovery probes inside your network | All > MID Server > MID Servers |
| **Discovery Schedule** | Recurring or triggered scans that keep the map current | All > Discovery > Discovery Schedules |
| **Identification & Reconciliation Rules** | Prevents duplicate CIs when the same host is rediscovered | All > Configuration > Identification/Reconciliation |
| **Dynamic CI Groups** | Query-defined CI collections used by service maps for impact analysis | All > Configuration > Dynamic CI Groups |

### Re-usable Code Snippets

#### Script Include: Service Mapping Helper

```javascript
var ServiceMappingHelper = Class.create();
ServiceMappingHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getMappedCIs: function() {
        var serviceSysId = this.getParameter('sys_id');
        var gr = new GlideRecord('cmdb_rel_ci');
        gr.addQuery('parent', serviceSysId);
        gr.query();
        var cis = [];
        while (gr.next()) {
            cis.push(gr.getValue('child'));
        }
        return JSON.stringify(cis);
    },
    type: 'ServiceMappingHelper'
});
```

#### Business Rule: Log Map Changes

```javascript
(function rule(current, previous) {
    if (current.operation() == 'update' && current.state) {
        gs.log('Service Mapping application service changed: ' + current.name +
               ' state=' + current.getValue('state'));
    }
})(current, previous);
```

---

## Out-of-Box Features

| Feature | Description | Where |
|---------|-------------|-------|
| Pattern-based top-down discovery | Starts at an entry point URL/IP and follows application dependencies | All > Service Mapping > Application Services |
| Traffic-based discovery | Uses network traffic and connections to identify dependencies patterns may miss | All > Service Mapping > Administration |
| Tag-based mapping | Groups CIs using cloud or infrastructure tags | All > Service Mapping > Application Services |
| Predictive Intelligence | Suggests service relationships from fingerprints and traffic data | All > Service Mapping > Administration |
| Manual mapping | Administrator selects CIs and defines service membership | All > Service Mapping > Maps |
| Dynamic CI Groups | CMDB query-based groups that auto-update membership | All > Configuration > Dynamic CI Groups |
| Service map visualization | Graphical dependency map of CIs and relationships | All > Service Mapping > Service Maps |

---

## Out-of-Box Values & Dropdowns

ServiceNow ships with predefined discovery methods and service states. Verify against your instance.

### Discovery Method (cmdb_ci_service_discovered.discovery_method)
| Method | Description |
|--------|-------------|
| `Top-down` | Starts at entry point, follows application dependencies (preferred for accurate app-level mapping) |
| `Traffic-based` | Uses network traffic and connections to find dependencies patterns may miss |
| `Tag-based` | Groups CIs using cloud/infrastructure tags |
| `Predictive Intelligence` | Uses ML to suggest service relationships |
| `Manual mapping` | Administrator selects CIs and defines membership |
| `Dynamic CI Groups` | CMDB query-based groups that auto-update membership |

### Application Service State (cmdb_ci_service_discovered.state)
| State | When to Use |
|-------|-------------|
| `Draft` | Service being configured, not yet published |
| `Published` | Service map is active and being used |
| `Retired` | Service is decommissioned |

### Relationship Type (cmdb_rel_ci.type)
| Relationship Type | Meaning |
|-------------------|---------|
| `Runs on::Runs` | Application runs on a server/host |
| `Depends on::Used by` | One CI depends on/consumes another |
| `Connects to::Connected to` | Network connection between CIs |

**Exam focus (CIS-SM Domain 1, 30%):** Discovery methods, pattern design, identification and connection sections.

---

## Goals, Benefits & Key Metrics

| Business Goal | Benefit | Key Metric (KPI) | Example Value | Where to measure |
|---------------|---------|------------------|---------------|------------------|
| Map every critical business service | Impact analysis knows exactly what breaks when a CI fails | Service map coverage — % of Tier-1 services with a published map | ≥90% | `cmdb_ci_service_discovered.state = Published` |
| Find blast radius in minutes | NOC can tell affected customers before they call | Mean time to identify blast radius | <5 minutes per incident | Walk `cmdb_rel_ci` from failing CI up to the service |
| Keep maps current as infrastructure changes | Stale maps stop causing wrong incident assignments | Map freshness — % of services re-discovered in 30 days | ≥95% | Recurring Discovery schedules update `cmdb_rel_ci` |
| Prevent duplicate CIs in maps | Accurate counts and correct relationships | Duplicate CI rate in service maps | <2% | IRE identification rules per CI class |
| Map without creating CIs by hand | Scales to thousands of CIs across the estate | Automated vs manual mapping ratio | ≥80% automated | Patterns / traffic-based vs manual `cmdb_rel_ci` rows |
| Route incidents to the right team | Faster resolution, fewer escalations | Incidents correctly mapped to a service | ≥90% | Alert → CI → service relationship chain |
| Reduce customer-facing outage duration | Quicker fixes protect SLAs | MTTR for service-impacting incidents | <2 hours | Incident open → service restored |

> Indicative starting KPIs — baseline your instance, then set targets.

---

## Core Concept Diagrams

### Top-Down Service Mapping Flow

```mermaid
flowchart TD
    Entry["Entry Point<br/>URL / hostname / IP<br/>e.g. online.mybank.com"]
    Service["Application Service<br/>cmdb_ci_service_discovered<br/>state = Published"]
    MID["MID Server<br/>discovers the host behind the entry point"]
    Pattern["Pattern-Based Discovery<br/>identifies IIS, Tomcat, SQL Server..."]
    Dep["Follow Outbound Dependencies<br/>10.10.2.30:8080 -> 10.10.3.40:1433"]
    Rel["cmdb_rel_ci Relationships<br/>Runs on · Depends on · Connects to"]
    Map["Service Map<br/>graphical dependency view"]

    Entry --> Service
    Service --> MID
    MID --> Pattern
    Pattern --> Dep
    Dep --> Rel
    Rel --> Map

    style Entry fill:#e58a8a,color:#fff
    style Service fill:#4cc38a,color:#000
    style Pattern fill:#e5b567,color:#000
    style Rel fill:#0a0d10,stroke:#e5b567
    style Map fill:#10141a

    note right of Service: Discovery method: top-down / traffic-based / tag-based / manual
    note right of Rel: Relationship types: Runs on::Runs, Depends on::Used by, Connects to::Connected to
```

### CI Relationship Hierarchy in a Service Map

```mermaid
graph TD
    svc[Online Banking Service<br/>cmdb_ci_service_discovered]
    f5[F5 Load Balancer]
    web["WEB01 - IIS<br/>cmdb_ci_appl"]
    webhost[WEB01 Host<br/>cmdb_ci_server]
    app["APP01 - Tomcat<br/>cmdb_ci_appl"]
    apphost[APP01 Host<br/>cmdb_ci_server]
    db["DB01 - SQL Server<br/>cmdb_ci_appl"]
    dbhost[DB01 Host<br/>cmdb_ci_server]

    svc --> f5
    f5 --> web
    web --> webhost
    web --> app
    app --> apphost
    app --> db
    db --> dbhost

    style svc fill:#4cc38a,color:#000
    style f5 fill:#e5b567,color:#000
    style web fill:#10141a
    style app fill:#10141a
    style db fill:#10141a

    linkStyle default stroke:#4cc38a,stroke-width:2px
```

### Horizontal Discovery vs Service Mapping

```mermaid
flowchart LR
    subgraph HD["Horizontal Discovery - 'What exists on the network?'"]
        H1["Scan IP ranges"] --> H2["Discover CIs"]
        H2 --> H3["cmdb_ci · cmdb_ci_server · cmdb_ci_appl"]
        H3 --> H4["Standalone CIs"]
    end

    subgraph SM["Top-Down Service Mapping - 'Which CIs support this service?'"]
        S1["Application service + entry point"] --> S2["Pattern / traffic discovery"]
        S2 --> S3["CI-to-CI relationships"]
        S3 --> S4["cmdb_ci_service_discovered + cmdb_rel_ci"]
    end

    H4 -.->|feeds discovered CIs| S3

    style HD fill:#10141a,stroke:#e58a8a
    style SM fill:#10141a,stroke:#4cc38a

    note right of HD: Runs on a schedule, independent of any service
    note right of SM: Starts from a business service and walks dependencies
```

---

## Key Table Hierarchy

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `cmdb_ci_service_discovered` | Mapped application service records (the service itself) | `name`, `entry_point`, `discovery_method`, `state` |
| `cmdb_ci_appl` | Application CIs discovered by patterns | `name`, `version`, `install_status` |
| `cmdb_ci_server` | Server / host CIs | `name`, `ip_address`, `os`, `hostname` |
| `cmdb_ci` | Base CI table — every discovered item starts here | `name`, `serial_number`, `asset_tag`, `location` |
| `cmdb_rel_ci` | Relationships between CIs (Runs on, Depends on, etc.) | `parent`, `child`, `type` |
| `cmdb_ci_service` | Logical business service layer | `name`, `description`, `owned_by` |

### Table Relationships

```
cmdb_ci_service_discovered  (Application Service: Online Banking)
        │
        ├──► cmdb_rel_ci ──► cmdb_ci_appl   (IIS, Tomcat, SQL Server)
        │                   (relationship type: "Runs on::Runs" / "Depends on::Used by")
        │
        ├──► cmdb_rel_ci ──► cmdb_ci_server (WEB01, APP01, DB01)
        │
        └──► cmdb_ci_service        (Logical business service view)
```

**The critical distinction for interviews:**

* **Horizontal Discovery** = What devices and applications exist on the network? (Fills `cmdb_ci`, `cmdb_ci_server`, etc.)
* **Top-down Service Mapping** = Which of those components support this particular application service, and how are they connected? (Fills `cmdb_ci_service_discovered` + `cmdb_rel_ci`)

---

## Integrations

| Integration | Direction | Purpose | Protocol |
|-------------|-----------|---------|----------|
| Discovery (MID Server) | Inbound | Auto-discover servers, network devices, applications | Discovery / MID Server / ECC Queue |
| CMDB | Bidirectional | Store discovered CIs and relationships | Internal |
| Service Graph Connectors | Inbound | Import CI data from external CMDBs / cloud providers | REST / API |
| Event Management | Inbound | Create incidents when mapped CIs breach thresholds | EM |
| Flow Designer | Outbound | Trigger remediation workflows on map changes | Flow Designer |
| Orchestration | Outbound | Run MID Server commands, SSH, PowerShell on discovered hosts | Orchestration |

---

## Key Fields

| Table | Field | Type | Why It Matters |
|-------|-------|------|----------------|
| `cmdb_ci_service_discovered` | `name` | String | The application service name (e.g. "Online Banking") |
| `cmdb_ci_service_discovered` | `entry_point` | String | URL, hostname, or IP where discovery starts |
| `cmdb_ci_service_discovered` | `discovery_method` | Choice | Top-down, traffic-based, tag-based, manual, dynamic CI group |
| `cmdb_ci_service_discovered` | `state` | Choice | Draft, Published, Retired |
| `cmdb_rel_ci` | `parent` | Reference | The upstream CI or service |
| `cmdb_rel_ci` | `child` | Reference | The downstream CI it depends on |
| `cmdb_rel_ci` | `type` | Choice | Relationship type (Runs on::Runs, Depends on::Used by, etc.) |
| `cmdb_ci_appl` | `name` | String | Discovered application name (IIS, Tomcat, etc.) |
| `cmdb_ci_server` | `ip_address` | String | Management IP of the discovered host |

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| No entry point defined | Map stays empty — nothing to start from | Always set a URL, hostname, or IP |
| Credentials not configured | MID Server can't authenticate to hosts | Set Discovery credentials per OS/application |
| MID Server can't reach network segment | Discovery returns no CIs | Place a MID Server in each network zone |
| Treating Service Mapping as a one-time task | Map goes stale after infrastructure changes | Schedule recurring Discovery; enable re-discovery on change |
| Creating every CI manually | Defeats the purpose; doesn't scale | Use patterns first; manual only for exceptions |
| Ignoring identification/reconciliation | Duplicate CIs for the same host | Tune IRE rules before large discovery runs |

---

## Deep Dive: Service Mapping — Automated or Manual?

### The short answer

Service Mapping is **primarily automated**, but it is **not necessarily fully automated from beginning to end**.

You do **not** normally create every CI and relationship manually, one table or one record at a time. ServiceNow uses Discovery, Service Mapping patterns, traffic analysis, and infrastructure relationships to identify application components and build a map of how a business service works.

However, an administrator or Service Mapping specialist **does** need to configure the service, credentials, entry points, patterns, identification rules, and troubleshoot missing relationships.

### 1. First, understand what Service Mapping is building

Imagine a company has an online banking application.

A user accesses:

`https://online.mybank.com`

Behind that URL, the application might depend on:

* A web server (IIS).
* An application server (Java/Tomcat).
* A database (SQL Server).
* A load balancer.
* Network devices.
* Storage and other infrastructure.

Service Mapping discovers these dependencies and creates a relationship map in the CMDB.

![ServiceNow Service Mapping: A Step-by-Step Guide](https://images.openai.com/static-rsc-4/L9z93Ky6gk0qo-2b_nN0Nn75rK5fqTMzqRdc-EkQf5ANKKMI-y2LQb2Zh43N7efOKbInd1FKHD-fQfqdbsTaJIKhdNgDVHpjmqtxZNcamQa_3M61irHbN8TyHIGulLLYS_zvX72AX3gNUiKbgO2WT7QdGE2YeUaXCU-PKYB6VMF0Svhj9JAUeVouDYZH81Ot?purpose=fullsize)

**The important distinction:**

* **Discovery:** Finds infrastructure and creates/updates CIs.
* **Service Mapping:** Identifies which CIs support a particular application service and establishes their relationships.
* **CMDB:** Stores the CIs and relationships.

### 2. How the automation actually works

The main method is called **pattern-based top-down discovery**. Here is the sequence:

1. **Administrator defines the application service**  
   Example: Online Banking. Provides an entry point such as `https://online.mybank.com`.

2. **Service Mapping identifies the host**  
   It extracts the hostname/IP and uses horizontal Discovery to identify the server hosting the application.

3. **MID Server executes Discovery**  
   The MID Server receives requests through the ECC Queue and executes the necessary probes and patterns.

4. **Patterns identify the application**  
   For example, the pattern recognizes IIS, its processes, application configuration and connections.

5. **Patterns identify outbound dependencies**  
   The pattern detects connections from IIS to other application servers, databases, and infrastructure.

6. **Discovery continues recursively**  
   Service Mapping investigates the connected components and their dependencies until it reaches the end of the service or a configured boundary.

7. **CMDB and service map are updated**  
   Discovered CIs and their relationships are recorded, and the application service map is generated.

Based on ServiceNow's documented pattern-based discovery process.

**The key thing to understand:** the pattern does the investigative work. You aren't manually telling ServiceNow to create an IIS CI, then a Tomcat CI, then a SQL Server CI.

ServiceNow has preconfigured patterns for commonly used technologies. You can also customize or create patterns when the out-of-box patterns don't cover your environment.

### 3. Full practical example: Online Banking

Let's assume the bank has the following architecture:

![금융IT 인프라를 이루는 기술#2 | 금융ICT 인프라 이야기](https://images.openai.com/static-rsc-4/DClJJshcVw4rfRW5ESyCSXKIMSfLWf1Qjy95wJ5ihGNutV6mJIJtjiuKAPqrN4uhxVwAi6-V5cJeyGF4Eezf2YKwiV-pxMOTpQ_oZ5hNI8gtGe__kazgdAJ8pdHQAUivSct0RBXNP6dNjEdtdwWI98p2y79yHBlPOk_AU-GKtjSp2DBikx4vrJGqKnmL27k_?purpose=fullsize)

| Component | Example |
|-----------|---------|
| Entry point | online.mybank.com |
| Load balancer | F5 |
| Web tier | IIS Server 01 |
| Application tier | Tomcat Server 01 |
| Database tier | SQL Server 01 |
| Supporting infrastructure | Network and storage |

#### Step 1 – Create the application service

An administrator navigates to Service Mapping and creates an application service.

They enter:

* **Name:** Online Banking
* **Service owner:** Banking Application Team
* **Discovery method:** Top-down
* **Entry point:** `online.mybank.com`

The administrator is essentially telling ServiceNow: *"Start investigating from this application entry point and discover everything supporting it."*

ServiceNow creates a mapped application service record.

#### Step 2 – Discover the web server

Service Mapping resolves the entry point to its hosting infrastructure.

The MID Server performs the required discovery activities.

Suppose the IP resolves to:

`10.10.1.20`

Discovery identifies:

* Windows Server.
* Hostname: WEB01.
* Operating system and hardware information.
* Installed and running software.

If WEB01 already exists in the CMDB, ServiceNow can identify and reuse the existing CI instead of creating a duplicate. If it doesn't exist, Discovery can create it.

#### Step 3 – Identify IIS

Now Service Mapping investigates what is running on WEB01.

It uses an appropriate pattern to identify IIS.

It might discover:

* IIS installation.
* IIS services.
* Application pools.
* Websites.
* Listening ports.
* Processes.
* Outbound connections.

ServiceNow identifies the relevant application CI and its connections.

#### Step 4 – Discover the application server

Suppose IIS communicates with:

`10.10.2.30:8080`

The pattern identifies the outbound connection.

Service Mapping investigates the destination and identifies:

* Host: APP01.
* Operating system: Linux.
* Application: Apache Tomcat.
* Listening port: 8080.

It then identifies the application CI and its relationship to the web tier.

#### Step 5 – Discover the database

Tomcat communicates with:

`10.10.3.40:1433`

Service Mapping investigates this connection.

It discovers:

* Host: DB01.
* Database platform: Microsoft SQL Server.
* SQL Server instance.
* Relevant database dependencies.

It adds the database to the application service map.

#### Step 6 – Generate the final map

![Pragmatic Patterns — Hybrid Business Service Manag... - ServiceNow Community](https://images.openai.com/static-rsc-4/S_tivZE2U7TUXgxeGXnckKteaQUQuchyDMnmdFmqyCbKIlQU96k0wt9cSeNyyf_bno2rlisBEdNWAQxfs1vU7_7jQWUXgyqYhjfMG-HLSR5FKBWhgJFbF_A1gpkujay0oUWEh2OJiWHTQsmg6AskFhkBWfftGgU6tXpQfinyiX-1HXjS6bOOO5V3nU4qV7MF?purpose=fullsize)

The resulting logical dependency map looks something like this:

```
Online Banking
└── Application service
    ├── F5 Load Balancer
    ├── WEB01 – IIS (Web application tier)
    ├── APP01 – Tomcat (Application tier)
    └── DB01 – SQL Server (Database tier)
```

Simplified example. Actual maps can contain many more CIs and relationships, including parallel dependencies.

Notice that the administrator didn't manually create five CI records and four relationships. Discovery and Service Mapping did the majority of that work.

### 4. Does ServiceNow always use patterns?

No. There are several approaches to service mapping.

| Method | How it works | Automation |
|--------|--------------|------------|
| Top-down / pattern-based | Starts at an entry point and follows application dependencies | High |
| Traffic-based | Uses network traffic and connections to identify dependencies | Medium-High |
| Tag-based | Groups CIs using cloud or infrastructure tags | Medium |
| Predictive Intelligence | Uses machine learning to suggest service relationships | Medium |
| Manual mapping | Administrator selects CIs and defines service membership | Low |
| Dynamic CI Groups | Uses CMDB queries and relationships to dynamically group CIs | High |

**Key distinctions:**

* **Top-down:** Usually the preferred method when you need accurate application-level dependencies.
* **Traffic-based:** Useful for finding connections that patterns might have missed. It can also introduce irrelevant dependencies.
* **Tag-based:** Particularly useful for cloud environments where resource tags are maintained consistently.
* **Predictive Intelligence:** Can suggest relationships based on fingerprints and traffic information, but suggestions may need review.
* **Manual:** Useful for static or difficult-to-discover services.

### 5. What if Service Mapping doesn't recognize an application?

This is where manual configuration and development become important.

For example, suppose the bank has an internally developed application called `BankingTransactionEngine`. ServiceNow doesn't recognize it using an existing pattern.

You have a few options:

* Create or customize a Service Mapping pattern to identify the application.
* Configure credentials and permissions so the MID Server can interrogate it.
* Configure how the pattern identifies the application and discovers its outbound connections.
* Use traffic-based discovery to help identify dependencies.
* Manually add or correct missing relationships if necessary.

You don't necessarily need to create a new CI class. You can often use an existing application CI class.

### 6. Where does all this information get stored?

This is important for a ServiceNow developer or CMDB interview.

| Table | Purpose |
|-------|---------|
| `cmdb_ci` | Base CI table |
| `cmdb_ci_server` | Server CIs |
| `cmdb_ci_appl` | Application CIs |
| `cmdb_rel_ci` | Relationships between CIs |
| `cmdb_ci_service_discovered` | Mapped application services |

The relationships are particularly important. For example:

* IIS runs on WEB01.
* Tomcat runs on APP01.
* SQL Server runs on DB01.
* WEB01 communicates with APP01.
* APP01 communicates with DB01.

These relationships are represented in the CMDB, including through `cmdb_rel_ci`, using relationship types such as `Runs on::Runs` and `Depends on::Used by`, depending on the relationship being modeled.

The service map provides the service-specific view of those dependencies.

### 7. What happens when infrastructure changes?

This is one of the biggest benefits.

Suppose the bank adds another application server:

`APP02 – Tomcat`

Or moves the database to a different server.

Service Mapping can periodically rediscover the application and update its map based on the new infrastructure and connections.

You don't need to manually redraw the entire service map every time infrastructure changes.

However, this depends on Discovery being configured properly, credentials working, patterns supporting the technology, and scheduled or triggered discovery running successfully.

### 8. Interview-ready answer

If an interviewer asks you whether Service Mapping is automated or manually configured, I would answer:

> "ServiceNow Service Mapping is primarily automated through pattern-based top-down discovery.  
> We initially configure the application service and define an entry point, typically a URL, hostname or IP address and port.  
> Service Mapping then uses Discovery and the MID Server to identify the hosting infrastructure. It executes predefined patterns to identify applications, processes and outbound connections, recursively discovering their dependencies.  
> The discovered configuration items and relationships are stored in the CMDB, and ServiceNow generates the application service map.  
> We don't normally create each CI and relationship manually. However, we do need initial configuration, credentials, appropriate permissions and potentially custom patterns for unsupported applications. We can also supplement automated mapping with traffic-based, tag-based or manual mapping.  
> The resulting map can be maintained through subsequent discovery, allowing us to understand the impact of infrastructure changes and incidents on business-critical services."

### 9. Discovery types at a glance

| Discovery type | Question it answers | Typical output |
|----------------|---------------------|----------------|
| **Horizontal Discovery** | What devices and applications exist on the network? | CIs in `cmdb_ci`, `cmdb_ci_server`, `cmdb_ci_appl` |
| **Top-down Service Mapping** | Which components support this application service, and how are they connected? | `cmdb_ci_service_discovered` + `cmdb_rel_ci` relationships |

**My recommendation:** Make sure you understand the difference between horizontal Discovery and top-down Service Mapping. This is a very common technical interview distinction.

Official documentation:

* [Pattern-based discovery](https://www.servicenow.com/docs/r/it-operations-management/service-mapping/pattern-based-discovery.html?utm_source=chatgpt.com)
* [Choosing a Service Mapping method](https://www.servicenow.com/docs/r/it-operations-management/service-mapping/choose-mapping-method.html?utm_source=chatgpt.com)

---

## Lab: Create Your First Mapped Application Service

**Instance requirement:** Service Mapping and Discovery must be installed. You'll need a MID Server with network access to a test target.

1. **Navigate** to All > Service Mapping > Application Services > All
2. **Click New** and fill:
   - Name: Online Banking Demo
   - Discovery method: Top-down
   - Entry point: A URL or IP you control (e.g. an internal web server)
   - Service owner: Select a user or group
3. **Submit** and note the application service sys_id
4. **Navigate** to All > Discovery > Discovery Schedules
5. **Create or run** a discovery schedule targeting the entry point's host
6. **Wait** for the MID Server to complete the scan
7. **Return** to the application service record → open the related **Service Map**
8. **Verify** discovered CIs appear (web server, app server, database) and relationships are drawn
9. **Inspect** `cmdb_rel_ci` to confirm relationship rows (e.g. "IIS Runs on WEB01")

---

## SLAs, Dashboards & Workspaces

### SLA Support

Service Mapping does not own its own SLA definitions — it generates `cmdb_ci_service_discovered` records and `cmdb_rel_ci` relationships, and SLAs are attached to the *tasks and incidents that consume the service map* (incidents, service requests, work orders) via `task_sla`. The SLA records that matter for Service Mapping are the ones triggered when a mapped CI fails, a service map goes stale, or impact analysis cannot trace a dependency.

| SLA Area | What It Tracks | Typical Target |
|----------|---------------|----------------|
| Service map coverage | % of Tier-1 services with a Published map | ≥ 90% of critical services mapped |
| Map freshness | Time since a service was last re-discovered | Re-discover within 30 days |
| Blast radius identification | Time from incident creation to full impact trace | < 5 minutes per incident |
| Incident-to-service routing | Time from CI failure to correctly assigned service owner | < 15 minutes |

**MTTD (Mean Time to Detect)** — measured from a CI failure (e.g. a server down) until the affected service is identified through the map. Typical target: under 5 minutes.

**MTTR (Mean Time to Resolve)** — measured from incident creation until the service is restored. Typical target: under 2 hours for service-impacting incidents.

Use `task_sla` to:
- Attach SLA definitions to incidents raised against mapped CIs (`cmdb_ci_service_discovered` → `cmdb_rel_ci` chain)
- Track breach risk with `stage`, `has_breached`, and `business_duration` fields
- Escalate tasks when an SLA stage approaches its threshold — e.g. a service-impacting P1 incident nearing breach

> **Note:** SLA definitions are created centrally (All > Service Level Management > SLA Definitions) and attached to the incident/task types that Service Mapping operations generate. The Service Mapping guide's [Goals, Benefits & Key Metrics](#goals-benefits--key-metrics) section lists the underlying KPIs (map coverage ≥ 90%, blast radius < 5 minutes, map freshness ≥ 95%) that these SLAs are built to protect.

### Out-of-Box Dashboards

| Dashboard | Purpose | Where to Find It |
|-----------|---------|------------------|
| Service Mapping Dashboard | Mapped service count, discovery method breakdown, map freshness, services without maps | All > Service Mapping > Service Maps > All (list view) |
| CMDB Health Dashboard | CMDB completeness, correctness, and compliance — including duplicate CI rate in service maps | All > CMDB Health > Dashboards |
| Service Impact / Operations Dashboard | CI health, service availability, incidents by service | All > IT Operations Management > Dashboards |

**Key metrics surfaced OOTB:** Service map coverage, map freshness, duplicate CI rate in maps, automated vs manual mapping ratio, incidents correctly mapped to a service, blast radius identification time.

### Out-of-Box Workspaces

| Workspace | Purpose | Path |
|-----------|---------|------|
| Service Mapping Workspace | Central entry point for application services, service maps, map administration, and discovery configuration | All > Service Mapping > Service Mapping Workspace |

**Workflow tip:** Start in the Service Mapping Workspace to define application services and generate maps, then switch to the CMDB Health Dashboard to verify map accuracy — and to the IT Operations Management Workspace (see the ITOM guide) when correlating map changes with event management and incident response.

---

## Quiz

1. Is Service Mapping primarily automated or manual?
   <details><summary>Answer</summary>Primarily automated through pattern-based top-down discovery, but requires initial configuration (entry point, credentials, patterns) and manual override for unsupported applications.</details>

2. What is the difference between horizontal Discovery and top-down Service Mapping?  
   <details><summary>Answer</summary>Horizontal Discovery finds what devices and applications exist (creates CIs). Top-down Service Mapping identifies which of those CIs support a specific business service and how they connect (creates relationships).</details>

3. What table stores mapped application services?  
   <details><summary>Answer</summary>`cmdb_ci_service_discovered`</details>

4. What table stores CI-to-CI relationships?  
   <details><summary>Answer</summary>`cmdb_rel_ci`</details>

5. Name three Service Mapping methods other than top-down pattern-based.  
   <details><summary>Answer</summary>Traffic-based, tag-based, manual mapping, dynamic CI groups, Predictive Intelligence.</details>

6. What role does the MID Server play in Service Mapping?  
   <details><summary>Answer</summary>It executes Discovery probes and patterns inside the network, receiving requests through the ECC Queue.</details>

---


---

## Related Guides

- [Discovery guide](./discovery-guide.md)
- [CMDB guide](./cmdb-guide.md)
- [ITOM guide](./itom-guide.md)
- [ITSM guide](./itsm-guide.md)
- [Service Mapping getting-started](./../../getting-started/servicemapping.md)

---

## Official Learning Resources

To avoid unofficial or outdated content, always use these validated official ServiceNow sources:

### 📺 Verified Videos & Playlists

### 🚀 Quick Start Guide

For those new to the module, we recommend starting with this official overview:

<div style="text-align: center; margin: 1.5rem 0;">
  <iframe width="560" height="315" src="" title="ServiceNow Service Mapping Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

Fallback link: [ServiceNow Service Mapping](https://www.servicenow.com/products/it-operations-management/service-mapping.html)

- [Ask a Ranger: Service Mapping](https://www.youtube.com/results?search_query=servicenow+service+mapping+ask+a+ranger)
- [ServiceNow ITOM Demos](https://www.youtube.com/results?search_query=servicenow+itom+discovery+service+mapping)

### 🚀 The Authoritative Path

1. **Now Learning (Structured Training)**
   - The only official source for certification paths and structured video courses.
   - [Go to Now Learning Portal](https://nowlearning.com/) → Search for "Service Mapping"

2. **Product Documentation (Technical Reference)**
   - The definitive source for every table, field, and OOB behavior.
   - [ServiceNow Product Documentation](https://docs.servicenow.com/) → Search for "Service Mapping"

---
