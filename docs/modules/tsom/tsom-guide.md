# TSOM — Telecom Service Operations Management

**Agent:** opencode  
**Date:** 2026-11-05  
**Module:** TSOM (Telecom Service Operations Management)  
**App:** TSOM  
**Confidence:** verify  

---

## Purpose

ServiceNow Telecom Service Operations Management (TSOM) is purpose-built for communications service providers (CSPs). It manages the lifecycle of telecom services—from order capture through activation, assurance, and billing—using telecom-specific data models, inventory, and orchestration. TSOM is where ITIL meets telecom: incidents are alarms, changes are network changes, and assets are network elements.

---

## Where to Find It

| Breadcrumb | Path |
|------------|------|
| Module entry | All > Telecom Service Operations > ... |
| TSOM Home | All > Telecom Service Operations > Home |
| Inventory | All > Telecom Service Operations > Inventory > ... |
| Service Inventory | All > Telecom Service Operations > Service Inventory > ... |
| Network Inventory | All > Telecom Service Operations > Network Inventory > ... |
| Service Order | All > Telecom Service Operations > Service Orders > All |
| Alarms | All > Telecom Service Operations > Alarms > All |
| Administration | All > Telecom Service Operations > Administration > ... |

**Tip:** If you don't see these menus, the `com.snc.tsom` plugin may not be activated. Go to System Definition → Plugins and search "TSOM".

---

## Re-usable Code / Metadata

### Scoped Application

TSOM ships as a scoped application. This means:

| Scope Aspect | Detail |
|--------------|--------|
| Scope name | `com.snc.tsom` |
| Cross-scope access | Required to read/write TSOM tables from global scope |
| Tables | Prefixed `u_` when custom; OOB TSOM tables use native names |
| Roles | `sn_tsom.admin`, `sn_tsom.user`, `sn_tsom.reader` |

### Meta Data Patterns

| Metadata Element | Example | Notes |
|------------------|---------|-------|
| Application menu | `sn_tsom.menu.main` | Defines left-nav items |
| Module | `sn_tsom.menu.inventory` | Points to a table/list view |
| Table extension | `cmdb_ci` extends `cmdb_ci_network` | Telecom CIs inherit from generic CIs |
| Choice list | `sn_tsom.service_status` | Active, Pending, Suspended, Retired |
| UI Policy | `sn_tsom.policy.validate_service_order` | Conditionally shows fields based on service type |

### Re-usable Code Snippets

#### REST Message Outbound (Telco API call)

```javascript
var rm = new sn_ws.RESTMessageV2('TSOM External API', 'GET');
rm.setEndpoint('https://api.telco-provider.com/v1/services');
rm.setHttpHeader('Content-Type', 'application/json');
rm.setRequestHeader('Authorization', 'Bearer ' + gs.getProperty('tsom.api.token'));
var response = rm.execute();
var httpStatus = response.getStatusCode();
var body = response.getBody();
if (httpStatus === 200) {
    var jsonResponse = new JSON().decode(body);
    gs.print('Service count: ' + jsonResponse.services.length);
} else {
    gs.error('API call failed: ' + httpStatus + ' - ' + body);
}
```

#### Business Rule: Auto-assign Service Order

```javascript
(function rule(current, previous) {
    if (current.operation() == 'insert' && !current.assignment_group) {
        var gr = new GlideRecord('sys_user_group');
        gr.addQuery('name', 'Telecom Operations Team');
        gr.query();
        if (gr.next()) {
            current.assignment_group = gr.sys_id;
        }
    }
})(current, previous);
```

#### UI Policy: Show Fields Based on Service Type

```javascript
(function rule(current) {
    if (current.service_type == 'fiber') {
        g_form.setVisible('fiber_termination_point', true);
        g_form.setMandatory('fiber_termination_point', true);
        g_form.setHidden('copper_pair', true);
    } else if (current.service_type == 'copper') {
        g_form.setVisible('copper_pair', true);
        g_form.setMandatory('copper_pair', true);
        g_form.setHidden('fiber_termination_point', true);
    } else {
        g_form.setHidden('fiber_termination_point', true);
        g_form.setHidden('copper_pair', true);
    }
})(current);
```

#### Script Include: TSOM Helper

```javascript
var TSOMHelper = Class.create();
TSOMHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getServiceStatus: function() {
        var serviceSysId = this.getParameter('sys_id');
        var gr = new GlideRecord('sn_tsom_service');
        gr.addQuery('sys_id', serviceSysId);
        gr.query();
        if (gr.next()) {
            return gr.getValue('state');
        }
        return 'unknown';
    },
    type: 'TSOMHelper'
});
```

---

## Out-of-Box Features

| Feature | Description | Where |
|---------|-------------|-------|
| Service Inventory | Track logical telecom services (voice, data, VPN) | All > TSOM > Service Inventory |
| Network Inventory | Track physical/network CIs (routers, switches, fiber) | All > TSOM > Network Inventory |
| Service Orders | Order-to-activate workflow for new services | All > TSOM > Service Orders |
| Alarms | Correlate network alarms into service-impacting events | All > TSOM > Alarms |
| Service Orders Approval | Approve/reject new service orders | All > TSOM > Approvals |
| Service Catalog for Telecom | Order new lines, ports, circuits via portal | Service Portal |
| Device Inventory | Track routers, switches, ONTs, modems | All > TSOM > Device Inventory |
| Circuit Management | Track leased lines, MPLS, dark fiber circuits | All > TSOM > Circuits |

