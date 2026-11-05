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

## Implementer Labs — What Actually Exists (Researched 2026-11-05)

TSOM and TNI are **licensed products**. They cannot be installed on a free Personal Developer Instance (PDI) — Store applications need an entitled organisation account, and TSOM's documentation requires an active TSOM subscription. So where does hands-on implementer practice actually happen? Researched against official ServiceNow sources on 2026-11-05:

<div class="verdict">
<h3>Verdict</h3>
<p><strong>Yes for TNI, effectively no for TSOM itself.</strong> The hands-on implementer labs live in the TNI courses and bootcamps, whose ServiceNow University lab instances come with the licensed plugins provisioned. TSOM Essentials is content-only. All ServiceNow University on-demand content is currently <strong>free</strong> with a free account — no partner or customer affiliation is needed (ServiceNow Training FAQs, KB0012229).</p>
</div>

<div class="card-grid">
  <div class="card">
    <h3>TSOM Essentials <span class="pill pill-no">No lab</span></h3>
    <p class="meta">ServiceNow University, March 2026 Store Release (Yokohama → Zurich, plus Australia).</p>
    <p>Covers the right objectives — Telecom Discovery Patterns, Service Graph Connectors, the Discovery Builder Framework, discrepancy remediation, TMF 688 event ingestion — but the official course page shows no lab instance, lab guide, or simulator. ServiceNow's own telecom training catalogue lists hands-on trainings under TNI and none under TSOM. Treat it as concepts only.</p>
    <p class="meta"><a href="http://nowlearninguat.service-now.com/lxp/en/telecommunications-service-management/telecommunications-service-operations?course_id=f07adf8c9307b2d056aeb94c5cba1094&amp;id=learning_course_prev">Course page</a></p>
  </div>
  <div class="card">
    <h3>TNI Essentials <span class="pill pill-yes">Has a lab ✓</span></h3>
    <p class="meta">ServiceNow University · Telecommunications Network Inventory</p>
    <p>The official catalogue: learners "apply what they have learned in hands-on lab exercises to fulfill multiple use cases," on a provided lab instance with the TNI plugins installed. Two cautions from learners: the Washington version had plugin mismatches between lab content and lab instance, and the indexed 7h15m version is retired — enrol via "View other releases" (a Vancouver version exists).</p>
    <p class="meta"><a href="https://learning.servicenow.com/lxp/en/telecommunications-service-management/telecommunications-network-inventory?course_id=5951bdd8471a9550f6b11244846d4313&amp;id=learning_course_prev">Course page</a></p>
  </div>
  <div class="card">
    <h3>TNI Implementation Bootcamp <span class="pill pill-yes">Has a lab ✓</span></h3>
    <p class="meta">ServiceNow University</p>
    <p>Officially "a comprehensive guide to implementing TNI within the ServiceNow platform, featuring hands-on lab activities that enable practical application of the concepts learned." This is the deepest sanctioned TNI practice available to an individual.</p>
  </div>
  <div class="card">
    <h3>TNI Implementer Learning Path <span class="pill pill-yes">Has a lab ✓</span></h3>
    <p class="meta">14h 13m · Prerequisites: ServiceNow Administration Fundamentals, CMDB Fundamentals, Flow Designer Fundamentals</p>
    <p>Lab scope: Network Inventory Workspace modelling and templates, sites, equipment, cards, interfaces and connections, telephone-number and IP allocation, design-and-assign, and applying the TMF API to create, search, and patch CIs — plus TNI's integration points with HAM and Order Management.</p>
    <p class="meta"><a href="https://learning.servicenow.com/lxp/en/telecommunications-service-management/telecommunications-network-inventory?id=learning_path_prev&amp;path_id=bff84642870295d4046fff38dabb35e6">Learning path</a></p>
  </div>
  <div class="card">
    <h3>TSOM Visibility &amp; Event Management Implementation Bootcamp <span class="pill pill-unverified">Lab unverified</span></h3>
    <p class="meta">ServiceNow University, on-demand, Yokohama</p>
    <p>The course exists officially, and bootcamps in this catalogue normally include labs — but its lab details (duration, TSOM plugin activation, task list) could not be confirmed from outside the enrolment page. Check the signed-in course page before counting on it.</p>
    <p class="meta"><a href="https://learning.servicenow.com/lxp/en/telecommunications-service-management/tsom-visibility-and-event-management?id=learning_course_prev&amp;course_id=8ea3f0f7872f1ad4bfe94088dabb350d">Course page</a></p>
  </div>
  <div class="card">
    <h3>AI for Telecommunications Implementation Bootcamp <span class="pill pill-yes">Has a lab ✓</span></h3>
    <p class="meta">ServiceNow University, Zurich</p>
    <p>Explicitly includes hands-on labs and a requestable lab instance (note on the course page: instances requested before June 1, 2026 should be terminated and re-requested). The Now Assist / agentic layer on top of the TSOM/TNI foundation.</p>
    <p class="meta"><a href="http://nowlearninguat.service-now.com/lxp/en/telecommunications-service-management/ai-for-telecommunications?course_id=57fc4b64c3ed3690e5533b877d013168&amp;id=learning_course_prev">Course page</a></p>
  </div>
  <div class="card">
    <h3>TNI Delivery Accreditation <span class="pill pill-info">Credential</span></h3>
    <p class="meta">Non-proctored exam in ServiceNow University · ~17 hours of prep per ServiceNow's APAC promo</p>
    <p>A credential, not a lab — it attests you have learned how to implement TNI. The Essentials and Bootcamp labs are the preparation. No partner-only gate was found; no price is published. There is no CIS-TSOM exam and no TSOM/TNI simulator; TSOM credentialing routes through Event Management (CIS-EM) in the TSOM Implementer path, and the TNI micro-certification feeds the HAM with Telecommunications Network Inventory Professional suite (with CIS-HAM).</p>
    <p class="meta"><a href="https://learning.servicenow.com/lxp/en/pages/now-learning-get-certified?id=amap_detail&amp;summary_id=79d64e311bfcf01002ed2f89bd4bcb51&amp;achievement_id=50487bb99302fd9056aeb94c5cba1003">Accreditation page</a></p>
  </div>
  <div class="card">
    <h3>Personal Developer Instance <span class="pill pill-no">No</span></h3>
    <p class="meta">developer.servicenow.com</p>
    <p>TSOM/TNI cannot be installed on a PDI — Store entitlement is tied to an organisation account. The only sanctioned hands-on routes are course lab instances (above) or an entitled employer, customer, or partner instance. On a PDI you can still build adjacent proof: telecom-style CMDB modelling, Discovery patterns, IntegrationHub ETL imports that mimic a Service Graph Connector feed, and TMF 688-style event ingestion by REST.</p>
  </div>
