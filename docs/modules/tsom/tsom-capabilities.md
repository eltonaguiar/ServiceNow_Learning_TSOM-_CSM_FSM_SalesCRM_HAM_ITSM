# TSOM Capabilities — Assurance, AIOps, AI, and Inventory

**Date:** 2026-11-06
**Companion to:** [TSOM guide](tsom-guide.md)
**Confidence:** verified against ServiceNow product documentation (Nov 2026); anything marked *verify* should be checked on your own instance.

---

## Why this page exists

The [TSOM guide](tsom-guide.md) covers what TSOM *is*, how to install it, and the data model. It did
not cover the **capability list** — the named pieces an accreditation or implementation exam actually
asks about: which component ingests alarms, which one groups them, which one watches metrics vs logs,
where Synthetic Monitoring sits, and which doc breadcrumb each lives under.

This page is that map. Every section answers one question: *what is this capability for, and where does
it live?*

---

## 1. Breadcrumb map — where each capability actually lives

The single most common trip-up: **TSOM is not one doc tree.** Most of its assurance capabilities are
ITOM features that TSOM *consumes*. Synthetic Monitoring, for example, is documented under
**IT Operations Management**, not under Telecom Service Operations.

| Capability | Product doc cluster / breadcrumb | Notes |
|---|---|---|
| TSOM overview, assurance, discrepancy, TMF APIs | **Telecom Service Operations Management** (`/docs/r/telecom-service-ops/…`) | The TSOM-specific tree: Explore, Telecom Assurance, Fault Management, Telecom Discrepancy ID&R |
| **Synthetic Monitoring** | **IT Operations Management → Synthetic monitoring** (`/docs/r/it-operations-management/exploring-synthetic-monitoring.html`) | *Not* under Telecom. Install `com.snc.uib.sow_synthetics`; TSOM lists it as a related topic under Telecom Assurance |
| Metric Intelligence | **IT Operations Management → Metric Intelligence** (`/docs/r/it-operations-management/metric-intelligence/…`) | Statistical anomaly detection over CI metrics; referenced from TSOM as a capability |
| Health Log Analytics | **IT Operations Management → Health Log Analytics** | Log triage/root cause; separate app from Metric Intelligence |
| Event Management / alert grouping | **IT Operations Management → Event Management** | Grouping types, correlation rules, alert suppression live here |
| AIOps LEAP | **IT Operations Management → AIOps LEAP** (Learning Enhanced Automation Platform) | Incident clustering + automation/playbook generation |
| Now Assist for ITOM | **Now Assist for IT Operations Management** | Alert Investigation / Alert Analysis skills |
| Telecom Discovery Patterns | **ITOM Discovery → Discovery patterns** (`sn_tsom_patterns` scope) | SNMP + CLI collection from network elements |
| Service Graph Connectors (Nokia Altiplano, NSP, Meraki…) | **Service Graph Connectors → \<connector\> → Setup** | Guided setup: MID, credentials, data source, schedule, filters |
| TNI entities, Network Inventory Workspace | **Telecommunications Network Inventory** (separate app, `sn_ni_adv`) | Separate entitlement from TSOM |

**Interview-safe phrasing:** *"TSOM sits on top of ITOM. The telecom layer is the data model, the
discovery patterns and the TM Forum APIs; the assurance engine underneath is Event Management, Metric
Intelligence, Health Log Analytics and Service Impact Analysis — each documented in its own ITOM tree."*

---

## 2. Event ingestion — how alarms get in

Two directions, and both exist in TSOM. Confusing them is a classic exam trap.

| Mechanism | Direction | What it does |
|---|---|---|
| **TMF 642 Alarm Management Open API** (`sn_ind_tmf642`) | Inbound + outbound | RESTful CRUD contract for alarms: external OSS creates/updates/clears alarm records in a standard schema |
| **TMF 688 Event Management API notifications** | Inbound | Subscription-based: the external system registers a **callback URL**, and each pushed notification triggers an **event-creation flow** in ServiceNow |
| **REST Poll / Push** | Inbound | Generic pull on a schedule or push to an endpoint; per-payload, not a stream |
| **Kafka Stream Connect** | **Bidirectional** | The streaming option: consumes external Kafka topics into ServiceNow *and* publishes event data back to the platform — this is the only one of the four that satisfies "receive continuously **and** send back" |

**Rule of thumb:** *CRUD on alarms → TMF 642. Callback notifications → TMF 688. Sustained
bidirectional streaming → Kafka Stream Connect.*

TSOM documentation calls the whole inbound side **External event management via Telecommunications API
notifications**, and it is TM Forum-aligned (TMF 642 for alarms, TMF 688 for events).

