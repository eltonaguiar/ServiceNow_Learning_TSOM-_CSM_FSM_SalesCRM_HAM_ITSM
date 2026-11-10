# Salesforce User Management & Data Handling

**Agent:** opencode  
**Date:** 2026-11-10  
**Platform:** Salesforce  
**Purpose:** User management, profiles, roles, data integrity, security, and data handling best practices  
**Confidence:** high  

---

## Contents

- [Users: Creation & Lifecycle](#users-creation--lifecycle)
- [Profiles & Permission Sets](#profiles--permission-sets)
- [Roles & Record Sharing](#roles--record-sharing)
- [Licenses & Permission Types](#licenses--permission-types)
- [Data Import & Export](#data-import--export)
- [Data Integrity & Quality](#data-integrity--quality)
- [Field-Level Security & Encryption](#field-level-security--encryption)
- [Duplicate Management](#duplicate-management)
- [Data Design Best Practices](#data-design-best-practices)
- [Troubleshooting Data & Access Issues](#troubleshooting-data--access-issues)

---

## Users: Creation & Lifecycle

### Creating a User

**Path:** Setup > Users > New User

| Field | What It Does |
|-------|-------------|
| **First Name / Last Name** | User's display name |
| **Email** | Login ID and notification address |
| **Username** | Must be unique across all Salesforce orgs (email format) |
| **User License** | Determines feature access (Salesforce, Platform, Chatter Free, etc.) |
| **Profile** | Base permissions (objects, fields, apps) |
| **Role** | Record-level sharing position in hierarchy |
| **Alias** | Short identifier shown in lists |
| **Time Zone / Locale** | Affects date/time formatting and business hours |

### User States

| State | Description |
|-------|-------------|
| **Active** | Can log in and use Salesforce |
| **Inactive (Frozen)** | Cannot log in; keeps history and records |
| **Deactivated** | Cannot log in; license freed up (can't be reactivated, must recreate) |

**Best practice:** Freeze users instead of deactivating when they leave temporarily. Deactivate only when you need the license back and won't need the user again.

### Password & Login Management

| Task | Path |
|------|------|
| Reset user password | Setup > Users > [User] > Reset Password(s) |
| Unlock user | Setup > Users > [User] > Unlock |
| View login history | Setup > Users > [User] > Login History |
| Session management | Setup > Session Settings |

---

## Profiles & Permission Sets

### Profiles

A **Profile** is the base permission set. Every user has exactly one profile.

| Setting | Controls |
|---------|----------|
| Object Permissions | Read, Create, Edit, Delete per object |
| Field-Level Security | Read/Edit per field |
| Page Layouts | Which layout a user sees per object |
| Apps & Tabs | Which apps and tabs are visible |
| Login Hours | When the user can log in |
| Login IP Ranges | From which IP addresses the user can log in |
| Password Policies | Password complexity, expiration |

**Best practice:** Use profiles for role-based base access (e.g., "Sales Rep Profile," "Support Agent Profile"). Use Permission Sets for exceptions.

### Permission Sets

**Permission Sets** grant additional access without changing the user's profile.

| Use Case | Example |
|----------|---------|
| Temporary access | Contractor needs edit access to one object for 2 weeks |
| Role-based exception | Marketing manager needs edit access to Campaigns (not in their base profile) |
| Feature license | User needs access to a specific feature (e.g., Marketing Cloud connector) |

### Permission Set Groups

Bundle multiple Permission Sets into one group for easier assignment.

**Example:** "Sales Team Bundle" = Sales Base + Commission Edit + Reports Access + Dashboard View

---

## Roles & Record Sharing

### Org-Wide Defaults (OWD)

OWD sets the **baseline** record visibility. Sharing can only *expand* access, never restrict below OWD.

| Setting | Meaning |
|---------|---------|
| **Private** | Only owner and above in role hierarchy can see |
| **Public Read Only** | Everyone can see, only owner can edit |
| **Public Read/Write** | Everyone can see and edit |
| **Controlled by Parent** | Child record visibility follows parent (Master-Detail only) |

**Path:** Setup > Sharing Settings

### Role Hierarchy

Users higher in the role hierarchy can see records owned by users below them.

```
CEO (sees everything)
├── VP Sales (sees all sales reps' records)
│   ├── Sales Manager East (sees East reps' records)
│   │   ├── Sales Rep A
│   │   └── Sales Rep B
│   └── Sales Manager West (sees West reps' records)
│       ├── Sales Rep C
│       └── Sales Rep D
└── VP Support (sees all support agents' records)
```

### Sharing Rules

Sharing rules *extend* access beyond OWD and role hierarchy.

| Type | Based On | Example |
|------|----------|---------|
| **Criteria-Based** | Field values | Share all "High Priority" cases with Executive Team |
| **Owner-Based** | Record owner | Share all records owned by "East Region" with "West Region Managers" |
| **Territory-Based** | Territory | Share accounts in "Enterprise Territory" with "Enterprise Support Team" |

**Path:** Setup > Sharing Settings > [Object] > Sharing Rules

### Manual Sharing

Record owners can manually share individual records with specific users or groups.

**Path:** On a record page > Sharing button > Add User/Group

---

## Licenses & Permission Types

| License Type | Typical Use | Can See Standard CRM? | Can Create Custom Apps? |
|--------------|-------------|----------------------|------------------------|
| **Salesforce** | Sales, service, full CRM users | Yes | Yes |
| **Salesforce Platform** | Custom app users (no standard CRM) | Limited | Yes |
| **Chatter Free** | Collaboration, feed only | No | No |
| **External Identity** | Customers/partners (Experience Cloud) | No | No |
| **Service Cloud** | Service console users | Yes | Yes |

### Permission Types

| Type | Granted By | Scope |
|------|-----------|-------|
| Profile | Profile | Base object/field access |
| Permission Set | Assignment | Additional object/field access |
| Permission Set Group | Assignment | Bundle of permission sets |
| Role | Role assignment | Record-level visibility |
| Sharing Rule | Criteria/Owner | Extended record visibility |

---

## Data Import & Export

### Data Import Wizard

**Path:** Setup > Data > Data Import Wizard

Best for: Fewer than 50,000 records, standard objects (Accounts, Contacts, Leads, Solutions, Person Accounts, Custom Objects)

| Step | Action |
|------|--------|
| 1 | Select object and operation (Add, Update, Upsert) |
| 2 | Upload CSV file |
| 3 | Map CSV columns to Salesforce fields |
| 4 | Match records (for upsert: match on external ID or Salesforce ID) |
| 5 | Review and import |

### Data Loader

**Path:** Download from Setup > Data > Data Loader (client application)

Best for: 50,000 to 5 million records, all objects including custom

| Operation | What It Does |
|-----------|-------------|
| **Insert** | Create new records |
| **Update** | Update existing records (need Salesforce ID) |
| **Upsert** | Update if exists, insert if not (need external ID) |
| **Delete** | Delete records (need Salesforce ID) |
| **Hard Delete** | Permanently delete (bypass recycle bin) |
| **Export** | Export records via SOQL query |

### Export

**Path:** Setup > Data > Export or Export All

| Option | What It Includes |
|--------|-----------------|
| **Export** | Active records, not deleted |
| **Export All** | All records including deleted (in recycle bin) |

Output: ZIP file with CSV files per object

---

## Data Integrity & Quality

### Validation Rules

**Path:** Setup > Object Manager > [Object] > Validation Rules

Validation rules prevent bad data from being saved.

**Example:** Opportunity Amount must be positive when Stage is "Closed Won"

```sql
AND(
    ISPICKVAL(StageName, 'Closed Won'),
    Amount <= 0
)
```

**Error message:** "Amount must be greater than zero for Closed Won opportunities."

### Required Fields

| Method | When to Use |
|--------|-------------|
| Field-level Required (in field definition) | Always required, everywhere |
| Validation Rule | Required only under certain conditions |
| Page Layout Required | Required on that layout only (can be bypassed via API) |

### Dependent Picklists

**Path:** Setup > Object Manager > [Object] > Fields & Relationships > [Picklist Field] > Dependent Picklist

Controls picklist values based on another field.

**Example:** Country = "USA" → State shows US states only; Country = "Canada" → State shows Canadian provinces.

### Record Types

**Path:** Setup > Object Manager > [Object] > Record Types

Different page layouts, picklist values, and business processes per object.

**Example:** Case Record Types: "Technical Support" (shows technical fields), "Billing Inquiry" (shows billing fields).

---

## Field-Level Security & Encryption

### Field-Level Security (FLS)

**Path:** Setup > Object Manager > [Object] > Fields & Relationships > [Field] > Set Field-Level Security

Controls who can see and edit each field.

| Setting | Effect |
|---------|--------|
| **Visible** | Field appears on page layouts and reports |
| **Read Only** | Field visible but cannot be edited |
| **Hidden** | Field not visible (even in reports/API) |

**Best practice:** Set FLS at the Profile level, not page layout. Page layouts can be bypassed via API or reports; FLS cannot.

### Shield Platform Encryption

Encrypts sensitive data at rest.

| Encryption Type | What It Encrypts | Where |
|-----------------|-----------------|-------|
| **Deterministic** | Same value always encrypts the same (searchable) | Custom fields, standard text fields |
| **Probabilistic** | Same value encrypts differently each time (more secure) | Text fields, text areas, email, phone |

**Path:** Setup > Encryption > Encryption Policy

**Note:** Requires Shield license. Consider if you're storing PII (SSN, credit card numbers, health data).

---

## Duplicate Management

### Matching Rules

**Path:** Setup > Duplicate Management > Matching Rules

Define what makes two records "the same" (e.g., same email, same phone + same name).

### Duplicate Rules

**Path:** Setup > Duplicate Management > Duplicate Rules

Define what happens when a duplicate is detected:

| Action | Behavior |
|--------|----------|
| **Alert** | Warn user, allow save |
| **Block** | Prevent save |
| **Report** | Create a duplicate record report |

**Example:** Block creation of a Lead if email already exists on a Contact.

---

## Data Design Best Practices

### Object Design

| Practice | Why |
|----------|-----|
| Use standard objects when possible | Less maintenance, better integration |
| Extend `task` or `event` for activity-like objects | Inherits activity features |
| Use Master-Detail for tight parent-child | Roll-up summaries, cascade delete |
| Use Lookup for loose associations | Flexibility, child can exist without parent |
| Limit custom fields per object (< 500) | Performance and manageability |

### Field Design

| Practice | Why |
|----------|-----|
| Use picklists instead of free text for categories | Consistent reporting |
| Use checkboxes for boolean states | Clearer than picklist Yes/No |
| Set defaults where possible | Less user error, faster entry |
| Use external IDs for integration keys | Upsert without Salesforce ID |
| Index frequently queried fields | Faster SOQL reports and code |

### Relationship Design

| Practice | Why |
|----------|-----|
| Master-Detail when child can't exist without parent | Data integrity, cascade delete |
| Lookup when child can exist independently | Flexibility |
| Avoid lookup loops (A → B → C → A) | Recursive logic, data integrity issues |
| Use junction objects for many-to-many | Two master-detail relationships on one object |

---

## Troubleshooting Data & Access Issues

| Symptom | Where to Check | Likely Cause |
|---------|---------------|-------------|
| User can't see a record | Sharing Settings, Role Hierarchy, Sharing Rules | OWD too restrictive, user not in role hierarchy |
| User can't see a field | Profiles > Field-Level Security | FLS = Hidden for their profile |
| User can't edit a field | Profiles > Field-Level Security, Page Layouts | FLS = Read Only, or field required but not on layout |
| Record won't save | Validation Rules | Data fails validation criteria |
| Duplicate records created | Duplicate Rules, Matching Rules | No duplicate rule, or rule set to Alert only |
| Report shows wrong data | Report filters, Role Hierarchy, Sharing | User lacks access to underlying records |
| Import failed | Data Loader logs, Import Wizard errors | Mapping errors, missing required fields, duplicate rules |

### The "Why Can't I See This?" Checklist

1. Is the user Active?
2. Does their Profile have Read access to the object?
3. Does their Profile have Read access to the field?
4. Is their Role positioned correctly in the hierarchy?
5. Is there a Sharing Rule granting access?
6. Is Org-Wide Default too restrictive?
7. Is the record owned by someone they can see through hierarchy?

---
