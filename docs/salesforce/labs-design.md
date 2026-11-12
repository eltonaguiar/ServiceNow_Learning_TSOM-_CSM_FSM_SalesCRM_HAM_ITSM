# Salesforce Labs, Design Considerations & Documentation

**Agent:** opencode  
**Date:** 2026-11-10  
**Platform:** Salesforce  
**Purpose:** Pre-existing labs, design considerations, system properties, and out-of-box features for Salesforce development  
**Confidence:** high  

<p class="meta" style="margin-bottom: 24px;"><a href="../../index.md">← Back to ServiceNow Module Guides</a> · Separate track from ServiceNow</p>

---

## Contents

- [Pre-Existing Labs & Documentation](#pre-existing-labs--documentation)
- [Lab 1: Build a Custom Object & Flow](#lab-1-build-a-custom-object--flow)
- [Lab 2: Write Your First Apex Trigger](#lab-2-write-your-first-apex-trigger)
- [Lab 3: Build a Lightning Web Component](#lab-3-build-a-lightning-web-component)
- [Lab 4: Make a REST API Callout](#lab-4-make-a-rest-api-callout)
- [Design Considerations](#design-considerations)
- [System Properties & OOB Features](#system-properties--oob-features)
- [What to Think About Before You Build](#what-to-think-about-before-you-build)

---

## Pre-Existing Labs & Documentation

Salesforce provides official, free hands-on labs and documentation. These are the best places to start:

| Resource | What It Is | Link |
|----------|-----------|------|
| **Trailhead** | Free guided learning with hands-on challenges | https://trailhead.salesforce.com |
| **Trailhead Projects** | Step-by-step project-based labs | https://trailhead.salesforce.com/en/content/learn/projects |
| **Developer Console** | Built-in IDE for Apex, Visualforce, SOQL | Gear menu (⚙️) > Developer Console |
| **Developer Workbook** | Guided Apex and Visualforce tutorials | https://developer.salesforce.com/docs/atlas.en-us.workbook.meta/workbook/ |
| **LWC Recipes** | Sample LWC components you can clone | https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.create_components_recipes |
| **Apex Recipes** | Sample Apex code patterns | https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/ |
| **Salesforce CLI** | Command-line development tool | https://developer.salesforce.com/tools/sfdxcli |
| **Workbench** | Browser-based data inspector and query tool | https://workbench.developerforce.com |

---

## Lab 1: Build a Custom Object & Flow

**Goal:** Create a custom object, add fields, and automate field updates with Flow.

**Prerequisites:** Salesforce Developer Org (free at developer.salesforce.com/signup)

**Steps:**

1. **Create the custom object**
   - Setup > Object Manager > Create > Custom Object
   - Label: "Project", Plural: "Projects", Object Name: `Project__c`
   - Check "Allow Reports", "Allow Activities", "Track Field History"
   - Click Save

2. **Add fields**
   - Setup > Object Manager > Project__c > Fields & Relationships > New
   - Field 1: Data Type = Text, Field Label = "Project Code", Required = ✓
   - Field 2: Data Type = Picklist, Field Label = "Status", Values = "Planning, In Progress, On Hold, Completed"
   - Field 3: Data Type = Date, Field Label = "Target Completion Date"

3. **Build the Flow**
   - Setup > Flows > New Flow
   - Select: "Record-Triggered Flow"
   - Object: Project__c, Trigger: "A record is created"
   - Add "Assignment" element: Set Status = "Planning" if Status is null
   - Add "Update Records" element: Update the triggering record
   - Save as "Auto-set Project Status", Activate

4. **Test**
   - App Launcher > Projects > New
   - Create a project without setting Status
   - Verify Status auto-fills to "Planning"

**What you learned:** Object creation, field types, Flow automation without code.

---

## Lab 2: Write Your First Apex Trigger

**Goal:** Write an Apex trigger that updates a related field, with a test class.

**Prerequisites:** Lab 1 completed (Project__c object exists)

**Steps:**

1. **Write the trigger**
   - Setup > Apex Triggers > New
   - Name: `ProjectTrigger`
   - Object: `Project__c`
   - Event: `before insert`, `before update`
   - Code:
     ```apex
     trigger ProjectTrigger on Project__c (before insert, before update) {
         for (Project__c p : Trigger.new) {
             if (String.isBlank(p.Project_Code__c)) {
                 p.Project_Code__c = 'PRJ-' + String.valueOf(Crypto.getRandomInteger().abs());
             }
         }
     }
     ```

2. **Write the test class** (required — Salesforce won't let you deploy without ≥75% code coverage)
   - Setup > Apex Classes > New
   - Name: `ProjectTriggerTest`
   - Code:
     ```apex
     @isTest
     private class ProjectTriggerTest {
         @isTest static void testProjectCodeGeneration() {
             Project__c p = new Project__c(Name='Test Project');
             insert p;
             p = [SELECT Project_Code__c FROM Project__c WHERE Id = :p.Id];
             System.assertNotEquals(null, p.Project_Code__c);
             System.assert(p.Project_Code__c.startsWith('PRJ-'));
         }
     }
     ```

3. **Run tests**
   - Setup > Apex Test Execution
   - Select `ProjectTriggerTest`, click Run
   - Verify 100% code coverage

**What you learned:** Triggers, test classes, code coverage requirement, SOQL query.

---

## Lab 3: Build a Lightning Web Component

**Goal:** Create an LWC that displays project information.

**Prerequisites:** Salesforce CLI installed (`sf` command), Dev Hub enabled

**Steps:**

1. **Authorize your Dev Org**
   ```bash
   sf org login web -d -a my-dev-org
   ```

2. **Create the LWC**
   ```bash
   sf project generate component -n projectCard -l lwc
   ```

3. **Edit `projectCard.js`**
   ```javascript
   import { LightningElement, api } from 'lwc';
   export default class ProjectCard extends LightningElement {
       @api projectName;
       @api projectStatus;
   }
   ```

4. **Edit `projectCard.html`**
   ```html
   <template>
       <lightning-card title={projectName} icon-name="standard:project">
           <div class="slds-m-around_medium">
               <p><strong>Status:</strong> {projectStatus}</p>
           </div>
       </lightning-card>
   </template>
   ```

5. **Edit `projectCard.js-meta.xml`**
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
       <apiVersion>60.0</apiVersion>
       <isExposed>true</isExposed>
       <targets>
           <target>lightning__RecordPage</target>
       </targets>
   </LightningComponentBundle>
   ```

6. **Deploy to org**
   ```bash
   sf project deploy start
   ```

7. **Add to a record page**
   - Setup > Object Manager > Project__c > Page Layouts > [Layout] > Lightning Record Page
   - Click Edit Page (opens Lightning App Builder)
   - Drag `projectCard` onto the page
   - Save and activate

**What you learned:** LWC structure, Salesforce CLI deployment, Lightning App Builder.

---

## Lab 4: Make a REST API Callout

**Goal:** Call an external REST API from Apex using Named Credentials.

**Prerequisites:** An external API to call (use https://jsonplaceholder.typicode.com for testing)

**Steps:**

1. **Create Named Credential**
   - Setup > Named Credentials > New
   - Label: "JSON Placeholder API"
   - Name: `JSON_Placeholder_API`
   - URL: `https://jsonplaceholder.typicode.com`
   - Identity: Named Principal
   - Authentication: Password Authentication
   - Username: (leave blank for public API)
   - Password: (leave blank for public API)
   - Check "Generate Authorization Header" = ✗

2. **Create Remote Site Setting** (fallback if Named Credential doesn't work)
   - Setup > Remote Site Settings > New
   - Name: "JSON Placeholder"
   - Remote Site URL: `https://jsonplaceholder.typicode.com`
   - Active = ✓

3. **Write the Apex callout**
   - Setup > Apex Classes > New
   - Name: `ExternalApiCaller`
   - Code:
     ```apex
     public class ExternalApiCaller {
         @future(callout=true)
         public static void fetchPosts() {
             Http http = new Http();
             HttpRequest req = new HttpRequest();
             req.setEndpoint('callout:JSON_Placeholder_API/posts/1');
             req.setMethod('GET');
             HttpResponse res = http.send(req);
             if (res.getStatusCode() == 200) {
                 System.debug('Response: ' + res.getBody());
             } else {
                 System.debug('Error: ' + res.getStatusCode());
             }
         }
     }
     ```

4. **Test from Anonymous Apex**
   - Developer Console > Debug > Open Execute Anonymous Window
   - Code: `ExternalApiCaller.fetchPosts();`
   - Click Execute
   - Check Debug Logs for the response

**What you learned:** Named Credentials, callouts, @future asynchronous methods, HttpRequest/HttpResponse.

---

## Design Considerations

### Before You Build: The Checklist

| Question | Why It Matters | Where to Decide |
|----------|---------------|-----------------|
| Can Flow do this instead of code? | Flows are declarative, easier to maintain, no test classes needed | Setup > Flows |
| Will this scale to 100K+ records? | Governor limits (100 SOQL, 10K DML rows, 6MB heap) | Apex design |
| Who needs to see/edit this data? | Profiles, roles, OWD, sharing rules, field-level security | Setup > Security |
| Is this data sensitive? | Field-level encryption, Shield Platform Encryption, event monitoring | Setup > Security |
| What happens if the external API is down? | Error handling, retry logic, fallback behavior, @future queue | Apex exception handling |
| Will users actually use this? | Page layout usability, Lightning Design System, training | Lightning App Builder |
| How will this be deployed? | Change sets, Salesforce CLI, CI/CD pipeline, sandbox strategy | Setup > Deploy |

### Code Design Patterns

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **Bulkification** | Always — triggers handle multiple records at once | Process `Trigger.new` as a list, never single record |
| **Trigger Framework** | Multiple triggers on same object | One trigger per object, delegate to handler classes |
| **Selector Layer** | Reusing SOQL queries | `ProjectsSelector.getByStatus('Active')` |
| **Domain Layer** | Business logic per object | `ProjectsDomain.setDefaultStatus()` |
| **Service Layer** | Cross-object logic | `ProjectService.createProjectWithTasks()` |
| **Async Processing** | Long-running operations | `@future`, `Queueable`, `Batch Apex` |

### Security Design

| Consideration | Implementation |
|--------------|----------------|
| **Least privilege** | Profiles get minimum access; Permission Sets add extras |
| **with sharing** | Apex respects sharing rules by default; use `without sharing` only when necessary |
| **CRUD/FLS checks** | Check `Schema.sObjectType.[Object].fields.[Field].isAccessible()` before DML |
| **SOQL injection** | Use bind variables (`:variable`), never string concatenation in queries |
| **Named Credentials** | Store endpoint URLs and auth externally, never hardcode |
| **Apex test data** | Create test data in `@isTest` methods; use `@testSetup` |

---

## System Properties & Out-of-the-Box Features

### Important System Properties

| Property | Where | What It Controls |
|----------|-------|------------------|
| `org.wideSharing.default` | Setup > Sharing Settings | Org-wide default record visibility |
| `setup.locked` | Setup > Deploy > Deployment Status | Whether metadata changes are allowed |
| `apex.pageLimit` | Internal | Visualforce page size limits |
| `session.timeout` | Setup > Session Settings | How long before idle sessions expire |
| `login.lockout` | Setup > Session Settings | Failed login lockout policy |

### Out-of-the-Box Features You Should Know

| Feature | What It Does | Where |
|---------|-------------|-------|
| **Record Types** | Different page layouts, picklists, business processes per object | Setup > Object Manager > [Object] > Record Types |
| **Formula Fields** | Read-only calculated fields (no code) | Setup > Object Manager > [Object] > Fields & Relationships > Formula |
| **Roll-Up Summary** | Aggregate child records on parent (Master-Detail only) | Setup > Object Manager > [Parent] > Fields & Relationships |
| **Validation Rules** | Block invalid data at save time | Setup > Object Manager > [Object] > Validation Rules |
| **Approval Processes** | Multi-step record approval with email | Setup > Approval Processes |
| **Sandboxes** | Isolated copies for dev/test | Setup > Sandboxes |
| **Change Sets** | Move metadata between orgs | Setup > Deploy > Change Sets |
| **Optimizer** | Health check, recommends improvements | Setup > Optimizer |
| **Platform Cache** | Cache frequently accessed data in memory | Setup > Platform Cache |
| **Apex Scheduler** | Schedule Apex classes to run periodically | Setup > Apex Classes > [Batch Class] > Schedule |

### Deployment Options

| Option | Best For |
|--------|----------|
| **Change Sets** | Simple config moves between related orgs (sandbox → production) |
| **Salesforce CLI (SFDX)** | Source-driven development, CI/CD, version control |
| **Metadata API** | Programmatic deployment, custom tooling |
| **Ant Migration Tool** | Legacy XML-based deployment (being superseded by CLI) |

---

## What to Think About Before You Build

### The "Buy vs Build" Decision

Before writing code or configuring:

1. **Is there an AppExchange app that does this?** (Save time, but costs money)
2. **Can Flow do this?** (Fastest to build, easiest to maintain)
3. **Do you need Apex?** (Only for complex logic, callouts, or bulk operations)
4. **Do you need LWC?** (Only for custom UI beyond standard page layouts)

### The "Maintenance" Question

| Question | Good Answer |
|----------|-------------|
| Who maintains this after you leave? | Documented Flow or well-structured Apex with test classes |
| Can an admin modify it? | Flow and declarative tools — yes; Apex — no |
| Is it documented? | Comments in code, Flow descriptions, external wiki |
| Are there test classes? | Yes, ≥75% coverage (Salesforce requirement) |
| Can it be deployed to production? | Via Change Sets or CLI, tested in sandbox first |

---