---

## Key Table Hierarchy

### Core Tables

| Table | Purpose | Extends | Key Fields |
|-------|---------|---------|------------|
| `sn_tsom_service` | Logical telecom service instance | `task` | `number`, `state`, `service_type`, `customer`, `assigned_to` |
| `sn_tsom_service_order` | Order to provision a service | `task` | `number`, `state`, `service_type`, `billing_account` |
| `sn_tsom_network_element` | Physical network device | `cmdb_ci` | `name`, `serial_number`, `ip_address`, `location` |
| `sn_tsom_circuit` | Point-to-point circuit | `cmdb_ci` | `circuit_id`, `bandwidth`, `termination_a`, `termination_b` |
| `sn_tsom_inventory_item` | Trackable inventory (ONT, modem, SIM) | `alm_asset` | `asset_tag`, `serial_number`, `status` |
| `sn_tsom_alarm` | Network alarm/event | `em_event` | `node`, `alarm_type`, `severity`, `clear_state` |
| `sn_tsom_service_instance` | Provisioned service instance | `task` | `service`, `customer`, `activation_date` |

### Table Relationships

```
sn_tsom_service_order
    │
    ├──► sn_tsom_service (one order → many services)
    │
sn_tsom_service
    │
    ├──► sn_tsom_circuit (uses circuit)
    ├──► sn_tsom_network_element (uses network element)
    ├──► sn_tsom_inventory_item (uses inventory items)
    │
sn_tsom_alarm
    │
    ├──► sn_tsom_network_element (alarm raised on element)
    │
sn_tsom_inventory_item
    │
    ├──► cmdb_ci (links to CMDB)
```

### CMDB Integration

| TSOM Table | Maps to CMDB Table | Relationship |
|------------|-------------------|--------------|
| `sn_tsom_network_element` | `cmdb_ci_network` | Extends |
| `sn_tsom_circuit` | `cmdb_ci_network` | Extends |
| `sn_tsom_inventory_item` | `cmdb_ci_hardware` | Via `alm_asset` |
| `sn_tsom_service` | `cmdb_ci_service` | Logical service mapping |

---

## Integrations

| Integration | Direction | Purpose | Protocol |
|-------------|-----------|---------|----------|
| OSS/BSS Sync | Outbound | Push service orders to telecom OSS | REST/SOAP |
| Network Discovery | Inbound | Discover network elements via SNMP/SSH | Discovery/MID Server |
| Alarm Ingestion | Inbound | Ingest alarms from NMS (Nokia, Ericsson, etc.) | REST/EM |
| Billing Integration | Outbound | Push service activations to billing system | REST/SFTP |
| Provisioning | Outbound | Provision circuits on Ciena/ADVA/etc. | NETCONF/REST |
| Customer Portal | Inbound | Customers order services via portal | Service Portal REST |
| CDRs | Inbound | Call detail records for usage billing | SFTP/API |
| Test & Measurement | Outbound | Run line tests on CPE | REST/SSH |

---

## Key Fields

| Table | Field | Type | Why It Matters |
|-------|-------|------|----------------|
| `sn_tsom_service` | `number` | String | Unique service identifier |
| `sn_tsom_service` | `state` | Choice | Draft → Pending → Active → Suspended → Retired |
| `sn_tsom_service` | `service_type` | Choice | Voice, Data, VPN, TV, Mobile |
| `sn_tsom_service` | `assigned_to` | Reference | Support owner |
| `sn_tsom_service_order` | `order_type` | Choice | New, Modify, Disconnect, Move |
| `sn_tsom_network_element` | `ip_address` | String | Management IP |
| `sn_tsom_network_element` | `location` | Reference | Physical site |
| `sn_tsom_circuit` | `bandwidth` | String | Circuit capacity (e.g., 1Gbps) |
| `sn_tsom_circuit` | `termination_a` | Reference | Location A |
| `sn_tsom_circuit` | `termination_b` | Reference | Location B |
| `sn_tsom_alarm` | `severity` | Choice | Critical, Major, Minor, Warning |
| `sn_tsom_alarm` | `clear_state` | Boolean | Whether alarm is cleared |

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Creating services without a customer | Services don't show on customer portal | Always populate `customer` field |
| Ignoring territory/region constraints | Orders fail to assign | Set territory on service order |
| Creating duplicate circuits | Same circuit appears twice | Use circuit ID as identification rule |
| Forgetting activation date | SLA calculations wrong | Set `activation_date` on provision |
| Mixing physical and logical inventory | Confusion in reports | Keep network elements separate from services |

---

## Lab: Create Your First Telecom Service

1. **Navigate** to All > Telecom Service Operations > Service Orders > All
2. **Click New** and fill:
   - Order Type: New
   - Service Type: Fiber Broadband
   - Customer: Select existing or create new
   - Billing Account: Select account
   - Termination Point: Customer premises address
3. **Submit** and note the order number
4. **Open** the created service order → change State to "Provisioned"
5. **Observe** a `sn_tsom_service` record was auto-created
6. **Create** a `sn_tsom_network_element` (router) and link it to the service via Related Lists
7. **Create** an `sn_tsom_alarm` on that network element with severity "Major"
8. **Verify** the alarm appears on the service's related list

---

## Quiz

1. What is the primary table for telecom services in TSOM?
2. What table stores physical network elements?
3. What is the difference between a service and a service order?
4. Which table stores alarms?
5. How do you link a circuit to a service?
