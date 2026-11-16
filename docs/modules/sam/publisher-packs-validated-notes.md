# Publisher Pack Notes — Validation Log

**Date:** 2026-11-16
**Companion page:** [SAM Guide](../sam-guide/)
**Scope:** every publisher-pack claim in the SAM guide's *Publisher Packs & License Metrics* section, re-checked against ServiceNow's public Brazil-release documentation.

---

## Why this page exists

The guide's publisher-pack section was first drafted from the `ALT_PARALLELSWARM_SAM` research corpus, which mixes verified, corroborated and unverified material. This page records **which of those claims survive a direct check against the primary documentation**, the exact wording each one rests on, and which claims were deliberately left out or corrected.

Rule for this page: a statement is only called **Validated** if it can be read in the Brazil text of a linked page below. Everything else is labelled.

### Status legend

| Status | Meaning |
|---|---|
| **Validated** | Stated on a ServiceNow Brazil doc page listed in Sources. Safe to teach and quote. |
| **Corroborated** | Consistent across two independent sources (e.g. ServiceNow page + vendor contract/SPD), but not stated on a ServiceNow Brazil page. Safe to teach with attribution. |
| **Unverified** | Corpus-only, release-dependent, or instance-dependent. Do not teach as fact; check the instance. |

### Sources (fetched 2026-11-16, all public)