</div>

### The individual route, in order

1. Free ServiceNow University account → enrol on demand (free).
2. **TNI Essentials** (via "View other releases") — request the lab instance; do the labs.
3. **TNI Implementation Bootcamp** — the deep implementation practice.
4. **TSOM Essentials** — concepts layer (no lab; don't expect one).
5. Optionally: **AI for Telecommunications Implementation Bootcamp** for the Now Assist layer, then the **TNI Delivery Accreditation**.

### Lab instance rules (ServiceNow University, KB0012546)

- A lab instance is a real practice instance, requestable **with certain courses** for labs and simulator tasks; URL and credentials arrive by email. Licensed products **are** provisioned in course lab instances when the course requires them — that is what makes TNI hands-on possible.
- Maximum **3 instances per course**, only **1 assigned at a time**; a new instance does **not** carry over your work.
- Instances hibernate; allow ~15 minutes to wake.
- A lab instance **terminates 2 days after course completion** and cannot be extended once terminated.
- Default terms: lab/simulation access up to **2 weeks** with an option of **one 2-week extension**, unless the course states otherwise (some courses run 2–4 days); the KB also describes two built-in extensions plus a catalogue request for one extra 2-week extension and one extra instance with justification.

### What does not exist

- No TSOM or TNI **instructor-led** course — the official 2026 Learning Paths guide marks every TNI/TSOM item as no-charge on-demand. (Generic ILT economics, if one ever appears: 1,900 Learning Credits for 2 days / 2,700 for 3 days, 1 LC = $1 USD.)
- No dedicated TSOM/TNI **simulator** and no **CIS-TSOM** exam.

**Sources:** [ServiceNow Training FAQs (KB0012229)](https://learning.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0012229) · [Lab instance help (KB0012546)](https://nowlearning.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0012546) · [TMT knowledge catalogue](https://www.servicenow.com/community/telecom-articles/telecommunications-media-and-technology-knowledge-amp/ta-p/3416810) · [2026 Learning Paths guide (PDF)](https://www.servicenow.com/community/s/cgfwn76974/attachments/cgfwn76974/training-certifications-forum/27192/1/Learning%20paths%20-%20ServiceNow.pdf) · [Zurich TSOM product documentation (PDF)](https://downloads.docs.servicenow.com/pdf/enus/servicenow-zurich-telecom-service-ops-enus.pdf)

---

## Lab: Create Your First Telecom Service

> **Instance requirement:** this walkthrough needs TSOM installed, which means an entitled instance — a ServiceNow University course lab instance or an employer/customer/partner instance. It will not run on a free PDI (see *Implementer Labs* above).

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