---

## 3. Alert management — grouping, correlation, and noise

### 3.1 Why it exists

A regional fibre cut produces thousands of downstream alarms: every circuit, peer and device behind the
cut screams at once. Untriaged, that is **alert fatigue** — operators start dismissing alerts wholesale
and miss the one that mattered. TSOM's answer is AIOps-driven alert management: correlation finds the
common root, grouping folds dependents into a parent, and the NOC gets a workable set instead of a wall.
ServiceNow's published figure for the reduction is *up to ~98–99% event noise reduction*.

### 3.2 Grouping vs correlation — the distinction that gets tested

| | **Grouping** | **Correlation** |
|---|---|---|
| Question it answers | *Which of these alerts are the same problem?* | *What does this problem break, and for whom?* |
| What it does | Combines related child alerts into one **parent alert** — one actionable item | Maps grouped alerts to **services, customers, accounts** via the CMDB/service model |
| Output | Volume reduction | Business impact / prioritisation |

They are complementary: grouping shrinks the queue, correlation makes the surviving items *rankable*.

### 3.3 The five grouping types (Event Management)

| Type | Icon | Formed by |
|---|---|---|
| Rule-based | R | Alert **correlation rules** — business rule on `em_alert` at create/update |
| Automated / aggregated | A | ML + alert aggregation: alerts sharing CI type **and metric name**, virtual primary alert; scheduled job |
| CMDB-based | C | CI relationships in the CMDB; catches what rules and automation missed; scheduled job |
| Text-based | T | Similar frequently-used words in Description / Metric Name / CI Class; scheduled job |
| Tag cluster | Tag | User-defined tag clustering definitions; scheduled job |

### 3.4 Where temporal analysis fits

Grouping has several *dimensions*: **temporal** (did these fire close together in a rolling window?),
**topological** (Discovery/Service Map data — are they on related CIs?), **CMDB relationship** (shared
ancestor/dependency?), and **content** (ML/NLP tagging of the alert text).

Temporal analysis is the time dimension — flapping and bursty alerts inside a rolling window are
recognised as one pattern, and repeated time-of-day patterns expose chronic issues as a single problem
instead of daily noise.

**Caveat:** the temporal window is evaluated continuously in the product; if a question phrases it as a
nightly offline batch over a 30-day window, that is the wrong answer — the batch/scheduled framing
belongs to the CMDB-based, automated and text grouping jobs, not to temporal pattern analysis.

---

## 4. Metric Intelligence

**Purpose:** monitor performance trends, detect **threshold breaches and anomalies** in metrics, and
surface issues before customers notice.

How it differs from a threshold tool:

| | Traditional threshold tool | Metric Intelligence |
|---|---|---|
| Who defines "abnormal" | A human writes a static rule ("CPU > 90% for 5 min") | It **learns each metric's normal shape**, including seasonality |
| What fires | The configured condition | **Deviation from the learned baseline**, with an anomaly score (0–10 — higher means greater risk of service disruption) |
| Blind spot | Slow drift, and false positives on legitimately spiky series | None of the above; catches subtle drift below any hard threshold |

Tooling: statistical models project expected values with control bounds; **Insights Explorer** shows
metric statistics and charts, and the **Anomaly Map** plots correlated anomaly scores across CIs on a
timeline. Anomalies can be promoted to regular IT alerts and appear in Service Operations Workspace and
service-health dashboards.

It is *not* the log analyser, and it *is* the source of **metric alerts**.

---

## 5. Health Log Analytics (HLA)

**Purpose:** analyse large volumes of telecom infrastructure **logs**, compare them against a
**baseline**, triage related issues, and identify the **underlying cause** of recurring service
degradation.

What happens on detection: HLA raises the anomaly and **forwards it as an event to Event Management**,
where it is correlated with alarms and metric anomalies for the same CI and service and becomes part of
the normal alert path. It does not open CMDB tasks, does not write into Metric Intelligence's queue, and
does not silently annotate CI records.

**Metric Intelligence vs HLA in one line:** metrics tell you *how much / how fast*; logs tell you *why*.

---

## 6. Service Impact Analysis and Service Observability

**Service Impact Analysis** walks the service model to answer: *which services, customers and accounts
does this broken thing hurt?* It is what makes a port failure a business decision.

**Service Observability** is the operator-facing view inside **Service Operations Workspace**, and it is
built from four capabilities:

| Capability | What it gives the operator |
|---|---|
| **Health signal centralization** | Metrics, logs and alerts from many sources in one pane — *what are the signals saying?* |
| **Related entity visibility** | The CIs, services and infrastructure components related to the record — *who is involved, and is this device the contributor?* |
| **Service goal tracking** | SLO / health-goal status per service — the scoreboard |
| **Observability vendor integration** | The plumbing that pulls third-party observability data in |

