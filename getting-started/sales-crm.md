---
layout: default
title: Sales CRM — Getting Started
---

# Sales CRM — Getting Started (2026)

**One line:** Sales CRM runs the motion from lead to cash — lead → opportunity → quote → order → fulfilment — on the same account and product records that CSM and FSM service afterwards.

Back to the [guide index](./index.md) · [CSM](./csm.md) · [FSM](./fsm.md) · [ITSM](./itsm.md) · [TSOM](./tsom.md) · [HAM](./ham.md)

---

## 1. What you actually build

| Stage | Object | Table |
|---|---|---|
| Lead | Prospective customer | `lead` |
| Opportunity | Potential deal on an account | `opportunity` |
| Product offering | Sellable product with pricing/bundles | `sn_prd_pm_product_offering` |
| Quote | Priced proposal from the CPQ configurator | `quote` |
| Order | Confirmed purchase (extends task) | `sn_order_mgmt_order` |
| Fulfilment task | The work steps that deliver it | `sc_task` |
| Post-sale | Sold product → install base → contract/entitlement | `sn_install_base_sold_product`, `sn_install_base_item`, `ast_contract`, `service_entitlement` |

The point that distinguishes Sales CRM from a generic CRM: **fulfilment is not an integration**. When the order fulfils, the sold product and install base records are written into the shared CRM Foundation, and CSM/FSM see them immediately. No batch sync, no middleware.

---

## 2. Out-of-the-box features

- **Sales CRM workspace** — pipeline board, account 360, activity timeline.
- **Lead qualification and conversion** — lead → account + contact + opportunity in one step.
- **Pipeline stages and forecast** — stage probabilities roll into forecast categories.
- **CPQ configurator** — bundles, compatibility rules, option constraints, real-time pricing.
- **Pricing engine** — price lists, discounts, approval thresholds.
- **Quote templates and e-signature** — generate, send, track, accept.
- **Order management** — order → order lines → fulfilment tasks (`sc_task`).
- **Territory management** — who owns which accounts/segments.
- **Approvals** — discount and non-standard terms via Flow Designer approval actions.
- **Now Assist for Sales CRM** — account summaries, email drafting (licence-dependent).
- **Activity and task tracking** — calls, emails, meetings against account/opportunity.

---

## 3. Key table hierarchy

```
lead
└── (qualify) ─► customer_account + customer_contact + opportunity

opportunity
├── quote (CPQ)
│   ├── quote line items ─► sn_prd_pm_product_offering ─► cmdb_model
│   └── approvals (sysapproval_approver)
└── sn_order_mgmt_order (extends task)
    ├── order lines
    ├── sc_task (fulfilment)
    └── (on fulfilment)
        ├── sn_install_base_sold_product
        ├── sn_install_base_item ──► cmdb_ci
        ├── ast_contract
        └── service_entitlement ──► contract_sla
```

Read that bottom block twice: the sales close is what creates the entitlement that CSM later checks on every case. Break it and the service team has no idea what the customer bought.

---

## 4. Reusable code and metadata

### 4.1 Business Rule — stamp the price book on a new quote line (before insert)

```javascript
// Name: Sales - default price book on quote line
// Table: quote_line (or your CPQ line table) | When: before | Insert: true
(function executeRule(current, previous) {
  if (!current.price_book.nil()) return;

  var quote = current.quote.getRefRecord();
  if (quote.price_book.nil()) {
    gs.addErrorMessage('Quote has no price book — set one before adding lines.');
    current.setAbortAction(true);
    return;
  }
  current.price_book = quote.getValue('price_book');
})(current, previous);
```

### 4.2 Script Include — weighted pipeline for an account

```javascript
var SalesPipeline = Class.create();
SalesPipeline.prototype = {
  initialize: function () {},

  weighted: function (accountId) {
    var total = 0;
    var opp = new GlideRecord('opportunity');
    opp.addQuery('account', accountId);
    opp.addQuery('stage', 'NOT IN', '6,7');        // 6 = closed lost, 7 = closed won
    opp.query();
    while (opp.next()) {
      var amount = parseFloat(opp.getValue('amount')) || 0;
      var prob   = parseFloat(opp.getValue('probability')) || 0;
      total += amount * (prob / 100);
    }
    return Math.round(total);
  },

  type: 'SalesPipeline'
};
```

### 4.3 Client Script — require a loss reason before closing an opportunity lost

```javascript
// Table: opportunity | Type: onSubmit
function onSubmit() {
  if (g_form.getValue('stage') === '6' && g_form.getValue('u_loss_reason') === '') {
    g_form.addErrorMessage('A loss reason is required to close an opportunity as lost.');
    return false;
  }
}
```

### 4.4 Discount approval (Flow Designer, OOTB actions)

```
Trigger: Quote updated  (condition: discount_percent > 15)
  → Ask for Approval  (approver = opportunity.owner.manager)
  → If approved  → Update Record: Quote.approval_status = approved
  → Else         → Update Record: Quote.approval_status = rejected; Send Notification
```

### 4.5 Metadata you will actually touch

| Record | Table | Why |
|---|---|---|
| Product offering | `sn_prd_pm_product_offering` | price, bundle, compatibility |
| Price list / book | `price_list`, `price_book` | regional and partner pricing |
| Quote template | `quote_template` | what the customer sees |
| Order model | order management config | fulfilment routing |
| Territory | territory tables | ownership and routing |
| Approval policy | `sys_approval_policy` | discount thresholds |

---

## 5. Integrations

| Direction | Pattern | Notes |
|---|---|---|
| Email/calendar | Microsoft 365 / Google Workspace spoke | log activity on account/opportunity |
| E-signature | DocuSign / Adobe Sign spoke | quote acceptance status back on `quote` |
| ERP | IntegrationHub spoke (SAP/Oracle) | order + invoice, keep CPQ as source of truth for price |
| Marketing automation | REST in/out | lead capture, campaign membership |
| CPQ external | REST `POST /api/now/table/quote` | partner quoting |
| Tax | Avalara/Vertex spoke | calculated on quote lines |
| Data | import set → `lead` / `customer_account` | coalesce on email/domain, never on name |

---

## 6. First lab (90 minutes, PDI)

1. Create a lead, qualify it, and inspect the account/contact/opportunity it produced.
2. Build a product offering with two options and a bundle; add a price list.
3. Create a quote, configure the bundle, apply a 20% discount and trigger the approval.
4. Convert the accepted quote to an order and follow the fulfilment `sc_task`.
5. Confirm `sn_install_base_sold_product` and `sn_install_base_item` now exist — then open a CSM case on that account and watch the entitlement resolve.
6. Run the weighted pipeline Script Include against the account and check the number.

---

## 7. Mistakes that get flagged in review

- **Modelling products as catalogue items (`sc_cat_item`).** Products are `cmdb_model`/product offerings; catalogue items are how employees order.
- **Skipping the quote and creating orders by hand.** You lose pricing, approvals, and the audit trail.
- **Custom stage values.** Forecasts and dashboards key off the OOTB stage set.
- **Duplicating account data "for sales".** One `customer_account`, always.
- **Treating fulfilment as an integration project.** It is a state transition inside one data model.
- **Discount approval in a Business Rule.** Use the approval policy so it is auditable.

---

## 8. Where to go next

- [CSM](./csm.md) — what happens to the entitlement you just created.
- [FSM](./fsm.md) — when the sold product needs an on-site install.
- Longer walkthrough: `docs/modules/sales-crm/sales-crm-guide.md`.
