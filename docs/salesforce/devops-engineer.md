# Salesforce DevOps Engineer — Release Engineering Training

**Agent:** kilo  
**Date:** 2026-11-13  
**Platform:** Salesforce  
**Audience:** Someone who already did the crash course and now needs the release, pipeline, and environment skills in a commercial-banking DevOps Engineer (Salesforce) role  
**Confidence:** high on platform mechanics; tool button-paths differ by vendor, so those stay at the category level  
**Job this track is built from:** [DevOps Engineer (Salesforce)](https://jobs.scotiabank.com/job/Toronto-DevOps-Engineer%28Salesforce%29-ON-M5H-1A1/606915617/), Requisition 276046, Commercial Banking Engineering, Toronto

<p class="meta" style="margin-bottom: 24px;"><a href="../../index.md">← Back to ServiceNow Module Guides</a> · <a href="./crash-course.md">Crash course</a> · <a href="./navigation-breadcrumbs.md">Breadcrumbs</a> · <a href="./labs-design.md">Labs</a> · <a href="./user-management-data.md">Users & data</a></p>

---

## Contents

- [What this role actually owns](#what-this-role-actually-owns)
- [Training items](#training-items)
- [1. Source of truth](#1-source-of-truth)
- [2. Metadata that breaks releases](#2-metadata-that-breaks-releases)
  - [2b. Payload ceilings, destructive changes, the queue, references](#2b-payload-ceilings--the-limits-that-decide-whether-a-deploy-is-one-deploy)
- [3. Environments and sandboxes](#3-environments-and-sandboxes)
- [4. Branching](#4-branching)
- [5. CI/CD](#5-cicd)
- [6. DevOps tools](#6-devops-tools)
- [7. Conflict clinic](#7-conflict-clinic)
- [8. Packages](#8-packages)
- [9. Tests and validation](#9-tests-and-validation)
  - [The five test levels](#the-five-test-levels)
  - [Coverage is three different rules](#coverage-is-three-different-rules-not-one)
  - [`validate`, the 10-day window, and the sandbox trap](#validate-the-10-day-window-and-the-sandbox-trap)
  - [Which payloads force a test run](#which-payloads-force-a-test-run--and-the-version-trap)
- [10. Releases, hotfixes, rollback](#10-releases-hotfixes-rollback)
- [11. Banking change control](#11-banking-change-control)
- [12. Design patterns you have to coach](#12-design-patterns-you-have-to-coach)
- [13. Salesforce Governor Limits — What You Check Before You Deploy](#13-salesforce-governor-limits--what-you-check-before-you-deploy)
  - [13.1. How to Check Any Limit](#131-how-to-check-any-limit)
  - [13.2. Per-Limit Reference](#132-per-limit-reference)
  - [13.3. Quick Reference Table](#133-quick-reference-table)
  - [13.4. Monitoring Limits Proactively](#134-monitoring-limits-proactively)
  - [13.5. Common Limit Mistakes](#135-common-limit-mistakes)
- [Labs](#labs)
- [Interview drills](#interview-drills)
- [Certifications](#certifications)
- [Quiz](#quiz)

Do the [crash course](./crash-course.md) first if Apex, Flow, profiles, and permission sets are still fuzzy. This page does not repeat that material.

---

## What this role actually owns

The posting is not "write features." It is "make Salesforce releases fast, safe, and auditable" for a commercial-banking org.

| You own | You partner on | You do not own alone |
|---------|----------------|----------------------|
| Git history of metadata | Apex, triggers, LWC | Business requirements |
| Pipeline: validate, test, deploy | Flow design | Production data fixes without a ticket |
| Dev / QA / UAT / Pre-Prod / Prod path | QA test evidence | Security exceptions |
| Sandbox create, refresh, mask | Admin config in a story | Approving your own prod change |
| Conflict resolution on deploy | Dependency design | Deciding the release scope |
| Runbooks, rollback, audit pack | Platform limits | Bypassing change control because the deploy is "small" |

ELI5: developers build the furniture. You own the loading dock, the truck, the checklist, and the proof that the right furniture arrived in the right building without breaking the one already there.

---

## Training items

Work these in order. Each item maps to a line in requisition 276046.

| # | Training item | JD line it covers | Done when |
|---|----------------|-------------------|-----------|
| 1 | [Source of truth](#1-source-of-truth) | Metadata lifecycle in Git; Salesforce DX | You can retrieve one metadata type, commit it, and dry-run deploy it to a second org |
| 2 | [Metadata that breaks releases](#2-metadata-that-breaks-releases) | Limits, dependencies, deployment constraints | You can name the dependency a failed deploy is missing without opening the org |
| 3 | [Environments and sandboxes](#3-environments-and-sandboxes) | Dev, QA, UAT, Pre-Prod, Prod; sandbox create/refresh; data masking | You can draw the path and say which sandbox type each stage uses, and why a Full copy is masked |
| 4 | [Branching](#4-branching) | Feature, release, hotfix | You can say where a hotfix is cut from, and which branches it merges back into |
| 5 | [CI/CD](#5-cicd) | GitHub Actions, Azure DevOps, or GitLab | You can describe the same four stages in any of those tools |
| 6 | [DevOps tools](#6-devops-tools) | Gearset, Copado, AutoRABIT, or equivalent | You can say what the CLI does that the vendor UI does not replace |
| 7 | [Conflict clinic](#7-conflict-clinic) | Profiles, permission sets, record types, layouts, Flows, Apex | You have a fix for each, not just the symptom |
| 8 | [Packages](#8-packages) | Unlocked packages / managed packages | You can say when unpackaged source is still the right deploy |
| 9 | [Tests and validation](#9-tests-and-validation) | Automated testing and validation | You can explain dry-run vs quick deploy vs a real prod deploy |
| 10 | [Releases, hotfixes, rollback](#10-releases-hotfixes-rollback) | Scheduled releases, hotfixes, emergency deploys, runbooks, rollback | You can fill the runbook template in Lab D from memory |
| 11 | [Banking change control](#11-banking-change-control) | Audit, security, compliance; regulated environment | You can list the artifacts an auditor asks for after a prod deploy |
| 12 | [Design patterns you coach](#12-design-patterns-you-have-to-coach) | DevOps-friendly design; Apex, Flow, permission sets vs profiles | You can reject a story that edits `Admin.profile` for one field |

---

## 1. Source of truth

Production is not the source of truth. Git is. The org is a target you deploy to.

A Salesforce DX project is a folder of metadata XML plus `sfdx-project.json`. The modern CLI is `sf` (the old `sfdx` binary still appears in older runbooks; same product family).

Practice on two free Developer Edition orgs, aliased `dev` and `qa`:

```bash
sf --version
sf org login web --alias dev --instance-url https://login.salesforce.com
sf project retrieve start --metadata PermissionSet:CB_Release_Reader --target-org dev
sf project deploy start --dry-run --target-org qa
```

Confirm flags with `sf project deploy start --help` before you memorize them. CLI flags move; the idea does not: retrieve from the org you trust, review the diff, deploy to the next org, never edit production in Setup and "remember to copy it later."

What to commit:

- Custom objects, fields, validation rules, Flows, Apex, LWC, permission sets, custom metadata, named credentials **metadata** (not the secret)
- A manifest (`package.xml`) or a package directory the pipeline always deploys

What not to commit:

- Profiles as the place business access lives (see [conflict clinic](#7-conflict-clinic))
- `.sfdx/`, org auth files, consumer secrets, JWT private keys
- Retrieved junk you did not mean to ship (`*.profile` user lists, certificate bodies, sandbox-only endpoints)

Destructive deletes are a separate file, not a side effect of "it was not in the folder." Current CLI shape (confirm with `--help`):

```bash
sf project deploy start \
  --manifest manifest/package.xml \
  --post-destructive-changes manifest/destructiveChanges.xml \
  --target-org qa
```

Use pre-destructive changes only when the delete must happen before the add (for example, a rename that would collide). A delete in production is not undone by Git. Rollback of a delete means recreating the metadata, and any records that lived on a deleted custom object are gone.

Trailhead, verified:

- [Org Development Model](https://trailhead.salesforce.com/content/learn/modules/org-development-model)
- [Salesforce DX Development Model](https://trailhead.salesforce.com/content/learn/modules/sfdx_dev_model)
- [App Development with Salesforce DX](https://trailhead.salesforce.com/content/learn/modules/sfdx_app_dev)
- [Quick Start: Salesforce DX](https://trailhead.salesforce.com/content/learn/projects/quick-start-salesforce-dx)
- [package.xml](https://trailhead.salesforce.com/content/learn/modules/package-xml)
- [Git and GitHub basics](https://trailhead.salesforce.com/content/learn/modules/git-and-git-hub-basics)

---

## 2. Metadata that breaks releases

Salesforce deploys are not file copies. The Metadata API compiles the payload against the target org. If the payload references something the target does not have, and you did not include it, the deploy fails. If the payload is fine but tests fail, production rejects it.

| Failure you will see | Usual cause | What you check first |
|----------------------|-------------|----------------------|
| `no such column` / field does not exist | Flow, layout, formula, or Apex references a field not in this payload and not already in the target | Add the field, or deploy to the org that already has it |
| `invalid cross reference id` | Record type, layout, or business process assignment points at something missing | Deploy the parent (object, record type, layout) in the same payload |
| `entity not found` / Apex dependency | Class A uses class B, B is not deployed | Deploy the dependency, or stop referencing it |
| Test failure only in prod/UAT | Test uses a profile, record type, or custom setting that exists in Dev and not in the target | Make the test create its own data; do not rely on org data |
| Flow version deployed but users still see the old one | New version is not active | Activate the version, or deploy the flow as Active — confirm which your tool does |
| Coverage below 75% | Production gate | See [tests](#9-tests-and-validation) |
| `CANNOT_MODIFY_MANAGED_OBJECT` | You tried to change a managed-package component | Configure around it, or upgrade the package. Do not fork it in Git |

Governor limits still matter to you even if you are not writing the trigger. A deploy can succeed and the feature can still fall over in prod because the code is not bulkified. Read the [governor-limits section of the crash course](./crash-course.md) before you sign off on an Apex story. Your question in review: "what happens when this runs on 200 records?"

### 2b. Payload ceilings — the limits that decide whether a deploy is one deploy

These are Metadata API limits, and they are the reason "just deploy the whole org" stops working.

| Limit | Value |
|---|---|
| Maximum compressed `.zip` folder size | **~39 MB** |
| Maximum uncompressed folder size | **~600 MB** (629,145,600 bytes) |
| Maximum files in an unlocked or second-generation managed package | **10,000** |
| Maximum files in an AppExchange-reviewed 1GP | **35,000** |

Two mechanics behind the 39 MB figure, because interviewers ask:

- The Metadata API base64-encodes after compressing. The resulting `.zip` must not exceed **50 MB**, and
  base64 adds ~22%, so the **compressed payload must stay under ~39 MB before encoding**.

**The 39 MB figure is the one that gets misremembered.** You will see "400 MB" in training material and in
some AI-generated notes. That is wrong by an order of magnitude and it changes a design decision: a team
sizing a deployment against 400 MB will not think about splitting it. It is ~39 MB compressed, ~600 MB
uncompressed.

### Destructive changes are a separate file

Deletes are not a side effect of "it was not in the folder". They are an explicit manifest, and in
production they are not undone by Git:

```bash
sf project deploy start \
  --manifest manifest/package.xml \
  --post-destructive-changes manifest/destructiveChanges.xml \
  --target-org qa
```

- `post-destructive-changes` runs **after** the adds. Use it for ordinary removal.
- `pre-destructive-changes` runs **before**. Use it only when a delete must happen before an add — for
  example a rename that would collide.
- A delete in production is not undone by `git revert`. Rollback means recreating the metadata, and any
  records that lived on a deleted custom object are gone.

### The deployment queue is not FIFO

One deploy at a time per org, and the queue is **not** first-in-first-out. Two consequences for release
engineering:

1. A long validation blocks the window behind it, and you cannot assume your job jumps the queue because it
   was submitted first.
2. Two people deploying to the same org in the same window is a scheduling problem, not a technical one.
   Whoever deploys second may be deploying on top of a change nobody reviewed.

This is why the release calendar exists, and why "I'll just deploy my fix quickly" is a release-control
problem even when the fix is one field.

### Which payloads force a test run — and the version trap

This is the question that decides how long a validation takes, and it has a **version-dependent** answer that
a lot of training material gets wrong.

| Metadata API version | What triggers a test run |
|---|---|
| **33.0 and earlier** | A long list of types: `ApexClass`, `ApexComponent`, `ApexPage`, `ApexTrigger`, `ArticleType`, `BaseSharingRule`, `CriteriaBasedSharingRule`, `CustomField`, `CustomObject`, `DataCategoryGroup`, `Flow`, `InstalledPackage`, `NamedFilter`, `OwnerSharingRule`, `PermissionSet`, `Profile`, `Queue`, `RecordType`, `RemoteSiteSetting`, `Role`, `SharingReason`, `Territory`, `ValidationRule`, `Workflow` |
| **34.0 and later (current)** | **Only Apex classes and Apex triggers.** If the payload has no Apex component, **no tests run by default** |

The official page states it with an example:

> "if your package contains a custom object, all tests are run in API version 33.0 and earlier. In contrast,
> **starting with API version 34.0, no tests are run for this package.**"

**Why this matters, and why the 24-type list still circulates.** Salesforce's "Running Tests in a Deployment"
page lists the 24 types as triggering a test run, which is correct **for API 33.0 and earlier**. That list has
been copied forward for a decade, and several current training documents present it as the modern rule. It is
not. On any supported API version, a payload of `CustomField`, `Profile`, `Flow` or `ValidationRule` alone runs
**zero tests**.

The practical consequence: a deploy that looks like it should have been slow and safe is neither. It is slow
because of compile time and it is *not* validated, because nothing ran. If you want a config-only deploy to be
validated, you must **set the test level explicitly** — the default will not do it.

Two related traps from the same page:

- `NoTestRun` is only valid for **development environments** (sandbox, Developer Edition, trial). It is the
  default there, and it is rejected in production when the payload contains Apex.
- `RunLocalTests` is the **default for production deployments that contain Apex** — and it is enforced
  regardless of payload contents. If you set it on a config-only deploy, you get the full run anyway.

Source: [Running Tests in a Deployment](https://developer.salesforce.com/docs/platform/api-metadata/guide/meta-deploy-running-tests.html).

### Intra-payload references resolve; ordering is not the mechanism

The Metadata API resolves references **within** a payload. If class A uses class B and both are in the same
deployment, you do not need to order the package.xml. What fails is a reference to something **not** in the
payload and **not** already in the target.

The practical rule is therefore: **deploy the parent and the child together.** Record type + its layout + the
permission set that grants visibility, in one payload. Not "record type Monday, permission set later".

---

## 3. Environments and sandboxes

The posting names five stages. Map them before you talk about tools.

| Stage | What it is for | Usual sandbox | Who promotes into it |
|-------|----------------|---------------|----------------------|
| Dev | Build and unit test | Developer or Developer Pro. Scratch orgs only if the bank's licenses and connected apps can be recreated there | Developer, via Git |
| QA | Automated validation, integration | Developer Pro or Partial Copy | Pipeline, on merge |
| UAT | Business testers | Partial Copy, or a masked Full | Release engineer, from the release branch |
| Pre-Prod | Dress rehearsal against prod-like metadata and volume | Full or a recent Partial, refreshed close to the window | Release engineer |
| Prod | Customers | Production | Release engineer, after approval, inside the window |

Scratch orgs are not sandboxes. A scratch org is an empty org created from a Dev Hub and a definition file. Useful for a single package. A bad answer in a bank interview is "UAT is a scratch org." Commercial Banking orgs carry managed packages, SSO, named credentials, and licenses a scratch org will not have unless someone encoded all of that. Know both. Recommend scratch orgs for package builds. Recommend sandboxes for the path above.

Sandbox types, in the order you will be asked:

| Type | Metadata | Data | Use it for |
|------|----------|------|------------|
| Developer | Yes | No | Isolated build |
| Developer Pro | Yes | No (more file/storage room) | QA when you do not need rows |
| Partial Copy | Yes | A template sample | UAT when testers need some rows and you do not want all of prod |
| Full | Yes | All of prod | Pre-prod, performance, and any test that depends on real shape |

Full copies contain customer data. In a bank that means SIN-adjacent identifiers, account numbers, emails, phone numbers. Refresh is not done when the copy finishes. It is done when masking has run and access is limited to the people on the ticket.

Salesforce Data Mask is the product name to know. It is not assumed to be in every org; many banks also mask with a vendor tool or a reviewed script. Training goal: you can say what must be masked, who confirms it, and that unmasked Full sandboxes are not a place for broad logins.

Setup paths (same style as the [breadcrumb page](./navigation-breadcrumbs.md)):

| Task | Where |
|------|--------|
| List and refresh sandboxes | Setup > Sandboxes |
| Sandbox template (Partial Copy) | Setup > Sandboxes > Sandbox Templates |
| Allow inbound deploys | Setup > Deploy > Deployment Settings |
| See what is running | Setup > Deploy > Deployment Status |
| DevOps Center, if the org uses it | Setup, search "DevOps Center" (must be enabled) |
| Data Mask | App Launcher > Data Mask, after the managed package is installed |

Refresh cadence is license-limited. Full is the slowest. Do not promise a same-day Full refresh in an interview. Say you check Setup > Sandboxes for the next eligible refresh before you commit a date.

Help, verified:

- [Sandboxes](https://help.salesforce.com/s/articleView?id=sf.deploy_sandboxes_parent.htm&type=5)
- [Sandbox templates](https://help.salesforce.com/s/articleView?id=sf.sandbox_templates.htm&type=5)
- [Data Mask](https://help.salesforce.com/s/articleView?id=sf.data_mask.htm&type=5)

---

## 4. Branching

The posting names feature, release, and hotfix. Use this shape unless the team already has a written one. Do not invent a second model in the interview; describe this one and say you will follow theirs if it is documented.

```text
main                         ← matches production
  hotfix/<ticket>            ← cut from main only
  release/2026-11-27         ← cut from main when the release freezes
    feature/<ticket>-name    ← short-lived, merged into the release branch
```

Rules that matter more than the diagram:

- A hotfix is cut from `main`, because `main` is what production is running. It merges back to `main` and into any open release branch, or the next release will resurrect the bug.
- A feature branch lives days, not weeks. Salesforce XML (Flows, profiles) does not merge. Long branches become "delete one side of the conflict and hope."
- The release branch is what QA and UAT deploy. Developers do not deploy their feature branch into UAT.
- Tag production after a successful deploy: `release-2026-11-27`. That tag is the rollback target.

Commit messages carry the change-ticket id. That is the audit trail, not a style preference.

---

## 5. CI/CD

Same pipeline in GitHub Actions, Azure DevOps, or GitLab. Only the YAML header changes.

| Stage | Trigger | What it runs | Target |
|-------|---------|--------------|--------|
| Validate | Pull request | `sf project deploy start --dry-run` plus the story's Apex tests | A CI sandbox that is refreshed or reset on a schedule |
| Integrate | Merge to the release branch | Real deploy | QA |
| Stage | Release manager | Validation-only deploy | Pre-Prod, then Prod |
| Release | Change window, after approval | Quick deploy of the validated prod job, or a fresh deploy if the validation expired | Prod |
| Tag | Pipeline success | Annotated tag + deploy id written to the ticket | Git |

Authentication in CI is JWT or a stored auth URL in the CI secret store. It is never `sf org login web` on a runner, and never a password in the repo. The connected app, the integration user, and the permission set on that user are part of the design. The integration user can deploy. It cannot be a shared human admin login.

Minimum commands the pipeline is wrapping:

```bash
sf project deploy start --dry-run --test-level RunSpecifiedTests \
  --tests CommercialBankingReleaseTest --target-org ci

sf apex run test --test-level RunLocalTests --code-coverage \
  --result-format human --wait 30 --target-org qa
```

`--test-level` values you must be able to say out loud: `NoTestRun`, `RunSpecifiedTests`, `RunLocalTests`, `RunAllTestsInOrg`. Production will not accept `NoTestRun` when the payload contains Apex.

A useful interview sentence: "I do not care which CI product we use. I care that a human cannot push to prod without a green validation, a named test run, and a ticket id."

---

## 6. DevOps tools

You will be asked which of these you have used. Be honest about which you have clicked. Be precise about what all of them sit on.

| Tool | What it is | What you are expected to know |
|------|------------|-------------------------------|
| Salesforce CLI (`sf`) | The deploy/retrieve/test/package engine | You can run a dry-run and read the failure. Every other tool is a UI over this or the Metadata API |
| DevOps Center | Salesforce product: work items, Git, promotion | Native option when the bank does not want another vendor. Still not a reason to skip Git discipline |
| Gearset | Compare and deploy, CI, backups on some editions | Compare orgs, spot the metadata you forgot, gate on tests. Sits on the Metadata API |
| Copado | User stories, pipelines, compliance packs | Common in large programs. Pipeline and promotion path, not just "we have Copado" |
| AutoRABIT | CI/CD and data tooling in the same category | Same interview answer as Gearset/Copado: promotion path, back-promotion, where secrets live |
| Change Sets | Setup UI between related orgs | Why they fail at this job's scale: no reviewable diff, no hotfix branch, profile XML you cannot merge, no rollback tag |

Change Sets are the thing you can explain and then retire. [Labs](./labs-design.md) already lists them next to the CLI. This role's answer is CLI or a vendor UI that uses the Metadata API, with Git in front of both.

DevOps Center overview (verified): [Salesforce Help](https://help.salesforce.com/s/articleView?id=sf.devops_center_overview.htm&type=5).

---

## 7. Conflict clinic

These are the six the posting names. Learn the cause, not the click-path.

### Profiles

`Admin.profile-meta.xml` is a dump of user permissions, object permissions, field permissions, layout assignments, and record-type visibility. Two stories editing it will conflict, and a bad merge can grant or remove access you did not review.

Fix you coach: stop putting story access in profiles. Ship a permission set (or a permission set group) per persona or per feature. Deploy that. Leave the profile alone unless the story truly changes a profile-only setting.

If a legacy org still deploys profiles, deploy a thin delta with a tool that supports profile decomposition, and require a second person to read the permission diff. Do not hand-merge a 10,000-line profile.

### Permission sets

Smaller, still a conflict if every story edits one giant `CB_Admin` permission set. Split by feature or persona. Permission set groups are how you bundle them for a job function without creating a new monolith.

Trailhead: [Permission Set Groups](https://trailhead.salesforce.com/content/learn/modules/permission-set-groups). Background on the model: [Data Security](https://trailhead.salesforce.com/content/learn/modules/data_security) and the [users and data guide](./user-management-data.md).

### Record types

A record type deploy fails, or "succeeds" and users still cannot use it, when any of these are missing:

- The business process and picklist values the record type depends on
- The page layout assignment
- Visibility on the profile or permission set

Deploy the record type, the layout, and the permission set that grants visibility in one payload. Do not deploy the record type on Monday and the permission set "later."

### Page layouts

The layout file is not the assignment. Assignment lives on the profile and the record type. Also do not confuse a classic page layout with a Lightning record page (FlexiPage). Testers say "the page is wrong" when the Lightning page was never activated for the app.

### Flows

Flow XML does not merge. Two developers editing the same flow will lose one side.

Working rules:

- One owner per flow while it is in a release, or split the work into subflows
- Know whether your deploy leaves the new version Draft or Active. Check in a sandbox before you promise prod behavior
- Fast mitigation when a new active version is bad and the previous version is still in the org: activate the previous version in Setup > Flows. That is a mitigation, not a rollback of the Git history. Follow it with a proper redeploy of the last good tag

Before-save vs after-save still matters to you, because a before-save flow that should have been a before-save flow and was built as after-save will time out under volume. You are not the Flow author, but you do not deploy a flow you cannot describe. Crash-course section: [Automation](./crash-course.md).

### Apex and dependencies

Deploy the class and its test in the same payload. A test class that queries `SELECT Id FROM Account LIMIT 1` and assumes a row exists will pass in Dev and fail in a empty QA sandbox. Tests create their own data.

A trigger with no coverage blocks production. A class that calls another class you forgot to retrieve fails at compile time in the target. Read the error, add the missing member, redeploy the validation. Do not "try it in prod to see."

---

## 8. Packages

Three things the posting lumps together, which you should not:

| Kind | Who it is for | DevOps note |
|------|----------------|-------------|
| Unlocked package | Your own team, modular internal apps | Versioned, upgradeable, has a dependency list. Best fit when a boundary is real (a credit-application module, not "all of Sales Cloud") |
| Org-dependent unlocked package | A module that still depends on unpackaged metadata in that org | Faster to adopt, harder to install elsewhere. Say that limitation out loud |
| Managed package (1GP or 2GP) | An ISV, or a hard IP boundary | You upgrade it. You do not edit its Apex in Git. A bank still uses managed packages for AppExchange products it bought |

Unpackaged metadata deployed from Git is still the right default for a large existing commercial-banking org. Packaging is how you stop that folder from becoming one unreviewable tree. Do not propose "package the entire org" as the first move.

You need a Dev Hub to create second-generation packages and scratch orgs. Setup > Dev Hub, in a production org or a designated developer org. Unlocked packages do not require a namespace. Managed packages usually have one.

Help: [Packages](https://help.salesforce.com/s/articleView?id=sf.dev_packages.htm&type=5). Trailhead: [Unlocked Packages for Customers](https://trailhead.salesforce.com/content/learn/modules/unlocked-packages-for-customers).

Typical commands, after the package exists in the project (confirm flags with `sf package version create --help`):

```bash
sf package version create --package CB_Credit --installation-key-bypass --code-coverage --wait 30
sf package install --package 04tXXXXXXXXXXXX --target-org uat --wait 30
```

The `04t` id is the package version you install. Promote that version before production. Do not install a beta package version into prod.

---

## 9. Tests and validation

Three different actions. Interviews collapse them. Do not.

| Action | Changes the org? | Why you run it |
|--------|------------------|----------------|
| Validation / dry-run (`--dry-run`, or a validate-only job in Gearset/Copado) | No | Prove the payload compiles and tests pass against that org |
| Quick deploy | Yes | Promote a validation that already succeeded, inside Salesforce's quick-deploy window, so you do not pay the test runtime again during the change window |
| Real deploy | Yes | First deploy, or the validation expired, or the payload changed |

Quick deploy only works if nothing relevant changed since the validation. If someone hotfixed prod after your validation, the quick deploy is no longer an honest rehearsal. Re-validate.

Help: [Quick Deploy](https://help.salesforce.com/s/articleView?id=sf.deploy_quick_deploy.htm&type=5).

Production rules you can say without notes:

- A payload with Apex must run tests
- Salesforce requires 75% coverage as the production gate — but **which** 75% depends on the test level (below)
- `RunSpecifiedTests` means you name the tests, and the Apex you are deploying has to be covered by those tests
- `RunLocalTests` runs local tests and skips managed-package tests. It is the honest gate before a release, and it is slow. That is why you validate before the window, then quick-deploy inside it
- A green Dev sandbox is not evidence. The validation that counts is against the org you are about to change

### The five test levels

| Level | What runs | Use it when |
|---|---|---|
| `NoTestRun` | Nothing | Never in production with Apex in the payload — Salesforce rejects it |
| `RunSpecifiedTests` | Only the tests you name | Fast, targeted. **Coverage is then measured per class in the package** |
| `RunRelevantTests` | Tests related to the change (newest level; confirm availability in your CLI) | First deploy of a new component, before you know which tests matter |
| `RunLocalTests` | All local tests, skipping managed-package tests | The honest pre-release gate |
| `RunAllTestsInOrg` | Everything, including managed packages | Slowest. Required for some package installs |

### Coverage is three different rules, not one

This is the single most confused topic in Salesforce release engineering. The platform documentation states
two distinct cases:

| Test level used | What coverage must be |
|---|---|
| `RunLocalTests` / `RunAllTestsInOrg` | **75% org-wide**, and **Apex triggers must have *some* coverage** |
| `RunSpecifiedTests` | **75% for each class and trigger in the deployment package individually** |

Two things follow, and both are interview-grade:

1. **There is no "1% per class" rule.** That number appears in a lot of training material. The real rule for
   `RunSpecifiedTests` is 75% *per item*; for the other levels it is 75% org-wide plus "triggers need some
   coverage". If you hear "1%", the person is remembering "triggers need *some* coverage" and attaching a
   number to it that the documentation does not contain.
2. **A single under-covered class fails the whole deploy** under `RunSpecifiedTests`, even if the org average
   is 90%. A high org-wide average does not protect you.

### `validate`, the 10-day window, and the sandbox trap

```bash
sf project deploy validate --manifest manifest/package.xml --target-org prod --test-level RunLocalTests
sf project deploy quick --job-id 0Af... --target-org prod
```

- `validate` runs the full deploy **without committing**. It returns a **job id**, not a deployment.
- That job id is **valid for 10 days** from the validation.
- `--use-most-recent` only looks back **3 days**, even though the job id is good for 10. Use the explicit
  `--job-id` once a validation ages past 3 days.
- **Do not run `validate` against a sandbox.** The CLI documentation is explicit: the command is intended for
  production orgs, because sandboxes do not run tests on deploy by default. To get a test run in a sandbox,
  use `sf project deploy start --dry-run --test-level RunLocalTests`.
- A quick deploy returns a **new** deployment id — not the validation id. Track the new one; the old id keeps
  reporting the validation's result.

If the deploy window slips more than 10 days, re-validate. Do not "just try the quick deploy" — it fails
without warning, and there is no notification as expiry approaches.

Trailhead: [Apex Testing](https://trailhead.salesforce.com/content/learn/modules/apex_testing).
CLI reference: `project deploy validate`, `project deploy quick`.
Metadata API: [Deploy a Recently Validated Component Set Without Tests](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_rest_deploy_recentvalidation.htm).

---

## 10. Releases, hotfixes, rollback

Three speeds. Write them down. The posting asks for all three.

| Speed | When | Branch | Deploy bar |
|-------|------|--------|------------|
| Scheduled | The release calendar | `release/<date>` | Full validation, UAT sign-off, change ticket, window |
| Hotfix | Prod defect, next release is too late | `hotfix/<ticket>` from `main` | Same validation, smaller payload, still a ticket |
| Emergency | Active customer or regulatory harm | `hotfix/<ticket>` from `main` | Short path that is already written. Not "whoever is online clicks Setup" |

Emergency is a shorter approval chain, not a skipped pipeline. If the written path says one named approver and a validation deploy, that is the path at 2 a.m. as well.

### Runbook template

Fill this for every prod promotion. Lab D is this template.

```text
Change ticket:
Release tag:
Payload (package directory or manifest):
Source branch / commit:
Validation org / deploy id / time:
Tests run and coverage:
Prod deploy id / time:
Approver (not the author):
Sandbox or feature flags to flip after deploy:
Rollback tag:
Rollback owner:
How we will know it worked (one query, one screen, one test):
```

### Rollback

Metadata does not roll back by itself. Rollback is a forward deploy of the last known-good tag, or a package install of the previous version.

| Situation | First move | Then |
|-----------|------------|------|
| Bad Flow, previous version still in the org | Activate the previous Flow version | Redeploy the last good tag so Git matches the org |
| Bad Apex or config | Stop the bleeding (deactivate the automation if that is safe) | Validate the previous tag, deploy it |
| Destructive delete already ran | You cannot undelete records | Restore metadata from Git; data restore is a separate, ticketed path (backup tool or Salesforce backup), not a Git revert |
| Post-deploy data script already ran | Git revert will not undo the rows | The script needs its own reverse script, reviewed before the window |

If you do not have a tag from the last good prod deploy, you do not have a rollback. Fix that before you take the next release.

---

## 11. Banking change control

Commercial banking is a regulated environment. The technical deploy is the easy part to explain. The audit pack is the part that gets you the job.

Keep these, every time:

- Change ticket id in the commit and the pull request
- Diff a second person read (not the author)
- Validation deploy id and prod deploy id
- Test run id and coverage number
- Named approver, different from the person who wrote the change
- Release tag
- For a Full sandbox refresh: refresh time, mask-complete confirmation, who is allowed to log in

Segregation of duties: the developer who wrote the Apex does not approve their own production deploy. Your pipeline should make that structural, not cultural. The integration user deploys. A human approves. Those are different identities.

Do not put production customer data in a slide, a debug log pasted into a ticket, or a sandbox that has not been masked. Debug logs can contain field values. Turn them off when the diagnosis is done.

This is the same discipline as the ServiceNow change path in the [cross-cutting guide](../cross-cutting.md): a ticket, a window, a backout, evidence. The metadata tool changes. The control does not.

---

## 12. Design patterns you have to coach

The posting says you provide guidance on DevOps-friendly design. These are the patterns worth being stubborn about.

| Pattern | Why release engineering cares |
|---------|-------------------------------|
| Permission sets over profile edits | Profiles do not merge. Permission sets do, if you keep them small |
| One flow owner per release, subflows for parallel work | Flow XML does not merge |
| Tests create their own data | Empty sandboxes and prod-like sandboxes behave the same |
| No hardcoded ids | The id in Dev is not the id in UAT. Use custom metadata or a query |
| Named Credentials for callouts | Endpoints differ per sandbox. Secrets never go in Git |
| Custom metadata / custom settings for toggles | You can ship a feature dark and turn it on after deploy, without another deploy |
| Bulkified Apex | A deploy can be green and still fail the first real batch. You ask the 200-record question |
| No environment-specific branches | `if (org.IsSandbox)` in code is a last resort. Config belongs in the target, not in a `uat` branch that can never merge |

## 13. Salesforce Governor Limits — What You Check Before You Deploy

You do not write every trigger, but you sign off on deploys that run code. A deploy can be green and still fall over in production because the code hits a governor limit under real volume. Your review question for every Apex story: **"what happens when this runs on 200 records?"**

Below is each limit you are expected to know for the DevOps Engineer role, with the Salesforce breadcrumb to check it, how much is left, what breaks when it is hit, and how to keep it under control.

---

### 13.1. How to Check Any Limit

| Breadcrumbs | What you see |
|-------------|--------------|
| **Org-wide limit usage** | Setup → Company Information → "API Requests, Last 24 Hours" (shows Total and Remaining) |
| **Apex limit usage per transaction** | Setup → Debug Logs → Open a log → search `LIMIT_USAGE` → line-by-line consumption for that transaction |
| **Real-time org snapshot** | Setup → System Overview → "Apex Limits" |
| **Batch / Scheduled / Queueable job status** | Setup → Apex Jobs → shows running, completed, failed, and error details |
| **Flow usage / faults** | Setup → Flow → "Faults" or "Flow Details" → interview count, errors |
| **Connected app API usage** | Setup → Connected Apps → OAuth Usage → API calls per connected app |
| **Scheduled jobs** | Setup → Scheduled Jobs → jobs scheduled per 24-hour window |

### Apex snippet — check limits inside code

```apex
// Heap size (per transaction)
Integer usedHeap = Limits.getHeapSize();
Integer maxHeap  = Limits.getLimitHeapSize();

// CPU time (per transaction)
Integer usedCpu  = Limits.getCpuTime();
Integer maxCpu   = Limits.getLimitCpuTime();

// SOQL queries (per transaction)
Integer usedSoql = Limits.getQueries();
Integer maxSoql  = Limits.getLimitQueries();

// DML statements (per transaction)
Integer usedDml  = Limits.getDmlStatements();
Integer maxDml   = Limits.getLimitDmlStatements();

// DML rows (per transaction)
Integer usedRows = Limits.getDmlRows();
Integer maxRows  = Limits.getLimitDmlRows();

// Generic: remaining for any limit type
Integer remaining = Limits.getLimit(<type>) - Limits.<getter>(<type>);
```

**Rule for releases:** if a transaction is already at **80% of any limit** in a sandbox test, treat it as a production risk and refactor before promoting.

---

### 13.2. Per-Limit Reference

#### 1. Total Apex API Requests (org-wide, 24 hours)

**ELI5:** This is how many times your org talks to the Salesforce API from outside (Postman, middleware, CI/CD, other apps calling Salesforce). Think of it as how many letters your company sends out in a day — Salesforce counts them all and stops you when you send too many.

| Detail | Value |
|--------|-------|
| Limit | 15,000 per 24 hours (Enterprise/Unlimited; varies by edition) |
| Reset | Every 24 hours (rolling) |
| Scope | Per org |
| Can be increased? | Yes — contact Salesforce (paid add-on) |

**Where to check:** Setup → Company Information → "API Requests, Last 24 Hours" → shows Total and Remaining.

**How much is left:** `Remaining = Total − Used`.

**What happens when hit:** `LIMIT_EXCEPTION` — All API calls fail. Integrations break. CI/CD deployments fail. SSO logins that use API calls stop working.

**Best practices to control it:**
- Cache API responses where possible (don't call Salesforce twice for the same data)
- Use Bulk API for large data loads instead of REST API one-record-at-a-time
- Schedule data syncs during off-peak hours
- Monitor connected app usage: Setup → Connected Apps → OAuth Usage
- Implement retry logic with exponential backoff for `LIMIT_EXCEPTION`

---

#### 2. SOQL Queries (synchronous, per transaction)

**ELI5:** SOQL is how you ask Salesforce "give me all records where X matches Y." This counts how many times you run a SOQL query in one piece of code. It's like how many times you can ask the librarian for a book before they tell you to come back tomorrow.

| Detail | Value |
|--------|-------|
| Limit | 100 per transaction (synchronous) |
| Reset | Per transaction (every Apex execution) |
| Scope | Per transaction |
| Can be increased? | No — hard limit |

**Where to check:** Setup → Debug Logs → open a log → search `SOQL_EXECUTE_BEGIN` → count the lines. Or in Apex: `Limits.getQueries()`.

**How much is left:** `Limits.getLimitQueries() − Limits.getQueries()` (in Apex).

**What happens when hit:** `System.LimitException: Too many SOQL queries: 101` — entire transaction rolls back, no data saved.

**Best practices to control it:**
- **Bulkify:** query once *outside* loops, never inside
- Use selective `WHERE` clauses on indexed fields (Id, Name, RecordTypeId, External ID)
- Use `FOR (SObject obj : [SELECT ...])` pattern instead of query-then-process
- Query only fields you need: `SELECT Id, Name FROM Account` — never `SELECT *`
- Use `@ReadOnly` on Visualforce pages (raises query limit to 200)

---

#### 3. SOQL Query Rows Returned (per transaction)

**ELI5:** This is how many total records your SOQL queries pull back in one transaction. Even if you only asked 5 times, if each query returned 100 books, you've got 500 books.

| Detail | Value |
|--------|-------|
| Limit | 50,000 per transaction (synchronous) |
| Reset | Per transaction |
| Scope | Per transaction |
| Can be increased? | No — hard limit |

**Where to check:** Debug Log → `SOQL_EXECUTE_BEGIN` → "Number of Rows". Or Apex: `Limits.getQueryRows()`.

**How much is left:** `Limits.getLimitQueryRows() − Limits.getQueryRows()`.

**What happens when hit:** `System.LimitException: Too many query rows: 50001` — transaction rolls back.

**Best practices to control it:**
- Always add a `LIMIT` clause: `SELECT Id FROM Account LIMIT 10000`
- Use selective `WHERE` clauses to reduce rows returned
- Use `COUNT()` when you only need a count, not the records
- Avoid `SELECT *` — query only needed fields

---

#### 4. DML Statements (per transaction)

**ELI5:** DML is how you save, update, or delete records (insert, update, delete, upsert, merge, undelete). This counts how many separate DML operations you run — like how many forms you fill out to change something.

| Detail | Value |
|--------|-------|
| Limit | 150 per transaction |
| Reset | Per transaction |
| Scope | Per transaction |
| Can be increased? | No — hard limit |

**Where to check:** Debug Log → `DML_BEGIN` lines. Or Apex: `Limits.getDmlStatements()`.

**How much is left:** `Limits.getLimitDmlStatements() − Limits.getDmlStatements()`.

**What happens when hit:** `System.LimitException: Too many DML statements: 151` — transaction rolls back.

**Best practices to control it:**
- **Bulkify:** collect records in a List, do ONE `insert myList` — never one insert per record
- Use `Database.insert(list, false)` for partial success (some records can fail without aborting all)
- Combine related updates into single DML calls
- Never DML inside a loop — collect first, DML once

---

#### 5. DML Rows Processed (per transaction)

**ELI5:** This is how many individual records your DML operations touch in total. If you insert 100 accounts in one DML statement, that's 100 rows.

| Detail | Value |
|--------|-------|
| Limit | 10,000 per transaction |
| Reset | Per transaction |
| Scope | Per transaction |
| Can be increased? | No — hard limit |

**Where to check:** Debug Log → `DML_BEGIN` → "Number of Rows". Or Apex: `Limits.getDmlRows()`.

**How much is left:** `Limits.getLimitDmlRows() − Limits.getDmlRows()`.

**What happens when hit:** `System.LimitException: Too many DML rows: 10001` — transaction rolls back.

**Best practices to control it:**
- Use Batch Apex for >10,000 records
- Use `Database.insert(list, false)` for partial failures
- Delete records in batches via `Database.delete()`
- Check `empty()` before DML to avoid empty operations

---

#### 6. Apex CPU Time (per transaction)

**ELI5:** This is how much processing time your Apex uses on Salesforce's servers. It's like how many minutes of the librarian's time you use — complex calculations take longer than simple lookups.

| Detail | Value |
|--------|-------|
| Limit | 10,000 ms (10 seconds) sync; 60,000 ms (60 seconds) async |
| Reset | Per transaction |
| Scope | Per transaction |
| Can be increased? | No — hard limit |

**Where to check:** Debug Log → `CUMULATIVE_LIMIT_USAGE` → "CPU time". Or Apex: `Limits.getCpuTime()`.

**How much is left:** `Limits.getLimitCpuTime() − Limits.getCpuTime()`.

**What happens when hit:** `System.LimitException: Apex CPU time limit exceeded` — transaction rolls back.

**Best practices to control it:**
- Avoid complex calculations in Apex — move to formula fields where possible
- Use `Map<Id, SObject>` for lookups instead of nested loops
- Avoid string manipulation in tight loops
- Use `System.debug()` sparingly in production (it costs CPU)
- Move long-running calculations to `@future` or Queueable

---

#### 7. Apex Heap Size (per transaction)

**ELI5:** This is how much memory your Apex code uses to hold variables, lists, and objects. It's like how much desk space you take up with books and papers — pile too much and there's no room left.

| Detail | Value |
|--------|-------|
| Limit | 6 MB sync; 12 MB async |
| Reset | Per transaction |
| Scope | Per transaction |
| Can be increased? | No — hard limit |

**Where to check:** Debug Log → `CUMULATIVE_LIMIT_USAGE` → "Heap size". Or Apex: `Limits.getHeapSize()`.

**How much is left:** `Limits.getLimitHeapSize() − Limits.getHeapSize()`.

**What happens when hit:** `System.LimitException: Apex heap size too large` — transaction rolls back.

**Best practices to control it:**
- Null out large collections when done: `myList = null;`
- Use `transient` keyword for variables that don't need view state
- Avoid loading large record sets into memory — use SOQL `FOR IN` loops
- Process large datasets in Batch Apex chunks (200 records per execute)

---

#### 8. SOQL For Loop Queries (per transaction)

**ELI5:** How many times you can iterate over query results in a `FOR` loop. Different from regular SOQL queries — this counts the loops themselves.

| Detail | Value |
|--------|-------|
| Limit | 200 per transaction |
| Reset | Per transaction |
| Scope | Per transaction |
| Can be increased? | No |

**Where to check:** Debug Log → `CUMULATIVE_LIMIT_USAGE` → "SOQL for loop iterations".

**What happens when hit:** `System.LimitException: Too many SOQL for loop iterations: 201`

**Best practices to control it:**
- Use `FOR (SObject obj : [SELECT ...])` pattern — it's more efficient than query + iterate
- Each `FOR` loop also counts as one query toward the 100-query limit
- Don't nest `FOR` loops over query results

---

#### 9. Total Email Invocations (org-wide, 24 hours)

**ELI5:** How many single emails your org sends via Apex — like how many individual letters your company mails in a day.

| Detail | Value |
|--------|-------|
| Limit | 5,000 per 24 hours (Enterprise) |
| Reset | Every 24 hours |
| Scope | Per org |
| Can be increased? | Yes — contact Salesforce |

**Where to check:** Setup → Email Administration → Deliverability / Single Email Mass Email limits.

**What happens when hit:** `System.LimitException: Too many email invocations: 5001` — all outbound Apex email fails.

**Best practices to control it:**
- Use Email Templates instead of building bodies in code
- Use Mass Email for bulk sends (separate limit)
- Queue email sends with `@future` or Queueable
- Use third-party email services (SendGrid, Mailgun) for high-volume
- Check `HasOptedOutOfEmail` before sending

---

#### 10. Email Recipients (org-wide, 24 hours)

**ELI5:** How many individual people can receive emails from your org in 24 hours. Emailing 100 people = 100 recipients, even if it's one email with 100 CCs.

| Detail | Value |
|--------|-------|
| Limit | 5,000 per 24 hours |
| Reset | Every 24 hours |
| Scope | Per org |
| Can be increased? | Yes — contact Salesforce |

**Where to check:** Setup → Email Administration.

**What happens when hit:** Email sends fail with `LIMIT_EXCEPTION`.

**Best practices to control it:**
- Deduplicate recipients before sending
- Use Salesforce CDP or Marketing Cloud for bulk campaigns
- Track bounces and clean invalid addresses

---

#### 11. Batch Apex — Batch Size (per batch)

**ELI5:** When processing records in batches, each batch handles a chunk of records. This is how many records are in one chunk.

| Detail | Value |
|--------|-------|
| Limit | 2,000 records per batch (recommended 200) |
| Reset | Per batch execution |
| Scope | Per batch |
| Can be increased? | No, but stay at 200 |

**Where to check:** Setup → Apex Jobs → open a batch job → "Batch Size" field.

**How much is left:** N/A — this is a design choice, not a consumption counter.

**What happens when hit:** Batch job fails or processes inefficiently.

**Best practices to control it:**
- Use batch size 200 (default and recommended)
- Larger batches = fewer calls but higher CPU/heap risk per batch
- Smaller batches = more calls but safer per-batch limits
- Test batch size with your specific logic before production

---

#### 12. Batch Apex — Concurrent Batches (org-wide)

**ELI5:** How many batch jobs can run at the same time — like how many workers processing batches simultaneously.

| Detail | Value |
|--------|-------|
| Limit | 5 concurrent batch jobs |
| Reset | As jobs complete |
| Scope | Per org |
| Can be increased? | No |

**Where to check:** Setup → Apex Jobs → count jobs with status "Processing" or "Preparing".

**How much is left:** `5 − (number of concurrent batch jobs)` from the Apex Jobs page.

**What happens when hit:** New batch jobs stay in "Preparing" (queued) until a running batch completes.

**Best practices to control it:**
- Chain batch jobs using `Database.executeBatch()` in the `finish()` method
- Don't schedule multiple batches to start at the same time
- Use Queueable Apex for simpler chaining instead of multiple batch jobs
- Monitor Apex Jobs queue regularly

---

#### 13. Queueable Apex — Jobs in Queue (per transaction)

**ELI5:** Queueable Apex runs code in the background. This limits how many jobs you can add to the queue in one transaction.

| Detail | Value |
|--------|-------|
| Limit | 50 jobs enqueued per transaction |
| Reset | As jobs are processed |
| Scope | Per transaction |
| Can be increased? | No |

**Where to check:** Setup → Apex Jobs → count "Queueable" jobs.

**What happens when hit:** `System.LimitException: Too many queueable jobs added to the queue: 51` — additional jobs can't be queued.

**Best practices to control it:**
- Chain queueable jobs: call `System.enqueueJob(nextJob)` at the end of `execute()`
- Never enqueue jobs inside a loop
- Use Queueable for chaining dependent async work (better than Batch for simple chains)
- Monitor queue depth in Apex Jobs

---

#### 14. Future Methods — Calls per 24 Hours (org-wide)

**ELI5:** Future methods run code in the background after the current transaction. This limits how many future calls you can make in a day.

| Detail | Value |
|--------|-------|
| Limit | 250,000 per 24 hours |
| Reset | Every 24 hours |
| Scope | Per org |
| Can be increased? | No — hard limit |

**Where to check:** Setup → Apex Jobs → filter by "Future" method type → count.

**What happens when hit:** Future method calls fail — async processing stops for the day.

**Best practices to control it:**
- Prefer Queueable Apex over Future methods (Queueable can be chained and monitored)
- Use `@future` only for simple fire-and-forget tasks
- Don't call future methods in triggers — use Queueable instead
- Track future method failures in a custom log object

---

#### 15. Scheduled Apex — Jobs per 24 Hours (org-wide)

**ELI5:** Scheduled Apex runs code on a timer (like a cron job). This limits how many scheduled jobs you can have active.

| Detail | Value |
|--------|-------|
| Limit | 100,000 per 24 hours |
| Reset | Every 24 hours |
| Scope | Per org |
| Can be increased? | No — hard limit |

**Where to check:** Setup → Scheduled Jobs → count active scheduled jobs.

**How much is left:** `100,000 − (active scheduled jobs)` from Scheduled Jobs page.

**What happens when hit:** New scheduled jobs cannot be created.

**Best practices to control it:**
- Use one scheduled job that triggers multiple tasks via Queueable or Batch
- Avoid scheduling jobs for every minute — use reasonable intervals
- Delete unused scheduled jobs regularly
- Monitor scheduled job execution history for failures

---

#### 16. Platform Events — Published per 24 Hours (org-wide)

**ELI5:** Platform Events are internal messages your org sends to itself (or to subscribers) when something happens. This limits how many events you can publish in a day.

| Detail | Value |
|--------|-------|
| Limit | 100,000 (Enterprise) to 1,000,000+ (Unlimited) per 24 hours |
| Reset | Every 24 hours |
| Scope | Per org |
| Can be increased? | Yes — depends on edition |

**Where to check:** Setup → Platform Event Details → "Published Events".

**What happens when hit:** Event publishing fails — downstream subscribers don't receive events.

**Best practices to control it:**
- Batch events where possible (publish multiple events in one call)
- Use durable events only when replay is needed (they cost more)
- Monitor event consumer latency — slow consumers cause backpressure

---

#### 17. Custom Metadata — Records per Org

**ELI5:** Custom Metadata lets you store configuration data deployable like code but editable like records. This limits how many custom metadata records you can have.

| Detail | Value |
|--------|-------|
| Limit | Varies by edition (typically 50,000+ for Enterprise) |
| Reset | N/A — total count, not rate |
| Scope | Per org |
| Can be increased? | Contact Salesforce |

**Where to check:** Setup → Custom Metadata Types → view record counts per type.

**What happens when hit:** Cannot create new custom metadata records until some are deleted.

**Best practices to control it:**
- Use Custom Metadata for configuration that moves between sandboxes via change sets
- Don't use Custom Metadata for transactional data (use Custom Objects instead)
- Keep metadata records lean — avoid large text fields

---

#### 18. Concurrent Apex Requests (org-wide)

**ELI5:** How many Apex requests can run at the exact same time — like how many people can talk to the librarian simultaneously.

| Detail | Value |
|--------|-------|
| Limit | ~10 concurrent requests (varies by edition) |
| Reset | As requests complete |
| Scope | Per org |
| Can be increased? | No |

**Where to check:** Setup → System Overview → "Concurrent Apex Requests".

**How much is left:** `10 − (currently running requests)`.

**What happens when hit:** Requests queue up and may time out.

**Best practices to control it:**
- Avoid long-running synchronous Apex from UI (users will experience timeouts)
- Use async processing (Queueable, Batch, Future) for long operations
- Monitor concurrent request spikes during data loads or integrations

---

#### 19. Test Method — Data Rows per Test (per test)

**ELI5:** When writing tests, this limits how many records your test can query or create. It's separate from production limits.

| Detail | Value |
|--------|-------|
| Limit | 50,000 rows per test method |
| Reset | Per test method |
| Scope | Per test |
| Can be increased? | No |

**Where to check:** Run tests → check test execution logs → `CUMULATIVE_LIMIT_USAGE`.

**What happens when hit:** Test method fails — deployment is blocked.

**Best practices to control it:**
- Use `Test.startTest()` and `Test.stopTest()` to get fresh limits for the test logic
- Use `@TestSetup` to create test data once for all test methods in a class
- Use `Test.isRunningTest()` to branch logic in production code
- Keep tests isolated — don't rely on data from other tests

---

#### 20. Flow Interview — Interview Limits

**ELI5:** A flow interview is one run of a Flow (when a user clicks a button that starts a Flow). This limits how many flow interviews can run and how complex they can be.

| Detail | Value |
|--------|-------|
| Limit | 2,000 interviews per 24 hours (per flow); various element limits per interview |
| Reset | Every 24 hours |
| Scope | Per org per flow |
| Can be increased? | Contact Salesforce |

**Where to check:** Setup → Flow → Interview details or Flow usage dashboard.

**What happens when hit:** New flow interviews fail to start.

**Best practices to control it:**
- Use `Get Records` with filters instead of getting all records then filtering
- Avoid loops inside loops in flows
- Use Decision elements instead of multiple Get Records
- Monitor flow errors in Setup → Flow → Faults
- Consider Apex for complex logic that exceeds flow limits

---

### 13.3. Quick Reference Table

| Limit | Default Value | Reset | Scope | Increase? |
|-------|--------------|-------|-------|-----------|
| API Requests (24h) | 15,000 | 24h | Org | Yes (paid) |
| SOQL Queries (sync) | 100 | Per txn | Txn | No |
| SOQL Rows Returned | 50,000 | Per txn | Txn | No |
| DML Statements | 150 | Per txn | Txn | No |
| DML Rows | 10,000 | Per txn | Txn | No |
| Apex CPU Time (sync) | 10,000 ms | Per txn | Txn | No |
| Apex Heap Size (sync) | 6 MB | Per txn | Txn | No |
| Email Invocations (24h) | 5,000 | 24h | Org | Yes |
| Batch Apex Concurrent | 5 | As jobs complete | Org | No |
| Queueable Jobs | 50 per txn | Per txn | Txn | No |
| Future Calls (24h) | 250,000 | 24h | Org | No |
| Scheduled Jobs (24h) | 100,000 | 24h | Org | No |
| Concurrent Apex | ~10 | As complete | Org | No |
| Test Data Rows | 50,000 | Per test | Txn | No |

---

### 13.4. Monitoring Limits Proactively

**Debug logs (per-transaction):**
```
Setup → Debug Logs → New
- Log Level: Apex Code: Finest, Visualforce: Finer
- Set trace flags for specific users or classes
- Open logs → search "CUMULATIVE_LIMIT_USAGE" → see all limits at once
- Search "LIMIT_USAGE_FOR_NS" for namespace-specific limits
```

**Apex code monitoring (real-time):**
```apex
if (Limits.getCpuTime() > Limits.getLimitCpuTime() * 0.80) {
    System.debug('WARNING: CPU time at 80% of limit: ' + Limits.getCpuTime() + 'ms');
    // Consider aborting or switching to async
}
```

**Scheduled monitoring jobs:**
Create a scheduled Apex job that:
- Queries `ApiUsage` or connected app OAuth data
- Checks `Limits.getApiRequests()` trend
- Sends alert email when approaching 80% of any limit

**Event Monitoring (Enterprise+):**
Setup → Event Monitoring → API Usage events → track which users/connected apps consume the most API calls. Identify integration spikes before they hit limits.

---

### 13.5. Common Limit Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| SOQL in a for loop | `Too many SOQL queries: 101` | Move query outside loop; collect IDs first, query once |
| DML in a for loop | `Too many DML statements: 151` | Collect records in a List, do one DML call |
| Loading all fields in SOQL | `Apex heap size too large` | Query only needed fields |
| Not using `LIMIT` in SOQL | `Too many query rows: 50001` | Add `LIMIT` clause + selective WHERE |
| Future method in trigger | `Too many future calls: 250001` | Use Queueable Apex instead |
| Synchronous Apex from UI | Page timeout / CPU limit | Move to `@future` or Queueable |
| Not checking limits before async | Async job fails mid-run | Check limits in `start()` method of Batch |
| Mass email without opt-out | Email limit exceeded | Check `HasOptedOutOfEmail` before sending |

---

## Labs

Do these in free Developer Edition orgs. Do not practice against a bank org.

### Lab A — Retrieve, review, dry-run

1. Create two Developer Edition orgs. Alias them `dev` and `qa`.
2. In `dev`, create a permission set `CB_Release_Reader` with read on Account.
3. Retrieve only that permission set. Read the XML before you commit it.
4. Dry-run deploy to `qa`. Read the result. Then do a real deploy.
5. Change the permission set in `qa` Setup directly. Retrieve. See the diff. That diff is the "someone edited prod in the UI" problem.

Done when the only path into `qa` is Git, and you can explain the diff in one sentence.

### Lab B — Profile conflict, on purpose

1. Two branches. Each adds a different field permission to the same profile XML.
2. Merge. Watch it conflict.
3. Throw that approach away. Recreate both permissions as two permission sets. Merge those.
4. Write three sentences: why the profile conflicted, what a bad merge would have granted, what you will tell a developer who asks to edit `Admin` profile for one field.

### Lab C — Failing validation

1. Write an Apex class that references a second class you do not deploy.
2. Dry-run. Save the error text.
3. Add the missing class. Dry-run again.
4. Add a test that queries `Account` without inserting one. Run it in an empty org. Fix the test so it inserts the row.

Done when you can map an error string to "missing dependency" vs "test depends on org data" without guessing.

### Lab D — Runbook

Fill the [runbook template](#runbook-template) for Lab A as if `qa` were production. Include a rollback tag even though the exercise is fake. The point is the habit.

### Lab E — Sandbox and mask checklist

You do not need a Full sandbox for this lab. Write the checklist you would attach to a refresh ticket:

- Sandbox name, type, and why that type
- Next eligible refresh (you looked it up; you did not guess)
- Template name, if Partial
- Fields you would mask (email, phone, government id, account number, birth date)
- Who confirms mask complete
- Who is allowed to log in before that confirmation (nobody outside the ticket)
- Which integration endpoints must be pointed at non-prod before users log in

Done when a stranger could run the checklist without asking you what "mask" means.

---

## Interview drills

Short answers. Say these in your own words after you have done the labs.

1. **Where is the source of truth?** Git. Production is a deploy target. If Setup and Git disagree, that is an incident, not a workflow.
2. **Walk a change to prod.** Feature branch, pull request, dry-run with tests, merge to the release branch, QA deploy, UAT, prod validation before the window, approval, quick deploy or fresh deploy, tag, ticket updated with both deploy ids.
3. **Hotfix during an open release?** Cut from `main`, not from the release branch. Merge back to `main` and to the open release branch.
4. **Why did this profile deploy fail or scare you?** Profiles are a grab bag of access. Two stories conflict. A bad merge changes access you did not mean to ship. Prefer permission sets.
5. **Flow deploy succeeded but users see the old screen.** The new version is probably not the active version. Check that before you redeploy.
6. **Validate vs quick deploy?** Validate does not change the org. Quick deploy applies a validation that already passed, inside the platform window, so the change window stays short.
7. **Unlocked vs managed?** Unlocked is yours, versioned, for internal modules. Managed is something you upgrade and do not edit. Packaging the entire existing bank org on day one is not a plan.
8. **What do you hand an auditor?** Ticket, diff, approver who is not the author, validation id, prod deploy id, test run, tag, and for any Full sandbox, mask-complete evidence.

---

## Certifications

The posting names Platform Developer I, Advanced Admin, and "DevOps related certs."

| Credential | How it maps | Link |
|------------|-------------|------|
| Platform Developer I | The PD1 the posting names. Apex, tests, and the platform model you deploy | [Exam](https://trailhead.salesforce.com/credentials/platformdeveloperi) |
| Platform App Builder | Metadata you move every week: objects, Flow, security | [Exam](https://trailhead.salesforce.com/credentials/platformappbuilder) |
| Advanced Admin | The posting's name. Salesforce renamed this credential to Platform Administrator II. Study the current exam guide and use both names in conversation | [Platform Administrator II](https://trailhead.salesforce.com/credentials/platformadministrator-ii) |
| A Salesforce "DevOps Engineer" cert | There is not an official one to list as if it existed. Copado, Gearset, and AutoRABIT offer their own certificates. Those show tool time. They do not replace PD1 | Vendor sites, after you have actually used the tool |

Study order for this role: crash course and PD1 material first, then this page's labs, then Platform Administrator II topics that overlap releases (security, change, environments).

---

## Quiz

1. Name the five environments in the posting and the sandbox type you would pick for UAT if testers need sample data but not a full customer copy.
2. A hotfix is cut from which branch, and which branches does it merge back into?
3. Why is a 75% coverage result in a Developer sandbox not enough to call production safe?
4. A deploy of a new record type succeeds, and users cannot create that type. What two assignments are probably missing?
5. What is the difference between a dry-run and a quick deploy?
6. Why do you refuse a story whose only access change is an edit to `Admin.profile`?
7. What does a Git revert not undo after a production deploy?
8. Which sandbox type requires a mask confirmation before broad login, and why?

Answers are in the sections above. Write them out. If you cannot, do the matching lab again.

---

## Related pages

- [Crash course](./crash-course.md) — objects, security, Flow, Apex, governor limits
- [Navigation breadcrumbs](./navigation-breadcrumbs.md) — Setup paths, including Deployment & DevOps
- [Labs and design](./labs-design.md) — first Flow, trigger, LWC, callout
- [Users and data](./user-management-data.md) — profiles, permission sets, import, field-level security

---

## Addendum — Official Salesforce Documentation & Resources

Salesforce does not host its main platform documentation in a single public GitHub repository. Official documentation is primarily maintained on the Salesforce Developers Portal and Salesforce Help. Salesforce maintains official GitHub organizations for open-source code, SDKs, and specific product documentation, alongside several community-maintained GitHub repositories that index official Salesforce docs for local search and AI tools.

This addendum covers the official sources you should use for AI summaries, offline reading, and Platform Admin 1 & 2 / Platform Developer 1 & 2 exam preparation.

---

### 1. Best Option for AI / LLM Use: `llms.txt` Files

Salesforce has published `llms.txt` files (following the [llmstxt.org](https://llmstxt.org) standard) specifically designed for Large Language Models.

| Resource | URL | Format | Notes |
|----------|-----|--------|-------|
| Main aggregated index | https://developer.salesforce.com/docs/llms.txt | Markdown | Lists product-specific `llms.txt` files (Apex, LWC, Platform, Data Cloud, Commerce Cloud, Service Cloud, Agentforce, APIs, etc.) |
| Product-specific `llms.txt` | Linked from the main index | Markdown | Clean Markdown versions of official docs, AI-friendly |

**Why this is ideal:** Salesforce explicitly tells LLMs to prefer these official sources. Content is already in AI-friendly Markdown format.

---

### 2. Salesforce Help — Product / Admin Documentation

| Resource | URL | Format | Notes |
|----------|-----|--------|-------|
| Main site | https://help.salesforce.com/ | HTML + PDFs | Covers product features, admin guides, setup, release notes |
| Downloadable PDFs | Linked from guide pages | PDF | Look for the PDF icon on product landing pages |

**Best for:** Admin guides, product features, setup instructions, release notes.

---

### 3. Salesforce Developer Docs — HTML / Markdown

| Resource | URL | Format | Notes |
|----------|-----|--------|-------|
| Developer portal | https://developer.salesforce.com/docs | HTML / Markdown | Apex Developer Guide, LWC, Aura, REST/SOAP/Metadata APIs, Salesforce DX, CLI, Object Reference |

**Best for:** Apex, LWC, Aura, APIs, platform developer reference.

---

### 4. Trailhead — Official Learning Content

| Resource | URL | Format | Notes |
|----------|-----|--------|-------|
| Trailhead | https://trailhead.salesforce.com/ | Interactive modules | Official modules, trails, and projects; more learning-oriented than pure reference |

**Best for:** Platform Admin 1 & 2 and Platform Developer 1 & 2 exam preparation, hands-on trails.

---

### 5. Release Notes

Available on the Help site (current and past releases). Many have PDF download options.

---

## Platform Admin 1 & 2 — Official Documentation Coverage

The following table maps Platform Admin 1 & 2 exam topics to official Salesforce documentation sources. All links are to `*.salesforce.com` domains.

| Topic | Official Source | What It Covers |
|-------|----------------|----------------|
| **Organization Setup** | [Help: Organization Setup](https://help.salesforce.com/s/articleView?id=sf.admin_org_setup.htm&type=5) | Company settings, fiscal year, currency, locales |
| **User Setup** | [Help: Manage Users](https://help.salesforce.com/s/articleView?id=sf.users.htm&type=5) | User creation, profiles, permission sets, login access |
| **Security and Access** | [Help: Data Security](https://help.salesforce.com/s/articleView?id=sf.data_security.htm&type=5) | Profiles, permission sets, OWD, sharing rules, roles |
| **Standard and Custom Objects** | [Help: Objects and Fields](https://help.salesforce.com/s/articleView?id=sf.fields.htm&type=5) | Object creation, custom fields, relationships |
| **Sales and Marketing Applications** | [Help: Sales Cloud](https://help.salesforce.com/s/articleView?id=sf.sales.htm&type=5) | Leads, opportunities, accounts, contacts, campaigns |
| **Service and Support Applications** | [Help: Service Cloud](https://help.salesforce.com/s/articleView?id=sf.service.htm&type=5) | Cases, solutions, entitlements, service contracts |
| **Activity Management** | [Help: Activities](https://help.salesforce.com/s/articleView?id=sf.activities.htm&type=5) | Tasks, events, calendars |
| **Chatter** | [Help: Chatter](https://help.salesforce.com/s/articleView?id=sf.chatter.htm&type=5) | Collaboration, groups, feeds |
| **Data Management** | [Help: Data Management](https://help.salesforce.com/s/articleView?id=sf.data.htm&type=5) | Import, export, data loader, data quality |
| **Analytics** | [Help: Reports and Dashboards](https://help.salesforce.com/s/articleView?id=sf.reports.htm&type=5) | Report builder, dashboard creation, report types |
| **Workflow / Automation** | [Help: Automation](https://help.salesforce.com/s/articleView?id=sf.automation.htm&type=5) | Workflow rules, approval processes, Flow Builder |
| **Desktop and Mobile Administration** | [Help: Mobile Administration](https://help.salesforce.com/s/articleView?id=sf.mobile_admin.htm&type=5) | Salesforce Mobile, Lightning Experience setup |
| **AppExchange** | [AppExchange](https://appexchange.salesforce.com/) | Installing and managing managed packages |

### Platform Admin 1 & 2 — Trailhead Modules to Complete

| Trailhead Module | URL | Admin 1 | Admin 2 |
|------------------|-----|---------|---------|
| [Data Security](https://trailhead.salesforce.com/content/learn/modules/data_security) | https://trailhead.salesforce.com/content/learn/modules/data_security | ✅ | ✅ |
| [Reports and Dashboards](https://trailhead.salesforce.com/content/learn/modules/reports_dashboards) | https://trailhead.salesforce.com/content/learn/modules/reports_dashboards | ✅ | ✅ |
| [Automate Business Processes with Flow](https://trailhead.salesforce.com/content/learn/modules/flow_builder) | https://trailhead.salesforce.com/content/learn/modules/flow_builder | ✅ | ✅ |
| [Administer Salesforce CMS](https://trailhead.salesforce.com/content/learn/modules/salesforce_cms) | https://trailhead.salesforce.com/content/learn/modules/salesforce_cms | | ✅ |
| [Manage User Access](https://trailhead.salesforce.com/content/learn/modules/user_access) | https://trailhead.salesforce.com/content/learn/modules/user_access | ✅ | ✅ |
| [Data Management](https://trailhead.salesforce.com/content/learn/modules/data_management) | https://trailhead.salesforce.com/content/learn/modules/data_management | ✅ | ✅ |
| [Process Automation](https://trailhead.salesforce.com/content/learn/modules/process_automation) | https://trailhead.salesforce.com/content/learn/modules/process_automation | | ✅ |
| [Lightning Experience Specialist](https://trailhead.salesforce.com/content/learn/modules/lexlex) | https://trailhead.salesforce.com/content/learn/modules/lexlex | ✅ | ✅ |

---

## Platform Developer 1 & 2 — Official Documentation Coverage

The following table maps Platform Developer 1 & 2 exam topics to official Salesforce documentation sources. All links are to `*.salesforce.com` domains.

| Topic | Official Source | What It Covers |
|-------|----------------|----------------|
| **Apex Fundamentals** | [Apex Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_dev_guide.htm) | Apex language, triggers, classes, governor limits |
| **Apex Triggers** | [Trigger Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers.htm) | Trigger context variables, bulkification, trigger frameworks |
| **SOQL / SOSL** | [SOQL and SOSL Reference](https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_soql_sosl.htm) | Querying data, relationship queries, aggregate functions |
| **Testing** | [Apex Testing](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing.htm) | Test classes, test data, @isTest, test setup |
| **Governor Limits** | [Execution Governors and Limits](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_gov_limits.htm) | Limits per transaction, per org, best practices |
| **Lightning Web Components** | [LWC Developer Guide](https://developer.salesforce.com/docs/component-library/documentation/en/lwc) | Components, properties, events, wire adapters |
| **Aura Components** | [Aura Components Developer Guide](https://developer.salesforce.com/docs/component-library/bundle/auradocumentation/introduction) | Legacy component framework |
| **Visualforce** | [Visualforce Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_dev_guide.htm) | Pages, components, controllers |
| **REST API** | [REST API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_query.htm) | REST resources, sObject API, composite API |
| **SOAP API** | [SOAP API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_api.htm) | Metadata API, deploy, retrieve |
| **Metadata API** | [Metadata API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_api.htm) | Deploying metadata, package.xml, destructive changes |
| **Salesforce CLI** | [Salesforce CLI Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm) | `sf` command-line, org management, source tracking |
| **Debugging** | [Debugging Apex](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_debugging.htm) | Debug logs, checkpoints, system.debug |

### Platform Developer 1 & 2 — Trailhead Modules to Complete

| Trailhead Module | URL | PD1 | PD2 |
|------------------|-----|-----|-----|
| [Apex Specialist](https://trailhead.salesforce.com/content/learn/modules/apex_specialist) | https://trailhead.salesforce.com/content/learn/modules/apex_specialist | ✅ | ✅ |
| [Lightning Web Components Specialist](https://trailhead.salesforce.com/content/learn/modules/lwc_specialist) | https://trailhead.salesforce.com/content/learn/modules/lwc_specialist | ✅ | ✅ |
| [Apex Testing](https://trailhead.salesforce.com/content/learn/modules/apex_testing) | https://trailhead.salesforce.com/content/learn/modules/apex_testing | ✅ | ✅ |
| [API Basics](https://trailhead.salesforce.com/content/learn/modules/api_basics) | https://trailhead.salesforce.com/content/learn/modules/api_basics | ✅ | ✅ |
| [Integration Specialist](https://trailhead.salesforce.com/content/learn/modules/integration_specialist) | https://trailhead.salesforce.com/content/learn/modules/integration_specialist | | ✅ |
| [Apex Enterprise Patterns](https://trailhead.salesforce.com/content/learn/modules/apex_design_patterns) | https://trailhead.salesforce.com/content/learn/modules/apex_design_patterns | | ✅ |
| [Security Specialist](https://trailhead.salesforce.com/content/learn/modules/security_specialist) | https://trailhead.salesforce.com/content/learn/modules/security_specialist | ✅ | ✅ |

---

### 6. Official Salesforce GitHub Resources

Salesforce maintains official GitHub organizations for open-source code, SDKs, and specific product documentation.

| Organization | URL | What It Contains |
|--------------|-----|------------------|
| **Salesforce (main)** | https://github.com/salesforce | Official open-source libraries, sample apps, LWC tools, developer skills |
| **SalesforceCommerceCloud** | https://github.com/SalesforceCommerceCloud | B2C Commerce technical references, script APIs, import/export schemas |
| **trailheadapps** | https://github.com/trailheadapps | Trailhead sample apps, official code examples, architectural patterns |

### 7. Community GitHub Repositories for Salesforce Docs

If you are looking for Markdown versions, offline PDFs, or AI/MCP integrations of official Salesforce documentation on GitHub, several community projects index them:

| Repository | URL | Description |
|------------|-----|-------------|
| **salesforce-docs-mcp** | https://github.com/SalesforceDiariesBySanket/salesforce-docs-mcp | Local-first MCP server with 350+ official Salesforce developer and release note PDFs |
| **salesforce-documentation-context** | https://github.com/damecek/salesforce-documentation-context | Downloads official Salesforce documentation PDFs, converts to Markdown, generates llms.txt for AI coding assistants |
| **salesforce-docs-cli** | https://github.com/gauravkheterpal/salesforce-docs-cli | Python CLI tool to query and render official Salesforce developer and admin docs in the terminal |
| **awesome-salesforce** | https://github.com/Clientell-Ai/awesome-salesforce | Categorized links to official guides, LWC recipes, developer utilities |

---

### 8. Practical Recommendations for AI Summaries

| Goal | Recommended Source | Format | Notes |
|------|-------------------|--------|-------|
| Technical / Developer docs | `llms.txt` files | Markdown | Best for AI — already structured for LLMs |
| Admin / Product guides | help.salesforce.com | HTML + PDFs | Download PDFs for offline processing |
| APIs & Platform | developer.salesforce.com | HTML / Markdown | Use the `llms.txt` indexes |
| Learning-style summaries | trailhead.salesforce.com | Interactive | Official but more educational |

**Tips:**
- Stick strictly to `*.salesforce.com` domains (`help.salesforce.com`, `developer.salesforce.com`, `trailhead.salesforce.com`) to keep it official-only.
- The `llms.txt` ecosystem is the strongest starting point if you're feeding docs into an AI summarizer.
- For bulk processing, prefer PDF downloads from the Help site or Markdown files linked from `llms.txt` files.
- For Apex/LWC specifically, start with the Apex Developer Guide and LWC Developer Guide on developer.salesforce.com.

---

