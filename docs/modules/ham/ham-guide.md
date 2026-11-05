# HAM — Hardware Asset Management

**Agent:** opencode  
**Date:** 2026-11-05  
**Module:** HAM (Hardware Asset Management)  
**App:** ITAM  
**Confidence:** high  

---

## Purpose

Hardware Asset Management (HAM) is the hardware-focused subset of ServiceNow IT Asset Management (ITAM). HAM tracks physical IT assets—laptops, servers, monitors, phones, printers, and other hardware—from procurement through disposal. HAM answers: *What do we own, where is it, who has it, when was it bought, when does it expire, and what does it cost?* HAM is distinct from SAM (Software Asset Management) though they share the ITAM application.

---

## Where to Find It

| Breadcrumb | Path |
|------------|------|
| Module entry | All > Asset Management > ... |
| Assets | All > Asset Management > Assets > All |
| Hardware | All > Asset Management > Assets > Hardware |
| Software | All > Asset Management > Assets > Software |
| Asset Models | All > Asset Management > Administration > Asset Models |
| Vendors | All > Asset Management > Vendors > All |
| Locations | All > Asset Management > Locations |
| Asset Categories | All > Asset Management > Administration > Categories |
| Asset States | All > Asset Management > Administration > States |
| Asset Lifecycle | All > Asset Management > Asset Lifecycle |
| Contracts | All > Asset Management > Contracts > All |

**Tip:** If menus are missing, verify the `com.snc.iam` (IT Asset Management) plugin is active (System Definition → Plugins).

---

## Re-usable Code / Metadata

### Application Scope

HAM is part of the ITAM application (`com.snc.iam`), not a fully scoped app. Tables use the `alm_` prefix convention.

| Scope Aspect | Detail |
|--------------|--------|
| Application | IT Asset Management (com.snc.iam) |
| Tables | `alm_asset`, `alm_hardware`, `alm_license`, `alm_asset_model`, `ast_contract` |
| Roles | `asset`, `itil`, `sam`, `sn_hamp_admin`, `admin` |

### Meta Data Patterns

| Metadata Element | Example | Notes |
|------------------|---------|-------|
| Application menu | `sn_iam.menu.main` | ITAM left-nav root |
| Module | `sn_iam.menu.assets` | Points to asset list |
| Asset Category | `alm_asset_category.hardware` | Hardware vs software vs contract |
| Asset State | `alm_asset_state.in_stock` | In stock, assigned, in repair, retired |
| UI Policy | `sn_iam.policy.validate_asset_tag` | Validates asset tag uniqueness |
| Business Rule | `sn_iam.rule.auto_assign_asset_tag` | Auto-generates asset tag |

### Re-usable Code Snippets

#### Business Rule: Auto-generate Asset Tag

```javascript
(function rule(current, previous) {
    if (current.operation() == 'insert' && !current.asset_tag) {
        var gr = new GlideRecord('alm_asset');
        gr.addQuery('category', current.category);
        gr.orderByDesc('number');
        gr.setLimit(1);
        gr.query();
        var nextNum = 1;
        if (gr.next()) {
            var lastNum = gr.getValue('number');
            var match = lastNum.match(/(\d+)$/);
            if (match) {
                nextNum = parseInt(match[1]) + 1;
            }
        }
        var categoryGr = new GlideRecord('alm_asset_category');
        gr.addQuery('sys_id', current.category);
        gr.query();
        if (categoryGr.next()) {
            var prefix = categoryGr.getValue('name').substring(0,3).toUpperCase();
            current.asset_tag = prefix + '-' + String(nextNum).padStart(4, '0');
        }
    }
})(current, previous);
```

#### UI Policy: Validate Serial Number and Asset Tag

```javascript
(function rule(current) {
    if (current.serial_number && current.asset_tag) {
        var gr = new GlideRecord('alm_asset');
        gr.addQuery('serial_number', current.serial_number);
        gr.addQuery('sys_id', '!=', current.sys_id);
        gr.query();
        if (gr.next()) {
            g_form.showErrorMsg('serial_number', 'Serial number already exists on another asset');
        }
        gr.query();
        gr.addQuery('asset_tag', current.asset_tag);
        gr.addQuery('sys_id', '!=', current.sys_id);
        gr.query();
        if (gr.next()) {
            g_form.showErrorMsg('asset_tag', 'Asset tag already exists on another asset');
        }
    }
})(current);
```

