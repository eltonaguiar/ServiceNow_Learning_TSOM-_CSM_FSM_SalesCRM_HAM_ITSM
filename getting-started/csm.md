---
layout: default
title: CSM — Getting Started
---

# CSM — Getting Started (2026)

**One line:** CSM answers three questions on every interaction — *who is the customer, what do they own, what are they entitled to* — and ties them to one record: the case.

Back to the [guide index](./index.md) · [ITSM](./itsm.md) · [FSM](./fsm.md) · [TSOM](./tsom.md) · [Sales CRM](./sales-crm.md) · [HAM](./ham.md)

---

## 1. What you actually build

| Object | Table | Why it exists |
|---|---|---|
| Case | `sn_customerservice_case` | The central record; extends `task` |
| Account | `customer_account` | B2B company (extends `core_company`) |
| Contact | `customer_contact` | A person at an account (extends `sys_user`) |
| Consumer | `csm_consumer` | B2C individual — **not** a `sys_user` |
| Household | `csm_household` | Consumers sharing an address/products |
| Entitlement | `service_entitlement` | SLA tier, support hours, covered channels |
| Contract | `ast_contract` | The commercial promise behind the entitlement |
| Install Base Item | `sn_install_base_item` | The specific deployed unit (serial) the customer owns |
| Sold Product | `sn_install_base_sold_product` | What was sold, created when a sales order fulfils |
| Interaction | `interaction` | One conversation (call/chat/email) that may spawn cases |

**The CSM mindset change from ITSM:** in ITSM the CI is the subject; in CSM the *customer* is the subject and the CI is what they own. A case is a task, so assignment, SLA and state all behave like ITSM — the difference is the entitlement check that decides *whether* you owe service at all.

---

## 2. Out-of-the-box features

- **CSM Configurable Workspace** — the agent UI: case list, contextual side panel, playbooks. Not the classic form.
- **Playbooks** — guided process lane per case type (verify → diagnose → resolve → close) with required steps.
- **Case types** and **case templates** — different fields/process per product line without forking the table.
- **Entitlement engine** — `service_entitlement` + `contract_sla` automatically pick the SLA when a case opens; entitlement check can block or warn.
- **Advanced Work Assignment (AWA)** — queue and skill-based routing across chat, case, and messaging channels.
- **Omnichannel** — email, web form, chat, voice (CTI via OpenFrame), SMS/WhatsApp through Digital Messaging.
- **Agent Assist / Now Assist for CSM** — similar-case search, case summarisation, reply drafting (licence-dependent).
- **Customer and Consumer Service Portals** — self-service case creation, knowledge, approvals.
- **Universal Request** (`universal_request`) — one front door that fans out to CSM/ITSM/HR.
- **Knowledge + Communities + Surveys** — deflection, peer answers, CSAT after closure.
- **Performance Analytics for CSM** — first contact resolution, case ageing, backlog by account.

---

## 3. Key table hierarchy

```
customer_account (extends core_company)
├── customer_contact (extends sys_user)        people at the account
├── csm_consumer                              B2C individuals (no login by default)
│   └── csm_consumer_user (extends sys_user)  their login record
├── csm_household                             groups of consumers
├── service_entitlement  ──► contract_sla     what they are owed
├── ast_contract                              the commercial agreement
├── sn_install_base_sold_product              what was sold
│   └── sn_install_base_item ──► cmdb_ci      the deployed unit
└── sn_customerservice_case (extends task)    the work
    ├── task_sla                              clock chosen by the entitlement
    ├── interaction                           the conversation that produced it
    └── kb_knowledge                          article used / written
```

Relationships that matter:

- `sn_customerservice_case.account` / `.contact` / `.consumer` — pick the right one; a case with none is a data-quality bug.
- `sn_customerservice_case.entitlement` → `service_entitlement` — drives the SLA.
- `sn_install_base_item.install_base_ci` → `cmdb_ci` — what the customer actually has.
- `interaction` → case — one chat can create several cases; one case can span several interactions.

---

## 4. Reusable code and metadata

### 4.1 Business Rule — block a case with no entitlement (before insert)

```javascript
// Name: CSM - require entitlement or explicit override
// Table: sn_customerservice_case | When: before | Insert: true
(function executeRule(current, previous) {
  if (current.entitlement.nil() && current.u_entitlement_override != true) {
    current.setAbortAction(true);
    gs.addErrorMessage('No active entitlement for this account. ' +
                       'Set an override reason or route to sales.');
  }
})(current, previous);
```