When an operator is asked to determine *whether a network device, service or infrastructure component is
contributing to an incident*, the capability being exercised is **related entity visibility**.

---

## 7. Synthetic Monitoring

**Breadcrumb: IT Operations Management → Synthetic monitoring** (plugin `com.snc.uib.sow_synthetics`).

It runs automated tests against HTTP endpoints **before subscribers complain**: it continually calls
endpoints registered in the CMDB (`cmdb_ci_endpoint_http` — the HTTP Endpoints table) and checks
availability, response time, status code, or the presence of a defined string in the body.

| Aspect | Detail |
|---|---|
| Test target | HTTP endpoint CIs (`cmdb_ci_endpoint_http`) — must exist in the CMDB |
| Pass/fail criteria | e.g. status 200 **and** response time < 500 ms |
| Where tests run | Agent Client Collector (ACC), a **MID Server**, or a ServiceNow-hosted location (public endpoints only) |
| On failure | **Alert sent through Event Management** (alert settings toggled per monitor, with a chosen severity), assigned to the monitor's support group |
| Extras | Create monitors from incidents (post-incident recommended action), API Insights-discovered API monitors, monitor history with full alert context |

Why the distractors fail: Metric Intelligence watches *real* metric streams; Service Observability is
where you *see* results; HLA reads logs. None of them execute a test transaction — only Synthetic
Monitoring does.

---

## 8. AIOps LEAP (Learning Enhanced Automation Platform)

**Purpose:** identify **automation opportunities** and generate **remediation playbooks** from evidence.

What it does with your history:

- clusters incidents by short description and assignment group (via the Group Action Framework), using
  historical work notes and resolution notes;
- treats those clusters as **automation opportunities**;
- **recommends automations** and generates **actionable playbooks** from the resolution workflows it saw;
- accumulates a knowledge base of documented resolution steps, and can create problem records for
  root-cause work.

So: LEAP is the *"what should we stop doing by hand?"* layer — not monitoring, not discovery, not
inventory reconciliation.

---

## 9. Now Assist for ITOM — the two alert skills

Both sound alike; they answer different questions.

| Skill | Question it answers | What the agent gets |
|---|---|---|
| **Alert Investigation** | *"What is this alert right now, and how bad is it?"* | A concise generative summary of the alert, its potential **service impact**, and next steps |
| **Alert Analysis** | *"How was this solved before?"* | Resolution insights drawn from **similar past alerts/incidents**, including who fixed it and how |

Given a fresh BGP peer-down on a core router: the agent judging **impact** uses Alert Investigation; the
agent looking for **how it was resolved last time on that router** uses Alert Analysis.

Now Assist *assists*; it does not autonomously manage alerts end-to-end, and AI-driven assignment rules
are routing configuration, not a Now Assist summarisation skill.

---

## 10. The AI-assisted proactive service workflow

TSOM's story is a four-stage loop, and the stages are easy to reorder by accident:

| Stage | What happens | Typical confusion |
|---|---|---|
| **Detect** | Gather alerts from multiple network domains via AIOps; eliminate up to ~98% of noise so only actionable alerts reach the operator | Confused with correlation |
| **Analyze** | Correlate related events, group them into actionable alerts, and identify **which customers are affected** | Confused with Communicate — impact *identification* is analysis, impact *notification* is communication |
| **Communicate** | Generate incidents from detected issues, correlate them to related cases, and **notify affected customers** about service disruptions | The stage people forget exists |
| **Act / Remediate** | Collaborate with support teams and use automation integrations to remediate using **predefined workflows** | If a question mentions "predefined workflow" or "playbook runs", it is this stage |

---

## 11. Inventory side — Discovery, connectors, TNI, discrepancy

### 11.1 Discovery phases for a new device

1. **Discovery** — Shazzam probes scan ports and find IP-addressable devices; new IPs land in the Devices
   table.
2. **Classification** — probes/patterns determine what the device is; a **CI class** is assigned.
   Classification assigns the class — it does not create the CI record.
3. **Identification & Reconciliation** — the **IRE** looks for a matching CI; finding none, it **inserts a
   new CI record**. This is the new-device step.
4. **Exploration** — patterns/probes collect configuration attributes and enrich the CI that now exists.

### 11.2 Telecom Discovery Patterns — protocols

Telecommunications Discovery Patterns collect **directly from network elements** using **SNMP and CLI**.
HTTP/FTP, JDBC/LDAP and REST/SOAP are application- and server-side transports, not device collection
protocols. Gated per MID Server by `mid.telecom.discovery.patterns.enabled`.

