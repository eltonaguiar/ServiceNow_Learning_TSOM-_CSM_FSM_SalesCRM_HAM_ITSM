# Salesforce Navigation & Breadcrumb Reference

**Agent:** opencode  
**Date:** 2026-11-10  
**Platform:** Salesforce  
**Purpose:** Quick-reference breadcrumb paths for administration and development  
**Confidence:** high  

<p class="meta" style="margin-bottom: 24px;"><a href="../../index.md">← Back to ServiceNow Module Guides</a> · Separate track from ServiceNow</p>

---

## Contents

- [App Launcher & Home](#app-launcher--home)
- [Setup Navigation Tree](#setup-navigation-tree)
- [Object & Field Configuration](#object--field-configuration)
- [Security & Access](#security--access)
- [Automation](#automation)
- [Development (Code)](#development-code)
- [Integration](#integration)
- [Deployment & DevOps](#deployment--devops)
- [Monitoring & Troubleshooting](#monitoring--troubleshooting)
- [Data Management](#data-management)

---

## App Launcher & Home

| Task | Path |
|------|------|
| Home dashboard | Home |
| All apps | App Launcher (9-dot grid, top-left) |
| Switch apps | App Launcher > [App Name] |
| User profile & settings | Click your avatar (top-right) > Settings |
| Switch to Setup | Click your avatar > Setup |
| Return to classic / lightning | Setup > Switch to Salesforce Classic / Lightning Experience |

---

## Setup Navigation Tree

The gear menu (⚙️) > **Setup** opens the left-hand navigation panel. Key sections:

| Section | Path | What You Do Here |
|---------|------|------------------|
| Users | Setup > Users > Users | Create users, reset passwords, deactivate |
| Profiles | Setup > Profiles | Set object/field permissions, login hours |
| Permission Sets | Setup > Permission Sets | Grant extra access beyond profiles |
| Roles | Setup > Roles | Set record-level sharing hierarchy |
| Permission Set Groups | Setup > Permission Set Groups | Bundle multiple permission sets |
| Sharing Settings | Setup > Sharing Settings | Org-wide defaults, manual sharing |
| Field-Level Security | Setup > Object Manager > [Object] > Fields & Relationships > [Field] > Set Field-Level Security | Control who sees each field |

---

## Object & Field Configuration

| Task | Path |
|------|------|
| Object Manager home | Setup > Object Manager |
| View/edit an object | Setup > Object Manager > [Object Name] |
| Create custom object | Setup > Object Manager > Create > Custom Object |
| Fields & Relationships | Setup > Object Manager > [Object] > Fields & Relationships |
| Create custom field | Setup > Object Manager > [Object] > Fields & Relationships > New |
| Page Layouts | Setup > Object Manager > [Object] > Page Layouts |
| Compact Layouts | Setup > Object Manager > [Object] > Compact Layouts |
| Record Types | Setup > Object Manager > [Object] > Record Types |
| Validation Rules | Setup > Object Manager > [Object] > Validation Rules |
| Formula Fields | Setup > Object Manager > [Object] > Fields & Relationships > New > Formula |
| Roll-Up Summary Fields | Setup > Object Manager > [Parent Object] > Fields & Relationships > New > Roll-Up Summary |
| Buttons, Links, Actions | Setup > Object Manager > [Object] > Buttons, Links, and Actions |
| Search Layouts | Setup > Object Manager > [Object] > Search Layouts |

---

## Security & Access

| Task | Path |
|------|------|
| Profiles | Setup > Profiles > [Profile Name] |
| Permission Sets | Setup > Permission Sets > [Permission Set Name] |
| Permission Set Groups | Setup > Permission Set Groups > [Group Name] |
| Roles | Setup > Roles > Roles |
| Sharing Settings (OWD) | Setup > Sharing Settings |
| Manual Sharing | On a record page: Sharing button |
| Field-Level Security | Setup > Object Manager > [Object] > Fields & Relationships > [Field] > Set Field-Level Security |
| Login Hours | Setup > Profiles > [Profile] > Login Hours |
| Login IP Ranges | Setup > Profiles > [Profile] > Login IP Ranges |
| Session Settings | Setup > Session Settings |
| Identity Verification | Setup > Identity Verification |
| Connected Apps (OAuth) | Setup > App Manager > Connected Apps |
| Named Credentials | Setup > Named Credentials |
| External Credentials | Setup > External Credentials |

---

## Automation

| Task | Path |
|------|------|
| Flow Builder home | Setup > Flows |
| Create new flow | Setup > Flows > New Flow |
| Process Builder (**retired**) | No Setup page — read-only at best. Build new automation in Flow |
| Workflow Rules (**retired**) | No Setup page. Build new automation in Flow (record-triggered) |
| Flows (the replacement) | Setup > Flows |
| Approval Processes | Setup > Approval Processes |
| Email Templates | Setup > Email Templates |
| Outbound Messages | Setup > Outbound Messages |

---

## Development (Code)

| Task | Path |
|------|------|
| Apex Classes | Setup > Apex Classes |
| Create Apex Class | Setup > Apex Classes > New |
| Triggers | Setup > Apex Triggers |
| Visualforce Pages | Setup > Visualforce Pages |
| Visualforce Components | Setup > Visualforce Components |
| Lightning Components (LWC/Aura) | Setup > Lightning Components |
| Create LWC | Setup > Lightning Components > New > Lightning Web Component |
| Anonymous Apex | Developer Console > Debug > Open Execute Anonymous Window |
| Developer Console | Gear menu (⚙️) > Developer Console |
| Workbench (external tool) | https://workbench.developerforce.com (query, inspect, update) |
| Salesforce CLI | Command line: `sf` (formerly `sfdx`) |

---

## Integration

| Task | Path |
|------|------|
| Remote Site Settings | Setup > Remote Site Settings |
| Named Credentials | Setup > Named Credentials |
| External Credentials | Setup > External Credentials |
| Connected Apps | Setup > App Manager > Connected Apps |
| External Data Sources | Setup > External Data Sources |
| Platform Events | Setup > Platform Events |
| Outbound Messages | Setup > Outbound Messages |

---

## Deployment & DevOps

| Task | Path |
|------|------|
| Sandboxes | Setup > Sandboxes |
| Change Sets | Setup > Deploy > Change Sets |
| Deployed Components | Setup > Deploy > Deployed Components |
| Inbound Change Sets | Setup > Deploy > Inbound Change Sets |
| Apex Test Execution | Setup > Apex Test Execution |
| Code Coverage | Setup > Apex Classes > [Class] > Code Coverage |
| Salesforce CLI (command line) | `sf project deploy start`, `sf project retrieve start` |
| Deployment Settings | Setup > Deploy > Deployment Settings |
| Deployment Status | Setup > Deploy > Deployment Status |
| Sandbox Templates | Setup > Sandboxes > Sandbox Templates |
| DevOps Center (if enabled) | Setup, search "DevOps Center" |
| Release engineering training | [DevOps Engineer track](./devops-engineer.md) |

---

## Monitoring & Troubleshooting

| Task | Path |
|------|------|
| Debug Logs | Setup > Debug Logs |
| Trace Flags | Setup > Trace Flags |
| Apex Jobs / Scheduled Jobs | Setup > **Background Jobs** (Apex Jobs and Scheduled Jobs were consolidated into one page; the old separate Setup > Apex Jobs and Setup > Scheduled Jobs paths no longer exist) |
| Batch and Queueable jobs | Setup > Background Jobs |
| Scheduled Flow jobs | Setup > Background Jobs (or the Flow's own schedule) |
| Batch Apex | Setup > Apex Classes > [Batch Class] > Schedule |
| Platform Events (monitor) | Setup > Platform Event Monitoring |
| Optimizer | Setup > Optimizer |
| System Status | https://status.salesforce.com (external) |
| Trust Site | https://trust.salesforce.com (external) |

---

## Data Management

| Task | Path |
|------|------|
| Data Import Wizard | Setup > Data > Data Import Wizard |
| Data Loader | Download from Setup > Data > Data Loader |
| Export | Setup > Data > Export |
| Export All | Setup > Data > Export All |
| Backups | Setup > Data > Backups |
| Bulk Data Load Jobs | Setup > Bulk Data Load Jobs |
| Duplicate Rules | Setup > Duplicate Rules |
| Matching Rules | Setup > Matching Rules |
| External Objects | Setup > External Data Sources > [Source] > External Objects |

---

## Quick Reference: Common "Where Is It?" Questions

| Question | Answer |
|----------|--------|
| "Where do I create a custom field?" | Setup > Object Manager > [Object] > Fields & Relationships > New |
| "Where do I write Apex code?" | Setup > Apex Classes > New (or Developer Console) |
| "Where do I make a field required?" | Setup > Object Manager > [Object] > Fields & Relationships > [Field] > Edit > Required, or Validation Rule |
| "Where do I see debug logs?" | Setup > Debug Logs |
| "Where do I set up API access?" | Setup > Remote Site Settings or Setup > Named Credentials |
| "Where do I add a user?" | Setup > Users > New User |
| "Where do I build an automation without code?" | Setup > Flows > New Flow |

---