### 4.2 Script Include — entitlement lookup for an account/product pair

```javascript
var CsmEntitlement = Class.create();
CsmEntitlement.prototype = {
  initialize: function () {},

  find: function (accountId, productModelId) {
    var gr = new GlideRecord('service_entitlement');
    gr.addQuery('account', accountId);
    gr.addQuery('active', true);
    gr.addQuery('valid_to', '>=', new GlideDateTime().getDate());
    if (productModelId) {
      gr.addQuery('product', productModelId).addOrCondition('product', '');
    }
    gr.orderByDesc('priority');           // most specific tier first
    gr.setLimit(1);
    gr.query();
    return gr.next() ? gr.getUniqueValue() : null;
  },

  type: 'CsmEntitlement'
};
```

### 4.3 Client Script — show the household only for consumer cases

```javascript
// Table: sn_customerservice_case | Type: onChange | Field: consumer
function onChange(control, oldValue, newValue, isLoading) {
  if (isLoading) return;
  g_form.setDisplay('household', newValue !== '');
  if (newValue === '') g_form.clearValue('household');
}
```

### 4.4 Flow Designer snippet (pseudo-actions, real names)

```
Trigger: Case created
  → If  Case.Entitlement is empty
      → Look up Entitlement (Script Include CsmEntitlement)
      → Update Record: Case.Entitlement, Case.SLA = entitlement.sla
  → Ask for Approval (manager) when Priority = 1 and Account.tier = Platinum
  → Send Notification (email action, template "CSM - case acknowledged")
```

### 4.5 Metadata you will actually touch

| Record | Table | Why |
|---|---|---|
| Case type | `csm_case_type` (via Case Type Manager) | per-product process and fields |
| Entitlement | `service_entitlement` | SLA tier, hours, channels |
| SLA definition | `contract_sla` | the clock behind the entitlement |
| Playbook | `sys_hub_flow` + playbook config | guided agent steps |
| Assignment/AWA queue | `awa_queue`, `awa_work_item` | routing |
| Portal widget | `sp_widget` / `sp_page` | self-service page |
| Notification | `sysevent_email_action` | customer comms |

---

## 5. Integrations

| Direction | Pattern | Notes |
|---|---|---|
| Voice | CTI via OpenFrame / partner connector → `interaction` | screen-pop to the right account/contact |
| Chat / messaging | Digital Messaging + AWA | one queue for chat, SMS, WhatsApp |
| Email | inbound email actions → case or interaction | threading via `watermark` |
| Outbound REST | `RESTMessageV2` to order status, logistics, billing | cache the response on the case |
| Flow spokes | Salesforce, SAP, Jira, Teams, Twilio | prefer spokes over custom scripts |
| Identity | SSO/SCIM for consumer portal users | `csm_consumer_user` |
| Data | IntegrationHub import → `sn_install_base_item` from ERP | coalesce on serial + account |

---

## 6. First lab (90 minutes, PDI)

1. Create an account, two contacts, and one consumer with a household.
2. Create a product model, a sold product, and two install base items linked to CIs.
3. Create an entitlement covering "Gold, 24×5, email+chat" and its SLA definition.
4. Open a case from the account as a chat interaction; watch the entitlement and `task_sla` populate.
5. Attempt a case with no entitlement — confirm the business rule blocks it.
6. Configure an AWA queue by skill, assign yourself, and take the case from the workspace.
7. Publish a knowledge article from the case resolution and confirm it appears in the portal search.

---

## 7. Mistakes that get flagged in review

- **Using `incident` for customer issues.** Cases and incidents are separate for a reason (data segregation, entitlement, portal visibility).
- **Treating `csm_consumer` as a user.** It is not a `sys_user`; the login is `csm_consumer_user`.
- **Hard-coding SLA on the case.** The entitlement picks it — that is the whole point of the module.
- **Skipping `interaction`.** Without it you cannot report channel mix or first-contact resolution.
- **Custom fields instead of case types.** Case types exist so you don't fork the table per product.
- **Portal widgets with no ACL review.** Consumer-facing reads are the most common data-leak finding in CSM audits.

---

## 8. Where to go next

- [FSM](./fsm.md) — the same account/install-base/entitlement data, dispatched to a technician.
- [Sales CRM](./sales-crm.md) — where the sold product, contract and entitlement are actually created.
- Longer walkthrough: `docs/modules/csm/csm-guide.md`.
