---
layout: default
title: Discovery — Getting Started
---

# Discovery — Getting Started (2026)

**One line:** Discovery is how ServiceNow learns what actually exists — it scans the network through a MID Server and keeps the CMDB true, including the software files sitting on every server.

Back to the [guide index](./index.md) · [ITSM](./itsm.md) · [CSM](./csm.md) · [FSM](./fsm.md) · [TSOM](./tsom.md) · [Sales CRM](./sales-crm.md) · [HAM](./ham.md)

Full guide: [Discovery module guide](../docs/modules/discovery/discovery-guide.md)

---

## 1. What you actually build

| Object | Table | Note |
|---|---|---|
| Discovery schedule | `discovery_schedule` | When scans run, against which IP ranges |
| Discovery status | `discovery_status` | One record per run — verify FBD initiation here |
| Discovery log | `discovery_log` | Human-readable run messages |
| ECC Queue | `ecc_queue` | MID Server work orders and results — debug here first |
| MID Server | `ecc_agent` | The agent inside your network doing the scanning |
| Software installation | `cmdb_sam_sw_install` | Where matched software lands |
| Unidentified file set | `cmdb_unidentified_file_set` | Files FBD collected that no signature matched |

---

## 2. The fast path

1. **MID Server up** — All > Discovery > MID Servers: status Up, Validated = Yes.
2. **Credentials in** — All > Discovery > Credentials: a Windows credential that actually logs into the target.
3. **Run once** — Quick Discovery against one server IP; open the Status record and confirm a CI appeared.
4. **Turn on File-Based Discovery** — All > Discovery > Discovery Definition > **Configuration Console** → Enable File Based Discovery → define Folders To Scan and Frequency (Monthly by default). Requires the `com.snc.discovery.file_based_discovery` plugin and a completed initial CDS sync (~24h).
5. **Verify twice** — Discovery Log shows the **Windows - File Based Discovery** probe; on the target, `C:\Windows\Temp` holds the `snc_tmp_*.tmp` scan file from your run.

---

## 3. The filtering rule that trips everyone

File-Based Discovery collects a file if it matches a **Software/File Signature** *or* an **extension wildcard** — and drops it if it matches the **blacklist**, which wins over both. Wildcards are additive, not a limit: a signature-matched file is collected even if its extension is in no wildcard list. Anything matching none of the three is ignored.

Console areas to know: **Folders To Scan** (remove `c:\windows` — it murders scan times for no SAM value), **Folders To Ignore**, **Extensions Blacklist**, **Extensions Wildcards**, and **Common** (Maximum Files 100000; Frequency Monthly).

---

## 4. Prove it

- A Status record for your run with the file-based probe in the log.
- An `snc_tmp_*.tmp` file in `C:\Windows\Temp` on the target, timestamped with the run.
- At least one new row in `cmdb_sam_sw_install` — or one honest row in `cmdb_unidentified_file_set` you can explain with the filtering model.