#### Script Include: HAM Helper

```javascript
var HAMHelper = Class.create();
HAMHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getAssetLifecycleStatus: function() {
        var assetSysId = this.getParameter('assetSysId');
        var gr = new GlideRecord('alm_asset');
        gr.addQuery('sys_id', assetSysId);
        gr.query();
        if (gr.next()) {
            var state = gr.getValue('state');
            var installStatus = gr.getValue('install_status');
            return JSON.stringify({
                asset_tag: gr.getValue('asset_tag'),
                state: gr.getDisplayValue('state'),
                install_status: gr.getDisplayValue('install_status'),
                is_retired: state == 'retired',
                is_available: state == 'in_stock'
            });
        }
        return '{}';
    },
    type: 'HAMHelper'
});
```

#### Business Rule: Sync Asset to CI

```javascript
(function rule(current, previous) {
    if (current.operation() == 'insert' && current.cmdb_ci) {
        var ciGr = new GlideRecord('cmdb_ci');
        gr.addQuery('sys_id', current.cmdb_ci);
        gr.query();
        if (ciGr.next()) {
            current.company = ciGr.getValue('company');
            current.location = ciGr.getValue('location');
        }
    }
})(current, previous);
```

---

## Out-of-Box Features

| Feature | Description | Where |
|---------|-------------|-------|
| Assets | All hardware/software assets | All > Asset Management > Assets > All |
| Hardware | Hardware-specific assets | All > Asset Management > Assets > Hardware |
| Software | Software licenses/installs | All > Asset Management > Assets > Software |
| Asset Models | Product models (Dell XPS 13, etc.) | All > Asset Management > Administration > Asset Models |
| Vendors | Suppliers/vendors | All > Asset Management > Vendors > All |
| Contracts | Maintenance/support contracts | All > Asset Management > Contracts > All |
| Asset Lifecycle | Procure → Receive → Deploy → Maintain → Retire | All > Asset Management > Asset Lifecycle |
| Procurement | Purchase orders and receiving | All > Asset Management > Procurement |
| Asset Categories | Categorize assets | All > Asset Management > Administration > Categories |
| Asset States | Lifecycle states | All > Asset Management > Administration > States |

---

## Key Table Hierarchy

### Core Tables

| Table | Purpose | Extends | Key Fields |
|-------|---------|---------|------------|
| `alm_asset` | Core asset record | `task` | `number`, `name`, `category`, `state`, `asset_tag`, `serial_number`, `purchase_date`, `cost`, `assigned_to`, `location`, `vendor`, `employment_type` |
| `alm_hardware` | Hardware-specific fields | `alm_asset` | `serial_number`, `mac_address`, `warranty_expiration`, `manufacturer`, `model_number` |
| `alm_license` | Software license | `task` | `name`, `license_count`, `installation_count`, `license_type`, `expiration_date` |
| `alm_asset_model` | Asset model definition | `task` | `name`, `manufacturer`, `category`, `model_number` |
| `ast_contract` | Maintenance/support contract | `task` | `name`, `vendor`, `start_date`, `end_date`, `renewal_date`, `contract_value` |
| `cmdb_ci_hardware` | Hardware CI | `cmdb_ci` | `name`, `serial_number`, `discovery_source`, `operational_status` |

### Table Relationships

```
alm_asset_model
    │
    ├──► alm_asset (many assets per model)
    │
alm_asset
    │
    ├──► cmdb_ci_hardware (one asset → one CI)
    ├──► customer_account (assigned to account/user)
    ├──► ast_contract (linked contracts)
    ├──► location (where asset is)
    │
cmdb_ci_hardware
    │
    ├──► cmdb_ci (extends CI table)
    │
ast_contract
    │
    ├──► alm_asset (assets under contract)
```

### CMDB Integration

| HAM Table | Maps to CMDB Table | Relationship |
|-----------|-------------------|--------------|
| `alm_asset` | `cmdb_ci_hardware` | Links via `cmdb_ci` field |
| `alm_asset_model` | `cmdb_ci_model` | Model reference |
| `alm_hardware` | `cmdb_ci_hardware` | Hardware details |
| `sn_sales_product` | `cmdb_ci` | Product as CI |

---

## Integrations

