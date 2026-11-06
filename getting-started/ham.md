---
layout: default
title: HAM — Getting Started
---

# HAM — Getting Started (2026)

**One line:** HAM knows where every physical device is, who has it, what it cost, and when it must be retired — and can prove it in an audit.

Back to the [guide index](./index.md) · [ITSM](./itsm.md) · [CSM](./csm.md) · [FSM](./fsm.md) · [TSOM](./tsom.md) · [Sales CRM](./sales-crm.md)

---

## 1. What you actually build

| Object | Table | Note |
|---|---|---|
| Asset | `alm_asset` | Base: financial + contractual facts |
| Hardware asset | `alm_hardware` | The device — extends `alm_asset` |
| Consumable | `alm_consumable` | Toner, cables — quantity, not serial |
| Bundle | `alm_bundle` | Parent asset grouping child assets |
| Stockroom | `alm_stockroom` | Where it physically sits |
| Stockroom type | `alm_stockroom_type` | Central / regional / virtual |
| Entitlement | `alm_entitlement` | Support/warranty wrapper |
| Hardware model | `cmdb_hardware_product_model` | The model library entry |
| Contract↔asset | `clm_m2m_contract_asset` | Which contract covers which asset |

**The distinction that matters:** the **asset** is the financial record (cost, depreciation, ownership). The **CI** in `cmdb_ci` is the operational record (what is running, what it connects to). They are linked (`alm_hardware.ci` → `cmdb_ci`) but they are not the same row, and conflating them is the classic HAM mistake.

---

## 2. Out-of-the-box features (HAM Pro, `sn_hamp`)

- **Hardware Asset Workspace** — asset operations, stockrooms, audits, disposal, all in one UI.
- **Asset lifecycle automation** — procurement → receiving → stock → deploy → repair → retire → dispose, with state transitions enforced.
- **Asset audits** (`sn_hamp_asset_audit`) — scan-based reconciliation, missing/extra asset reporting.
- **Reclamation** (`sn_hamp_asset_reclaim_line`) — offboarding returns, automatic stockroom intake.
- **Disposal** (`sn_hamp_hardware_disposal`, `sn_hamp_hw_asset_disposal_task`) — compliant retirement with certificates.
- **Loaner orders** (`sn_hamp_loaner_asset_order`) — temporary replacement devices.
- **Normalization** (`sn_hamp_hw_normalization_map`, `sn_hamp_custom_hw_prod_model`) — map messy vendor names to a clean model library.
- **Carrier integration profiles** — shipping/tracking for transfers and disposals.
- **Attestation and repair orders** (`sn_itam_common_asset_attestation`, `sn_itam_common_repair_order`).
- **RFID** (`sn_itam_common_rfid_conn_attr`, `sn_itam_common_rfid_stg_asset`).
- **Performance Analytics for HAM** — asset age, end-of-life exposure, utilisation, cost per device.
- **Mobile scanning** — barcode/QR receive, move, audit from the Now Mobile app.

---

## 3. Key table hierarchy

```
alm_asset
├── alm_hardware ──► cmdb_ci (operational twin)
│   ├── alm_bundle (parent/child via alm_asset.parent)
│   ├── alm_entitlement / alm_entitlement_asset
│   ├── clm_m2m_contract_asset ──► ast_contract (contract management)
│   └── sn_hamp_asset_audit (audit lines)
├── alm_consumable
└── alm_fixed_assets

Location / stock
├── alm_stockroom ──► alm_stockroom_type
├── cmn_location
└── alm_transfer_order (movement between stockrooms)

Model library
├── cmdb_hardware_product_model ──► cmdb_model
├── sn_hamp_hw_manufacturer
├── sn_hamp_hw_device_type
└── sn_hamp_hw_normalization_map

Lifecycle records (HAM Pro)
├── sn_hamp_asset_reclaim_line
├── sn_hamp_hardware_disposal ──► sn_hamp_hw_asset_disposal_task
├── sn_hamp_loaner_asset_order
└── sn_itam_common_repair_order
```

Asset states you will see in every implementation: **On order → In stock → In transit → In use → Retired → Disposed** (plus **Missing**, which audits set). If a customer invents their own states, reporting breaks.

---

## 4. Reusable code and metadata

### 4.1 Script Include — assets whose warranty expired but are still in use

```javascript
var HamWarranty = Class.create();
HamWarranty.prototype = {
  initialize: function () {},

  expiringWithin: function (days) {
    var out = [];
    var limit = new GlideDateTime();
    limit.addDaysUTC(days);

    var gr = new GlideRecord('alm_hardware');
    gr.addQuery('install_status', '1');           // 1 = installed / in use
    gr.addQuery('warranty_expiration', '<=', limit);
    gr.addQuery('warranty_expiration', '>=', new GlideDateTime());
    gr.query();
    while (gr.next()) {
      out.push({
        asset: gr.getValue('asset_tag'),
        model: gr.getDisplayValue('model'),
        assigned_to: gr.getDisplayValue('assigned_to'),
        expires: gr.getValue('warranty_expiration')
      });
    }
    return out;
  },

  type: 'HamWarranty'
};
```

