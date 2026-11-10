# ServiceNow Code Deployment & Instance Management — Interview Prep

**Agent:** opencode  
**Date:** 2026-11-10  
**Module:** Platform Administration / Code Deployment  
**Confidence:** high  

---

## Contents

- [Purpose](#purpose)
- [Instance Cloning & Maintenance](#instance-cloning--maintenance)
- [The 3 Types of Update Sets](#the-3-types-of-update-sets)
- [Source Control & Git Repo](#source-control--git-repo)
- [Collapsible Labs](#collapsible-labs)
- [Key Tables](#key-tables)
- [Common Mistakes](#common-mistakes)
- [Interview Talking Points](#interview-talking-points)
- [Official Learning Resources](#official-learning-resources)

---

## Purpose

Deployment hygiene separates junior admins from senior platform owners. You should be able to explain how changes move from development to production safely — through update sets, source control, cloning, and instance maintenance — without breaking production or losing work.

This page covers the four deployment topics that appear most often in ServiceNow JD requirements: cloning/instance maintenance, the three types of update sets, source control, and Git repository workflows.

---

## Instance Cloning & Maintenance

### Cloning

Cloning copies data and configuration from one ServiceNow instance to another (typically production → sub-production).

| Clone Type | Description | Typical Use |
|------------|-------------|-------------|
| **Full clone** | Copies all data, including transaction tables (incidents, tasks, etc.) | Refresh dev/test with recent production data |
| **Partial clone** | Copies schema and configuration only, excludes transaction tables | Faster refresh, cleaner dev environment |
| **Clone profile** | Reusable clone definition specifying which tables/databases to include | Consistent refreshes across environments |

### Clone Process

1. **Request clone** via ServiceNow Support (for customer instances) or clone definition (PDI/partner)
2. **Select source and target** instances
3. **Define clone profile** (what tables to include/exclude)
4. **Execute clone** — target instance is offline during the copy
5. **Post-clone tasks** — reset admin passwords, disable scheduled jobs, update MID Server references, clear cache

### Instance Maintenance

| Task | Purpose |
|------|---------|
| **Node shutdown** | Gracefully take an application node out of the cluster for patching |
| **Maintenance mode** | Prevent user logins during critical changes |
| **Scheduled maintenance** | Notify users of planned downtime via `cmn_ca_*` tables |
| **Cache clear** | Clear UI cache, client script cache, or scheme cache after updates |
| **Scheduled job review** | Disable non-essential jobs during maintenance windows |

**Post-clone checklist:**
- [ ] Reset `admin` password (clone copies production credentials)
- [ ] Disable inbound email (don’t email production customers from dev)
- [ ] Disable scheduled jobs that touch external systems
- [ ] Re-point MID Server references if source/target use different MID Servers
- [ ] Clear `sys_cache` and `sys_ui_cache` tables
- [ ] Verify clone status in `sys_clone_status`

---

## The 3 Types of Update Sets

Update sets group customizations so they can be moved between instances.

| Type | Created By | Scope | Typical Use |
|------|------------|-------|-------------|
| **1. Regular (Local) Update Set** | Admin/Developer manually via Update Sets module | Instance-specific | Ad-hoc changes, one-off fixes, emergency production patches |
| **2. Developer Update Set** | App Engine Studio / Studio automatically | App or module in development | Active development work; auto-created when you save a new app file |
| **3. Remote Update Set** | Source Control / Git integration | Distributed team | Changes pulled from Git; enables multi-developer collaboration and CI/CD |

### Update Set Lifecycle

```
Create → Develop (add customizations) → Complete → Commit → Test on Target → Apply → Close (or Ignore/Delete)
```

### Key States

| State | Meaning |
|-------|---------|
| **In progress** | Being actively developed; customizations are captured |
| **Complete** | Development finished; ready to move to another instance |
| **Committed** | Pushed to another instance (via retrieve/update set XML) |
| **Applied** | Customizations loaded on target instance |
| **Ignore / Delete** | Abandoned; customizations not moved |

### Important Rules

- **One update set at a time per user** — only one "in progress" update set per user by default
- **Default update set** — the system captures changes in the default update set unless you switch; always verify your active update set before making changes
- **Update set XML** — export as XML for manual transfer between instances without source control
- **Preview update set** — review changes before committing to catch missing customizations

---

## Source Control & Git Repo

ServiceNow integrates with Git-based source control (GitHub, GitLab, Azure DevOps) via the **Source Control** application.

### How It Works

1. **Connect to Git repo** — Link your ServiceNow instance to a Git repository (personal access token or OAuth)
2. **Create a source control repo record** — Points to your Git repo URL, branch, and auth
3. **Sync update sets** — Pull remote update sets from Git into your instance, or push local update sets to Git
4. **Branch strategy** — Feature branches per change set, merged via pull request into main

### The 3 Update Set Types in Source Control Context

| Type | Source Control Relationship |
|------|----------------------------|
| **Regular (Local)** | Can be pushed to Git as a remote update set for backup/sharing |
| **Developer** | Auto-created in Studio; can be committed to Git as part of app development |
| **Remote** | Pulled from Git into the instance — this is how distributed teams share work |

### Typical Git Workflow

```
Developer creates feature branch in Git
    ↓
Remote update set pulled to dev instance
    ↓
Developer works in a local update set
    ↓
Update set completed → committed → pushed to Git as remote update set
    ↓
Pull request reviewed → merged to main
    ↓
Test instance pulls remote update set from main branch
    ↓
Production instance pulls after UAT sign-off
```

### Source Control Setup Checklist

- [ ] Source Control plugin active (`com.glide.source_control`)
- [ ] Git repo created (GitHub/GitLab/Azure DevOps)
- [ ] Personal access token or OAuth credentials configured
- [ ] Source Control Repo record created in ServiceNow
- [ ] Branch naming convention agreed (e.g., `feature/incident-auto-assign`)
- [ ] Pull request review process defined

---

## Collapsible Labs

<details>
<summary><strong>Lab 1: Create and complete a local update set</strong></summary>

**Goal:** Move a Business Rule from one instance to another using an update set.

**Steps:**
1. Navigate to **System Update Sets > Update Sets > New**
   - Name: "BR Auto-assign Incident"
   - State: `In progress` (default)
   - Click **Submit**
2. Set this as your **Default update set** (related link: "Make Default")
3. Create your Business Rule (e.g., auto-assign incident by category)
4. Verify the Business Rule appears in the update set's **Customizations** related list
5. Change update set state to **Complete**
6. Click **Retrieve Update Set** (if moving to another instance) or **Export XML** to save the file
7. On the target instance, import the XML or retrieve the update set, then click **Commit** then **Apply**
8. Close the update set

**Verification:** The Business Rule exists on the target instance and fires as expected.

</details>

<details>
<summary><strong>Lab 2: Developer update set in App Engine Studio</strong></summary>

**Goal:** See how Studio auto-creates a developer update set during app development.

**Steps:**
1. Navigate to **App Engine > Studio**
2. Create a new application (e.g., "Asset Tracking Demo")
3. Add a table, form, and flow within the app
4. Navigate to **System Update Sets > Update Sets**
5. Observe a **Developer update set** was auto-created with the app name as prefix
6. Examine its customizations — they match the Studio changes
7. Complete the developer update set when development is done

**Key insight:** Developer update sets tie your Studio work to the update set model so it can be moved between instances like any other change.

</details>

<details>
<summary><strong>Lab 3: Connect ServiceNow to Git (Source Control)</strong></summary>

**Goal:** Link your instance to a GitHub repo and sync a remote update set.

**Prerequisites:**
- GitHub repo (public or private)
- GitHub Personal Access Token with `repo` scope

**Steps:**
1. In ServiceNow, navigate to **Source Control > Source Control Repos > New**
   - Name: "My Company ServiceNow Repo"
   - Type: `Git`
   - URL: `https://github.com/yourorg/servicenow-config.git`
   - Branch: `main`
   - Authentication: `Basic Auth` or `Personal Access Token`
   - Username/Password or token: Your GitHub credentials
2. Click **Test Connection** — should return success
3. Click **Save**
4. Navigate to **Source Control > Source Control > Git > Pull**
   - Select your repo, choose `main` branch
   - Pull remote update sets from Git into your instance
5. Create a local update set, make a change, complete it
6. Navigate to **Source Control > Git > Push**
   - Select your completed update set
   - Push it to Git as a remote update set
7. Verify the update set XML appears in your GitHub repo

</details>

<details>
<summary><strong>Lab 4: Clone post-tasks checklist</strong></summary>

**Goal:** Safely prepare a cloned instance for development use.

**Steps:**
1. After a production→dev clone completes:
2. Log in as `admin`, reset the password immediately
3. Navigate to **System Properties > Email > Inbound** — set `glide.mail.bounce.email` to a test address, disable outbound email if needed
4. Navigate to **System Definition > Scheduled Jobs** — disable jobs that call external APIs or email customers
5. Clear cache: navigate to **System Diagnostics > Stats > Cache** → clear relevant caches
6. Verify `sys_clone_status` shows the clone completed successfully
7. Re-point any MID Server references if the dev environment uses different MID Servers

</details>

---

## Key Tables

| Table | Purpose |
|-------|---------|
| `sys_update_set` | Update set records |
| `sys_update_xml` | Individual customizations within an update set |
| `sys_update_set_relation` | Parent/child update set relationships |
| `sys_update_set_state` | Update set state definitions |
| `sys_source_control_repo` | Source control repository records |
| `sys_source_control_remote_update_set` | Remote update sets pulled from Git |
| `sys_clone_status` | Clone job status and history |
| `sys_clone_exclude` | Tables excluded from cloning |
| `sys_mid_server` | MID Server records (relevant post-clone) |
| `sys_properties` | System configuration properties |

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Making changes in the default update set | Can't track what changed; hard to revert | Always create/switch to a named update set before developing |
| Forgetting to complete an update set | Changes never leave the instance | Complete → commit → apply on target |
| Pushing incomplete update sets to Git | Broken builds on test/prod | Only push completed, tested update sets |
| Cloning without disabling scheduled jobs | Dev instance emails production customers | Disable outbound email and external jobs post-clone |
| Not testing update sets on a sub-prod instance first | Production breakage | Always apply to dev/test before production |
| Mixing regular and developer update sets in one app | Confusing XML exports | Keep them separate; complete developer sets before pushing |

---

## Interview Talking Points

**Q: "How do you move changes from dev to production?"**

A: "I develop in a named update set (or developer update set in Studio), complete it, test it on a sub-prod instance, then either retrieve it via update set XML or push it to Git as a remote update set. Production gets the change through source control — pull from main, commit, apply. I never develop directly in the default update set on production."

**Q: "What are the three types of update sets?"**

A: "Regular (local) update sets created manually for ad-hoc changes, developer update sets auto-created by App Engine Studio during app development, and remote update sets pulled from Git via source control for multi-developer and CI/CD workflows."

**Q: "What do you do after cloning production to dev?"**

A: "Reset the admin password, disable outbound email and customer-facing scheduled jobs, clear caches, verify clone status, and re-point MID Server references. I also verify `sys_clone_status` shows success before any development begins."

**Q: "How does source control work with update sets?"**

A: "ServiceNow connects to a Git repo via the Source Control application. Remote update sets are pulled from Git into the instance, local work is completed in local/developer update sets, then completed sets are pushed back to Git. Pull requests provide code review before changes reach main and flow down to test and production."

---

## Official Learning Resources

### Now Learning (Structured Training)
- [Update Sets Fundamentals](https://nowlearning.com/) — Search "update sets" on Now Learning Portal
- [Source Control for ServiceNow](https://nowlearning.com/) — Search "source control" on Now Learning Portal
- [App Engine Studio Fundamentals](https://nowlearning.com/) — Search "App Engine Studio" on Now Learning Portal
- [System Administration — Cloning](https://nowlearning.com/) — Search "cloning" on Now Learning Portal

### Product Documentation (Technical Reference)
- [ServiceNow Product Documentation — Update Sets](https://docs.servicenow.com/) → Search "update sets"
- [ServiceNow Product Documentation — Source Control](https://docs.servicenow.com/) → Search "source control git"
- [ServiceNow Product Documentation — Cloning](https://docs.servicenow.com/) → Search "clone instance"
- [ServiceNow Product Documentation — MID Server](https://docs.servicenow.com/) → Search "MID Server"

### Official Videos & Playlists
- [ServiceNow YouTube Channel](https://www.youtube.com/c/ServiceNow) — Search "ServiceNow update sets", "ServiceNow source control git", "ServiceNow clone instance"
- [Update Set best practices](https://www.youtube.com/results?search_query=servicenow+update+set+best+practices)
- [ServiceNow Git integration demo](https://www.youtube.com/results?search_query=servicenow+source+control+github+demo)

---
