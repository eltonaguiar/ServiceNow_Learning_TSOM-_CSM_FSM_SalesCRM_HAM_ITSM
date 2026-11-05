# ServiceNow Module Guides — TSOM, CSM, FSM, Sales CRM, HAM, ITSM

**Author:** opencode  
**Date:** 2026-11-05  
**Branch:** servicenow-modules-2026-11-05-tsom-csm-fsm-salescrm-ham-itsm  
**Source Repo:** https://github.com/eltonaguiar/ServiceNow_Learning_TSOM-_CSM_FSM_SalesCRM_HAM_ITSM  

---

## Purpose

This repository contains beginner-friendly getting-started guides for six ServiceNow modules:

| Module | Guide | Focus |
|--------|-------|-------|
| **TSOM** | `docs/modules/tsom/tsom-guide.md` | Telecom Service Operations Management |
| **CSM** | `docs/modules/csm/csm-guide.md` | Customer Service Management |
| **FSM** | `docs/modules/fsm/fsm-guide.md` | Field Service Management |
| **Sales CRM** | `docs/modules/sales-crm/sales-crm-guide.md` | Sales CRM |
| **HAM** | `docs/modules/ham/ham-guide.md` | Hardware Asset Management |
| **ITSM** | `docs/modules/itsm/itsm-guide.md` | IT Service Management |

Each guide covers:

- **What the module is** — ELI5 explanation and business purpose
- **Where to find it** — Navigation breadcrumbs in ServiceNow
- **Reusable code** — Script includes, Business Rules, UI Policies you can copy-paste
- **Out-of-box features** — Workflows, playbooks, integrations, metrics, dashboards
- **Key table hierarchy** — Table relationships and CMDB mappings
- **Integrations** — External systems and protocols
- **Key fields** — Critical, useful, optional fields by table
- **Common mistakes** — What to avoid and how to fix
- **Hands-on lab** — Step-by-step walkthrough
- **Quiz** — Knowledge check questions

---

## Repository Structure

```
ServiceNow_Learning_TSOM-_CSM_FSM_SalesCRM_HAM_ITSM/
├── README.md                          # This file
├── SUCCESS_PACK_OPENCODE.MD           # 90-day ServiceNow career landing strategy
├── docs/
│   ├── modules/
│   │   ├── tsom/tsom-guide.md         # Telecom Service Operations Management
│   │   ├── csm/csm-guide.md           # Customer Service Management
│   │   ├── fsm/fsm-guide.md           # Field Service Management
│   │   ├── sales-crm/sales-crm-guide.md # Sales CRM
│   │   ├── ham/ham-guide.md           # Hardware Asset Management
│   │   └── itsm/itsm-guide.md         # IT Service Management
│   ├── methodology/rapid-learning-methodology.md
│   ├── concepts/servicenow-concepts-eli5.md
│   ├── fields/mandatory-vs-critical-fields.md
│   ├── navigation/breadcrumbs-cheatsheet.md
│   ├── common-mistakes/mistakes-to-avoid.md
│   ├── out-of-box/out-of-box-workflows-integrations.md
│   └── success-packs/success-pack-prerequisites.md
├── labs/
│   ├── rest-message-integration/
│   └── remote-table/
├── scripts/
│   ├── creative_search_scan.py        # Tavily/Firecrawl web search scraper
│   └── process_cached_jobs.py         # Cached job data processor
├── data/
│   └── modules.json                   # Machine-readable module metadata
├── .github/
│   └── workflows/
│       └── pages.yml                  # GitHub Actions for GitHub Pages
└── SUCCESS_PACK_OPENCODE.MD           # 90-day ServiceNow career landing strategy
```

---

## The 5-Step Rapid Learning Loop

Every module guide follows the same repeatable process:

