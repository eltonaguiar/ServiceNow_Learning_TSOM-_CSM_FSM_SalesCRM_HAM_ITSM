# Data Management & Migration — Interview Prep

**Agent:** opencode  
**Date:** 2026-11-10  
**Module:** Data Management (Import Sets, Transform Maps, Reconciliation, Data Cleansing)  
**Confidence:** high  

---

## Contents

- [Purpose](#purpose)
- [Import Sets & Transform Maps](#import-sets--transform-maps)
- [Data Cleansing & Reconciliation](#data-cleansing--reconciliation)
- [Identification & Reconciliation (IRE)](#identification--reconciliation-ire)
- [Legacy Data Migration Strategy](#legacy-data-migration-strategy)
- [Collapsible Labs](#collapsible-labs)
- [Key Tables](#key-tables)
- [Common Mistakes](#common-mistakes)
- [Interview Talking Points](#interview-talking-points)
- [Official Learning Resources](#official-learning-resources)

---

## Purpose

Data management in ServiceNow covers importing, cleansing, transforming, and reconciling data from external systems. For a ServiceNow Developer, this means being able to move legacy data into ServiceNow accurately, handle imperfect source data, and prevent duplicates through Identification & Reconciliation (IRE).

This is critical for migration projects, integrations, and ongoing data quality — all of which appear in the Court Services/Toronto JD ("experience addressing inconsistent or imperfect legacy data during migration or synchronization").

---

## Official Exam Alignment — CSA & CAD

### CSA — Certified System Administrator (KB0011554, updated January 2026)
| Guide Section | CSA Domain | Exam Weight | What's Covered |
|---------------|------------|-------------|----------------|
| **Import Sets & Transform Maps** | Domain 5: Database Management — Importing Data | 30% | Import sets, transform maps, data loading |
| **Identification & Reconciliation (IRE)** | Domain 5: Database Management — CMDB and CSDM | 30% | Identification rules, reconciliation rules, data source precedence |

### CAD — Certified Application Developer (KB0011498)
| Guide Section | CAD Domain | Exam Weight | What's Covered |
|---------------|------------|-------------|----------------|
| **Import Sets & Transform Maps** | Domain 5: Working with External Data — Import data in CSV or Excel format | 10% | Import sets, transform maps, data cleansing |
| **Legacy Data Migration Strategy** | Domain 5: Working with External Data — Integrate to external data source using REST | 10% | Data migration planning, legacy system integration |

**Official preparation courses (CSA):**
- Welcome to ServiceNow
- ServiceNow Administration Fundamentals

**Official preparation courses (CAD):**
- Welcome to ServiceNow
- Scripting in ServiceNow Fundamentals
- Application Development Fundamentals

**Exam guidance:** Questions are based on official ServiceNow training materials, the ServiceNow Product documentation site, and the ServiceNow developer site.

---

## Import Sets & Transform Maps

### Import Set Flow

```
Source File (CSV/Excel) → Import Set Table (staging) → Transform Map → Target Table (e.g., incident, cmdb_ci, user)
```

### Import Set Table

| Component | Purpose |
|-----------|---------|
| **Import Set** | Staging table that holds raw imported data temporarily |
| **Transform Map** | Maps import set fields to target table fields |
| **Transform Script** | JavaScript that runs per record during transform for complex logic |
| **Coalesce** | Field(s) used to match existing records (prevents duplicates) |

### Transform Map Fields

| Field | Purpose |
|-------|---------|
| **Source** | Import set field name |
| **Target** | Target table field name |
| **Coalesce** | ✓ if this field is used to match existing records |
| **Transform Script** | Optional per-field or per-record JavaScript |
| **Order** | Execution order when multiple maps target the same table |

### Coalesce Behavior

| Coalesce Setting | Result |
|------------------|--------|
| **Coalesce = true** | If match found → update existing record; if no match → insert new |
| **Coalesce = false** | Always insert new record (creates duplicates) |
| **Multiple coalesce fields** | All must match to update (AND logic) |

---

## Data Cleansing & Reconciliation

### Data Cleansing Techniques

| Technique | When to Use | Example |
|-----------|-------------|---------|
| **Transform Script** | Per-field cleanup during import | Trim whitespace, uppercase, date format conversion |
| **Reference Qualification** | Ensure references point to valid records | Only allow active users in `assigned_to` |
| **Data Lookup** | Enrich imported data with reference data | Map legacy department codes to ServiceNow department names |
| **Default values** | Handle null/missing source values | Set `priority = 3` if source field is empty |
| **Field mapping rules** | Transform values between systems | Legacy "Sev1" → ServiceNow "1 - Critical" |

### Reconciliation Process

| Step | Action |
|------|--------|
| **1. Identify** | Use identification rules to find if a record already exists |
| **2. Compare** | Compare field values between source and existing record |
| **3. Merge/Update** | Update existing record with source data (based on reconciliation priority) |
| **4. Report** | Log discrepancies for review |

### Data Quality Dimensions

| Dimension | Description |
|-----------|-------------|
| **Completeness** | Required fields are populated |
| **Accuracy** | Data reflects real-world values |
| **Consistency** | Same data represented the same way across systems |
| **Timeliness** | Data is current |
| **Uniqueness** | No duplicate records |

---

## Identification & Reconciliation (IRE)

IRE is ServiceNow's engine for preventing duplicate CIs and records.

### Identification Rules

| Rule Type | Match Criteria | Example |
|-----------|---------------|---------|
| **Serial Number** | `serial_number` + `manufacturer` + `model` | Server with same SN, maker, model = same CI |
| **MAC Address** | Network interface MAC | Network card with same MAC = same CI |
| **Hostname + DNS** | `name` + DNS domain | Same host on same domain = same CI |
| **Asset Tag** | `asset_tag` | Same physical tag = same CI |
| **Custom** | Any combination of fields | Custom logic for legacy identifiers |

### Reconciliation Priority

| Priority | Source | Trust Level |
|----------|--------|-------------|
| 1 (highest) | Discovery | Directly observed, most trusted |
| 2 | Import Set from trusted system | Bulk load from HR/finance system |
| 3 | Manual entry | Human-entered, least trusted |

When two sources conflict, the higher-priority source wins.

### IRE Flow

```
Discovery/Import → Identification Rule → Match Found?
    │
    ├── YES → Reconciliation → Update existing CI (higher priority wins)
    │
    └── NO → Create new CI
```

---

## Legacy Data Migration Strategy

### Migration Phases

| Phase | Activities | Deliverables |
|-------|-----------|-------------|
| **1. Assessment** | Profile legacy data, identify quality issues, map fields | Data mapping document, issue log |
| **2. Cleansing** | Fix duplicates, standardize formats, validate references | Cleansed staging data |
| **3. Pilot** | Import small sample, validate results, refine transform maps | Pilot import results, sign-off |
| **4. Full Import** | Import production data, monitor for errors | Imported records, exception report |
| **5. Post-Migration** | Reconcile, validate, decommission legacy system | Final data quality report |

### Common Legacy Data Issues

| Issue | Example | Mitigation |
|-------|---------|------------|
| **Duplicate records** | Same customer in two systems | Coalesce on email/customer ID in transform map |
| **Missing required fields** | No `short_description` on legacy incidents | Set defaults in transform script |
| **Invalid references** | `assigned_to` points to terminated employee | Reference qualification + default assignment group |
| **Date format mismatches** | `MM/DD/YYYY` vs `YYYY-MM-DD` | Transform script date parsing |
| **Inconsistent codes** | Legacy "Sev1", "Priority 1", "Critical" | Lookup table mapping to standard values |
| **Orphaned records** | Child records without parent | Import parent first, then children |

---

## Collapsible Labs

<details>
<summary><strong>Lab 1: Import Set + Transform Map (CSV to Incident)</strong></summary>

**Goal:** Import a CSV file of incidents into ServiceNow using Import Set and Transform Map.

**Prerequisites:** CSV file with columns: `number, short_description, priority, assignment_group, opened_by`

**Steps:**
1. Navigate to **System Import Sets > Import Sets > New**
   - Name: "Legacy Incident Import"
   - Table: `import_set` (or create a custom import table)
   - Upload CSV file
2. Navigate to **System Import Sets > Transform Maps > New**
   - Name: "Legacy Incident to Incident"
   - Source table: Your import set table
   - Target table: `incident`
   - Transform script (optional): Set default priority if empty
3. Create field maps:
   - `number` → `number` (Coalesce: ✓)
   - `short_description` → `short_description` (Coalesce: ✗)
   - `priority` → `priority` (Coalesce: ✗)
   - `assignment_group` → `assignment_group` (Coalesce: ✗, transform script to resolve name to sys_id)
4. Click **Transform** — preview then execute
5. Verify incidents created in `incident` table

**Verify:** Check that coalesce on `number` prevents re-importing the same incident.

</details>

<details>
<summary><strong>Lab 2: Transform Script for Data Cleansing</strong></summary>

**Goal:** Use a transform script to cleanse imperfect legacy data during import.

**Steps:**
1. Create a transform map field map on a text field (e.g., `department`)
2. Add a transform script:
   ```javascript
   function transform(source, target) {
       // Trim whitespace
       var dept = source.department ? source.department.toString().trim() : '';
       // Uppercase
       dept = dept.toUpperCase();
       // Map legacy codes
       var deptMap = {
           'FIN': 'Finance',
           'HR': 'Human Resources',
           'IT': 'Information Technology',
           'LEGAL': 'Legal Services'
       };
       target.department = deptMap[dept] || dept || 'Unknown';
       return true;
   }
   ```
3. Import a CSV with messy department values (lowercase, codes, blanks)
4. Verify cleansed values in target records

**Verify:** All departments are standardized; blanks map to 'Unknown'.

</details>

<details>
<summary><strong>Lab 3: Identification Rule for Duplicate Prevention</strong></summary>

**Goal:** Create an identification rule that prevents duplicate CIs by serial number.

**Steps:**
1. Navigate to **Configuration > Identification/Reconciliation > Identification > New**
   - Name: "Server by Serial Number"
   - Table: `cmdb_ci_server`
   - Match criteria:
     - `serial_number` is not empty
     - `manufacturer` is not empty
     - `model` is not empty
   - Match using: All fields must match (AND)
2. Navigate to **Configuration > Identification/Reconciliation > Reconciliation > New**
   - Name: "Server Reconciliation"
   - Source: `discovery`
   - Target: `cmdb_ci_server`
   - Identification: "Server by Serial Number"
   - Reconciliation priority: 1
3. Run a Discovery scan or import server data
4. Verify duplicate serial numbers update existing CIs instead of creating new ones

**Verify:** Import same serial number twice — only one CI exists.

</details>

---

## Key Tables

| Table | Purpose |
|-------|---------|
| `sys_import_set` | Import set definitions |
| `sys_import_set_row` | Individual rows in an import set |
| `sys_import_set_column` | Column definitions |
| `sys_transform_map` | Transform map definitions |
| `sys_transform_map_field` | Field mappings within a transform map |
| `sys_transform_map_script` | Transform scripts |
| `sys_metadata_measure` | Data quality metrics |
| `cmdb_ci` | Configuration items (target of CI imports) |

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Coalesce = false on unique field | Duplicate records on every import | Set coalesce = true on unique identifier (number, serial, email) |
| No transform script for reference fields | `assignment_group` stays empty (name ≠ sys_id) | Add transform script to resolve name to sys_id |
| Importing without cleansing first | Garbage data in production | Cleanse source data before import, or cleanse in transform script |
| No identification rules | Duplicate CIs after Discovery | Configure IRE identification rules before Discovery |
| Importing children before parents | Orphaned records, broken references | Import parent records first, then children |
| Skipping pilot import | Surprises in full import | Always test with small sample first |

---

## Interview Talking Points

**Q: "How do you handle imperfect legacy data during migration?"**

A: "I profile the source data first to identify quality issues — duplicates, missing fields, invalid references, inconsistent codes. Then I build transform maps with coalesce on unique identifiers to prevent duplicates, and use transform scripts to cleanse and standardize values (trim, uppercase, map legacy codes, set defaults). I always run a pilot import on a small sample, validate the results, and only then proceed to full import."

**Q: "What is a coalesce field and why does it matter?"**

A: "A coalesce field tells ServiceNow how to match an imported record to an existing one. If coalesce is true and a match is found, the existing record is updated; if not, a new record is inserted. Without coalesce, every import creates duplicates. I typically coalesce on unique identifiers like incident number, serial number, or email."

**Q: "What is IRE and when does it matter?"**

A: "IRE (Identification & Reconciliation Engine) prevents duplicate CIs and resolves conflicts between data sources. Identification rules determine if a discovered or imported CI already exists. Reconciliation decides which data source wins when values conflict (Discovery > Import Set > Manual). It matters because duplicate CIs break impact analysis, service mapping, and change risk assessment."

**Q: "How do you handle reference fields during import?"**

A: "Reference fields store sys_ids, not display names. In a transform map, I either use a transform script to look up the target record by name and set the sys_id, or I ensure the source data already contains sys_ids. I also add reference qualification to prevent invalid references."

---

## Official Learning Resources

### Now Learning (Structured Training)
- [Data Management Fundamentals](https://nowlearning.com/) — Search "import sets" or "data management" on Now Learning Portal
- [CMDB Fundamentals — IRE](https://nowlearning.com/) — Search "identification reconciliation" on Now Learning Portal
- [Transform Maps](https://nowlearning.com/) — Search "transform map" on Now Learning Portal

### Product Documentation (Technical Reference)
- [ServiceNow Product Documentation — Import Sets](https://docs.servicenow.com/) → Search "import sets", "transform maps"
- [ServiceNow Product Documentation — IRE](https://docs.servicenow.com/) → Search "identification reconciliation"
- [ServiceNow Product Documentation — Data Quality](https://docs.servicenow.com/) → Search "data quality", "CMDB Health"

### Official Videos & Playlists
- [ServiceNow YouTube Channel](https://www.youtube.com/c/ServiceNow) — Search "ServiceNow import sets", "ServiceNow transform map", "ServiceNow identification reconciliation"
- [Import sets demo](https://www.youtube.com/results?search_query=servicenow+import+set+transform+map+demo)
- [IRE deep dive](https://www.youtube.com/results?search_query=servicenow+identification+reconciliation+engine)

---
