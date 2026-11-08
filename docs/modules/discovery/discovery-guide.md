# Discovery — ITOM Discovery

Discovery is how ServiceNow finds out what actually exists on the network. It logs into servers, network devices, and cloud accounts through a MID Server, identifies each device, and creates or updates its Configuration Item (CI) in the CMDB — including the software installed on it. Everything upstream (ITSM impact analysis, SAM license counts, TSOM inventory reconciliation) is only as good as what Discovery put in the CMDB.

This guide covers classic Discovery end to end, with a deep focus on **File-Based Discovery (FBD)**: how to reach the Discovery Configuration Console, how to configure it area by area, how filtering really works, and how to run an FBD scan and prove it executed — on the instance *and* on the target device.

## Contents

- [Purpose](#purpose)
- [Where to Find It](#where-to-find-it)
- [How Discovery Works](#how-discovery-works)
- [Re-usable Code / Metadata](#re-usable-code--metadata)
- [Out-of-Box Features](#out-of-box-features)
- [Key Table Hierarchy](#key-table-hierarchy)
- [Integrations](#integrations)
- [Key Fields](#key-fields)
- [Common Mistakes](#common-mistakes)
- [Deep Dive: Customizing an Out-of-Box Pattern — and Making Your Own](#deep-dive-customizing-an-out-of-box-pattern--and-making-your-own)
- [Deep Dive: The Discovery Configuration Console](#deep-dive-the-discovery-configuration-console)
- [Deep Dive: File-Based Discovery](#deep-dive-file-based-discovery)
- [Deep Dive: Running File-Based Discovery](#deep-dive-running-file-based-discovery)
- [Deep Dive: From Files to Licenses — File Signature Normalization](#deep-dive-from-files-to-licenses--file-signature-normalization)
- [Lab: Run Your First Discovery and File-Based Scan](#lab-run-your-first-discovery-and-file-based-scan)
- [Quiz](#quiz)
- [Official Learning Resources](#official-learning-resources)
- [Visual & Video Guides](#visual--video-guides)

---

## Purpose

- **Populate the CMDB with facts, not spreadsheets.** Discovery scans IP ranges on a schedule and keeps CIs current as devices change.
- **Identify hardware and software.** Servers, VMs, network gear, databases — and, with File-Based Discovery, the software files physically present on a machine, even software that never registered itself anywhere.
- **Feed everything else.** ITSM uses CIs for impact; SAM reconciles installations against entitlements; HAM matches discovered devices to asset records; TSOM reconciles discovered network state against inventory (see the TSOM guide's discrepancy checks).

## Where to Find It

| Destination | Breadcrumb |
|-------------|------------|
| Discovery dashboard / home | All > Discovery > Dashboard |
| **Discovery Configuration Console** | All > Discovery > **Discovery Definition > Configuration Console** |
| Discovery schedules | All > Discovery > Discovery Definition > Schedules |
| Discovery status (per-run record) | All > Discovery > Status |
| Discovery log | All > Discovery > Discovery Log |
| MID Servers | All > Discovery > MID Servers |
| Credentials | All > Discovery > Credentials |
| Probes and patterns | All > Discovery > Discovery Definition > Probes · Patterns |
| Internal Discovery properties | Type `discovery_private_properties.list` in the navigator filter |
| Software installations created | `cmdb_sam_sw_install` |
| Files kept by File-Based Discovery | `cmdb_file_information` (also a related list on the CI) |
| Files that matched nothing | `cmdb_unidentified_file_set` |

Roles that matter: **discovery_admin** (configure and run Discovery), **admin**, the MID Server's service account user (with the `mid_server` role) on the instance side, and local/domain credentials on the target side.

## How Discovery Works

A Discovery run moves through four phases, all coordinated through the **ECC Queue** (`ecc_queue`) between the instance and a **MID Server** sitting inside the network:

1. **Scanning** — port probes (Shazzam) find live IPs and open ports.
2. **Classification** — classifiers decide what kind of device answered (Windows server, Linux, switch, …).
3. **Identification** — identification rules and the Identification and Reconciliation Engine (IRE) match the device to an existing CI or create a new one — this is what prevents duplicates.
4. **Exploration** — probes and patterns gather the detail: OS, CPU, memory, running processes, installed software — and this is the phase where **File-Based Discovery runs**.

Work is sent to the MID Server as ECC Queue **output** records; results come back as **input** records, where sensors/pattern steps process them into the CMDB.

## Re-usable Code / Metadata

Check the latest Discovery status for a CI from a script or background job:

```javascript
// Most recent Discovery status that touched a given CI
var st = new GlideRecord('discovery_status');
st.addQuery('cmdb_ci', current.sys_id); // or a sys_id string
st.orderByDesc('sys_created_on');
st.setLimit(1);
st.query();
if (st.next()) {
  gs.info('Last run: ' + st.getValue('sys_id') +
          ' | State: ' + st.getDisplayValue('state') +
          ' | Created: ' + st.getValue('sys_created_on'));
}
```

Navigator shortcuts worth memorizing (type in the filter box):

| Shortcut | Opens |
|----------|-------|
| `discovery_status.list` | All Discovery run records |
| `discovery_log.list` | The Discovery log |
| `ecc_queue.list` | MID Server in/out traffic — the first place to debug a stuck run |
| `discovery_private_properties.list` | Internal Discovery properties (incl. file-discovery internals) |
| `cmdb_unidentified_file_set.list` | Files File-Based Discovery could not match |
| `cmdb_sam_sw_install.list` | Software installations |
| `sa_pattern.list` | Every Discovery pattern (out-of-box and yours) |

### The re-usable metadata inventory

Beyond scripts, Discovery is built from configuration records you define **once** and reuse everywhere. Every row below has the same shape: a concrete **example**, the plain-English version (**ELI5**), the **technical** version, and exactly **how the reuse works** — because the whole point of these objects is that you change them in one place instead of twenty.

| Re-usable piece | Example | ELI5 | Technical explanation | How the reuse works | Where it lives |
|---|---|---|---|---|---|
| **Discovery Schedules** | A "HQ Datacenters — Nightly" schedule cloned to make "Branch Offices — Weekly" | A saved trip plan — route, time, vehicle. Copy the plan and change the destination instead of planning from zero. | A `discovery_schedule` record binding ranges, MID selection, a behaviour, and the credential set, with its own run frequency. | Clone the schedule and change only what differs (ranges, MID); the proven behaviour + credential combination carries over untouched. | All > Discovery > Discovery Definition > **Schedules** |
| **IP ranges** | `10.20.0.0/16` — the Toronto datacenter, entered once on the schedule | A neighbourhood on a map, instead of a written list of every house address in it. | A CIDR block (or start–end pair) stored as a `discovery_range_item`; the scan phase probes every address inside the block. | The block is scanned as a unit by every run of every schedule that includes it — nobody maintains individual IPs anywhere. | All > Discovery > Discovery Definition > **Schedules** > open a schedule > **Discovery Ranges** |
| **IP range sets** | The set "All Canadian Sites" = Toronto /16 + Montreal /16 + Vancouver /16, referenced by 20 schedules | A mailing list. You add a person to the list once, and every email sent to the list reaches them — you never re-type their address into 20 separate emails. | Structured range records (`discovery_range`, `discovery_range_item`, `discovery_range_item_ip`) grouping sub-ranges and individual IPs under one named parent that schedules reference. | **This is the "change it in 1 place" object.** Add the new Calgary subnet to the set once and all 20 schedules scan it on their next run — instead of opening 20 schedules and editing each one. | On the schedule's **Discovery Ranges** — maintain the set, not copies of it |
| **MID Server IP ranges** | MID-TOR-01 may scan `10.20.0.0/16`; MID-MTL-01 may scan `10.30.0.0/16` | Each delivery driver has a territory; a parcel is only handed to the driver whose territory contains the address. | Range records on the MID Server (`ecc_agent`) constraining which targets that MID's work may address. | One schedule can cover the whole country; the ranges route each part to the right MID automatically — no separate per-site schedules. | All > MID Server > **Servers** > open the MID > **IP Ranges** |
| **MID Server capabilities** | A MID with SNMP + WMI capabilities receives switch and Windows work; a Linux-only MID never does | A handyman's advertised skills — you only get sent jobs matching the skills on your card. | Capability records on the MID declaring which protocols and applications it can execute; the instance matches work to capabilities when assigning it. | Set capabilities once per MID; every schedule and pattern benefits from the routing — no per-schedule MID micromanagement. | All > MID Server > **Servers** > open the MID > **Capabilities** |
| **Patterns** | The *Windows OS – Servers* pattern explores every Windows server Discovery finds, anywhere | One recipe that works in every kitchen — same steps, whatever house you are cooking in. | A `sa_pattern` definition: an identification section plus ordered steps/operations the MID executes against a target, writing CIs and relations. | Write the exploration logic once; every classifier and schedule that invokes it reuses it. Fix a parsing step once and every future run on every network is fixed. | All > Discovery > Discovery Definition > **Patterns** (Pattern Designer) |
| **Pattern libraries** | The library step "get running processes" is called by a dozen patterns | A Lego brick used in many models — redesign the brick and every model built with it improves. | Shared, versioned step sequences in Pattern Designer, invoked from pattern steps instead of being rebuilt inside each pattern. | Change the library once; all patterns calling it pick up the change — no hunting through each pattern to patch the same logic. | Inside **Pattern Designer** (shared libraries) |
| **Probes and sensors** | The *Windows – Installed Software* probe collects the registry data; its sensor turns it into install records | One person takes the photo, another files it — and the same pair can be assigned to any beat. | A probe (`discovery_probe`) is the MID-side collection script; the sensor is the instance-side parser that maps the returned data onto CI fields. | Define the pair once and attach it to any classifier; the same collection logic then serves every schedule that reaches that classifier. | All > Discovery > Discovery Definition > **Probes** / **Sensors** |
| **Classifiers** | The *Windows* classifier fires when a host answers on WMI and identifies itself as Windows | A sorting hat: it looks at what answered the door and decides which rulebook applies to it. | A classification record whose trigger conditions (port-probe results, banners) select the pattern or probe set and the CI class used for exploration. | One classifier decision serves every schedule — change which pattern "Windows" uses in this one record and all schedules follow. | All > Discovery > Discovery Definition > **Classifiers** |
| **Discovery Behaviours** | A "WMI-only" behaviour attached to ranges where firewall policy blocks SSH | A dress code for a venue: whichever event is held there, the same rules apply to everyone entering. | A `discovery_behavior` record grouping functionality definitions (which probes/patterns may run) that a schedule applies to specified ranges. | Define the behaviour once, attach it to many schedules and ranges. A policy change ("no SNMP v2 in PCI ranges") is edited in one behaviour, not in every schedule. | All > Discovery > Discovery Definition > **Behaviours** |
| **Credentials & credential aliases** | Schedules reference the alias "Windows Domain Cred"; the credential record behind it is rotated quarterly | A name in your contacts. You tap "Mom" — if her number changes, you update the contact once, not every message thread you ever sent her. | Credential records (`discovery_credentials`) tried per target type; aliases decouple the reference from the record, so patterns and schedules point at the alias. | Rotate or replace the credential in one record; every schedule and pattern using the alias keeps working unchanged. | All > Discovery > **Credentials** · **Connections & Credential Aliases** |
| **Credential affinities** | After MID-TOR-01 logs into 10.20.4.15 with the domain credential, the next run tries that credential first for that host | Remembering which key opened which door, so next time you don't try the whole keyring. | `dscy_credentials_affinity` rows (IP + MID + credential) written on each successful authentication and consulted before the general credential order. | The system builds this reuse itself — every successful login makes the next run faster, with zero configuration from you. | `dscy_credentials_affinity.list` (system-maintained) |
| **Identification rules (IRE identifiers)** | Windows servers are matched on `name` + `serial_number` — so the SCCM connector cannot create a second CI for a laptop Discovery already found | A bouncer checking two pieces of ID: if they match the list, you are already inside — no second entry gets created. | IRE identifier records (`cmdb_identifier` and its entries), per CI class, defining the attribute sets used to match an incoming payload to an existing CI. | One rule per class serves *every* source — Discovery, Service Graph Connectors, import sets. Change the matching once; deduplication changes everywhere, consistently. | All > Configuration > **Identification/Reconciliation** (CI Identifiers) |
| **Discovery properties** | One timeout property governs how long every schedule waits on an unresponsive host | One thermostat for the whole house instead of a separate dial in every room. | Engine-level settings (`discovery_private_properties` and `glide.discovery.*` properties) read at run time by all schedules. | Tune once, centrally — no schedule carries its own copy of the setting to drift out of sync with the others. | All > Discovery > **Properties** · `discovery_private_properties.list` |

The pattern to notice: **schedules are the *when and where*, everything above is the *how* — and the *how* is all shared.** That is why the next deep dive (customizing a pattern) matters: change one pattern and every schedule that reaches it changes with it.

## Out-of-Box Features

- **Discovery schedules** — recurring scans by IP range, with behaviours that control which probes run where.
- **Patterns** — the modern, declarative way to explore devices and applications (replacing probe/sensor pairs for most content).
- **Discovery Configuration Console** — one place to control which CI types and information get discovered, File-Based Discovery, and SWID tags.
- **File-Based Discovery** — software discovery from files on disk (deep dives below).
- **Cloud Discovery** — API-based discovery of AWS, Azure, and GCP resources.
- **Agent Client Collector (ACC)** — agent-based data collection for endpoints that can't be scanned remotely.
- **Service Graph Connectors** — partner/third-party data (e.g. SCCM) imported through the same IRE rules — see the CSDM/SCCM map in the ITSM guide.

## Key Table Hierarchy

| Table | What it holds |
|-------|---------------|
| `discovery_schedule` | When Discovery runs, against which ranges |
| `discovery_range_item` | The IP ranges attached to a schedule |
| `dscy_credentials_affinity` | Learned credential affinities (IP + MID → the credential that worked) |
| `cmdb_identifier` | IRE identification rules — how a discovered device matches an existing CI |
| `sa_pattern` | Discovery patterns (out-of-box and custom copies) |
| `discovery_behavior` | Behaviours: which functionality runs against which ranges |
| `discovery_status` | One record per run — state, timing, devices found |
| `discovery_log` | Human-readable messages from a run |
| `discovery_device_history` | Per-device outcome per run |
| `ecc_queue` | MID Server work orders and results |
| `ecc_agent` | MID Server records |
| `discovery_credentials` | Credentials Discovery can use on targets |
| `discovery_private_properties` | Internal Discovery settings |
| `cmdb_ci` (+ subclasses) | The CIs Discovery creates and updates |
| `cmdb_file_information` | The actual files FBD found on a CI — name, size, version, path, CI reference |
| `samp_file_name` | The controlled allow-list of file names Discovery keeps (synced from CDS) |
| `samp_custom_file_name` | Your own additions to the allow-list, for software CDS doesn't know |
| `cmdb_sam_sw_install` | Software installations (incl. from File-Based Discovery) |
| `cmdb_unidentified_file_set` | Discovered files no signature matched |
| `cmdb_swid_tag` | SWID tags, when enabled in the console |

## Integrations

- **MID Server** — the agent in your network that does the actual scanning (WMI/WinRM/PowerShell on Windows, SSH on UNIX/Linux, SNMP on network devices).
- **Service Graph Connectors** — SCCM and others; complementary to Discovery, reconciled by the same IRE.
- **Event Management / TSOM** — discovered topology feeds service impact and discrepancy checks.
- **SAM / HAM** — installations and device data flow into normalization and asset matching (see the HAM guide).

## Key Fields

| Field | Where | Why it matters |
|-------|-------|----------------|
| `cmdb_ci.discovery_source` | CI | Which source last updated the CI (e.g. ServiceNow Discovery) |
| `cmdb_ci.last_discovered` | CI | Freshness — stale CIs usually mean a failing schedule or credential |
| `discovery_status.state` | Status record | Whether a run completed, is active, or had errors |
| `ecc_queue.queue` / `ecc_queue.state` | ECC Queue | Input vs output; ready/processed/error — your debugging lens |
| `glide.discovery.file_discovery.wildcard.windows` | System property | Extra file extensions FBD collects on Windows |
| `glide.discovery.file_discovery.blacklist.windows` | System property | Extensions FBD always drops on Windows |

## Common Mistakes

- **Expired or under-privileged credentials** — the #1 cause of "Discovery found nothing." Test credentials from the MID Server host, not your laptop.
- **Assuming extension wildcards limit what FBD collects** — they don't; wildcards are additive on top of signature-driven collection. Blacklist is the only hard filter. (Full model below.)
- **Leaving `c:\windows` in Folders To Scan** — scan times balloon on Windows servers for near-zero SAM value. Remove it.
- **Expecting FBD to run again tomorrow** — the default frequency is **Monthly**; a CI is not re-scanned until the interval expires.
- **Enabling FBD before CDS sync finishes** — File-Based Discovery does not trigger until the initial Content Data Service synchronization completes (~24h).
- **Scanning a whole drive by accident** — setting Folders To Scan to `C:/` scans *everything*; combined with a high Maximum Files cap it can hammer the target.
- **Debugging in the CMDB** — when a run looks wrong, read the ECC Queue and Discovery Log first; the CI is the *result*, not the evidence.

---

## Deep Dive: Customizing an Out-of-Box Pattern — and Making Your Own

Patterns are where Discovery's real behaviour lives, sooner or later every implementer has to change one: collect one more attribute, parse one vendor's odd output format, identify one application ServiceNow never heard of. There are three routes, in increasing order of commitment.

### First, the anatomy

A pattern (`sa_pattern`) is an ordered set of **steps** built in the **Pattern Designer**:

- The **Identification section** runs first: its steps decide *what this thing is* and which CI type it becomes (matching on process, port, banner, or a file on disk).
- **Connection sections** (mainly for Service Mapping) describe how to get from this CI to the next one.
- Each step is built from **operations** — connect to the device, run a command or query, parse the output, match values, set CI fields, create relations to other CIs.

**Where:** All > Discovery > Discovery Definition > **Patterns** — the list opens in Pattern Designer. Nothing about a pattern is edited on a normal form; it is all in the designer.

### The golden rule

**Out-of-box patterns are read-only. You never edit them in place** — the designer will not save changes to a ServiceNow pattern, and anything you forced in would be overwritten by the next upgrade or store release anyway. You customize a **copy**, or you **extend** the original (route 2).

### Route 1 — Duplicate the pattern and own the copy

1. **Open the original.** All > Discovery > Discovery Definition > **Patterns** > open the out-of-box pattern in Pattern Designer (e.g. the *Windows OS – Servers* pattern).
2. **Make your copy.** Use the designer's create-from-existing / duplicate option so the copy — not the original — opens for editing. Rename it with your own prefix (e.g. `Acme — Windows OS – Servers`) so nobody mistakes it for vendor content.
3. **Edit the steps in the copy.** Add or adjust operations: run an extra command, parse one more field, tighten the identification match. Steps read and write CI attributes, so work on the attributes your copy actually changes.
4. **Test with the Pattern Debugger, inside the designer.** The debugger runs your pattern against a real target IP and shows every step's input and output. Fix parsing here — never by re-running full schedules and reading tea leaves in the CMDB.
5. **Point Discovery at your copy.** A pattern only runs when something calls it, and for horizontal Discovery that something is the **classifier**. All > Discovery > Discovery Definition > **Classifiers** > open the classifier (e.g. *Windows*) > set its **Pattern** field to your copy — instead of the original, or in addition to it where the classifier supports both. From then on, that device type is explored by your version.
6. **Check the pre/post processing scripts.** Some patterns are also referenced by name in Discovery's pre- and post-processing scripts. Search those scripts for the **original pattern's name**; if it appears, add or re-point the reference to your copy, or your pattern will run but its surrounding processing won't.
7. **Prove it, then widen.** Run one schedule against one known IP, check the Discovery Status and the CI's attributes, then let normal schedules pick it up.

**The cost, stated plainly:** your copy is frozen at the moment you made it. When ServiceNow ships an improved original, your copy does **not** get the improvement — after upgrades, diff your copies against the new originals and re-apply your changes to a fresh copy where the difference matters. Keep customized patterns few, prefixed, and documented, or this debt sneaks up on you.

### Route 2 — Extend the original (when it offers extension sections)

Some patterns expose **extension sections**: reserved places in the step sequence where you add your own steps (collect one extra file, read one extra registry key or config value) *without* forking the pattern. The base pattern stays vendor-maintained and keeps receiving updates; your extension rides along. If the change you need fits in an extension section, this is the right route — check for one in Pattern Designer before reaching for Route 1.

### Route 3 — Build your own pattern from scratch

For a device or application nothing ships for:

1. **New pattern.** All > Discovery > Discovery Definition > **Patterns** > **New** in Pattern Designer. Set the pattern type and discovery type (**Horizontal** for classic Discovery) and name it with your prefix.
2. **Identification section first.** Declare the CI type the pattern creates and the match logic that proves "this is that thing" (a running process, an open port plus banner, a signature file).
3. **Add exploration steps.** Connect with the right credential type, collect with command/query operations, parse output into CI fields, and create relations (runs on, hosts, contains) so the CI lands connected, not orphaned.
4. **Debug against a real target** until a single run produces exactly the CI you intended — no duplicates, no empty key fields.
5. **Wire it to a classifier.** If it is a new device/app type, create the classifier too: All > Discovery > Discovery Definition > **Classifiers** > New — set the classification criteria (what answer on the wire means "use my pattern") and put your pattern in the classifier's **Pattern** field. Without this step your pattern exists but never runs.
6. **Schedule it** like any other discovery — the schedule, ranges, behaviours and credentials from the re-usable inventory above all apply unchanged.

| Route | Use it when | Upgrade behaviour |
|-------|-------------|-------------------|
| 1. Duplicate & own | You must change the original's core logic | Your copy is frozen — re-base after upgrades |
| 2. Extension section | You only need to *add* collection steps | Base pattern keeps updating; extension survives |
| 3. New pattern | No shipped pattern exists for the target | Entirely yours to maintain |

---

## Deep Dive: The Discovery Configuration Console

The console is where you manage **what kind of CIs and CI information you want to discover** — including File-Based Discovery and SWID tags.

**Breadcrumb:** All > Discovery > **Discovery Definition > Configuration Console**. Role required: **admin**. Toggles work as expected: right = enabled, left = disabled.

**The File-Based Discovery areas of the console** (the ones that matter for this guide):

| Area | What you control there |
|------|------------------------|
| **Enable File Based Discovery** (master toggle, top) | Turns FBD on/off entirely. If you disable it before scan results return, the file data is ignored. |
| **Windows** › Add %PATH% Folders To Scan List | Also scan every folder on the system `%PATH%`. |
| **Windows** › Folders To Scan | Root folders FBD walks. Defaults include `c:\program files*` and `%PATH%`. Add your own with the path field + **Add Path**. Set `C:/` to scan a whole drive. |
| **Windows** › Folders To Ignore | Subfolders carved out of the scan list (e.g. `C:\Program Files\Temp`). |
| **Windows** › Extensions Blacklist | Extensions dropped on sight (hard filter — see filtering model). |
| **Windows** › Extensions Wildcards | Extra extensions collected on top of signature matches (additive). |
| **Windows** › Advanced | Platform tuning options. |
| **Unix** | The same folder/extension controls for UNIX/Linux targets. |
| **Common** › Maximum Files | Cap on files discovered per target (100000 in the standard example). |
| **Common** › Frequency | How often FBD re-runs per CI. **Monthly by default.** |

## Deep Dive: File-Based Discovery

File-Based Discovery identifies software running on Windows, UNIX/Linux, and macOS devices **from the files on disk**, even when registration information is absent — portable apps, copied binaries, in-house tools. It runs during the **exploration phase** of normal Discovery: the MID Server asks the target to enumerate files in the configured folders, filters them, and the results are matched to software using file **name, size, and version**.

**Prerequisites**

- Plugin: **File-based Discovery** (`com.snc.discovery.file_based_discovery`) — included with the Discovery subscription, but activation must be requested. Activating it also activates **SAM File Signature Normalization** (`com.snc.file_signature_normalization`).
- The initial **CDS synchronization** must have occurred (~24 hours for the first data set) — FBD will not trigger before it.
- FBD is **disabled by default** (performance cost); you turn it on in the console.
- On Windows, discovery runs a signed PowerShell payload — the **Windows - File discovery** probe carries `filebaseddiscovery.ps1` as a probe parameter. PowerShell 7 is not supported for FBD on Windows hosts.

### How the Filtering Actually Works (a common misconception)

It is **not** true that everything outside your extension wildcards is ignored. FBD uses a layered filtering system:

1. **The Core Target List (content-based).** ServiceNow automatically looks for files that match your active Software Signatures and File Signatures. If a signature specifies a file like `app.exe` or `version.txt`, Discovery looks for it **regardless** of the wildcard properties.
2. **The Extension Wildcards (additive).** The property `glide.discovery.file_discovery.wildcard.windows` tells the system: *"In addition to the specific files required by my software signatures, also collect and evaluate any file that ends with these extensions."*
3. **The Exclusion List (blacklist, hard filter).** The property `glide.discovery.file_discovery.blacklist.windows` acts as a hard filter: if a file matches a blacklisted extension (like `.log` or `.tmp`), it is dropped immediately — even if a signature or wildcard would otherwise have included it.

**The rule of thumb**

- If a file matches your **blacklist**, it is ignored.
- If a file matches a **Software/File Signature**, it is collected.
- If a file matches an **extension wildcard**, it is collected.
- If a file matches **none of the above**, it is ignored.

### The Allow-List: samp_file_name → cmdb_file_information

There is a second, stricter gate after the scan-scope and extension layers, and it decides what is actually **kept and stored**: the file's **name** must be on the allow-list.

- **Results land in File Information [`cmdb_file_information`].** This table stores the actual files Discovery found on a CI — file name, size, version (when available), path, and a reference back to the CI. You can also view them as a related list on the CI record itself.
- **Only files listed in File Names [`samp_file_name`] are kept.** `samp_file_name` is a controlled list of file names (signatures) ServiceNow recognizes as belonging to software products. Most records come from the **Content Data Service (CDS)** and stay current through a scheduled sync.
- **`samp_custom_file_name` is your extension of the list** — add your own file names there to discover software that is not in the standard content.
- **Everything else is filtered out before it is ever stored.** On **Windows**, the **MID Server** performs this filtering against the allowed file-name list it received from the instance. On **UNIX/Linux**, the **File-based Discovery probe itself** filters the results. A file whose name is not on the list is discarded and never written to `cmdb_file_information`.

Why the design exists: FBD's job is finding software that does **not** appear cleanly in the Windows Registry or standard package managers — portable apps, custom installs, UNIX software. Restricting collection to defined file names avoids storing thousands of irrelevant files, focuses on files that can be matched to known products, and feeds SAM: a matched file can create or update a Software Installation [`cmdb_sam_sw_install`] record (when SAM is active) for license compliance. A file that is kept but cannot be matched to a known product can later surface in the Unidentified File Set, where an administrator maps it to a publisher and product for future discoveries.

> **The shopping-list analogy:** `samp_file_name` is a shopping list of specific file names Discovery is allowed to "buy" (collect). The MID Server or probe is the store clerk who only rings up items on the list. Everything else stays on the shelf. What makes it through is recorded in `cmdb_file_information` for processing and software identification.

### Worked Example — Getting a Custom File Discovered: `C:\temp\server_runner.exe`

Scenario: your most important in-house service runs from **`C:\temp\server_runner.exe`** on a fleet of Windows servers. It is not in the CDS content, it registers nothing in the Registry, and SAM is blind to it. Three separate things keep it invisible by default — fix all three:

1. **The folder is not scanned.** Default Folders To Scan cover `c:\program files*` and `%PATH%` — `C:\temp` is neither. In the Configuration Console (Windows section), add **`C:\temp`** via the path field + **Add Path**. (Check Folders To Ignore doesn't carve it back out.)
2. **The extension must be evaluated.** Ensure `.exe` is covered — either by an active file signature for the name or by the **Extensions Wildcards** list (`glide.discovery.file_discovery.wildcard.windows`). An `.exe` in a scanned folder gets *evaluated*; that alone doesn't guarantee it is *kept* — see step 3.
3. **The name must be on the allow-list — this is the step everyone misses.** `server_runner.exe` is in-house, so CDS has no `samp_file_name` record for it, and the MID Server's name filter will discard it. Add a **custom file name** record in **`samp_custom_file_name`** for `server_runner.exe`, mapped to your publisher and product (e.g. Publisher: *Internal IT*, Product: *Server Runner*). That single record is what turns the file from "stays on the shelf" into "collected, stored, and matched."

Then run it and verify the chain end to end:

4. Run Discovery against one pilot server (respect the FBD **frequency** — if the CI was FBD-scanned recently, the Monthly interval will skip it; pilot on a fresh CI or wait for the interval).
5. On the instance: open the CI → **File Information related list** → `server_runner.exe` should appear with its size, version, and `C:\temp` path. No row here = it was filtered out (re-check steps 1–3, in that order).
6. Normalization: because the custom file name maps the file to a product, the sensor match produces a **Software Installation** in `cmdb_sam_sw_install` — the file is now countable by SAM. If you skipped the product mapping, the kept file would instead wait in `cmdb_unidentified_file_set` for a `sam_admin` to map it — same destination, one manual step later.
7. Roll out: the console change and the custom file name are instance-wide — every subsequent FBD run on every in-scope server now collects `server_runner.exe` automatically.

### Worked Example — One Windows Server, Four Files

Configuration: Folders To Scan = `c:\program files*`, `%PATH%` · Wildcards include `.exe`, `.dll` · Blacklist includes `.log`, `.tmp` · Maximum Files 100000 · Frequency Monthly.

| File found on target | What happens | Why |
|----------------------|--------------|-----|
| `C:\Program Files\VendorApp\app.exe` (matches a CDS file signature) | **Collected**, matched to a normalized installation in `cmdb_sam_sw_install` | Core target list — signature match |
| `C:\Program Files\InHouse\custom-tool.exe` (no signature anywhere) | **Collected** (via the `.exe` wildcard), lands in `cmdb_unidentified_file_set` for a SAM admin to normalize | Wildcard match, no signature |
| `C:\Program Files\VendorApp\debug.log` | **Ignored** | Blacklist hard filter — dropped even though it sits in a scanned folder |
| `C:\Program Files\VendorApp\readme.txt` (no signature, `.txt` not in wildcards) | **Ignored** | Matches none of the three layers |

### Worked Example — A Custom Application Folder

Your company deploys an in-house app to `D:\apps` on every app server, and SAM needs it counted:

1. Console → Windows → **Folders To Scan** → add `D:\apps*` (**Add Path**).
2. **Extensions Wildcards** → ensure `.exe` (and `.dll` if the app ships side-by-side libraries) are present.
3. **Extensions Blacklist** → add noisy extensions the app writes (`.log`, `.tmp`, `.bak`) so they never reach the instance.
4. Leave **Frequency** at Monthly unless the app changes often — every FBD run has a real cost on the target.
5. Run Discovery (next section) and expect the app's binaries in `cmdb_unidentified_file_set` on the first pass — in-house software has no CDS signature until a SAM admin creates a custom normalization rule for it (see the HAM guide's File Signature Normalization deep dive).

## Deep Dive: Running File-Based Discovery

Running FBD is a three-step procedure — configure, run, verify — and the verification happens in **two places**: the instance, and the target device itself.

### Step 1 — Enable FBD in the Discovery Configuration Console

1. All > Discovery > Discovery Definition > **Configuration Console**.
2. Turn on **Enable File Based Discovery**.
3. Define **Folders To Scan** and the **Frequency** (Common section; Monthly by default), plus Folders To Ignore, Extensions Blacklist, and Extensions Wildcards as needed.
4. Confirm prerequisites: the FBD plugin is active and the initial CDS sync has completed.

### Step 2 — Run Discovery and verify initiation in the Status record

1. Run Discovery against the target (from a schedule, or **Discovery > Status > New** / Quick Discovery against the IP).
2. Open the resulting **Discovery Status record** (`discovery_status`) and confirm the run progresses through exploration.
3. Check the **Discovery Log** for the file-based scan being initiated — you are looking for the **Windows - File Based Discovery** probe activity for the target. If it never appears: FBD is not enabled, the interval (frequency) has not expired for that CI, or CDS sync has not finished — in that order.

### Step 3 — Verify the FBD scan file executed on the target device

The MID Server delivers a temporary scan payload to the Windows target, and it executes there during the scan:

1. On the Windows server, open **`C:\Windows\Temp`**.
2. Look for the FBD scan file — a temporary file named like **`snc_tmp_<hash>.tmp`** (roughly 10 MB in the reference example: `snc_tmp_5fe23251db1eff001f63e2399619d.tmp`, 10,192 KB) with a Date modified matching your Discovery run.
3. Its presence + timestamp is your on-device proof the FBD scan executed; its absence, with a "successful" Discovery run, means the scan phase ran but FBD never fired on that target — go back to Step 2's checks.

The full picture: **Configuration Console settings → Run Discovery → Status record / Discovery Log on the instance → `snc_tmp_*.tmp` scan file on the Windows target.** Each arrow is a place a failure can hide, and now you know where to look for each one.

## Deep Dive: From Files to Licenses — File Signature Normalization

FBD is the collection half; **File Signature Normalization** is the matching half. Discovered file attributes (name, size, version, binary signatures) are mapped to standardized entries in the **Content Data Service (CDS)**, creating normalized software installation records automatically. Files the CDS doesn't know become `cmdb_unidentified_file_set` records; a user with the **sam_admin** role reviews them and can create custom normalization rules that optionally sync back to the CDS. Duplicate installations from multiple sources are marked inactive by default.

**Worked example — `superman.exe` → DC Comics Software.** FBD is configured to find all `.exe` and `.dll` files. (1) File information for `superman.exe` is sent to the MID Server and compared, **by name**, against a synchronized list from the instance. (2) `superman.exe` is on the list of files of potential software packages, so the file is sent via the payload to the ServiceNow instance. (3) The instance sensor processes `superman.exe` using its **Name, Size, and Version** to match a software package called **DC Comics Software**. (4) Match found → a software installation record is created. If no match had been found, the file would be added to the **Unidentified File Set** [`cmdb_unidentified_file_set`]: a `sam_admin` can create a custom file signature rule for it manually, the **next** Discovery run associates the file with that customized mapping, and customers who opt in to the content service can have their custom signatures sent to the CDS for analysis and inclusion in future discovery.

The full treatment — plugin (`com.snc.file_signature_normalization`), tables (`samp_file_set`, `samp_file_map`, `samp_file_name`, `samp_custom_file_name`), and the admin workflow — lives in the **HAM guide**: [Deep Dive: File Signature Normalization (SAM)](../ham/ham-guide.md#deep-dive-file-signature-normalization-sam). The console-side configuration is covered from the Discovery side in the [HAM guide's File-Based Discovery section](../ham/ham-guide.md#deep-dive-file-based-discovery-and-the-discovery-configuration-console) as well.

---

## Lab: Run Your First Discovery and File-Based Scan

**Goal:** Discover one Windows server, enable File-Based Discovery, and prove the scan ran — in the Status record and on the target.

1. **MID Server:** Confirm a MID Server is Validated and Up (All > Discovery > MID Servers).
2. **Credentials:** Add a Windows credential with local admin rights on the target (All > Discovery > Credentials) and test it.
3. **Baseline run:** Run Quick Discovery against the target IP. Open the Status record; confirm a CI was created/updated (`cmdb_ci_win_server`) and note `last_discovered`.
4. **Enable FBD:** Configuration Console → Enable File Based Discovery → Folders To Scan: keep `c:\program files*`, **remove `c:\windows`** if present → Blacklist: `.log`, `.tmp` → Common: Maximum Files 100000, Frequency **Monthly**.
5. **Re-run Discovery** against the same target.
6. **Verify on the instance:** Status record completes; Discovery Log shows the **Windows - File Based Discovery** probe; check `cmdb_sam_sw_install` for new installations on the CI and `cmdb_unidentified_file_set` for unmatched files.
7. **Verify on the target:** Check `C:\Windows\Temp` for the `snc_tmp_*.tmp` scan file timestamped with your run.
8. **Write down** which layer of the filtering model explains every file you saw collected — and every one you didn't.

## Quiz

1. What are the four phases of a Discovery run, and in which phase does File-Based Discovery execute?
<details><summary>Answer</summary>Scanning, Classification, Identification, Exploration. FBD executes during Exploration.</details>

2. Where do you enable File-Based Discovery, and what must have happened before it will trigger for the first time?
<details><summary>Answer</summary>In the Discovery profile; needs a successful identification (CI created) first.</details>

3. A file matches an extension wildcard **and** the blacklist. Is it collected? Why?
<details><summary>Answer</summary>Not collected; blacklist overrides wildcard.</details>

4. You ran Discovery successfully but no file-based scan appears in the log. Name three things to check, in order.
<details><summary>Answer</summary>1. Check MID Server status; 2. Check Discovery Profile configuration; 3. Check target OS permissions.</details>

5. How do you prove an FBD scan actually executed on a Windows target — what file, in which folder?
<details><summary>Answer</summary>C:\Windows\Temp\servicenow_discovery.log (or similar agent log).</details>

6. A discovered `.exe` has no CDS signature. Which table does it land in, and who deals with it?

---

*Part of the ServiceNow Module Guides. Verify behaviour against your own instance and the official ServiceNow documentation.*



---


## 📺 Visual & Video Guides

### Discovery Explained
<div style="text-align: center; margin: 1.5rem 0;">
  <iframe width="560" height="315" src=" title="Discovery Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

Fallback link: [Discovery Explained]()
---

*Part of the ServiceNow Module Guides. Verify behaviour against your own instance and the official ServiceNow documentation.*


---

*Part of the ServiceNow Module Guides. Verify behaviour against your own instance and the official ServiceNow documentation.*



---


## 📺 Visual & Video Guides

### Discovery Explained
<div style="text-align: center; margin: 1.5rem 0;">
  <iframe width="560" height="315" src=" title="Discovery Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

Fallback link: [Discovery Explained]()

---


## 📺 Visual & Video Guides

### Discovery Explained
<div style="text-align: center; margin: 1.5rem 0;">
  <iframe width="560" height="315" src=" title="Discovery Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

Fallback link: [Discovery Explained]()
---

*Part of the ServiceNow Module Guides. Verify behaviour against your own instance and the official ServiceNow documentation.*
<details><summary>Answer</summary>cmdb_ci_discovered_item (unidentified); the Discovery admin/owner resolves it.</details>

---

*Part of the ServiceNow Module Guides. Verify behaviour against your own instance and the official ServiceNow documentation.*
<details><summary>Answer</summary>cmdb_ci_discovered_item (unidentified); the Discovery admin/owner resolves it.</details>


---


## 📺 Visual & Video Guides

### Discovery Explained
<div style="text-align: center; margin: 1.5rem 0;">
  <iframe width="560" height="315" src=" title="Discovery Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

Fallback link: [Discovery Explained]()
---

*Part of the ServiceNow Module Guides. Verify behaviour against your own instance and the official ServiceNow documentation.*
<details><summary>Answer</summary>cmdb_ci_discovered_item (unidentified); the Discovery admin/owner resolves it.</details>

---

*Part of the ServiceNow Module Guides. Verify behaviour against your own instance and the official ServiceNow documentation.*
<details><summary>Answer</summary>cmdb_ci_discovered_item (unidentified); the Discovery admin/owner resolves it.</details>


---


## 📺 Visual & Video Guides

### Discovery Explained
<div style="text-align: center; margin: 1.5rem 0;">
  <iframe width="560" height="315" src=" title="Discovery Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

Fallback link: [Discovery Explained]()

---


## 📺 Visual & Video Guides

### Discovery Explained
<div style="text-align: center; margin: 1.5rem 0;">
  <iframe width="560" height="315" src=" title="Discovery Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

Fallback link: [Discovery Explained]()
---

*Part of the ServiceNow Module Guides. Verify behaviour against your own instance and the official ServiceNow documentation.*

---

---

---

---

## 🎓 Official Learning Resources

To avoid unofficial or outdated content, always use these validated official ServiceNow sources:

### 📺 Verified Videos & Playlists
- [How to: Get Started with ITOM Discovery](https://www.youtube.com/watch?v=vLBDPIW-yT0)
- [ITOM Academy: Discovery and CMDB Diagnostics](https://www.youtube.com/watch?v=8xCHM7Q12vA)
- [Enhancing Application Portfolio Management with ITOM Visibility](https://www.youtube.com/watch?v=A6FzPmLeLms)
- [ITOM Visibility Overview](https://www.youtube.com/@ServiceNowDocs/search?query=ITOM%20Visibility)

### 🚀 The Authoritative Path
1. **Now Learning (Structured Training)**
   - The only official source for certification paths and structured video courses.
   - [Go to Now Learning Portal](https://nowlearning.com/) $\rightarrow$ Search for "ITOM Discovery"
   
2. **Product Documentation (Technical Reference)**
   - The definitive source for every table, field, and OOB behavior.
   - [ServiceNow Product Documentation](https://docs.servicenow.com/) $\rightarrow$ Search for "ITOM Discovery"