| Integration | Direction | Purpose | Protocol |
|-------------|-----------|---------|----------|
| Discovery (MID Server) | Inbound | Auto-discover hardware on network | Discovery/MID Server |
| SCCM/Intune | Inbound | Import hardware from Microsoft endpoints | Service Graph Connector |
| Jamf | Inbound | Import Mac assets | Service Graph Connector |
| AWS/Azure | Inbound | Import cloud instances | Service Graph Connector |
| vCenter | Inbound | Import VMware servers | Service Graph Connector |
| Procurement | Outbound | Create purchase orders | Internal/REST |
| Contract Management | Outbound | Link assets to maintenance contracts | Internal |
| CMDB | Bidirectional | Assets ↔ CIs | Internal |
| Financial | Outbound | Push asset costs to finance system | REST/SFTP |
| Barcode/RFID | Inbound | Scan asset tags during audits | Barcode/RFID readers |

---

## Key Fields

| Table | Field | Type | Why It Matters |
|-------|-------|------|----------------|
| `alm_asset` | `number` | String | Auto-number; unique asset identifier |
| `alm_asset` | `asset_tag` | String | Physical sticker number; must be unique |
| `alm_asset` | `category` | Choice | Determines which fields appear |
| `alm_asset` | `state` | Choice | In stock, assigned, in repair, retired |
| `alm_asset` | `serial_number` | String | Manufacturer serial; warranty link |
| `alm_asset` | `purchase_date` | Date | Warranty start, depreciation |
| `alm_asset` | `cost` | Currency | Purchase price; TCO calculation |
| `alm_asset` | `assigned_to` | Reference | Who has the asset |
| `alm_asset` | `location` | Reference | Physical location |
| `alm_asset` | `vendor` | Reference | Who sold it |
| `alm_asset` | `model_id` | Reference | Make/model of asset |
| `alm_asset` | `employment_type` | Choice | Owned, leased, rented |
| `alm_hardware` | `serial_number` | String | Hardware serial number |
| `alm_hardware` | `mac_address` | String | Network MAC address |
| `alm_hardware` | `warranty_expiration` | Date | Warranty end date |
| `ast_contract` | `start_date` | Date | Contract start |
| `ast_contract` | `end_date` | Date | Contract expiration |
| `ast_contract` | `renewal_date` | Date | When to renew |
| `alm_asset_model` | `name` | String | Model name (e.g., "Dell XPS 13") |
| `alm_asset_model` | `manufacturer` | String | Manufacturer (e.g., Dell) |

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Creating assets without categories | Asset form missing fields | Define categories first |
| Duplicate asset tags | Can't identify physical asset | Enforce unique asset tags |
| Missing serial numbers | Can't claim warranty | Record serial at receipt |
| Not retiring old assets | Reports show ghost assets | Retire assets when replaced |
| Creating asset without location | Can't find physical asset | Require location field |
| Confusing asset with CI | Duplicate records | Understand asset vs CI distinction |
| Not linking contract to asset | Missed renewal dates | Link contract to asset |
| Backdating purchase dates | Wrong depreciation | Use actual purchase date |

---

## Lab: Create Your First Asset

1. **Navigate** to All > Asset Management > Assets > All
2. **Click New** and fill:
   - Name: Laptop for Sarah - Dell XPS 13
   - Category: Hardware > Computer > Laptop
   - Asset Tag: AST-001234
   - Serial Number: FCH12345678
   - State: In Stock
   - Purchase Date: Today's date
   - Cost: 1200.00
   - Vendor: Dell Technologies
   - Model: Dell XPS 13 (create if needed)
   - Location: New York Office
3. **Submit** and note the asset number
4. **Open** the asset record → change State to "Assigned"
5. **Set** Assigned To: Select an employee (e.g., Sarah Jenkins)
6. **Add** a note: "Issued to Sarah for her new role"
7. **Create** a contract record:
   - Name: Dell Support Contract 2026
   - Vendor: Dell Technologies
   - Start Date: Today
   - End Date: 3 years from today
   - Contract Value: 300.00
8. **Link** the contract to the asset in Related Lists
9. **Change** asset state to "Retired" (simulate end of life)
10. **Verify** in Related Lists: CI, Contracts, Transfers, History

---

## Quiz

1. What is the difference between `alm_asset` and `cmdb_ci`?
2. Which table holds software license information?
3. What are the asset lifecycle states?
4. Why is asset tag critical?
5. How do you link an asset to a contract?
