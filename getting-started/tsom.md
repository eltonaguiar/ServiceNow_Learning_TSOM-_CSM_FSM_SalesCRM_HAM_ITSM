---
layout: default
title: TSOM — Getting Started
---

# TSOM — Getting Started (2026)

**One line:** TSOM is the telecom operating layer on top of the CMDB — model the network, ingest its alarms and performance, and see which *customers and services* are affected before the NOC does.

Back to the [guide index](./index.md) · [CSM](./csm.md) · [FSM](./fsm.md) · [ITSM](./itsm.md) · [Sales CRM](./sales-crm.md) · [HAM](./ham.md) · [TSOM Diagrams Slideshow](./tsom-diagrams.md)

---

## 1. What you actually build

TSOM is not a form-heavy module. It is four capabilities you wire together:

| Layer | What it does | Built on |
|---|---|---|
| **Telecom data model** | Models equipment, interfaces, ports, sites, links, circuits | CMDB classes (aligned to CSDM) |
| **TNI (Telecom Network Inventory)** | The inventory of physical + logical network entities | CMDB + discovery ETLs |
| **Assurance** | Alarms, performance, service impact, event correlation | Event Management (`em_*`) |
| **Service visibility** | Maps network failure → affected service → affected customer | CSDM service layer + CMDB relationships |

The telecom data model is deliberately an **extension** of the standard CMDB, not a parallel universe: it reuses existing classes and adds telecom-specific ones only where needed. That is why TSOM work looks like CMDB work with a telecom vocabulary.

---

## 2. Out-of-the-box features

- **Telecom Discovery Builder** — a schema-aligned ETL framework that loads network inventory from EMS/NMS and other sources; the TSOM Core data source is the reference schema, and you clone it for each connector.
- **TNI entities and relationships** — equipment, cards, interfaces, ports, links, circuits, sites, with containment and consumption relationships.
- **Discrepancy identification and reconciliation** — compares discovered vs asserted inventory and flags drift.
- **Data source validation** — OOTB checks that a connector's output matches the schema before you trust it.
- **Event Management for telecom** — alarm ingestion, de-duplication, correlation, maintenance windows.
- **Telecommunications API notification** — pub/sub ingestion of external events via the Telecom Alarm Management Open API (create topic → subscription → activate endpoint).
- **Unresolved monitored object handling** — events for objects not yet in the CMDB land in `em_unique_nodes` (`type = unknown`) instead of being dropped.
- **SD-WAN data model** — a domain-specific subset of the telecom model for SD-WAN topologies.
- **Service-level dashboards and health scoring** — service impact views for NOC/operations.

---

## 3. Key table hierarchy

```
cmdb_ci  (platform base — everything below is a CI)
├── cmdb_ci_telco_equipment            TSOM base class for telecom hardware
│   ├── cmdb_ci_network_packet_broker  (documented child class)
│   └── ... vendor/technology children you or a connector add
├── cmdb_ci_netgear                    generic network gear (routers, switches)
├── cmdb_ci_ip_network                 logical IP networks
└── cmdb_ci_service                    the CSDM service layer customers care about

Relationships
├── cmdb_rel_ci                        containment / dependency / consumption
├── cmdb_ci_spkg / model tables        model + vendor normalisation
└── TNI entities                       interfaces, ports, links, circuits, sites

Assurance
├── em_event        raw ingested alarm/event
├── em_alert        correlated alert (what a NOC works)
├── em_unique_nodes unresolved monitored objects (type = unknown)
└── task/incident   what you raise when an alert breaches a service
```

**How to read it in an interview:** the CI graph is the truth; `em_*` is the noise; the service classes are the business. TSOM's value is the mapping between the three.

---

## 4. Reusable code and metadata

### 4.1 Script Include — blast radius for a network CI

```javascript
var TsomImpact = Class.create();
TsomImpact.prototype = {
  initialize: function () {},

  // Walk the CMDB dependency graph upward from a failed device to affected services
  affectedServices: function (ciSysId, maxDepth) {
    var visited = {}, found = {};
    var queue = [{ id: ciSysId, depth: 0 }];

    while (queue.length) {
      var node = queue.shift();
      if (visited[node.id] || node.depth > (maxDepth || 5)) continue;
      visited[node.id] = true;

      var rel = new GlideRecord('cmdb_rel_ci');
      rel.addQuery('child', node.id);
      rel.addQuery('parent.sys_class_name', 'STARTSWITH', 'cmdb_ci_service');
      rel.query();
      while (rel.next()) {
        found[rel.getValue('parent')] = rel.getDisplayValue('parent');
      }

      var down = new GlideRecord('cmdb_rel_ci');
      down.addQuery('child', node.id);
      down.query();
      while (down.next()) {
        queue.push({ id: down.getValue('parent'), depth: node.depth + 1 });
      }
    }
    return found;
  },

  type: 'TsomImpact'
};
```

### 4.2 Business Rule — raise an incident when a critical alarm hits a service CI

