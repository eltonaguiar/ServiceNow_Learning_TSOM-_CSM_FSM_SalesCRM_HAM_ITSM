# AI Features & JavaScript Reference — Coding Section

**Agent:** opencode  
**Date:** 2026-11-11  
**Scope:** ServiceNow AI-native tiers, Now Assist, Predictive Intelligence, Virtual Agent, AI Agents, NASK, JavaScript reference patterns  
**Confidence:** high  
**Status:** **NEW_NOV11**

---

## Contents

- [Overview](#overview)
- [The Three AI Tiers](#the-three-ai-tiers)
- [Foundation Tier — Setup Guide](#foundation-tier-setup-guide)
- [Advanced Tier — Setup Guide](#advanced-tier-setup-guide)
- [Prime Tier — Setup Guide](#prime-tier-setup-guide)
- [Core AI Features Catalog](#core-ai-features-catalog)
- [Now Assist Skill Kit — Practical Implementation](#now-assist-skill-kit-practical-implementation)
- [Production Readiness Checklist](#production-readiness-checklist)
- [JavaScript Reference — Glide APIs & Scripting Patterns](#javascript-reference-glide-apis--scripting-patterns)
- [Official Resources](#official-resources)
- [Quiz](#quiz)

---

## Overview

ServiceNow's current product packaging uses three AI-native tiers: **Foundation**, **Advanced**, and **Prime**. These tiers differ primarily by the level of AI autonomy, process depth, and customization rights. All tiers include core AI enablers such as Now Assist (generative AI skills), Predictive Intelligence, Virtual Agent, AI Control Tower, and Workflow Data Fabric basics, with progressive capability increases.

**Packaging Notice:** ServiceNow's AI packaging evolved to Foundation, Advanced, and Prime tiers around April 2026 (replacing the prior five-tier model). Last verified: October 2026. Entitlements are contract-specific—what is "included" vs. "add-on" varies by agreement. The table below reflects publicly documented capabilities; your instance may differ. Confirm with your ServiceNow account team.

**NEW_NOV11** — This section was added as part of the AI Features consolidation exercise on 2026-11-11.

---

## The Three AI Tiers

| Tier | Capabilities | Best For |
|------|-------------|----------|
| **Foundation** | OOTB Now Assist skills (summarization, drafting, categorization), Predictive Intelligence, core processes (Incident, Request, Asset/CMDB), Virtual Agent | Getting started with AI; standard OOTB skills |
| **Advanced** | Full ITIL processes (Change, Problem, Major Incident, On-Call), Process Mining, Platform Analytics Advanced, AI Voice, higher Assist allocation, OOTB agentic task execution | Organizations needing agentic workflows and deeper process automation |
| **Prime** | Ability to build net-new custom AI skills and agents, higher autonomy, advanced AI Action Fabric options | Custom AI development; building net-new agents and skills |

Shared across tiers (with variations in depth/allocation): Now Assist, Moveworks conversational layer, AI Control Tower (governance/observability), Workflow Data Fabric, and RaptorDB Standard for performance. Usage is often metered via "Assists" (consumed per skill/agent run, with tier allocations and top-up options). Only Prime unlocks building truly net-new custom skills and agents.

**NEW_NOV11** — Tier comparison table added as part of AI Features consolidation.

---

## Foundation Tier — Setup Guide

1. Confirm licensing and instance version (Zurich or later preferred for full AI features).
2. Activate relevant plugins via System Applications > All Available Applications (or the Store): Now Assist for ITSM (or relevant product), Predictive Intelligence (com.glide.platform_ml and related), Virtual Agent.
3. Open Now Assist Admin (or AI Admin Hub in newer releases) > Features/Skills. Select a workflow (e.g., Technology) and activate skills such as Incident Summarization or Reply Generation via the guided setup: choose triggers/inputs, display locations (in-product, Now Assist panel, or both), and roles.
4. For Predictive Intelligence: Navigate to Predictive Intelligence > Homepage or Classification > Solution Definitions. Create a solution definition (e.g., classification for assignment group based on short description), filter high-quality historical data (ideally 30k–300k clean records), submit for training, validate accuracy, and activate. Training typically runs on ServiceNow's training service and returns the model.

**NEW_NOV11** — Foundation setup steps added as part of AI Features consolidation.

---

## Advanced Tier — Setup Guide

Build on Foundation steps, then:

1. Activate additional process plugins (Change, Problem, Major Incident, On-Call) and Process Mining / Platform Analytics Advanced.
2. Configure OOTB agentic workflows for ITSM, CSM, HRSD, or ITOM.
3. Set up AI Control Tower governance policies for model providers and data residency.
4. Enable AI Voice if telephony integration is required.

**NEW_NOV11** — Advanced setup steps added as part of AI Features consolidation.

---

## Prime Tier — Setup Guide

1. Use AI Agent Studio and Now Assist Skill Kit to create net-new custom agents and skills from natural-language instructions or detailed prompts. Define single-responsibility agents, tools, and orchestration.
2. Configure advanced governance in AI Control Tower (policies, observability, external AI if licensed separately).
3. Build custom AI Action Fabric workflows for multi-agent orchestration across systems.
4. Deploy custom skills via UI Action, Now Assist Panel, or other deployment targets.

**NEW_NOV11** — Prime setup steps added as part of AI Features consolidation.

---

## Core AI Features Catalog

### Generative AI — Now Assist

| Feature / Skill | Description | Tier Availability | Training Link |
|-----------------|-------------|-------------------|---------------|
| Incident Summarization | Auto-generates concise summaries of incident threads, work notes, and resolution details | Foundation, Advanced, Prime | [Now Assist for ITSM: Incident Summarization](https://learn.servicenow.com/learning-plans/now-assist-itsm-incident-summarization) |
| Case Summarization | Summarizes customer service case history for faster agent onboarding | Foundation, Advanced, Prime | [Now Assist for CSM: Case Summarization](https://learn.servicenow.com/learning-plans/now-assist-csm-case-summarization) |
| Resolution Note Generation | Drafts resolution notes from work notes and activity | Foundation, Advanced, Prime | [Resolution Note Generation](https://learn.servicenow.com/learning-plans/now-assist-resolution-note-generation) |
| Reply Generation (Email/Chat) | AI-drafts responses for agents in email or chat channels | Foundation, Advanced, Prime | [Reply Generation](https://learn.servicenow.com/learning-plans/now-assist-reply-generation) |
| Knowledge Article Generation | Creates draft KB articles from resolved incidents or cases | Foundation, Advanced, Prime | [Knowledge Article Generation](https://learn.servicenow.com/learning-plans/now-assist-knowledge-generation) |
| Code Generation (Script Assist) | Generates server/client scripts, flow logic, and fix suggestions | Advanced, Prime | [Script Assist / Code Generation](https://learn.servicenow.com/learning-plans/now-assist-code-generation) |
| Flow Generation | Creates Flow Designer flows from natural language descriptions | Advanced, Prime | [Flow Generation](https://learn.servicenow.com/learning-plans/now-assist-flow-generation) |
| Playbook Generation | Generates step-by-step playbooks for processes | Advanced, Prime | [Playbook Generation](https://learn.servicenow.com/learning-plans/now-assist-playbook-generation) |
| Service Catalog Item Generation | Creates catalog items, variables, and workflows from descriptions | Advanced, Prime | [Catalog Item Generation](https://learn.servicenow.com/learning-plans/now-assist-catalog-generation) |

**NEW_NOV11** — Now Assist feature catalog added as part of AI Features consolidation.

### Predictive Intelligence (ML)

| Feature | Description | Tier Availability | Training Link |
|---------|-------------|-------------------|---------------|
| Classification | Auto-routes records (incidents, cases, requests) to assignment groups/categories | Foundation, Advanced, Prime | [Predictive Intelligence: Classification](https://learn.servicenow.com/learning-plans/predictive-intelligence-classification) |
| Similarity | Finds similar incidents, problems, or cases to accelerate resolution | Foundation, Advanced, Prime | [Predictive Intelligence: Similarity](https://learn.servicenow.com/learning-plans/predictive-intelligence-similarity) |
| Regression / Numeric Prediction | Predicts numeric values (e.g., priority, SLA risk, effort hours) | Advanced, Prime | [Predictive Intelligence: Regression](https://learn.servicenow.com/learning-plans/predictive-intelligence-regression) |
| Clustering | Groups records by latent patterns for proactive problem management | Advanced, Prime | [Predictive Intelligence: Clustering](https://learn.servicenow.com/learning-plans/predictive-intelligence-clustering) |
| Time Series Forecasting | Forecasts volume, backlog, or resource needs over time | Advanced, Prime | [Time Series Forecasting](https://learn.servicenow.com/learning-plans/predictive-intelligence-forecasting) |

**NEW_NOV11** — Predictive Intelligence feature catalog added as part of AI Features consolidation.

### Virtual Agent & Conversational AI

| Feature | Description | Tier Availability | Training Link |
|---------|-------------|-------------------|---------------|
| Virtual Agent Designer | Low-code builder for conversation topics, flows, and entities | Foundation, Advanced, Prime | [Virtual Agent Designer](https://learn.servicenow.com/learning-plans/virtual-agent-designer) |
| NLU / Intent Classification | Natural language understanding for user utterances | Foundation, Advanced, Prime | [NLU & Intent Classification](https://learn.servicenow.com/learning-plans/virtual-agent-nlu) |
| ServiceNow Voice | Telephony integration with speech-to-text and text-to-speech | Advanced, Prime | [ServiceNow Voice](https://learn.servicenow.com/learning-plans/servicenow-voice) |
| AI Search Integration | Grounds Virtual Agent answers in Knowledge Base and catalog | Foundation, Advanced, Prime | [AI Search for Virtual Agent](https://learn.servicenow.com/learning-plans/ai-search-virtual-agent) |

**NEW_NOV11** — Virtual Agent feature catalog added as part of AI Features consolidation.

### AI Agents & Agentic Workflows

| Feature | Description | Tier Availability | Training Link |
|---------|-------------|-------------------|---------------|
| AI Agent Studio | Visual builder for creating, testing, and deploying AI agents | Advanced, Prime | [AI Agent Studio](https://learn.servicenow.com/learning-plans/ai-agent-studio) |
| Now Assist Skill Kit | Framework for building custom generative skills (Prime only for net-new) | Prime (custom); Advanced (OOTB) | [Now Assist Skill Kit](https://learn.servicenow.com/learning-plans/now-assist-skill-kit) |
| OOTB Agentic Workflows | Pre-built agents for ITSM, CSM, HRSD, ITOM (e.g., Incident Resolution Agent) | Advanced, Prime | [OOTB Agentic Workflows](https://learn.servicenow.com/learning-plans/ootb-agentic-workflows) |
| AI Action Fabric (A2A/MCP) | Multi-agent orchestration and external system collaboration | Prime | [AI Action Fabric](https://learn.servicenow.com/learning-plans/ai-action-fabric) |
| Agentic Task Execution | Agents that complete multi-step tasks autonomously with human-in-the-loop | Advanced, Prime | [Agentic Task Execution](https://learn.servicenow.com/learning-plans/agentic-task-execution) |

**NEW_NOV11** — AI Agents feature catalog added as part of AI Features consolidation.

### Process Mining & Analytics

| Feature | Description | Tier Availability | Training Link |
|---------|-------------|-------------------|---------------|
| Process Mining | Discovers, analyzes, and optimizes end-to-end processes from event logs | Advanced, Prime | [Process Mining](https://learn.servicenow.com/learning-plans/process-mining) |
| Platform Analytics Advanced | Advanced dashboards, KPI tracking, and operational insights | Advanced, Prime | [Platform Analytics Advanced](https://learn.servicenow.com/learning-plans/platform-analytics-advanced) |
| Task Intelligence | Automates task creation, assignment, and routing using ML | Advanced, Prime | [Task Intelligence](https://learn.servicenow.com/learning-plans/task-intelligence) |

**NEW_NOV11** — Process Mining feature catalog added as part of AI Features consolidation.

### Data & Platform Foundations

| Feature | Description | Tier Availability | Training Link |
|---------|-------------|-------------------|---------------|
| RaptorDB | High-performance database engine for AI/analytics workloads | All tiers (Standard); Prime (enhanced) | [RaptorDB](https://learn.servicenow.com/learning-plans/raptordb) |

**NEW_NOV11** — Data & Platform Foundations catalog added as part of AI Features consolidation.

---

## Now Assist Skill Kit — Practical Implementation

**Why this matters:** NASK (now also called AI Skill Kit) turns ServiceNow AI from "here are OOTB summaries" into "here is a real button on an Incident form that drafts a resolution note, classifies the ticket, or checks policy compliance." This section gives you a buildable implementation path.

### Build Your First Useful AI Button: "Draft Resolution Notes" on Incident

**Business outcome:** An agent opens an Incident, clicks **Draft Resolution Notes**, and receives a draft resolution based on work notes, short description, CI, and related knowledge.

1. Confirm the user has the appropriate Now Assist/AI Skill Kit roles.
2. **Create the skill**: Go to Now Assist Skill Kit / AI Skill Kit → Create new custom skill → Name: `Draft Incident Resolution Notes`.
3. **Add inputs from the Incident record**: `short_description`, `description`, `work_notes`, `cmdb_ci`, `priority`. Keep inputs limited to fields that genuinely improve the output.
4. **Add tools**: Script tool to fetch recent related Incidents for the same CI; Decision node to skip the retriever when the Incident has no CI or insufficient description. NASK supports retrievers, scripts, subflows, flow actions, decision nodes, and chained skills.
5. **Deploy as a UI Action**: Choose UI Action as deployment target → Select `incident` table → NASK generates a UI Action with the skill invoked from its Script field. By default, output appears as an informational message. For a more useful version, modify the UI Action to write the draft into a field such as `close_notes`, `work_notes`, or a custom `u_ai_draft_resolution` field—but require agent review before saving.
6. **Control access**: Activate the skill in Now Assist Admin console → Assign the role configured during activation → Verify UI Action is active and visible to intended roles. ServiceNow identifies skill activation, role assignment, and UI Action activation as common reasons a button does not appear.

**NEW_NOV11** — NASK practical implementation added as part of AI Features consolidation.

### Custom Skill vs AI Agent — Decision Guide

| Goal | Deployment Channel | Example User Prompt |
|------|-------------------|---------------------|
| Let users ask for AI help anywhere | Now Assist Panel | "Summarize this incident and suggest next steps" |
| Button on a form | UI Action | "Draft resolution notes for this incident" |
| Background automation | Scheduled Job / Flow | "Nightly knowledge article curation" |
| Multi-system orchestration | AI Action Fabric | "Onboard new employee across HR, IT, Facilities" |

**NEW_NOV11** — Decision guide added as part of AI Features consolidation.

### Real AI Agent Example: "Incident Triage Assistant"

Build an agent that:
- Input = new Incident record
- Agent reads short_description, category, CI
- Calls Classification model
- If confidence >90%, auto-assigns
- If 60-90%, suggests top 3 groups to agent
- If <60%, escalates to dispatcher
- Deploy to sub-prod, A/B test 2 weeks, promote

**NEW_NOV11** — Incident Triage Assistant example added as part of AI Features consolidation.

---

## Production Readiness Checklist

### Production-Readiness Checklist

- [ ] Instance version (Zurich or later for full AI features)
- [ ] Licensing confirmed for target tier (Foundation/Advanced/Prime)
- [ ] Required plugins activated (Now Assist, Predictive Intelligence, Virtual Agent)
- [ ] AI Control Tower policies configured
- [ ] Assist metering and quota monitoring enabled
- [ ] Model evaluation framework in place
- [ ] Human oversight process defined for AI-generated content
- [ ] Rollback plan documented (disable skill in Now Assist Admin; revert update set)

### Best-Practice Principles

- Start with Foundation-level skills and core processes
- Activate plugins, train models in a non-production clone first
- Configure skills via Admin Hub guided setup
- Build simple flows/agents before complex orchestration
- Use App Engine Studio for rapid app/module creation
- Implement security and basic testing before production
- MVP first, expand based on adoption metrics
- Validate in sub-prod; avoid inefficient GlideRecord loops or heavy client scripts

### Risk-Tier Model for Human Oversight

| Risk Level | Example | Human Oversight Required |
|------------|---------|-------------------------|
| Low | Incident summarization draft | Agent reviews before saving |
| Medium | Resolution note generation | Agent edits and approves |
| High | Auto-assignment via Classification | Dispatcher confirms routing |
| Critical | Autonomous agentic task execution | Human-in-the-loop approval gate |

### Security & Privacy Requirements (Operational)

- Define allowed model providers (Now LLM vs. third-party)
- Data residency rules documented
- Approval workflows for new custom skills (Prime)
- Source citations required for grounded responses
- Confidence thresholds configured with fallback-to-human paths

### Model Evaluation Framework

- Track accuracy metrics per model/skill
- Monitor correction rate spikes as failure indicator
- Retrain models on schedule
- Validate in sub-prod before production promotion

### Cost Model Nuance

- Usage metered via "Assists" (consumed per skill/agent run)
- Tier allocations with top-up options
- MVP first, expand based on adoption
- Monitor AI usage analytics continuously

### Rollout RACI

| Role | Responsible | Accountable | Consulted | Informed |
|------|-------------|-------------|-----------|----------|
| Platform Admin | Plugin activation | Instance stability | AI Lead | Leadership |
| AI Lead | Skill configuration | AI governance | Developers | End users |
| Developers | Custom skill build | Code quality | Platform Admin | QA |
| QA | Testing in sub-prod | Test sign-off | AI Lead | End users |
| End Users | UAT and feedback | Adoption | AI Lead | Leadership |

### Failure Modes & Rollback Plan

| Failure Mode | Detection | Mitigation | Rollback |
|--------------|-----------|------------|----------|
| Bad retrieval (wrong KB article) | User feedback, correction rate spike | Disable retriever tool; fall back to prompt-only | Disable skill in Now Assist Admin; revert update set |
| Hallucinated content | Agent review flags | Require human-in-the-loop for high-risk outputs | Disable skill; retrain model |
| High Assist consumption | Quota alerts | Implement usage caps; review skill efficiency | Reduce skill allocation; optimize prompts |
| Latency SLA breach | P95/P99 monitoring | Scale model provider; optimize inputs | Fall back to OOTB skill |

### Change Communication & Accessibility

- Communicate new AI buttons/features to end users before rollout
- Provide training on when to trust vs. verify AI output
- Ensure WCAG accessibility for AI UI components
- Document fallback paths when AI is unavailable

**NEW_NOV11** — Production readiness checklist added as part of AI Features consolidation.

---

## JavaScript Reference — Glide APIs & Scripting Patterns

**NEW_NOV11** — JavaScript reference section added as part of AI Features consolidation.

This section consolidates the JavaScript reference patterns from the ServiceNow JavaScript reference page (findtorontoevents.ca/servicenow/javascript/) into a coding-focused reference for platform scripting.

### GlideRecord — Server-Side Record Queries

```javascript
// Basic query
var gr = new GlideRecord('incident');
gr.addQuery('priority', '1');
gr.addQuery('state', '!=', '6'); // not Resolved
gr.orderBy('sys_created_on');
gr.setLimit(50);
gr.query();

while (gr.next()) {
  gs.print(gr.number + ' - ' + gr.short_description);
}

// Insert a new record
var grNew = new GlideRecord('incident');
grNew.initialize();
grNew.short_description = 'AI-generated incident';
grNew.description = 'Drafted by Now Assist Skill Kit';
grNew.priority = '3';
grNew.insert();

// Update existing record
var grUpd = new GlideRecord('incident');
grUpd.get('SYSTEM_ID_HERE');
grUpd.work_notes = 'Resolution drafted via AI Skill Kit';
grUpd.update();

// Delete record
var grDel = new GlideRecord('incident');
grDel.get('SYSTEM_ID_HERE');
grDel.deleteRecord();
```

**Key methods:** `get()`, `insert()`, `update()`, `deleteRecord()`, `query()`, `next()`, `addQuery()`, `orderBy()`, `setLimit()`, `initialize()`

### GlideSystem — System Utilities

```javascript
// Current user info
gs.getUserID();           // Returns current user's sys_id
gs.getUserName();         // Returns current user's display name
gs.getUserByID('sys_id'); // Returns GlideUser object

// Logging
gs.info('Informational message');
gs.warn('Warning message');
gs.error('Error message');
gs.debug('Debug message');
gs.print('Debug output (visible in background scripts)');

// Date/time
gs.nowDateTime();         // Current date/time in system format
gs.daysAgo(7);            // Date 7 days ago
gs.minutesAgo(30);        // Date 30 minutes ago

// Property access
gs.getProperty('glide.ui.timezone');
gs.getSession().putProperty('temp.key', 'value');
```

### GlideAjax — Client-to-Server Bridge

**Client Script (asynchronous — never blocks the UI):**

```javascript
function onSubmit() {
  var ga = new GlideAjax('MyScriptInclude');
  ga.addParam('sysparm_name', 'getIncidentCount');
  ga.addParam('sysparm_category', g_form.getValue('category'));
  ga.getXML(function(response) {
    var answer = ga.getAnswer();
    g_form.addInfoMessage('Incident count: ' + answer);
  });
}
```

**Server-side Script Include:**

```javascript
var MyScriptInclude = Class.create();
MyScriptInclude.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  getIncidentCount: function() {
    var category = this.getParameter('sysparm_category');
    var gr = new GlideRecord('incident');
    gr.addQuery('category', category);
    gr.query();
    return gr.getRowCount();
  },
  type: 'MyScriptInclude'
});
```

**Important:** Always use GlideAjax instead of `g_form.getReference()` to avoid freezing the browser UI while waiting for server response.

### GlideForm — Client-Side Form Manipulation

```javascript
// Client Script - onLoad
function onLoad() {
  // Set field value
  g_form.setValue('priority', '3');
  
  // Make field mandatory
  g_form.setMandatory('short_description', true);
  
  // Show/hide field
  g_form.setDisplay('work_notes', true);
  
  // Set field read-only
  g_form.setReadOnly('number', true);
  
  // Add info message
  g_form.addInfoMessage('AI features enabled for this form');
}

// Client Script - onChange
function onChange() {
  var category = g_form.getValue('category');
  if (category === 'software') {
    g_form.setMandatory('u_software_version', true);
  }
}

// Client Script - onSubmit
function onSubmit() {
  if (!g_form.getValue('cmdb_ci')) {
    g_form.addErrorMessage('Please select a Configuration Item before submitting');
    return false;
  }
}
```

### Business Rule — Server-Side Data Logic

```javascript
// Before Business Rule on incident table
(function executeRule(current, previous) {
  // Auto-assign based on category
  if (current.category === 'network' && current.assignment_group.nil()) {
    current.assignment_group = 'Network Team';
  }
  
  // Set priority based on impact and urgency
  if (current.impact === '1' && current.urgency === '1') {
    current.priority = '1';
  }
  
  // Log AI-generated changes
  if (current.u_ai_generated === true) {
    gs.info('Incident ' + current.number + ' was AI-generated');
  }
})(current, previous);
```

### Script Include — Reusable Server-Side Library

```javascript
var AIHelper = Class.create();
AIHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  summarizeIncident: function(incidentSysId) {
    var gr = new GlideRecord('incident');
    if (!gr.get(incidentSysId)) return 'Incident not found';
    
    var summary = 'Incident ' + gr.number + ': ' + gr.short_description;
    summary += '\nState: ' + gr.getDisplayValue('state');
    summary += '\nPriority: ' + gr.getDisplayValue('priority');
    summary += '\nWork notes: ' + gr.work_notes;
    
    return summary;
  },
  
  getRelatedIncidents: function(ciSysId, limit) {
    var gr = new GlideRecord('incident');
    gr.addQuery('cmdb_ci', ciSysId);
    gr.orderByDesc('sys_created_on');
    gr.setLimit(limit || 10);
    gr.query();
    
    var results = [];
    while (gr.next()) {
      results.push({
        number: gr.number,
        short_description: gr.short_description,
        state: gr.getDisplayValue('state')
      });
    }
    return JSON.stringify(results);
  },
  
  type: 'AIHelper'
});
```

### UI Policy — Declarative Form Logic

UI Policies provide declarative (no-code) logic to show/hide fields, set mandatory, or set read-only based on conditions. Example:

- **Condition:** `category` is `software`
- **Action:** Set `u_software_version` to mandatory
- **Action:** Set `u_license_type` to visible

### UI Action — Client/Server Button

```javascript
// UI Action on incident table - client script
function onClick(control) {
  var ga = new GlideAjax('AIHelper');
  ga.addParam('sysparm_name', 'summarizeIncident');
  ga.addParam('sysparm_incident_sys_id', g_form.getUniqueValue());
  ga.getXML(function(response) {
    var summary = ga.getAnswer();
    g_form.addInfoMessage(summary);
  });
}

// UI Action server script (runs on server)
var incident = new GlideRecord('incident');
incident.get(current.sys_id);
incident.work_notes = 'AI summary generated at ' + gs.nowDateTime();
incident.update();
```

### Scheduled Job — Periodic Execution

```javascript
// Scheduled Job script (server-side)
var gr = new GlideRecord('incident');
gr.addQuery('state', '!=', '6'); // not Resolved
gr.addQuery('priority', '1');
gr.query();

while (gr.next()) {
  gs.log('P1 incident still open: ' + gr.number);
  // Could trigger AI summarization or escalation
}
```

### GlideDateTime — Date/Time Manipulation

```javascript
var gdt = new GlideDateTime();
gs.print(gdt.getValue());           // Current date/time
gs.print(gdt.getDisplayValue());    // Human-readable format

var gdtFuture = new GlideDateTime();
gdtFuture.addDaysUTC(7);
gs.print(gdtFuture.getDisplayValue()); // 7 days from now

var diff = gdtFuture.getDifference(gdt);
gs.print('Days difference: ' + diff.getDayPart());
```

### GlideAggregate — Aggregation Queries

```javascript
var grAgg = new GlideAggregate('incident');
grAgg.addQuery('state', '!=', '6');
grAgg.groupBy('priority');
grAgg.count('sys_id');
grAgg.query();

while (grAgg.next()) {
  gs.print('Priority ' + grAgg.priority + ': ' + grAgg.getAggregate('COUNT', 'sys_id') + ' incidents');
}
```

### GlideUser — User Information

```javascript
var user = gs.getUser();
gs.print(user.getUserName());       // Display name
gs.print(user.getUserID());         // sys_id
gs.print(user.getDepartment());     // Department
gs.print(user.getCompany());        // Company
gs.print(user.hasRole('admin'));    // Boolean role check
gs.print(user.getMemberOfGroups()); // Groups user belongs to
```

### GlideAttachment — File Attachments

```javascript
// Add attachment to record
var ga = new GlideAttachment();
ga.write('incident', 'SYSTEM_ID', 'resolution_notes.txt', 'text/plain', 'AI-generated resolution notes');

// Retrieve attachments
var attachments = new GlideAttachment();
var attachmentList = attachments.get('incident', 'SYSTEM_ID');
```

### GlideEmailOutbound — Sending Email

```javascript
var email = new GlideEmailOutbound();
email.setTo('user@example.com');
email.setSubject('AI-generated incident summary');
email.setBody('Your incident has been processed by AI Skill Kit.');
email.send();
```

### GlideSysAttachment — Alternative Attachment API

```javascript
var gsa = new GlideSysAttachment();
gsa.writeContent('incident', 'SYSTEM_ID', 'ai_draft.txt', 'Draft resolution notes from AI', 'text/plain');
```

### GlideFilter — Record Filter Evaluation

```javascript
var gf = new GlideFilter();
var gr = new GlideRecord('incident');
gr.get('SYSTEM_ID');

if (gf.match(gr, 'priority=1^state!=6')) {
  gs.print('Record matches filter criteria');
}
```

### GlideDate — Date-Only Operations

```javascript
var gd = new GlideDate();
gs.print(gd.getValue());       // Current date
gs.print(gd.getDisplayValue()); // Human-readable date
gd.addDays(30);
gs.print(gd.getDisplayValue()); // 30 days from now
```

### GlideDuration — Time Duration

```javascript
var gd = new GlideDuration();
gd.setValue(3600); // 1 hour in seconds
gs.print(gd.getDisplayValue()); // Human-readable duration
```

### GlideTime — Time-Only Operations

```javascript
var gt = new GlideTime();
gs.print(gt.getValue());       // Current time
gs.print(gt.getDisplayValue()); // Human-readable time
```

### GlideSysLog — System Logging

```javascript
gs.log('Custom log message');           // System log
gs.print('Debug output');               // Background script output
gs.info('Info message');                // Info level
gs.warn('Warning message');             // Warning level
gs.error('Error message');              // Error level
```

### GlideSession — Session Information

```javascript
var session = gs.getSession();
gs.print(session.getUserID());          // Current user sys_id
gs.print(session.getClientBrowser());   // Browser info
gs.print(session.getClientIPAddress()); // Client IP
gs.print(session.getLanguage());        // Session language
```

### GlideDBObjectManager — Database Operations

```javascript
var dbom = new GlideDBObjectManager();
var count = dbom.getRecordCount('incident');
gs.print('Total incidents: ' + count);
```

### GlideSystem Properties — Common Properties

| Property | Description | Example Value |
|----------|-------------|---------------|
| `glide.ui.timezone` | System timezone | `America/Toronto` |
| `glide.ui.date_format` | Date display format | `yyyy-MM-dd` |
| `glide.ui.time_format` | Time display format | `HH:mm` |
| `glide.smtp.server` | SMTP mail server | `smtp.example.com` |
| `glide.basetime.date` | Base time reference | `1970-01-01` |

### Client Script Types

| Type | When It Runs | Use Case |
|------|-------------|----------|
| `onLoad` | Form loads | Set defaults, show/hide fields |
| `onChange` | Field value changes | Dynamic field behavior |
| `onSubmit` | Form submits | Validation before save |
| `onCellEdit` | List cell edits | Inline list editing |

### Business Rule Types

| Type | When It Runs | Use Case |
|------|-------------|----------|
| `before` | Before DB write | Validate/modify data |
| `after` | After DB write | Trigger subsequent actions |
| `async` | After commit | Long-running tasks (emails, integrations) |

### Common Scripting Patterns

**Async vs Sync:** Always prefer asynchronous patterns (GlideAjax, async Business Rules) to avoid blocking the UI thread.

**Error Handling:** Wrap GlideRecord operations in try/catch blocks for production code.

**Null Checks:** Always check `gr.get()` returns true before accessing fields on a GlideRecord.

**Display Values:** Use `getDisplayValue()` for reference fields to show human-readable labels instead of sys_ids.

**NEW_NOV11** — JavaScript reference patterns added as part of AI Features consolidation.

---

## Official Resources

- [Configuring Now Assist Skill Kit](https://learn.servicenow.com/learning-plans/now-assist-skill-kit)
- [Now Assist Skill Kit: Tools & Deployment Options](https://learn.servicenow.com/learning-plans/now-assist-skill-kit-tools)
- [Configure AI Agents in AI Agent Studio](https://learn.servicenow.com/learning-plans/ai-agent-studio)
- [ServiceNow AI Agents Product Page](https://www.servicenow.com/products/ai-agents)
- [ServiceNow Learning Catalog](https://learn.servicenow.com/)
- [AI Control Tower Documentation](https://docs.servicenow.com/)
- [JavaScript Reference](https://findtorontoevents.ca/servicenow/javascript/index.html)

**NEW_NOV11** — Official resources list added as part of AI Features consolidation.

---

## Quiz

1. What are the three AI-native tiers in ServiceNow's current packaging?
   <details><summary>Answer</summary>Foundation, Advanced, and Prime.</details>

2. Which tier unlocks building net-new custom AI skills and agents?
   <details><summary>Answer</summary>Prime.</details>

3. What is an "Assist" in ServiceNow AI metering?
   <details><summary>Answer</summary>Unit of consumption for Now Assist skills and AI Agent runs. One skill invocation = 1 Assist.</details>

4. Why is GlideAjax preferred over g_form.getReference()?
   <details><summary>Answer</summary>GlideAjax is asynchronous, meaning it doesn't lock the browser UI while waiting for the server to respond.</details>

5. What is NASK (Now Assist Skill Kit)?
   <details><summary>Answer</summary>Framework for building custom generative skills in ServiceNow AI.</details>

6. Which Business Rule type runs after the record is committed to the database?
   <details><summary>Answer</summary>Async Business Rule.</details>

7. What does `gs.getUserID()` return?
   <details><summary>Answer</summary>The current user's sys_id.</details>

**NEW_NOV11** — Quiz added as part of AI Features consolidation.

---

*Generated by opencode on 2026-11-11. Part of the ServiceNow_Learning_TSOM-_CSM_FSM_SalesCRM_HAM_ITSM repository. **NEW_NOV11** — This entire document was added as part of the AI Features consolidation exercise.*
