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