| # | Page | Updated |
|---|---|---|
| S1 | [Software license metrics](https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/c_SAMLicenseMetrics.html) | 2026-09-10 |
| S2 | [SAM publisher pack for Adobe](https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/adobe-publisher-pack.html) | 2026-09-10 |
| S3 | [SAM publisher pack for Citrix](https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/citrix-publisher-pack.html) | 2026-09-10 |
| S4 | [SAM publisher pack for IBM](https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/ibm-publisher-pack.html) | 2026-09-10 |
| S5 | [SAM publisher pack for Microsoft](https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/microsoft-publisher-pack.html) | 2026-09-10 |
| S6 | [Microsoft Per Core (with CAL) licensing rules](https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/microsoft-percore-withcal.html) | 2026-09-10 |
| S7 | [SAM publisher pack for Oracle](https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/oracle-publisher-pack.html) | 2026-09-10 |
| S8 | [SAM publisher pack for SAP](https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/sap-publisher-pack.html) | 2026-09-10 |
| S9 | [SAM publisher pack for VMware](https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/vmware-publisher-pack.html) | 2026-09-10 |
| S10 | [Software Asset Management properties](https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/sam-properties.html) | 2026-03-12 |
| S11 | [Oracle licensing in soft-partitioned environments](https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/oracle-licensing-soft-partitioned-environments.html) | 2026-09-10 |
| S12 | [Software entitlement fields](https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/software-entitlement-fields.html) | 2026-09-10 |
| S13 | [Software Asset Management release notes](https://www.servicenow.com/docs/r/release-notes/software-asset-management-rn.html) | 2026-09-10 |
| S14 | [Software model fields](https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/software-model-fields.html) | 2026-09-10 |
| S15 | [Add a custom license metric](https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/add-custom-license-metric.html) | 2026-11-05 |
| S16 | [Create an entitlement (Foundation)](https://www.servicenow.com/docs/r/it-service-management/software-asset-management-foundation-plugin/t_AddASoftwareEntitlementSAMF.html) | 2026-10-08 |
| S17 | [Software model metric attributes](https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/sw-metric-attributes.html) | 2026-09-10 |
| S18 | [Supported Microsoft license types](https://www.servicenow.com/docs/r/it-asset-management/software-asset-management/supported-microsoft-license-types.html) | 2026-09-10 |

---

## Metric group — what the primary docs actually say

**Validated (S12, *Software entitlement fields*):**

- "Metric group: This field is automatically populated based on the Software Model field. Each metric group has a set of license metrics that are specific to the software publisher."
- "Note: If this field is set to Consumption or Subscription, the License type field is automatically set to Subscription."
- "License metric: License metric for the license group that the software license is counted against when reconciliation is run. The options for license metric change based on the Metric group field."

**Validated (S14, *Software model fields*):** the model's Software Entitlements tab repeats the same pair of definitions, and the **Metric Attributes** related list is keyed by metric group + license metric with the attribute types `Maximum active OSEs per server`, `Maximum installs per OSE`, `Maximum installs per right`, `Maximum processors per right`, `Minimum users per processor`, `Minimum cores per processor`, `Minimum cores per server`, each with an integer value or an *unlimited* flag. So the group is declared on the model and inherited by the entitlement — not typed fresh on every entitlement.

**Validated (S15, *Add a custom license metric*):** the module is `All > Software Asset > Administration > Custom License Metrics`; the form's **Metric group** is fixed to **Custom**, so a scripted metric surfaces by its *name* in the entitlement's License metric picker.

**Validated (S16, Foundation):** Foundation's create-entitlement form offers **Common** only (plus custom metrics). The publisher groups are a Professional capability, which matches the edition split recorded above.

**Still unverified:** "The Metric group selected does not have to correspond to the publisher of the software title" (corpus only). The narrower claim — each group carries publisher-specific metrics — is validated and compatible with either reading, so the guide keeps the stronger sentence labelled as observed practice rather than platform rule.

**Confusion to keep flagging:** "metric group" (counting-rule family) vs the reconciliation **group** (`com.snc.samp.recon.group` — Company / Cost Center / Country / Department / Region / None). Different fields, different jobs, names that collide.

### Metric attributes — validated defaults

**Validated (S17, *Software model metric attributes*):** the related list is keyed by metric group + license metric + attribute, with an integer `Attribute value` and an `Attribute value is unlimited` flag; each attribute's own description carries the formula the engine applies. Documented defaults:

- **Microsoft** — Per Core: `Minimum cores per processor` 4, `Minimum cores per VM` 4. Per Core (with CAL): 8 / 8, `Minimum cores per server` 16, `Maximum active OSEs per server` 2, `Maximum installs per OSE` 1. Per Processor: `Maximum processors per right` 2, `Maximum active OSEs per server` 2, `Maximum installs per OSE` 1. Server (Per Instance): `Maximum installs per OSE` 1.
- **Oracle** — Per Processor: `Maximum number of sockets per server` 2, `Maximum size of instance on cloud` 8. Named User Plus: `Minimum users per processor` 25, `Minimum NUPs` 5, `Minimum NUPs per server` 10, `Minimum NUPs on cloud` 10, WebLogic on-premise 10, WebLogic cloud 10, socket cap 2, cloud instance size 8.
- **VMware** — Per Processor: `Maximum cores per processor` 32 ("effective April 2, 2020, VMware requires one license for up to 32 physical cores"). Per Application Instance: `Maximum installs per right` 1.
- **Red Hat** — Per Socket-pair: `Maximum sockets per right` 2, `Maximum VMs per right` 2.
- **IBM / Citrix / Common** — Per Processor: `Maximum cores per processor` unlimited. **Common Per Core**: `Minimum cores per processor` 1.
- **Per user / per device metrics across groups** — `Maximum installs per right` is **unlimited** by default.

**Validated (S18, *Supported Microsoft license types*):** attributes are what turn metric descriptions into arithmetic — Per Processor "a right is consumed for processors … the quantity of processors licensed by a single right is determined by the Maximum processor per rights"; Per Core (with CAL) consumes the minimum when "the core count is less than the specified value in either the Minimum cores per processor or Minimum cores per server metric attributes"; Per Core checks `Minimum cores per processor` before consuming rights.

**Upgraded from unverified:** the SQL Server *"4 cores per socket"* floor was previously listed as Microsoft contract only — S17 documents `Minimum cores per processor = 4` for Microsoft Per Core, so the floor ships in the platform. The rule's origin is still Microsoft's licensing, which is why the guide ties overrides to contract clauses.

**Still hardcoded, not attributes:** VMware Per Core's 16-cores-per-processor minimum, VVEP's 3 × 2 × 32 cap, Oracle/IBM core-factor tables (`samp_processor_definition`). Recorded so nobody hunts for a row that does not exist.

---

## Pack matrix — validated essentials

| Pack | Plugin ID (validated) | Source | Metric group visible only with pack |
|---|---|---|---|
| Adobe | `com.sn_samp_adobe` | S2 | Adobe |
| Citrix | `com.sn_samp_citrix` | S3 | Citrix |
| IBM (incl. Red Hat) | `com.sn_samp_ibm` | S4 | IBM, Red Hat |
| Microsoft | `com.snc.samp.microsoft` | S5 | Microsoft |
| Oracle | `com.snc.samp.oracle` | S7 | Oracle |
| SAP | `com.sn_samp_sap` | S8 | SAP |
| VMware | `com.sn_samp_vmware` | S9 | VMware |
| Engineering Applications | `sn_samp_eng_app` | S1 | Common → Concurrent Licenses metrics |
| SaaS License Management | (adds groups, no pack plugin named) | S1 | Subscription, Consumption |

**Validated:** "Adobe, Citrix, IBM (includes both IBM and Red Hat), Microsoft, Oracle, SAP, and VMware publisher packs are available as add-ons" (S1). "Installing SaaS License Management adds the Subscription and Consumption metric groups" (S1). Each pack page names its plugin with the instruction to activate it, e.g. "activate the Software Asset Management Professional for Oracle plugin (`com.snc.samp.oracle`)" (S7).

**Validated, often missed:** the IBM pack page states it "is available as part of the Software Asset Management Professional (`com.snc.samp`) plugin" and that it "does not require the legacy IBM PVU Process Pack" (S4). The Red Hat metrics sit behind the same pack (S1: "Red Hat license metrics are visible only if the IBM publisher pack is installed").

**Unverified:** `com.sn_samp_master_ws`, `com.snc.sams` (Foundation) — corpus-only identifiers; the Foundation/Professional split is corroborated elsewhere in this docs set but the IDs are not on the pages above.

---

## Adobe

**Validated (S2):**
- Pack adds Adobe-specific options on the entitlement; you must **select the Adobe metric group** to see them.
- Agreement types: Generic, **ETLA**, **CLP**, **TLP**, **VIP**.
- Metrics: Per Device, Per User, User Subscription.
- Adobe Cloud integration profile compares subscriptions against installations; dashboard is "Office 365 & Adobe Cloud".
- Reports: *Adobe Cloud Users without Installations*, *Underused Adobe Cloud Installations*.

**Validated (S1):** User Subscription consumes "a right … for each active unique software subscription record assigned to a user", with the three states — **Allocated in use** (allocation + subscription), **Not Allocated in use** (subscription, no allocation), **Allocated not in use** (allocation, no subscription). Multi-right allocations split: "a user has a user allocation with two rights but only one subscription record … one right is considered Allocated in use and the second right is considered Allocated not in use."

**In-instance check:** entitlement → Metric group = Adobe → License metric picker shows the three metrics; Adobe Cloud integration profile exists; *Allocated not in use* count > 0 is your reclaim queue.

---

## Citrix

**Validated (S3):**
- Two licensing models: **concurrent** (license checked out for the session, returned on disconnect) and **User/Device** (assigned to a user or a shared device; user = unlimited devices, device = unlimited users).
- Data comes from the **Citrix License Server**, and admins "must create a Discovery schedule to run on the Citrix discovery pattern"; Discovery uses **OData APIs** against the **Delivery Controller** to identify third-party apps delivered through the farm.
- Access mapping: if users are mapped at **both** Delivery Group and Application Group level, SAM "considers mappings at only the Application Group level".
- Compliance is based on **potential access**, not observed launches.

**Validated (S1):** Per User/Device "checks the compliance of all related software models based on the number of distinct users and devices". Per Processor = CPU count on physical server or VM. Per User through a client access record licenses the accessing users.

**Validated (S10):** `com.snc.samp.citrix.app.license.period` — "Indicates the license period (in days) for Citrix applications to be considered during reconciliation. Default is 90 days." Available only with the Citrix pack.

**In-instance check:** Discovery schedule against the Delivery Controller returns rows; if the Citrix position is empty, suspect the schedule before the entitlement.

---

## IBM (and Red Hat)

**Validated (S4):**
- Metrics: Authorized User, Authorized User Value Unit, Employee User Value Unit, External User Value Unit, Per Device, Per Named User, Per Processor, Per User, **PVU**, **RVU**, **VPC**.
- Requires activating `com.sn_samp_ibm`; Red Hat coverage is **RHEL Server** and **RHEL for Virtual Datacenters**.
- **PVU, RVU and VPC are supported only if** the pack is integrated with **ILMT**, **BigFix Inventory**, or a SAM provider authorised in IBM's **Client Value Acceleration (CVA)** program. This is a hard prerequisite, not a nice-to-have.
- Discovery-tool matrix: PVU/RVU → ILMT/BigFix on integration API **v1 or v2**, or ServiceNow Discovery + IBM License Compliance for a CVA provider. VPC → ILMT/BigFix on integration API **v2** only, or Discovery + IBM License Compliance. All other metrics (Authorized User, External UVU, …) → any discovery tool.

**Validated (S1):** PVU "Full capacity PVU entitlements require licenses for all activated processor cores in the physical hardware environment. Subcapacity PVU entitlements require licenses for less than the full capacity of your server or group of servers." RVU is the same construction over "activated processor cores used or managed by a product". VPC "is available only if you request and install the IBM License Compliance for Software Asset Management application from the ServiceNow Store". The Australia Patch 6+ metrics each require "a related record in the Resource Value [`samp_sw_resource_value`] table".

**Validated (S10):**
- `sn_samp_ibm_lic.default_region` — default "North America and South America"; **requires both the IBM pack and the IBM License Compliance app**; auto-associates physical hosts to a region because "IBM license usage can be calculated only for physical hosts that are associated with a region".
- `sn_samp_ibm_lic.ilmt_api_version` — selects the ILMT/BigFix integration API version.
- RHEL Server vs RHEL for Virtual Datacenters optimisation threshold — **default 3.2**, derived from the list-price ratio of the two subscriptions.

**In-instance check:** `v_plugin` shows `com.sn_samp_ibm`; ILMT connection record + `ilmt_api_version` set; every PVU/RVU host has a region.

---

## Microsoft

**Validated (S5):** supported licensing models are Per User, Per Device, Per Core, Per Core (with CAL), User CAL, Device CAL, Server (per instance), Server (per server), Per Processor, User Subscription and Software Assurance. A PPN with a **P+SA** licence type that lacks a version assignment gets a software model with the exact version applied automatically, both on entitlement creation and on MLS import (visible under *Upgrade history*); the `SAMP - Update generic PSA entitlements` fix script backfills existing rows.

**Validated (S1):**
- **Per Core:** "Licenses the cores on both the physical server and the virtual cores that support virtual machines and presents a cost-efficient model based on the number of rights used."
- **Deprecation:** "Per Core (Physical Core) and Per Core (Virtual OSE) metrics is deprecated from the New York release. Any existing entitlements … are replaced with Per Core. You may see a change in your reconciliation results."
- **Per Core (with CAL):** "licenses at the cluster level only when the physical server is an ESX Server and is a part of a cluster. This license metric uses all processors on every ESX Server within a cluster…" and "If vMotion or DRS is enabled on a cluster … the peak capacity of the cores on all the ESX Servers is considered."
- **Server (Per Instance):** "a set number of software installations on either a physical server or virtual machine." **Server (Per Server):** "all software installations on a physical server and any virtual machines hosted by the physical server."
- Virtual cores on a VM are counted as CPU count × core count × **CPU thread count** (S6, virtual-machine path).

**Validated (S6):** Per Core (with CAL) on-premise licensing has exactly two paths — physical cores (physical hosts) or individual virtual machines — and "**you can either allocate to individual hosts or individual virtual machines, not to cluster**". Windows Server floors are **8 licences per physical processor** and **16 per server** (Standard) with Datacenter covering unlimited VMs once all host cores are licensed; VM-based licensing requires SA or subscription and carries an **8-licence minimum per VM**.

**Corroborated (not on a ServiceNow page):** the **minimum 4 core licences per physical processor** for SQL Server comes from Microsoft's own SQL Server per-core licensing terms, not from the ServiceNow docs — ServiceNow documents the 8/16 Windows Server floors instead. Teach the 4-core rule as a Microsoft contract rule, quoted from Microsoft, not as a ServiceNow behaviour.

**Validated (S10)** — Microsoft pack properties and defaults:

| Property | Default | What it decides |
|---|---|---|
| `com.snc.samp.windowserver.license.threshold` | `4.59` | Windows Server Datacenter vs Standard: license physical hosts or VMs, based on the price ratio |
| `com.snc.samp.sqlserver.standard_sa.to.enterprise_sa.cost.ratio` | `0.25` | SQL Server Standard+SA vs Enterprise+SA: hosts or VMs |
| `com.snc.samp.ms.sa.to.nonsa.cost.ratio` | `1.25` | SQL Server with SA vs without SA |

**Unverified:** `com.snc.samp.use_component_licenses` (corpus only — not on the properties page).

---

## Oracle

**Validated (S7):** pack plugin `com.snc.samp.oracle`; supports Oracle Database, Database options, management packs, WebLogic Server, Oracle Java. Entitlement fields: Agreement Type (Generic / **ULA**), License metric (Named User Plus, Per Processor, Employee), Metric group Oracle. BYOL supported for Database and WebLogic across hybrid infrastructure; Oracle **GLAS** data collection supported.

**Validated (S7) — Named User Plus:**
- Licenses all **users and physical devices** that access the product; a user operating an accessing device licenses both.
- **Requires a client access record** ("you must create a corresponding client access record").
- **Edition minimums are applied automatically** through metric attributes, and the metric takes the larger of (minimum × processors/cores) vs (users + devices):

| Edition | Minimum |
|---|---|
| Database SE / SE1 | 5 NUP |
| Database SE2 | 10 NUP per database server; each SE2 database may use max **16 CPU threads** |
| Database EE | **25 NUP per processor**, or all accessing users and devices — whichever is larger |
| WebLogic SE | 10 NUP per processor |
| WebLogic EE / Suite | 10 NUP per processor core |

Worked example (S7): "20 users are accessing an Enterprise Edition database … on a physical server with eight processor cores. The NUP license metric consumes 200 rights because … (25 minimum licenses x 8 CPU cores = 200 rights) is greater than the number of users (20)."

Attribute names carrying the minimums: *Minimum users per processor* (Database), *Minimum NUPs for WebLogic on-premise deployments*, *Minimum NUPs for WebLogic cloud deployments*.

**Validated (S7) — Per Processor:** licenses only "the underlying physical server or cloud server", never individual VMs or partitions; rights = cores × **Oracle Processor Core Factor Table** factor (2 CPUs × 4 cores × 0.5 = 4 rights). Options and management packs are auto-allocated with the same metric.

**Validated (S7) — CAL interaction:** if a client access record exists, SAM licenses users and devices using **NUP only** and "doesn't use the Per Processor license metric even if Per Processor licenses are available".

**Validated (S7) — Employee:** total full-time, part-time and temporary employees including contractors/agents/consultants; consumption is driven by **resource value records**; cost uses the **`samp_price_tier`** table with a **one-year true-up** for the subscription period.

**Validated (S1/S7/S10):** `com.snc.samp.oracle.reconlevel` — levels **ESX** (all processor cores on the ESX host), **ESX cluster** (default; all processors on every ESX server in the cluster), **vCenter(s)** (all cores on every ESX server; licensing maths depends on ESXi version). `com.snc.samp.oracle.hostaffinityenabled` applies **only** at the vCenter(s) level and accounts for VM–host affinity rules.

**Unverified:** the `samp_oracle_options` "Considered for licensing = Yes" gating (corpus only).

**Validated (S11) — soft partitioning and the boundary.** ServiceNow's own page states the rule the "10% rule" folklore corrupts: "To run an Oracle database or WebLogic server on a VM, you must license all processors on the underlying physical ESXi host that is running your VM. If your physical ESXi host is running multiple VMs simultaneously, you must still license all processors on the host regardless of how many VMs are running." The boundary scales with the **vMotion capability** of the vSphere version:

| vSphere version | vMotion reach | Boundary you license |
|---|---|---|
| ESXi 5.0 and earlier | any host, same shared storage, same datacenter | all processors on every ESXi host in that datacenter's shared storage |
| ESXi 5.1–5.5 | any host within the same vCenter | all processors on every ESXi host in that vCenter |
| vCenter 6.0 and later | hosts in **any** vCenter on the network (ESXi 5.1+) | all processors on all such hosts across all vCenters |

VM–host affinity rules are honoured only when aggregation is set to `vCenter(s)` (S11, S10) — "licensing is based on the sum of all physical ESXi hosts that the VMs can reside on, as specified in your VM-Host affinity rules". **Nutanix AHV** is not approved hard partitioning: license "all physical cores on the AHV host running the VM", and "if the physical host is part of a Nutanix Cluster, you must license all the physical cores in that cluster" (S11). This is where the ELI5 in the guide comes from: the walls are on wheels, so you pay for the building.

**Validated (S13, S12):** the **License Metric Tier** tab (tier ranges + calculation factors) is a Brazil addition; Microsoft **Rights per license pack** / **Number of packs** exist for Per Core and Per Core (with CAL), SQL core licences being sold in packs of two (S12).

**Validated cadence correction:** reconciliation is described as the "weekly run of reconciliation" (S10) and "runs weekly or on demand" (S8); the guide's earlier "default nightly" was wrong.

---

## SAP

**Validated (S8):** plugin `com.sn_samp_sap`; manages **SAP NetWeaver 7.4 / SAP_BASIS 740 and later**. Supports named users, engine measurement, third-party (Digital Access) access, user subscription and FUE.

- **Named users:** ECC supports Professional, Limited Professional, Employee Self Service; S/4HANA supports Developer Access, Enterprise Management for Professional/Functional/Productivity Use, Technical SAP Engine User, Technical Use.
- **Engines:** usage calculated automatically where SAP engine measurement supports it, by calculation where an engine is composed of multiple measurements plus an indicator, otherwise by **manual self-declaration**. **Brazil adds revenue-based licensing for engines** (KB1641524).
- **Digital Access:** indirect usage by people or third-party apps without direct login; licensed by **documents created by the third-party application**, weighted by a multiplier in the **`samp_sap_document`** table installed with the pack:

| Document type | Multiplier |
|---|---|
| Sales, Purchase, Invoice, Manufacturing, Quality Management, Service and Maintenance, Time Management | 1 |
| **Material**, **Financial** | **0.2** |

Worked example (S8): 10 material + 10 sales documents = (10 × 0.2) + (10 × 1) = **12 Digital Access licences**. Reading, updating or deleting documents carries no charge — only creation. Data is pulled via **SAP Passport** or **SAP Estimation** tooling.

- **FUE / User Subscription:** one FUE framework, four cloud use types with weighting factors — **Self-Service, Core, Advanced, Development**. For **S/4HANA Cloud Public Edition the metric is named `User Subscription`** (before Brazil it was named Full Usage Equivalent); for **Private Edition it stays `Full Usage Equivalent`**. Public Edition use types live in `samp_sap_cloud_use_type` (installed with the `sn_s4_hana_cld_spk` spoke); Private Edition classifies users on the SAP system during collection. FUE requires S/4HANA Cloud Private Edition, version 2025, FPS01 (02/2026), SAP_BASIS 816.
- Data cadence: master data weekly, user/web/engine activity monthly; user and web activity deleted after **90 days**, engine measurements after **one year**. Activity transform maps are **off by default** (performance) and must be enabled per connection (*Fetch activity = True*).

**Validated (S1):** Named User "The Named User Type is defined by the software model linked to the entitlement" — the single highest-value trap in the pack.

---

## VMware

**Validated (S9):** plugin `com.sn_samp_vmware`.

- **Subscription suites (VVS, VVEP)** use **Per Core**: "Each core requires one right, and you must license a minimum of 16 cores per processor." Worked example: 2 × 20-core + 2 × 8-core hosts = 40 + (2 × **16** minimum) = **72 rights**.
- **VVEP limits:** each licence covers a maximum of **three physical hosts**, **two processors** each, **32 cores** per processor; extra cores stay unlicensed.
- **vCenters are inferred as suite components of VVS/VVEP** and therefore "don't require or consume any rights".
- **Perpetual** products (no new perpetual licences after **2023-12-11**, existing ones still manageable): Per Application Instance (1 right per instance), Per Device (per physical host), Per Named User (per user), Per OSI (per physical **and** virtual server), Per Processor (**1 right per 32 cores**).
- Discovery via ServiceNow Discovery; compliance in License usage view / publisher overview for VMware.

**Validated (S1):** Per Processor — "Each CPU requires one right for every 32 cores. A Maximum cores per processor metric attribute with a default value of 32 is automatically created on software models for VMware per processor entitlements"; product scope vSphere, vSphere with Operations Management. Per Core scope is "subscription-based VMware suite products: VMware vSphere Standard (VVS) and VMware vSphere Essentials Plus (VVEP)".

**Corroborated:** the 16-cores-per-processor floor also appears in Broadcom's vSphere Standard SPDs ("minimum licensing requirement of 16 Cores per Processor"), so it is a vendor contract floor, not a SAM artefact.

---

## SaaS License Management — Subscription & Consumption

**Validated (S1):** installing SaaS LM adds the **Subscription** (metric: User Subscription = number of users) and **Consumption** (metric: SaaS Consumption, licensed by unit of measure) groups.

**Validated (S5, S1):** the entitlement's default license metric for SaaS entitlements is **User Subscription**; a Consumption/Subscription metric group forces License type = **Subscription**.

**Validated (S1) — CrowdStrike metrics** live here: *Reserved Hourly Average Sensor* counts unique active endpoints per clock-hour averaged over a **rolling 28 days**, resetting each clock-hour; *Sensor Subscription* averages endpoint counts over **four consecutive weeks**, each week being endpoints consumed in the previous seven days. Available from **Yokohama Patch 1** with `sn_sam_saas_int` **15.0.8** and `sn_itam_samp` **2.1.0**; below that, **KB1801232**.

**In-instance check:** integration profile created → software models generated automatically; CrowdStrike requires the two minimum versions above or the metrics are absent.

---

## Engineering Applications (concurrent licensing)

**Validated (S1):** *Concurrent Licenses* metrics (Floating, Token, Network) are visible only with **`sn_samp_eng_app`** plus **OpenLM** and **Open iT** integration. Each is peak-based: "The number of rights consumed is based on the peak number of licenses/tokens checked out during a specified time."

**Validated (S10):** `com.snc.samp.eng.app.peak.usage.period` — default **30 days**, only `sam_admin` can change it.

---

## Common metrics

**Validated (S1):**
- **Per Core** = "cores on a physical server or virtual machine. CPU core count * CPU count". **Per Processor** = CPU count on a physical server or VM.
- **Per Named User / Per Named Device** — "You must add allocations."
- **Resource Consumption** — 1:1 between `samp_sw_resource_value.unit_consumption` and `samp_license_metric_result.licenses_required`.
- **Concurrent User** — "create a related record in the Resource Value [`samp_sw_resource_value`] table to identify the resource being measured."
- **User CAL / Device CAL / User-Device CAL** — per accessing user / device / either.

**Validated (S10):** `com.snc.samp.recon.enablecustommetrics` — default **Yes**; set to No and custom metrics are ignored during reconciliation.

---

## Corrections made to the guide after validation

| # | Guide said (draft) | Documentation says | Action |
|---|---|---|---|
| 1 | Oracle NUP minimums are "a contract term SAM does not enforce for you" | Minimums for every Oracle edition are applied automatically via metric attributes, and rights = larger of minimum × cores vs users/devices (S7) | **Corrected** — replaced with the edition minimum table and the 25 × 8 = 200 example |
| 2 | IBM sub-capacity "requires evidence — ILMT or BigFix Inventory … Without that feed, sub-capacity claims are indefensible" | PVU, RVU and VPC metrics are **only supported** when integrated with ILMT, BigFix Inventory or an authorised CVA provider; VPC needs API v2 (S4) | **Corrected** — upgraded from "needs evidence" to a hard prerequisite + discovery-tool matrix |
| 3 | "The metric group you select does **not** have to match the publisher of the title" (from corpus, quoted as official) | Not stated on any Brazil page re-checked. The documented facts are: metric group is auto-populated from the software model, and metric options change with the group (S1, S5) | **Corrected** — reworded to the documented behaviour plus the practical warning |
| 4 | IBM `default_region` described as a plain region setting | The property additionally requires the **IBM License Compliance** app; IBM usage can only be calculated for hosts with a region (S10) | **Corrected** — prerequisite added |
| 5 | VMware section stopped at 32 cores / 16-core floor | VVEP caps at 3 hosts × 2 processors × 32 cores; vCenters included in suites consume **no** rights (S9) | **Added** |
| 6 | SAP Digital Access described only as "documents created by third-party apps" | Document multipliers: material and financial **0.2**, all others **1.0**; `samp_sap_document`; creation only, reads/updates/deletes free (S8) | **Added** |
| 7 | SAP Public/Private naming implied one metric | Public Edition = **User Subscription** (renamed in Brazil), Private Edition = **Full Usage Equivalent** (S8) | **Added** |
| 8 | Citrix described the Delivery Controller requirement only | Application Group mapping overrides Delivery Group mapping when both exist (S3) | **Added** |
| 9 | Microsoft cluster statement unqualified | Cluster is the **calculation** boundary (S1) but the allocation unit is a host or a VM, "not to cluster" (S6) | **Added** as an explicit reconciliation of the two pages |
| 10 | Property table listed corpus defaults without provenance | All Microsoft/Citrix/Engineering/Oracle/IBM defaults used here are confirmed on S10; `use_component_licenses` is not | **Annotated** in the guide, catalogued below |
| 11 | Reconciliation runs "nightly by default" | ServiceNow describes it as the **weekly** run, triggerable on demand (S10, S8) | **Corrected** |
| 12 | Diagram node said Oracle virtualised → "10% rule applies" | No percentage exists in Oracle's Partitioning Policy or on any Brazil page; the mechanism is cores × core factor at the vMotion boundary (S11) | **Corrected** — node replaced, boundary table + ELI5 added |
| 13 | Diagram node said Adobe Document Cloud → "per-document pricing" | Adobe metrics are Per Device / Per User / User Subscription; Document Cloud is not a per-document metric (S1, S2) | **Corrected** |
| 14 | SQL Server "4 cores per socket" listed as Microsoft-contract-only | S17 documents `Minimum cores per processor = 4` for the Microsoft **Per Core** metric, and 8 for **Per Core (with CAL)** — the floor is shipped in the platform | **Upgraded to Validated** |

## Contradictions inside ServiceNow's own docs

- **Microsoft Per Core (with CAL).** S1 says the metric licenses at **cluster level** when the physical server is an ESX Server in a cluster, using the peak core capacity of all hosts. S6 says you allocate to **individual hosts or individual VMs, "not to cluster"**. Both are Brazil, 2026-09-10. Read them as: the cluster is what the calculation must cover (Microsoft's rule), while SAM's allocation is performed per host or per VM and then evaluated across the cluster. Do not quote S6 alone and conclude clusters are out of scope.
- **`sn_samp_ibm_lic.default_region` availability.** S10 makes it conditional on the IBM License Compliance app while the IBM pack page (S4) lists the app only against PVU/RVU/VPC. Treat the app as a prerequisite for region-scoped IBM usage.

## Deliberately not asserted

| Claim | Status | Why it stayed out / is flagged |
|---|---|---|
| `com.snc.samp.use_component_licenses` (default `false`) | Unverified | Not on the S10 properties page; corpus only |
| `samp_oracle_options` "Considered for licensing" gating | Unverified | Corpus only; plausible but not in S7 |
| SQL Server **4 core licences per socket** minimum | Corroborated (Microsoft) | Microsoft contract term; ServiceNow documents Windows Server's 8/16 floors instead |
| Foundation ships no publisher packs | Corroborated | Every pack page requires a Professional plugin; no Foundation pack page exists |
| `alm_license.license_metric_type` as the metric field | Unverified | Instance-dependent schema; the guide's snippet says so inline |
| "Metric group need not match the publisher" as an official rule | Unverified | See correction 3 |
| `com.sn_samp_master_ws`, `com.snc.sams` IDs | Unverified | Corpus-only identifiers |
| CrowdStrike version gates | Validated | S1 — kept, with KB1801232 for older builds |
| The "10% rule" for virtualised Oracle | False / folklore | No rule of any percentage exists in Oracle's Partitioning Policy or the Brazil pages; the video calling it "not a rule" is correct (S11) — kept only as an explicitly debunked myth |

## Compliance troubleshooting & cheat sheet — what rests on what

The guide gained two reference sections on 2026-11-16: `### Troubleshooting a wrong compliance position` (Reconciliation section) and `## One-Page Cheat Sheet — Groups, Metrics, Attributes, Arithmetic`. **Neither introduces a new platform claim.** Every row routes to something already validated above; this table states the routing so the next reviewer does not have to re-derive it.

| Troubleshooting row | Rests on | Status |
|---|---|---|
| Unlicensed with installs present; `active_rights` 0 | Entitlement date validity and On Order exclusion are part of the guide's own three-term model; the four position names come from the SAM position vocabulary used throughout the corpus | Corroborated |
| Demand 0 despite installs; duplicate models | Normalization (SUMN) → software model is the counting unit (S12/S14) | Validated |
| Concurrent user demand 0 | Concurrent User needs a Resource Value record; Engineering Applications pack page states resource values feed concurrency | Corroborated |
| Per Named User counts nobody | Demand table's "count of **allocations**" for per-named metrics | Corroborated |
| SQL demand below contract on Common Per Core | `Minimum cores per processor` 1 (Common Per Core) vs 4 (Microsoft Per Core) — S17 | Validated |
| SQL demand ≈ 4 × cores | `Minimum cores per processor` 4 for Microsoft Per Core — S17 | Validated |
| OSE cap swallows extra OSEs | `Maximum active OSEs per server` 2 — S17 | Validated |
| Windows per-VM licensing not reflected | Per Core (with CAL) cluster-level rule (S6) + 8-licence minimum per VM (S5) | Validated |
| Oracle demand above population | `Minimum users per processor` 25 — S17 | Validated |
| Oracle jump after VM move | `com.snc.samp.oracle.reconlevel`, default `ESX cluster` — S10/S11 | Validated |
| Oracle 2× on Per Processor | Oracle Processor Core Factor Table is applied via processor definitions — S7 | Validated |
| VMware round number per socket | 16-core floor (VVS/VVEP) and `Maximum cores per processor` 32 — S9/S17 | Validated |
| IBM sub-capacity unsupportable | ILMT / BigFix Inventory prerequisite — S4 | Validated |
| Red Hat metrics missing | Red Hat metrics sit behind the IBM pack — S1/S4 | Validated |
| SAP users all one type | Named User Type is carried on the software model — S8 | Validated |
| Adobe seats not reclaimed | Allocated in use / Not Allocated in use / Allocated not in use — S1/S2 | Validated |
| Citrix position empty | Discovery schedule on the Delivery Controller; Application Group mapping precedence — S3 | Validated |
| Position flips between runs | No single page; follows from discovery de-duplication and usage-evidence inputs | Unverified (diagnostic heuristic) |
| Two dashboards disagree | `com.snc.samp.recon.group` default **None** — S10; the "position is per model × metric" framing is the guide's own | Partly validated |
| Position shifts after upgrade | Per Core (Physical Core) / (Virtual OSE) retired in New York, results may change — S13 | Validated |
| Everything compliant, zero deltas | Exclusions and ignore lists remove installs from demand; "Not counted" is a distinct state in the position vocabulary | Corroborated |

**Explicitly the guide's framing, not a ServiceNow statement:** the demand → required → active_rights ordering, the "which term moved?" triage, and the "not a bug — do not fix" list. They are pedagogical scaffolding built on validated mechanics; the mechanics are sourced, the diagnosis sequence is ours.

**Cheat sheet provenance:** every default in its knob table is copied from the S17 list above; every group/metric/gate row comes from S1–S9; the position table reuses the six states already defined in the guide. Nothing in it should need re-validating separately — if a value changes upstream, fix it in `### Metric attributes` and mirror it into the cheat sheet.

**Deliberately not in the cheat sheet:** CrowdStrike consumption internals, IBM's full Australia Patch 6+ metric list, and SAP's document multipliers. They belong in the sections, not on a one-page card, and compressing them would invite misquotation.

## Missing-metric tree and diagnosis lab — provenance

`### When the metric you need isn't in the picker` and `## Lab: Break It on Purpose — Seven Diagnosis Drills` add no new platform claims either. Routing:

| Claim | Rests on | Status |
|---|---|---|
| Entitlement metric group is populated from the software model; the picker cascades from it | S16/S17 — "automatically populated based on the Software Model field" | Validated |
| Publisher metric groups require their pack; Foundation ships Common only | S1–S9 pack pages + the Foundation/Professional split | Validated |
| `Per Core (Physical Core)` / `(Virtual OSE)` retired from New York, results may change | S13 | Validated |
| Red Hat metrics ship in the IBM pack | S1/S4 | Validated |
| `Subscription` / `Consumption` come from SaaS License Management; Consumption forces `License type = Subscription` | S15/S16 | Validated |
| Custom License Metrics path, group fixed to **Custom**, metric appears by name | S15 | Validated |
| 4-core floor, `Maximum active OSEs per server` = 2, minimum users per processor 25 | S17 | Validated |
| Per-named-user metrics count allocations | Demand table plus pack pages | Corroborated |
| "A custom metric carries no counting rule of its own" | No page says this; inferred from custom metrics supplying a name and a fixed group only | Unverified — labelled inline in the guide |
| Drill predictions ("required falls toward raw core count", "required does not move") | Arithmetic over the validated attributes | Derived, not quoted |

The drills are deliberately sub-production only; nothing in them is safe to rehearse against a reconciled production model.

---

## Re-validation recipe (next release)

1. Open S1 and diff the metric table against the guide's matrix — renames and deprecations land there first (the New York `Per Core` collapse is the template).
2. Open each pack page (S2–S9) and check the plugin ID line and the licensing-models list.
3. Open S10 and confirm each default in the guide's property table; any property that has disappeared is a behaviour change, not a typo.
4. Re-run the TOC anchor check after any heading edit — anchors are generated from heading text, so emoji or punctuation changes break the Contents list.