```javascript
// Name: TSOM - critical alarm on service CI
// Table: em_alert | When: after | Insert: true
(function executeRule(current, previous) {
  if (current.severity + '' !== '1') return;            // 1 = critical

  var ci = current.cmdb_ci.getRefRecord();
  if (ci.getRecordClassName() !== 'cmdb_ci_service' &&
      ci.getValue('sys_class_name') !== 'cmdb_ci_service') return;

  var inc = new GlideRecord('incident');
  inc.initialize();
  inc.short_description = 'TSOM: critical alarm on ' + ci.getDisplayValue('name');
  inc.cmdb_ci = ci.getUniqueValue();
  inc.urgency = 1;
  inc.impact = 1;
  inc.correlation_id = current.getUniqueValue();        // dedupe anchor
  inc.insert();

  current.u_incident = inc.getUniqueValue();
  current.update();
})(current, previous);
```

### 4.3 Inbound event shape (Telecom Alarm Management Open API)

```json
{
  "eventType": "communicationsAlarm",
  "source": { "nms": "ems-01", "ne": "edge-router-42" },
  "alarm": {
    "id": "ALM-99812",
    "perceivedSeverity": "CRITICAL",
    "probableCause": "LINK_DOWN",
    "raisedTime": "2026-11-05T14:02:11Z",
    "objectClass": "interface",
    "objectInstance": "edge-router-42/ge-0/0/1"
  }
}
```

Map `objectInstance` onto a CI with a lookup rule. Anything unmatched should land in `em_unique_nodes`, not be discarded — that queue is your inventory gap report.

### 4.4 Metadata you will actually touch

| Record | Table | Why |
|---|---|---|
| Data source | `sys_data_source` | the ETL input (clone the TSOM core schema) |
| Transform map | `sys_transform_map` | TNI entity creation, coalesce keys |
| Discovery schedule | `discovery_schedule` | when ETLs run |
| Correlation rule | `em_correlation_rule` | collapse alarm storms |
| Event rule | `em_event_rule` / `em_alert_rule` | severity mapping, suppression |
| CI class | `sys_db_object` / `cmdb_ci_*` | extend, never fork |
| Service model | `cmdb_ci_service` + `cmdb_rel_ci` | the business view |

---

## 5. Integrations

| Direction | Pattern | Notes |
|---|---|---|
| EMS/NMS → platform | Telecom Discovery Builder ETL (REST/file/DB) | schema-aligned; validate before enabling |
| Alarms | Telecom Alarm Management Open API (pub/sub) | create topic, subscription, activate endpoint |
| Alarms (legacy) | SNMP trap / syslog → MID Server → `em_event` | keep the MID close to the network |
| Performance | Prometheus / vendor telemetry → MID / IntegrationHub | feeds health scoring |
| Inventory | CMDB API (`/api/now/cmdb/instance/...`) | asserted inventory vs discovered |
| Ticketing out | `RESTMessageV2` to the NOC tool if ServiceNow is not the system of record | keep correlation id |
| Customer impact | CSM/CRM Foundation account + service records | who is affected, and are they entitled |

---

## 6. First lab (90 minutes, PDI)

1. Install TSOM (or use a free trial instance) and open the Telecom data model docs from the module.
2. Create two `cmdb_ci_telco_equipment` records and a link between them; inspect the relationship records created.
3. Clone the TSOM Core data source, load three rows from a CSV, and run the ETL into staging.
4. Confirm the entities appear in the TNI view; introduce a deliberate schema error and read the validation failure.
5. Create a service (`cmdb_ci_service`) and relate the equipment to it.
6. Send a test alarm via the Open API topic/subscription; watch `em_event` → `em_alert`.
7. Break the relationship on purpose and confirm your `TsomImpact` Script Include no longer reports the service — then fix it.

---

## 7. Mistakes that get flagged in review

- **Forking the CMDB.** Creating a parallel "telecom CMDB" defeats CSDM alignment and breaks every service map.
- **Modelling at the wrong level.** Interfaces and ports matter; a single "router" CI with 48 ports in a text field does not.
- **Trusting the connector on day one.** Validate the data source output against the core schema first.
- **Dropping unmatched events.** `em_unique_nodes` is the signal that your inventory is incomplete.
- **Alarm-per-incident.** Without correlation rules, one fibre cut produces 400 incidents.
- **Skipping the service layer.** Without `cmdb_ci_service` relationships, TSOM cannot answer "which customers are affected".

---

## 8. Where to go next

- [CSM](./csm.md) — how the affected subscriber becomes a case.
- [ITSM](./itsm.md) — the incident process the alarms feed.
- Longer walkthrough: `docs/modules/tsom/tsom-guide.md`.
- [TSOM capabilities](./../docs/modules/tsom/tsom-capabilities.md) — Event Management, Metric Intelligence, Health Log Analytics, Service Impact Analysis, Synthetic Monitoring, AIOps LEAP, Now Assist skills, discovery protocols, TNI class hierarchy, discrepancy remediation — with the doc breadcrumb for each.
- Official reference: [Telecom data model](https://www.servicenow.com/docs/r/telecom-service-ops/telecommunications-service-operations-management/telecom-data-model.html) (Brazil release, updated 2026-11-06).