### 11.3 Service Graph Connector for Nokia Altiplano

The SGC calls the **Altiplano controller over REST API through a MID Server**, stages the payload, and the
**IRE** processes the staged data into TNI-model CIs. It does not SNMP-probe elements directly (that is
Discovery), does not use CLI sessions, and does not rely on NETCONF notifications (push telemetry is a
different path).

### 11.4 TNI class hierarchy — where `Card` sits

```
Equipment Holder   (containers: Rack, Shelf, Slot)
    └── Slot ──contains──► Card          ◄── the containment relationship
Equipment          (installed units: Card, Chassis, Device)
    └── Card ──hosts──► Port / Network Interface
```

**`Card`'s direct parent class is `Equipment`.** Slot is an Equipment Holder subclass — it *holds* the
card, it is not the card's parent class. Network Interface sits *below* the card on the logical side.

Mental model: **holders hold, equipment is held.**

### 11.5 Impact propagation gaps

Impact does not propagate by itself — it walks the relationship graph. If an alert on a card cannot reach
the network interface it hosts, there is no chain to the link, the circuit or the service. The fix is a
**relation rule that defines impact between hardware CIs and network interface CIs** (infrastructure
relation). Changing event rules re-routes alerts, grouping policies merge them, and dashboards merely
display the gap — none of those create the missing edge.

### 11.6 Configuration drift

**Cause: network changes occur without corresponding inventory updates.** Drift is the gap that opens
when reality moves and the record does not. Identification rules (B), reconciliation rules (C) and
approved reconciliation workflows (D) are the *prevention/correction* mechanisms — they are why the other
three options cannot be the cause.

### 11.7 Discrepancy audit and remediation

When a **CMDB Compliance certification audit** runs, every audit record that lands in a **failed** state
produces a **follow-on task** documenting the discrepancy type and the affected CIs. The audit reports;
it does not auto-fix, does not decommission CIs, and does not raise external monitoring alerts.

Choosing **manual vs automated remediation**:

| Situation | Approach |
|---|---|
| The correct value is obvious (casing, a stale attribute) | **Automated remediation workflow** |
| **The truth is in dispute** — e.g. a hierarchy mismatch between discovered and CMDB inventory where the correct parent/child must be determined before any update | **Manual remediation workflow** — a human decides, then the fix is applied and recorded |

---

## 12. Quick reference — capability behind each question

| Ask | Answer |
|---|---|
| Bidirectional continuous event streaming | Kafka Stream Connect |
| Alarm CRUD from an external OSS | TMF 642 Alarm Management API |
| Callback-driven event creation | TMF 688 notifications |
| 8,000 alarms → a feasible set | AIOps alert management (grouping + correlation) |
| Volume outpacing triage, operators numb | Alert fatigue |
| Threshold breaches + performance anomalies in metrics | Metric Intelligence |
| Learned baselines instead of static thresholds | Metric Intelligence |
| Logs vs baseline, recurring degradation root cause | Health Log Analytics |
| Log anomaly → alert path | Forwarded as an event to Event Management |
| Which device/service relates to this incident | Related entity visibility (Service Observability) |
| Alerts → impacted services/customers | Correlation (Service Impact Analysis) |
| Test HTTP endpoints before customers complain | Synthetic Monitoring (ITOM) |
| Automation opportunities + playbooks | AIOps LEAP |
| Explain this live alert and its impact | Now Assist **Alert Investigation** |
| How was this solved before | Now Assist **Alert Analysis** |
| Incidents + customer notification | **Communicate** stage |
| Predefined workflows remediate | Act / Remediate stage |
| New device CI created by | IRE in Identification & Reconciliation |
| Telecom patterns protocols | SNMP + CLI |
| Altiplano inventory import | SGC: REST via MID → staging → IRE |
| Parent class of Card | Equipment |
| Card alert doesn't reach the service | Missing infrastructure relation rule (hardware → network interface) |
| Drift cause | Changes without inventory updates |
| Inventory drift definition | Mismatch between network records and live network state |
| How the audit spots a difference | Compares field values for specific CI attributes across the configured discovery data sources |
| Failed audit record | Follow-on task |
| Hierarchy mismatch, truth unknown | Manual remediation |
| Event Mgmt + Metric Intelligence + Health Log Analytics together | Full-spectrum visibility: service-level impact down to log-level diagnostics |
| TM Forum API to create/update/clear alarms | TMF 642 (TMF 641 = service ordering, 622 = product ordering, 620 = product catalog) |