### 4.2 Business Rule — never retire an asset with an open incident (before update)

```javascript
// Name: HAM - block retire with open incidents
// Table: alm_hardware | When: before | Update: true
// Condition: current.install_status.changesTo('7')   // 7 = retired
(function executeRule(current, previous) {
  var inc = new GlideAggregate('incident');
  inc.addQuery('cmdb_ci', current.ci);
  inc.addQuery('active', true);
  inc.addAggregate('COUNT');
  inc.query();
  if (inc.next() && parseInt(inc.getAggregate('COUNT'), 10) > 0) {
    current.setAbortAction(true);
    gs.addErrorMessage('Retire blocked: open incidents reference this CI.');
  }
})(current, previous);
```

### 4.3 Scheduled job — flag assets past end of life

```javascript
// Name: HAM - flag EOL assets (daily)
var gr = new GlideRecord('alm_hardware');
gr.addQuery('install_status', 'IN', '1,2');          // in use / in stock
gr.addQuery('model.life_cycle_stage', 'End of Life');
gr.query();
while (gr.next()) {
  gr.setValue('u_eol_flagged', true);
  gr.setWorkflow(false);                              // bulk update: no notifications
  gr.update();
}
gs.info('HAM EOL flagging complete');
```

### 4.4 Client Script — require a stockroom before stock state

```javascript
// Table: alm_hardware | Type: onChange | Field: install_status
function onChange(control, oldValue, newValue, isLoading) {
  if (isLoading) return;
  if (newValue === '2' && g_form.getValue('stockroom') === '') {   // 2 = in stock
    g_form.showFieldMsg('stockroom', 'In-stock assets must have a stockroom.', 'error');
  }
}
```

### 4.5 Metadata you will actually touch

| Record | Table | Why |
|---|---|---|
| Hardware model | `cmdb_hardware_product_model` | model library, lifecycle stage |
| Normalization map | `sn_hamp_hw_normalization_map` | vendor name → model |
| Stockroom | `alm_stockroom` | physical location |
| Depreciation | `cmdb_depreciation` | finance reporting |
| Contract | `ast_contract` + `clm_m2m_contract_asset` | warranty coverage |
| Vendor catalogue | `pc_vendor_cat_item` | procurement link |

---

## 5. Integrations

| Direction | Pattern | Notes |
|---|---|---|
| Endpoint management | Intune / SCCM / Jamf via IntegrationHub or Agent Client Collector | reconciles what is actually installed |
| Discovery | MID Server + Discovery / Service Graph | fills the `cmdb_ci` twin |
| Procurement | SAP Ariba / Coupa spoke | PO → asset on order → received |
| Shipping | carrier integration profiles + transfer orders | tracking on movement |
| Finance | ERP export of cost/depreciation | finance owns the numbers, HAM mirrors them |
| Barcode/RFID | mobile scanning, RFID staging table | audits and stock takes |
| HR | offboarding flow → reclamation | returns device to stockroom |
| Content service | Hampel/normalization feed | keeps the model library current |

---

## 6. First lab (90 minutes, PDI)

1. Activate HAM, create a stockroom and a hardware model (with lifecycle stage).
2. Order a device from the catalogue → follow it through on order → received → in stock.
3. Assign it to a user → state in use, `cmdb_ci` twin created.
4. Add warranty dates and a contract link; run the warranty Script Include.
5. Create an asset audit, mark one asset missing, and reconcile.
6. Retire the asset — confirm the open-incident block fires, close the incident, retire again.
7. Open the Hardware Asset Workspace and find the asset in both the asset and stock views.

---

## 7. Mistakes that get flagged in review

- **Treating the asset as the CI.** Two records, one link — reporting depends on it.
- **No stockrooms.** "In stock" with no location is unauditable.
- **Free-text manufacturer/model.** Normalization exists so HAM Pro can report on real models.
- **Skipping the receive step.** Assets jump from on-order to in-use and stock counts never reconcile.
- **Deleting instead of disposing.** Disposal records are the audit evidence.
- **Bulk updates without `setWorkflow(false)`.** Notification storms are the usual cause of a failed go-live.
- **Ignoring `install_status` semantics.** Every report filters on it; custom states break them.

---

## 8. Where to go next

- [ITSM](./itsm.md) — the incident that blocked the retire.
- [FSM](./fsm.md) — the field tech consuming parts and assets.
- Longer walkthrough: `docs/modules/ham/ham-guide.md`.
- Related repo: [`ServiceNow_Learning_SAM`](https://github.com/eltonaguiar/ServiceNow_Learning_SAM) for the software side of ITAM.
