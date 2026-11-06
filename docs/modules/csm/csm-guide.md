# CSM — Customer Service Management

**Agent:** opencode  
**Date:** 2026-11-05  
**Module:** CSM (Customer Service Management)  
**App:** CSM  
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
- [Lab: Create Your First Customer Case](#lab-create-your-first-customer-case)
- [Quiz](#quiz)

---

## Purpose

Customer Service Management (CSM) is ServiceNow's platform for managing customer-facing service operations. Unlike ITSM (which is internal IT-facing), CSM is built for **customer-facing** support: cases, accounts, entitlements, and SLAs that apply to paying customers. CSM includes a customer-facing portal, agent workspace, and entitlement-based SLAs.

---

## Where to Find It

| Breadcrumb | Path |
|------------|------|
| Module entry | All > Customer Service > ... |
| Cases | All > Customer Service > Cases > All |
| Accounts | All > Customer Service > Accounts |
| Consumers | All > Customer Service > Consumers |
| Entitlements | All > Customer Service > Administration > Entitlements |
| Case Types | All > Customer Service > Administration > Case Types |
| CSM Portal | All > Customer Service > Customer Service Portal |
| Administration | All > Customer Service > Administration > ... |

**Tip:** If menus are missing, verify the `com.snc.customerservice` plugin is active (System Definition → Plugins).

---

## Re-usable Code / Metadata

### Scoped Application

CSM ships as a scoped application (`com.snc.customerservice`).

| Scope Aspect | Detail |
|--------------|--------|
| Scope name | `com.snc.customerservice` |
| Tables | `sn_customerservice_case`, `customer_account`, `sn_customerservice_entitlement`, etc. |
| Roles | `sn_customerservice_agent`, `sn_customerservice_manager`, `sn_customerservice.customer` |

### Meta Data Patterns

| Metadata Element | Example | Notes |
|------------------|---------|-------|
| Application menu | `sn_customerservice.menu.main` | CSM left-nav root |
| Module | `sn_customerservice.menu.cases` | Points to case list |
| Case type | `sn_customerservice.case_type.billing` | Defines workflow per case type |
| Choice list | `sn_customerservice.case_state` | New, In Progress, Resolved, Closed |
| UI Policy | `sn_customerservice.policy.entitlement_required` | Hides fields when no entitlement |

### Re-usable Code Snippets

#### Business Rule: Auto-assign Case Based on Account

```javascript
(function rule(current, previous) {
    if (current.operation() == 'insert' && current.account && !current.assignment_group) {
        var gr = new GlideRecord('sn_customerservice_account');
        gr.addQuery('sys_id', current.account);
        gr.query();
        if (gr.next() && gr.assignment_group) {
            current.assignment_group = gr.assignment_group;
        }
    }
})(current, previous);
```

#### Business Rule: Validate Entitlement on Case Create

```javascript
(function rule(current, previous) {
    if (current.operation() == 'insert' && current.entitlement) {
        var gr = new GlideRecord('sn_customerservice_entitlement');
        gr.addQuery('sys_id', current.entitlement);
        gr.addQuery('state', 'active');
        gr.query();
        if (!gr.next()) {
            current.setAbortAction(true);
            gs.addErrorMessage('Selected entitlement is not active. Case cannot be created.');
        }
    }
})(current, previous);
```

#### UI Policy: Show/Hide Fields Based on Case Type

```javascript
(function rule(current) {
    if (current.case_type == 'billing') {
        g_form.setVisible('billing_account', true);
        g_form.setMandatory('billing_account', true);
        g_form.setHidden('technical_contact', true);
    } else if (current.case_type == 'technical') {
        g_form.setVisible('technical_contact', true);
        g_form.setMandatory('technical_contact', true);
        g_form.setHidden('billing_account', true);
    } else {
        g_form.setHidden('billing_account', true);
        g_form.setHidden('technical_contact', true);
    }
})(current);
```

#### Script Include: CSM Helper

```javascript
var CSMHelper = Class.create();
CSMHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getCustomerCases: function() {
        var accountSysId = this.getParameter('accountSysId');
        var gr = new GlideRecord('sn_customerservice_case');
        gr.addQuery('account', accountSysId);
        gr.addQuery('state', '!=', 'closed');
        gr.query();
        var results = [];
        while (gr.next()) {
            results.push({
                number: gr.getValue('number'),
                state: gr.getDisplayValue('state'),
                priority: gr.getDisplayValue('priority'),
                sys_id: gr.getValue('sys_id')
            });
        }
        return JSON.stringify(results);
    },
    type: 'CSMHelper'
});
```

---

## Out-of-Box Features

| Feature | Description | Where |
|---------|-------------|-------|
| Cases | Customer support cases | All > Customer Service > Cases |
| Accounts | Customer accounts (B2B) | All > Customer Service > Accounts |
| Consumers | Individual consumers (B2C) | All > Customer Service > Consumers |
| Entitlements | Service level agreements per customer | All > Customer Service > Administration > Entitlements |
| Case Types | Categories that drive workflow | All > Customer Service > Administration > Case Types |
| CSM Portal | Customer self-service portal | All > Customer Service > Customer Service Portal |
| Customer Service Workspace | Agent console | All > Customer Service > Agent Workspace |
| Knowledge Base | Self-service articles for customers | All > Knowledge |
| Customer Satisfaction (CSAT) | Post-case satisfaction surveys | All > Customer Service > CSAT |

---

## Key Table Hierarchy

### Core Tables

| Table | Purpose | Extends | Key Fields |
|-------|---------|---------|------------|
| `sn_customerservice_case` | Customer support case | `task` | `number`, `account`, `contact`, `case_type`, `state`, `priority`, `entitlement` |
| `customer_account` | B2B customer account | `task` | `name`, `account_number`, `industry`, `parent_account` |
| `sn_customerservice_consumer` | Individual consumer | `sys_user` | `email`, `phone`, `account` |
| `sn_customerservice_entitlement` | Service entitlement/SLA | `task` | `account`, `start_date`, `end_date`, `coverage_type` |
| `sn_customerservice_sla` | SLA record | `task_sla` | `case`, `entitlement`, `breach_time` |
| `sn_customerservice_product` | Product/asset | `cmdb_ci` | `name`, `serial_number`, `account` |

### Table Relationships

```
customer_account
    │
    ├──► sn_customerservice_case (one account → many cases)
    ├──► sn_customerservice_consumer (one account → many consumers)
    ├──► sn_customerservice_entitlement (one account → many entitlements)
    │
sn_customerservice_case
    │
    ├──► sn_customerservice_sla (one case → many SLAs)
    ├──► sn_customerservice_product (linked products)
    │
sn_customerservice_entitlement
    │
    ├──► sn_customerservice_case (entitlement validates case)
```

### CMDB Integration

| CSM Table | Maps to CMDB Table | Relationship |
|-----------|-------------------|--------------|
| `sn_customerservice_product` | `cmdb_ci` | Extends |
| `sn_customerservice_consumer` | `sys_user` | Extends |
| `customer_account` | Standalone (not CI) | Standalone |

---

## Integrations

| Integration | Direction | Purpose | Protocol |
|-------------|-----------|---------|----------|
| Email | Inbound/Outbound | Create cases from email, send notifications | Email/SMTP |
| Chat/Messaging | Inbound | Live chat, WhatsApp, SMS | Twilio/SMS spokes |
| Salesforce | Bidirectional | Sync accounts and cases | REST/IntegrationHub |
| ERP | Outbound | Sync customer billing data | REST/SOAP |
| Knowledge Base | Inbound | Publish articles to customer portal | Internal |
| CSM Portal | Inbound | Customers create cases via portal | Service Portal |
| SMS | Outbound | Send case updates via SMS | Twilio/SMS spoke |
| Email Notification | Outbound | Case status updates to customers | SMTP |

---

## Key Fields

| Table | Field | Type | Why It Matters |
|-------|-------|------|----------------|
| `sn_customerservice_case` | `number` | String | Auto-number, customer-facing ID |
| `sn_customerservice_case` | `account` | Reference | Drives entitlement, SLA, reporting |
| `sn_customerservice_case` | `contact` | Reference | Who reported; drives auth/comms |
| `sn_customerservice_case` | `case_type` | Choice | Selects workflow and fields |
| `sn_customerservice_case` | `entitlement` | Reference | Validates service level |
| `sn_customerservice_case` | `state` | Choice | New → In Progress → Resolved → Closed |
| `sn_customerservice_case` | `priority` | Choice | Drives SLA and escalation |
| `customer_account` | `name` | String | Customer company name |
| `customer_account` | `account_number` | String | External billing reference |
| `sn_customerservice_entitlement` | `start_date` | Date | Entitlement begins |
| `sn_customerservice_entitlement` | `end_date` | Date | Entitlement expires |
| `sn_customerservice_entitlement` | `coverage_type` | Choice | What is covered (support, parts, etc.) |

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Skipping entitlement setup | SLAs don't trigger, customers billed wrong | Configure entitlements per account |
| Testing portal as admin | Can't see customer experience | Test as actual customer user |
| One case type for everything | Workflow can't differentiate | Create case types per request type |
| Missing account on case | No entitlement/SLA resolution | Always populate account |
| Not setting contact | No notification recipient | Always set contact/consumer |

---

## Lab: Create Your First Customer Case

1. **Navigate** to All > Customer Service > Cases > All
2. **Click New** and fill:
   - Case Type: Billing Inquiry
   - Account: Select existing account (or create one first)
   - Contact: Select contact under that account
   - Entitlement: Select active entitlement for account
   - Short Description: Customer disputing invoice charge
   - Priority: High
3. **Submit** and note the case number
4. **Open** the case → change State to "In Progress"
5. **Add** a work note: "Investigating billing discrepancy"
6. **Change** State to "Resolved" → add Close Code and Close Notes
7. **Observe** CSAT survey may be triggered
8. **Verify** in Related Lists: Tasks, Approvals, Entitlements, Knowledge

---

## Quiz

1. What field determines which case workflow fires?
2. What is the difference between an account and a consumer in CSM?
3. What happens if entitlement is missing on a case?
4. What table stores customer accounts?
5. How does CSM differ from ITSM Incident Management?