| Step | Name | What You Do | Output |
|------|------|-------------|--------|
| 1 | **Orient** | Read the ELI5 glossary + breadcrumbs for the module | Mental map of where things are |
| 2 | **Configure** | Turn the module on (if needed). Set roles. Create a test record. | Working instance with module active |
| 3 | **Build** | Do the lab: create a record, run a flow, call an integration | Tangible artifact (record, flow, integration) |
| 4 | **Verify** | Confirm the artifact works end-to-end | Evidence it works |
| 5 | **Teach Back** | Write a summary using the concept summary template | You can explain it simply |

**Time target:** Complete Steps 1–5 in under 2 hours per module.

---

## How to Use This Repo

1. **New to ServiceNow?** Start with `docs/concepts/servicenow-concepts-eli5.md` (ELI5 glossary).
2. **Learning a specific module?** Pick a module from `docs/modules/`, follow the 5-step loop.
3. **Building an integration?** Start at `labs/rest-message-integration/` or `labs/remote-table/`.
4. **Need a quick reference?** Use `docs/navigation/breadcrumbs-cheatsheet.md` and `scripts/rapid-learning-checklist.md`.
5. **Stuck?** Check `docs/common-mistakes/mistakes-to-avoid.md` first.

---

## Core Principles

1. **No configuration without a purpose.** Every field you touch must map to a business need.
2. **Evidence over memory.** If you can't show it in a screenshot or list view, you haven't learned it.
3. **Break things safely.** Use a developer instance. Never practice on production.
4. **Certifications are a side effect, not the goal.** CSA/CAD come from doing, not memorizing.

---

## GitHub Pages

This repository is deployed to GitHub Pages via GitHub Actions. The site is automatically built and deployed on every push to the `main` branch.

**Live site:** `https://eltonaguiar.github.io/ServiceNow_Learning_TSOM-_CSM_FSM_SalesCRM_HAM_ITSM/`

### Workflow

The `.github/workflows/pages.yml` workflow:
1. Checks out the repository
2. Builds the site (if needed)
3. Deploys to GitHub Pages

---

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/creative_search_scan.py` | Tavily/Firecrawl web search scraper for job discovery |
| `scripts/process_cached_jobs.py` | Cached job data processor for BESTIEJOB |

---

## Data

| File | Purpose |
|--------|---------|
| `data/modules.json` | Machine-readable metadata for all 6 modules including tables, fields, roles, breadcrumbs, OOB features, integrations, quizzes |

---

## Module Quick Reference

| Module | Primary Table | Key Tables | Key Roles |
|--------|-------------|------------|-----------|
| **TSOM** | `sn_tsom_service` | `sn_tsom_service_order`, `sn_tsom_network_element`, `sn_tsom_circuit`, `sn_tsom_alarm` | `sn_tsom.admin`, `sn_tsom.user` |
| **CSM** | `sn_customerservice_case` | `customer_account`, `sn_customerservice_entitlement`, `sn_customerservice_consumer` | `sn_customerservice_agent`, `sn_customerservice.manager` |
| **FSM** | `wm_order` | `wm_task`, `wm_agent`, `wm_territory`, `wm_crew` | `wm_admin`, `wm_dispatcher`, `wm_agent` |
| **Sales CRM** | `sn_sales_opportunity` | `sn_sales_account`, `sn_sales_contact`, `sn_sales_lead`, `sn_sales_quote`, `sn_sales_order` | `sn_sales.admin`, `sn_sales.user` |
| **HAM** | `alm_asset` | `alm_hardware`, `ast_contract`, `alm_asset_model` | `asset`, `itil`, `sn_hamp_admin` |
| **ITSM** | `incident` | `problem`, `change_request`, `change_task`, `task_sla`, `cmdb_ci` | `itil`, `sn_incident.write`, `admin` |

---

*Generated by opencode on 2026-11-05. Part of the ServiceNow_Learning_TSOM-_CSM_FSM_SalesCRM_HAM_ITSM repository at github.com/eltonaguiar/ServiceNow_Learning_TSOM-_CSM_FSM_SalesCRM_HAM_ITSM.*
