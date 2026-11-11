# AI — ServiceNow AI Platform, Now Assist, and Agentic Workflows

**Agent:** opencode  
**Date:** 2026-11-10  
**Module:** AI (Now Assist, Predictive Intelligence, AI Agents, Virtual Agent)  
**App:** Now Platform  
**Confidence:** high  
**Source:** ServiceNow product documentation (Zurich/Xanadu/Yokohama), ServiceNow AI Features packaging (Oct 2026)

---

## Contents

- [Purpose](#purpose)
- [AI Feature Types Breakdown](#ai-feature-types-breakdown)
- [Where to Find It](#where-to-find-it)
- [AI Product Packaging — Foundation, Advanced, Prime](#ai-product-packaging--foundation-advanced-prime)
- [Core AI Features Catalog](#core-ai-features-catalog)
- [Predictive Intelligence — Similar Incidents, Knowledge, Classification](#predictive-intelligence--similar-incidents-knowledge-classification)
- [Virtual Agent & Conversational AI](#virtual-agent--conversational-ai)
- [AI Agents & Agentic Workflows](#ai-agents--agentic-workflows)
- [Now Assist Panel — “Diagnose a Service Graph Connector”](#now-assist-panel--diagnose-a-service-graph-connector)
- [Now Assist Skill Kit — Build Your First AI Button](#now-assist-skill-kit--build-your-first-ai-button)
- [Custom Skill vs AI Agent — Decision Guide](#custom-skill-vs-ai-agent--decision-guide)
- [Real AI Agent Example: “Incident Triage Assistant”](#real-ai-agent-example--incident-triage-assistant)
- [Install / Enablement per Module](#install--enablement-per-module)
- [AI Control Tower — Governance & Observability](#ai-control-tower--governance--observability)
- [Best Practices That Actually Provide Value](#best-practices-that-actually-provide-value)
- [Lab: Deploy a Custom AI Skill on Incident](#lab--deploy-a-custom-ai-skill-on-incident)
- [Quiz](#quiz)
- [Official Learning Resources](#official-learning-resources)

---

## Purpose

ServiceNow AI is the platform layer that adds generative AI, predictive ML, and agentic automation on top of the core Now Platform. It is **not** a module you install like ITSM or CSM — it is a set of capabilities (Now Assist, Predictive Intelligence, Virtual Agent, AI Agents, AI Control Tower) that you license in tiers and activate across existing modules (Incident, Change, Asset, CMDB, etc.).

**The core question AI answers:** *“Can the platform do the reading, drafting, routing, and triage so humans only do the deciding?”*

ServiceNow’s AI packaging evolved to three tiers around April 2026 (Foundation, Advanced, Prime), replacing the prior five-tier model. Entitlements are contract-specific — what is “included” vs “add-on” varies by agreement. Confirm with your ServiceNow account team.

---

## AI Feature Types Breakdown

ServiceNow AI is not one thing — it is four distinct feature types layered on top of the Now Platform. The table below shows how they differ, what problem each solves, and a concrete example.

| Feature Type | What it does | Example | Typical Tier |
|---|---|---|---|
| **Generative AI — Now Assist** | Reads, writes, summarizes, drafts, and generates content using LLMs. Output is text, code, or structured suggestions. | Auto-summarize a 50-work-note incident thread into a 3-bullet executive summary; draft a resolution note; generate a KB article | Foundation, Advanced, Prime |
| **Predictive Intelligence (ML)** | Trains on historical data to classify, route, predict, and find similar records. Output is a score, label, or ranked list. | Auto-route “Outlook not sending” → “Messaging Team” with 92% accuracy; find 3 similar past incidents; predict change effort hours | Foundation, Advanced, Prime |
| **Virtual Agent (Conversational AI)** | Talks to users in natural language via chat/voice. Deflects tickets by resolving common requests without a human agent. | Employee says “I forgot my password” → bot verifies identity → resets password → confirms done, no ticket created | Foundation, Advanced, Prime |
| **AI Agents / Agentic Workflows** | Reasons, plans, and acts autonomously (with guardrails). Uses tools, triggers, and multi-step reasoning to complete work. | Incident Triage Agent: reads a new P1 incident, finds similar incidents + KB + recent changes, drafts a triage summary, recommends assignment | Advanced, Prime |

### Key distinctions

| Distinction | Generative AI | Predictive Intelligence | Virtual Agent | AI Agents |
|---|---|---|---|---|
| **Input** | Text, records, documents | Historical structured data (fields, values) | User utterances (chat/voice) | Records, events, tool outputs, goals |
| **Output** | Generated text / code / structured suggestion | Score, label, category, ranked list, prediction | Conversational response, ticket deflection | Action taken, recommendation, executed workflow |
| **Human role** | Reviews and edits the draft | Reviews and applies the routing/prediction | Interacts via chat; escalates if stuck | Sets guardrails, approves high-stakes actions |
| **Primary value** | Faster reading, drafting, documentation | Faster routing, fewer misroutes, proactive problem detection | Fewer tickets created, 24/7 self-service | End-to-end automation of multi-step processes |
| **Best first use case** | Incident summarization | Auto-routing incidents to the right group | Password reset / password-related self-service | Incident triage package (context + recommendation) |

### How they work together (a single incident lifecycle)

| Stage | AI feature type | What happens |
|---|---|---|
| **1. Ticket arrives** | Virtual Agent | Employee chats “my VPN isn’t working” → bot attempts password reset / VPN troubleshooting → deflects the ticket or creates an incident with context |
| **2. Ticket created** | Predictive Intelligence — Classification | Auto-routes the incident to “Network Team” based on `short_description` + historical patterns |
| **3. Agent opens ticket** | Generative AI — Now Assist | Auto-summarizes the 20-work-note thread; suggests relevant KB articles via Similar Incidents; drafts a resolution note |
| **4. Agent needs context** | AI Agent (Incident Triage Assistant) | Gathers related CIs, recent changes, similar incidents, KB articles → presents a triage package: “Likely cause: Change CHG004521. Runbook: KB009876.” |
| **5. Resolution** | Generative AI + Flow Designer | Agent clicks “Execute remediation” → agent runs a pre-approved flow (e.g., restart interface) → ticket auto-closes on verification |

**Rule of thumb:** Start with Generative AI (Now Assist summarization) for immediate productivity, then add Predictive Intelligence (classification/similarity) for routing, then Virtual Agent for deflection, then AI Agents for multi-step automation — in that order, because each layer depends on the data quality of the one before it.

---

## Where to Find It

| Destination | Breadcrumb |
|---|---|
| Now Assist Admin / AI Admin Hub | All > Now Assist > Admin > ... |
| AI Skill Kit | All > AI Skill Kit > ... |
| AI Agent Studio | All > AI Agent Studio > Create and manage > AI agents |
| Virtual Agent Designer | All > Conversational Interfaces > Virtual Agent > ... |
| Predictive Intelligence | All > Predictive Intelligence > ... |
| AI Control Tower | All > AI Control Tower > Overview |
| Now Assist skills | All > Now Assist > Admin > Features/Skills |
| Conversational Interfaces | All > Conversational Interfaces > Assistants |

---

## AI Product Packaging — Foundation, Advanced, Prime

| Tier | AI Focus | Key Additions (publicly documented) | Typical Fit |
|---|---|---|---|
| **Foundation** | Assisted insights & routine automation | OOTB Now Assist skills (summarization, drafting, categorization), Predictive Intelligence, core processes (Incident, Request, Asset/CMDB), Virtual Agent | Entry-level service desks seeking productivity gains without heavy process expansion |
| **Advanced** | Agentic workflows that synthesize context and automate steps | Full ITIL processes (Change, Problem, Major Incident, On-Call), Process Mining, Platform Analytics Advanced, AI Voice, higher Assist allocation, OOTB agentic task execution | Mature operations needing deeper processes and contextual automation |
| **Prime** | Fully autonomous AI workforce & custom builds | Ability to build net-new custom AI skills and agents, higher autonomy, advanced AI Action Fabric options | Organizations ready for end-to-end autonomous roles or highly specialized agents |

**Shared across tiers (with variations in depth/allocation):** Now Assist, Moveworks conversational layer, AI Control Tower (governance/observability), Workflow Data Fabric, RaptorDB Standard. Usage is often metered via **“Assists”** (consumed per skill/agent run, with tier allocations and top-up options). **Only Prime unlocks building truly net-new custom skills and agents.**

---

## Core AI Features Catalog

### Generative AI — Now Assist

| Feature / Skill | Description | Tier Availability |
|---|---|---|
| Incident Summarization | Auto-generates concise summaries of incident threads, work notes, and resolution details | Foundation, Advanced, Prime |
| Case Summarization (CSM) | Summarizes customer service case history for faster agent onboarding | Foundation, Advanced, Prime |
| Resolution Note Generation | Drafts resolution notes from work notes and activity | Foundation, Advanced, Prime |
| Reply Generation (Email/Chat) | AI-drafted responses for agents in email or chat channels | Foundation, Advanced, Prime |
| Knowledge Article Generation | Creates draft KB articles from resolved incidents or cases | Foundation, Advanced, Prime |
| Code Generation (Script Assist) | Generates server/client scripts, flow logic, and fix suggestions | Advanced, Prime |
| Flow Generation | Creates Flow Designer flows from natural language descriptions | Advanced, Prime |
| Playbook Generation | Generates step-by-step playbooks for processes | Advanced, Prime |
| Service Catalog Item Generation | Creates catalog items, variables, and workflows from descriptions | Advanced, Prime |

### Predictive Intelligence (ML)

| Feature | Description | Tier Availability |
|---|---|---|
| Classification | Auto-routes records (incidents, cases, requests) to assignment groups/categories | Foundation, Advanced, Prime |
| Similarity | Finds similar incidents, problems, or cases to accelerate resolution | Foundation, Advanced, Prime |
| Regression / Numeric Prediction | Predicts numeric values (priority, SLA risk, effort hours) | Advanced, Prime |
| Clustering | Groups records by latent patterns for proactive problem management | Advanced, Prime |
| Time Series Forecasting | Forecasts volume, backlog, or resource needs over time | Advanced, Prime |

### Virtual Agent & Conversational AI

| Feature | Description | Tier Availability |
|---|---|---|
| Virtual Agent Designer | Low-code builder for conversation topics, flows, and entities | Foundation, Advanced, Prime |
| NLU / Intent Classification | Natural language understanding for user utterances | Foundation, Advanced, Prime |
| ServiceNow Voice | Telephony integration with speech-to-text and text-to-speech | Advanced, Prime |
| AI Search Integration | Grounds Virtual Agent answers in Knowledge Base and catalog | Foundation, Advanced, Prime |
| Moveworks Integration | Conversational layer for employee support automation across Slack/Teams | All tiers (varies) |

### AI Agents & Agentic Workflows

| Feature | Description | Tier Availability |
|---|---|---|
| AI Agent Studio | Visual builder for creating, testing, and deploying AI agents | Advanced, Prime |
| Now Assist Skill Kit | Framework for building custom generative skills | Prime (custom); Advanced (OOTB) |
| OOTB Agentic Workflows | Pre-built agents for ITSM, CSM, HRSD, ITOM | Advanced, Prime |
| AI Action Fabric (A2A/MCP) | Multi-agent orchestration and external system collaboration | Prime |
| Agentic Task Execution | Agents that complete multi-step tasks autonomously with human-in-the-loop | Advanced, Prime |

### Data & Platform Foundations

| Feature | Description | Tier Availability |
|---|---|---|
| Workflow Data Fabric | Unified data layer connecting internal and external sources for AI grounding | All tiers |
| RaptorDB | High-performance database engine for AI/analytics workloads | All tiers (Standard); Prime (enhanced) |
| Integration Hub / Spokes | Pre-built connectors for external data ingestion into Data Fabric | All tiers |

---

## Predictive Intelligence — Similar Incidents, Knowledge, Classification

Predictive Intelligence is the ML layer of ServiceNow AI. It trains on your historical data to classify, route, and find similar records — **without** you writing rules.

### Similar Incidents

**What it does:** Given a new incident, Predictive Intelligence Similarity finds past incidents that are alike and surfaces them so the agent can apply a known fix faster.

**Concrete example:**
- New incident: *“SAP GUI timeout on PO creation”*
- AI surfaces 3 similar past incidents — all fixed by clearing SAP GUI cache + increasing HTTP timeout
- Agent applies fix in 5 min vs 45 min troubleshooting
- Target: >30% similarity match rate

**How it works:**
1. Create a **Solution Definition** (Predictive Intelligence > Classification > Solution Definitions)
2. Select the table (e.g., `incident`) and fields to train on (e.g., `short_description`, `category`, `cmdb_ci`)
3. Filter to high-quality historical data — ideally **30K–300K clean records**
4. Submit for training (runs on ServiceNow’s training service, returns the model)
5. Validate accuracy, then activate
6. On new incidents, Similar Incidents appears as a related list with matched records and confidence scores

### Relevant Knowledge Articles

When an incident is created or updated, AI can surface KB articles relevant to the incident’s short description, category, and CI. This is powered by **AI Search** + **Predictive Intelligence Similarity**. The agent sees suggested KB articles in the Now Assist panel without searching manually.

### Application Menu / Model called “Similar Incidents”

ServiceNow ships an application menu and model surface for Predictive Intelligence Similarity. On the incident form, a **“Similar Incidents”** related list (or module) shows historically similar incidents with:
- Incident number and short description
- Similarity confidence score
- Resolution notes (if closed)
- Assignment group that handled it

Agents can click through to the similar incident, copy the resolution approach, or link the records.

### Classification

Auto-routes incidents/cases/requests to assignment groups/categories based on `short_description` + historical patterns. Example: 5,000 incidents/month → train on 18 months of clean “short_description + assignment_group” pairs → model routes *“Outlook not sending”* → *“Messaging Team”* with 92% accuracy, cutting misroutes from 18% to 3%.

**Critical prerequisite:** Predictive Intelligence is only as good as your historical data. Clean, labeled records are non-negotiable. Garbage in = garbage out.

---

## Virtual Agent & Conversational AI

Virtual Agent is ServiceNow’s chatbot/self-service layer. Employees or customers ask questions in natural language (via Employee Center, Slack, Teams, or web), and Virtual Agent resolves them without creating a ticket.

### How it works

1. User asks: *“How do I reset my MFA?”*
2. Virtual Agent uses **NLU** (Natural Language Understanding) or **LLM topic discovery** to match the request to a topic
3. The topic flow runs: verify identity → call “Password Reset” spoke → confirm reset → offer “Set up MFA” follow-up
4. If unresolved, escalates to a live agent with full context

### Deflection example
- Build “Password Reset” topic in ~30 min
- Virtual Agent authenticates via caller ID + voice PIN
- Resolves 65% of password tickets without a ticket being created
- Avg handle time: 2.3 min vs 8 min live agent

### Virtual Agent Designer
Build conversation flows visually (drag-and-drop) with controls: Dynamic Choice, Card, Boolean, Decision, Text Input, Record Action. Topics can use **LLM topic discovery** instead of rigid NLU keywords — meaning the bot understands *“my VPN’s broken”* maps to the VPN topic even if the user never says the exact keyword.

---

## AI Agents & Agentic Workflows

AI Agents go beyond Now Assist summarization — they **reason, plan, and act** within guardrails.

| Capability | What it does | Tier |
|---|---|---|
| AI Agent Studio | Visual builder for creating, testing, deploying AI agents | Advanced, Prime |
| Now Assist Skill Kit | Framework for building custom generative skills | Prime (custom); Advanced (OOTB) |
| OOTB Agentic Workflows | Pre-built agents for ITSM, CSM, HRSD, ITOM (e.g., Incident Resolution Agent) | Advanced, Prime |
| AI Action Fabric (A2A/MCP) | Multi-agent orchestration across external systems | Prime |
| Agentic Task Execution | Agents complete multi-step tasks autonomously with human-in-the-loop | Advanced, Prime |

**Example — Incident Resolution Agent (OOTB):** Activates on P1/P2 incidents → auto-gathers similar incidents, KB articles, recent changes on affected CIs, runbook links → presents in Now Assist panel: *“Likely cause: Change CHG004521 (DNS update). Runbook: KB009876. Rollback steps: …”* Agent clicks *“Execute rollback”* → agent runs Flow. MTTR -35%.

---

## Now Assist Panel — “Diagnose a Service Graph Connector”

ServiceNow’s **Now Assist** panel (top-right chat bubble) can help diagnose Service Graph Connector problems directly from the chat interface. The panel surfaces suggested prompts including **“Diagnose a Service Graph Connector”** — click it to start a guided troubleshooting session without leaving the page.

| Now Assist capability | How it helps with SGC |
|---|---|
| Diagnose a Service Graph Connector | Analyzes connector configuration, schedules, and recent run status to identify misconfigurations |
| Generate KB Article | Creates a knowledge base article from the diagnosis for team reference |
| Ask free-form | Ask about specific errors, schedule failures, or data-mapping issues in plain language |

**Suggested prompts:**
- *“Diagnose a Service Graph Connector”* — general health check
- *“Why is my OpenTelemetry connector not ingesting data?”* — specific connector failure
- *“Show me failed SGC schedules in the last 24 hours”* — recent failures
- *“Generate a KB article for this SGC diagnosis”* — document for your team

**Limitations:** Now Assist suggestions are AI-generated — review for accuracy. It can identify *what* is wrong but may not have permission to *change* connector configuration.

---

## Now Assist Skill Kit — Build Your First AI Button

The Now Assist Skill Kit (NASK) turns ServiceNow AI from “here are OOTB summaries” into “here is a real button on an Incident form that drafts a resolution note, classifies the ticket, or checks policy compliance.”

### Build Your First Useful AI Button: “Draft Resolution Notes” on Incident

**Business outcome:** An agent opens an Incident, clicks **Draft Resolution Notes**, and receives a draft resolution based on work notes, short description, CI, and related knowledge.

**Prerequisites:**
- Instance has the required AI entitlement and Otto/AI Skill Kit plugins installed/updated via Application Manager
- User has appropriate Now Assist/AI Skill Kit roles
- Use a non-production instance first

**Steps:**

1. **Create the skill:** Go to `Now Assist Skill Kit / AI Skill Kit` → Create new custom skill → Name: `Draft Incident Resolution Notes`
2. **Add skill inputs** from the Incident record: `short_description`, `description`, `work_notes`, `cmdb_ci`, `priority`. Keep inputs limited to fields that genuinely improve output.
3. **Write a grounded prompt** with explicit rules (template below).
4. **Add useful tools:** NASK supports retrievers, scripts, subflows, flow actions, decision nodes, chained skills:
   - **Retriever** to search relevant KB articles or known-error records
   - **Script tool** to fetch recent related Incidents for the same CI
   - **Decision node** to skip the retriever when the Incident has no CI or insufficient description
5. **Test properly:** Use the skill’s **Test prompt** area. Inspect both the **Grounded prompt** (actual prompt + tool output sent to the model) and **Tools** (each tool’s request and response).
6. **Deploy as a UI Action:** Choose UI Action as deployment target → Select `incident` table → NASK generates a UI Action with the skill invoked from its Script field. Output appears as an informational message by default. For more utility, modify the UI Action to write the draft into `close_notes`, `work_notes`, or a custom `u_ai_draft_resolution` field — but require agent review before saving.
7. **Control access:** Activate the skill in Now Assist Admin console → Assign the role → Verify UI Action is active and visible to intended roles. Common reasons a button doesn’t appear: skill not activated, role not assigned, UI Action not active.

**Prompt starting point:**
```
You are assisting an IT service desk agent.

Using only the provided Incident data and retrieved knowledge, draft a resolution note.

Rules:
- Do not invent facts, root causes, or actions.
- If information is insufficient, say exactly what is missing.
- Use clear, professional language suitable for an Incident record.
- Separate: Summary, Actions Taken, Root Cause, Follow-up.

Incident data:
Short description: {{short_description}}
Description: {{description}}
Work notes: {{work_notes}}
Configuration item: {{cmdb_ci}}
Priority: {{priority}}

Retrieved knowledge:
{{retrieved_articles}}
```

**Acceptance criteria:**
- Button appears only for authorized fulfillers
- Output is clearly labeled as an AI draft
- Agent can edit before saving
- No automatic update to a customer-facing field without approval
- Test cases cover: empty work notes, missing CI, unrelated KB results, sensitive data, long ticket histories

---

## Custom Skill vs AI Agent — Decision Guide

NASK skills are modular building blocks; AI agents use tools — including custom skills — to complete broader tasks.

| Need | Best Fit | Example |
|---|---|---|
| Generate or transform text from the current record | NASK skill + UI Action | Draft resolution notes |
| Retrieve and summarize knowledge | NASK skill + Retriever | Find policy exceptions for an expense report |
| Run a repeatable workflow step | NASK skill as Flow Action | Classify an inbound request, then route it |
| Handle a multi-step, conversational task | AI Agent | Investigate an Incident, check similar records, recommend next action |
| Execute an end-to-end process with guardrails | Agentic workflow | Triage, enrich, assign, and notify — within defined limits |
| Let users ask for AI help anywhere | Now Assist Panel | “Summarize this incident and suggest next steps” |

---

## Real AI Agent Example: “Incident Triage Assistant”

**Business outcome:** When a P1/P2 Incident is created, the agent gathers context, identifies likely related records, proposes a category and assignment group, and creates a draft investigation summary for human approval.

**Steps:**

1. **Define the job narrowly:** Not “resolve incidents” but *“Prepare a triage package for high-priority Incidents.”*
2. **Create the agent:** `AI Agent Studio → Create and manage → AI agents` → Choose **Chat** for internal agent → Define specialty, goals, and limits.
3. **Set security first:** Define who can invoke it, which tables/fields it can read. Ensure ACLs — not only agent instructions — control data access.
4. **Add modular tools:** `Get Incident Details`, `Find Similar Incidents`, `Search Known Errors`, `Get CI Health`, `Draft Triage Summary`. Custom NASK skills can be published and added as tools.
5. **Add a trigger:** Trigger on Incident creation where priority is P1 or P2. Do not trigger on every Incident initially.
6. **Require human approval:** The agent may create a draft summary and recommendation. It should **not** automatically reassign, change priority, close, or notify executives until accuracy is proven.
7. **Test and monitor:** Use AI Agent Studio’s test capability. Track: correct category, correct assignment-group recommendation, useful similar-record retrieval, false-positive escalations, user acceptance.

---

## Install / Enablement per Module

AI features are **not** separate modules you install like ITSM. They are platform capabilities activated via plugins and entitlements, then configured per module (table/workflow).

| Module / Table | AI features you can enable | Install / Activate via |
|---|---|---|
| Incident (`incident`) | Incident Summarization, Similar Incidents, Classification, Resolution Note Generation, Reply Generation, AI Agent triage | Now Assist Admin > Skills; Predictive Intelligence > Solution Definitions; AI Agent Studio |
| Change Request (`change_request`) | Regression (predict effort/duration), Playbook Generation, Code Generation | Predictive Intelligence; Now Assist Skill Kit; Flow Designer AI |
| Problem (`problem`) | Clustering (group related incidents into problems), Similarity | Predictive Intelligence > Clustering / Similarity |
| Request (`sc_request`) | Classification (route to fulfillment group), Catalog Item Generation | Predictive Intelligence; Now Assist Skill Kit |
| CMDB (`cmdb_ci`) | — | AI does not create CIs; Discovery + ITOM Visibility do |
| Asset (`alm_asset`) | — | HAM does not have native AI features; use Classification for asset categorization |
| HR (`sn_hr_core_case`) | Case Summarization (CSM/HRSD), Reply Generation | Now Assist for CSM/HRSD skills |
| Virtual Agent (any table) | Virtual Agent topics, NLU intent classification, AI Search grounding | Conversational Interfaces > Virtual Agent > Topics |
| Flow Designer (any table) | Flow Generation from natural language | Flow Designer AI (Advanced, Prime) |

**Plugins / entitlements to verify:**
- `com.glide.platform_ml` — Predictive Intelligence
- Now Assist for ITSM / CSM / HRSD / ITOM (product-specific plugins)
- AI Skill Kit (`com.snc.na_skill_kit` or equivalent)
- AI Agent Studio (`com.snc.ai_agent` or equivalent)
- Virtual Agent (`com.snc.virtual_agent`)
- Integration Hub spokes (for external LLM providers: Azure OpenAI, OpenAI, Google Gemini, WatsonX, Aleph Alpha)

**Note:** Spokes do **not** consume Integration Hub transactions — they consume Assists.

---

## AI Control Tower — Governance & Observability

AI Control Tower is the centralized governance and observability hub for all AI capabilities across the platform. Included in all tiers with progressive depth.

| Capability | What it does |
|---|---|
| Model Inventory | Catalog of all Predictive Intelligence models, Now Assist skills, and AI Agents deployed |
| Performance Monitoring | Accuracy, drift, latency, and adoption metrics per model/skill |
| Usage & Quota Tracking | Real-time Assist consumption by skill, agent, user, department |
| Alerting & Thresholds | Alerts for quota overage (>80% monthly Assist consumption), model accuracy drift, skill failure rates, latency spikes |
| Policy Enforcement | Define allowed model providers (Now LLM vs third-party), data residency rules, approval workflows for new custom skills (Prime) |
| Audit Trail | Immutable log of all AI actions, configurations, and governance decisions |

**Setup:** Navigate to `AI Control Tower > Overview`. Enable **Assist Metering** and configure **Alert Policies** for quota thresholds. Assign `ai_control_tower_admin` and `ai_control_tower_viewer` roles.

**Assist metering:** One skill invocation = 1 Assist (varies by skill complexity). Tier allocations vary by contract — confirm your allocation and top-up terms with your ServiceNow account team. Set alerts at 50%, 80%, 95% of allocation.

---

## AI Cost Management — Avoiding Surprise Bills & Limit Breaks

Operationalizing AI at scale requires cost control. Without guardrails, Assist consumption can burn through your monthly allocation quickly, and once the quota is hit, AI features (Now Assist skills, AI agents, Predictive Intelligence predictions) can stop working — breaking workflows that depend on them.

### Cost management levers

| Lever | What it does | How to use it |
|---|---|---|
| **Assist Metering** | Tracks real-time Assist consumption by skill, agent, user, department | Enable in AI Control Tower > Overview; review daily/monthly burn rate |
| **Alert Policies** | Notifies when quota thresholds are approached | Configure alerts at 50%, 80%, 95% of monthly allocation via email, Slack, or ServiceNow notifications |
| **Top-up Options** | Purchase Assist packs via account team; auto-top-up can be enabled | Enable auto-top-up in Control Tower if you cannot afford feature interruption |
| **Tier Right-sizing** | Match tier to actual usage | Foundation for OOTB summarization/drafting; Advanced for agentic workflows; Prime only for custom agents/skills |
| **Skill Consumption Review** | Identify top-consuming skills/users/departments | Control Tower > Usage Analytics shows daily/monthly burn, top consumers, projected overage |
| **Disable Unused Skills** | Stops Assist drain from low-value skills | Turn off OOTB skills nobody uses; consolidate duplicate custom skills |

### What breaks when you hit limits

| Limit hit | What breaks | Symptom |
|---|---|---|
| **Monthly Assist quota exhausted** | All Now Assist skills and AI agent runs stop | Summarization buttons return errors; agents stop responding; Predictive Intelligence stops predicting |
| **Skill failure rate spike** | Specific skill stops working | "Draft Resolution Notes" button returns errors; check skill logs in Control Tower |
| **Model accuracy drift** | Predictions become unreliable | Classification routes incidents to wrong groups; Similarity match rate drops |
| **Latency spike** | Slow AI responses | Now Assist panel takes >5s to respond; users abandon it |

### Cost optimization tactics

- **Disable unused OOTB skills** — every active skill consumes Assists when invoked
- **Consolidate similar custom skills** — don't maintain three skills that do the same thing
- **Use caching for repeated queries** — don't re-summarize the same incident thread multiple times
- **Right-size the tier** — don't buy Prime for OOTB summarization; Foundation covers summarization/drafting/categorization
- **Set alerts before you hit the wall** — 50%/80%/95% alerts give you time to top up or throttle before features break

---

## AI Oversight — Monitoring Usage & Identifying Risky Chats/Topics

AI Control Tower provides observability into *who is using AI, what they’re asking, and whether anything looks risky*. This is essential for governance, compliance, and cost control.

### What you can oversee

| Oversight area | What to look for | Where in Control Tower |
|---|---|---|
| **Usage by user/department** | Who is consuming the most Assists? Is one team burning 50% of the quota? | Usage Analytics dashboard |
| **Skill adoption** | Which skills are used most? Which are unused? | Skill consumption report |
| **Risky chats/topics** | Users asking about sensitive data (salaries, personal info, proprietary code), attempting to bypass security, or generating harmful content | Audit Trail + skill failure/error logs |
| **Model accuracy drift** | Classification routing incidents to wrong groups; Similarity match rate dropping | Performance Monitoring (accuracy, precision/recall, F1) |
| **Latency & availability** | P50/P95/P99 response times for Now Assist panel, Virtual Agent, AI Search | Performance & Reliability Monitoring |
| **System impact** | Transaction times, semaphore waits, DB load from AI workloads | System Diagnostics > Stats; Performance Analytics |

### Identifying risky chats or topics

Control Tower's **Audit Trail** logs all AI actions, configurations, and governance decisions immutably. Use it to:

1. **Review prompts and outputs** — see what users are asking and what the AI is returning
2. **Flag sensitive data exposure** — users pasting salaries, personal information, or proprietary code into AI prompts
3. **Detect prompt injection attempts** — users trying to bypass security or get the AI to ignore its rules
4. **Monitor skill failure rates** — a spike in failures can indicate users are testing the AI's limits or asking unsupported questions

### Oversight setup

| Step | Action |
|---|---|
| **1. Enable metering** | AI Control Tower > Overview > Enable Assist Metering |
| **2. Configure alert policies** | Set quota thresholds at 50%/80%/95%; route alerts to the AI CoE or IT leadership |
| **3. Assign roles** | `ai_control_tower_admin` for configurers; `ai_control_tower_viewer` for read-only oversight |
| **4. Review weekly** | Control Tower > Usage Analytics — check top consumers, top skills, projected overage |
| **5. Audit monthly** | Audit Trail — review AI actions, configurations, governance decisions for compliance |
| **6. Enforce policies** | Policy Enforcement — allowed model providers (Now LLM vs third-party), data residency rules, approval workflows for new custom skills (Prime) |

### AI Center of Excellence (CoE) — recommended governance body

Establish an AI CoE with representatives from IT, Security, Legal, and Business Units. The CoE should:

- Define **AI Policy**: approved use cases, data classification handling, human-in-the-loop requirements, escalation paths
- Implement **Change Management** for all AI config changes (skill activation, model retraining, agent deployment)
- Schedule **Quarterly Reviews**: quota burn, model performance, skill adoption, ROI measurement
- Document **Data Lineage** for all training data used in Predictive Intelligence and custom skills

---

## Agentic AI — AI Agents & Agentic Workflows

AI Agents go beyond Now Assist summarization — they **reason, plan, and act** within guardrails.

| Capability | What it does | Tier |
|---|---|---|
| AI Agent Studio | Visual builder for creating, testing, deploying AI agents | Advanced, Prime |
| Now Assist Skill Kit | Framework for building custom generative skills | Prime (custom); Advanced (OOTB) |
| OOTB Agentic Workflows | Pre-built agents for ITSM, CSM, HRSD, ITOM (e.g., Incident Resolution Agent) | Advanced, Prime |
| AI Action Fabric (A2A/MCP) | Multi-agent orchestration across external systems | Prime |
| Agentic Task Execution | Agents complete multi-step tasks autonomously with human-in-the-loop | Advanced, Prime |

**Example — Incident Resolution Agent (OOTB):** Activates on P1/P2 incidents → auto-gathers similar incidents, KB articles, recent changes on affected CIs, runbook links → presents in Now Assist panel: *"Likely cause: Change CHG004521 (DNS update). Runbook: KB009876. Rollback steps: …"* Agent clicks *"Execute rollback"* → agent runs Flow. MTTR -35%.

**Agentic AI decision guardrails:**
- Agents should **draft, not decide** — propose actions, require human approval for high-stakes changes (reassign, change priority, close, notify executives)
- Agents should **read more than they write** — prefer read-only tools (Get Incident Details, Find Similar Incidents) over write tools unless accuracy is proven
- **Security first** — define who can invoke the agent, which tables/fields it can read; ACLs control data access, not just agent instructions

---

## Best Practices That Actually Provide Value

| Practice | Why it provides value |
|---|---|
| **Start with OOTB skills, not custom agents** | Foundation-tier OOTB summarization and categorization give immediate ROI with zero model training. Custom agents are Prime-only and higher complexity. |
| **Train models on 30K–300K clean historical records** | Predictive Intelligence Classification/Similarity accuracy depends on data quality. Garbage in = garbage out. |
| **Keep humans in the loop for high-stakes actions** | Agents should draft summaries and recommend routing, but not auto-reassign, change priority, close, or notify executives until accuracy is proven. |
| **Use AI Control Tower for quota alerts** | Prevent surprise Assist overage charges; set alerts at 50/80/95% of allocation. |
| **Measure acceptance rate, edit rate, fallback rate** | If agents ignore or heavily edit AI suggestions, the skill needs prompt refinement or the use case is wrong. |
| **Document data lineage for training data** | Compliance and auditability — know what data trained each Predictive Intelligence model. |
| **Quarterly AI reviews** | Quota burn, model performance, skill adoption, ROI measurement. Retrain models on schedule. |
| **Right-size the tier** | Don’t buy Prime for OOTB summarization. Foundation covers summarization/drafting/categorization. Advanced covers agentic workflows. Prime covers custom agent/skill building. |

**What does NOT provide value:**
- Building custom AI agents for tasks that OOTB Now Assist skills already handle
- Training Predictive Intelligence models on dirty or insufficient historical data
- Letting agents auto-close incidents or change priorities without human approval
- Ignoring Assist quota metering until you get an overage bill

---

## Lab: Deploy a Custom AI Skill on Incident

**Goal:** Create and deploy a “Draft Resolution Notes” AI skill on the Incident table using Now Assist Skill Kit.

**Prerequisites:**
- ServiceNow instance with Now Assist + AI Skill Kit entitlement (non-production)
- `admin` or Now Assist admin role

**Steps:**

1. **Navigate** to `All > AI Skill Kit > Home` → **Create new skill**
2. **Name:** “Draft Incident Resolution Notes” → Select **Create from scratch** (or use prompt assistance/library)
3. **Add skill inputs:** `short_description`, `description`, `work_notes`, `cmdb_ci`, `priority`
4. **Write the prompt** (use the template from the NASK section above)
5. **Add tools:** Retriever for KB articles; Script tool for related incidents on same CI; Decision node to skip if no CI
6. **Test in the editor:** Inspect the Grounded prompt and Tools output — do not rely only on whether the final answer “looks good”
7. **Deploy as UI Action:** Select `incident` table → NASK generates the UI Action
8. **Modify the UI Action** (optional): Write draft into `close_notes` or `u_ai_draft_resolution` field, requiring agent review before saving
9. **Activate & assign role:** In Now Assist Admin console, activate the skill and assign the configured role
10. **Verify:** Open an Incident on the incident table — the button should appear for authorized fulfillers; click it and confirm a draft appears

**Proof of concept:** The Incident form shows a new UI Action button; clicking it generates an AI-drafted resolution note that the agent can edit before saving.

---

## Quiz

1. **Which ServiceNow AI tier is required to build net-new custom AI skills and agents?**
   <details><summary>Answer</summary>Prime</details>

2. **What does Predictive Intelligence Similarity do?**
   <details><summary>Answer</summary>Finds similar incidents, problems, or cases to accelerate resolution by matching historical records</details>

3. **What is an “Assist” in ServiceNow AI metering?**
   <details><summary>Answer</summary>One skill invocation = 1 Assist (varies by skill complexity)</details>

4. **Which Now Assist Skill Kit deployment target puts an AI button on an Incident form?**
   <details><summary>Answer</summary>UI Action</details>

5. **Can Now Assist generate a Virtual Agent topic or a spoke from a specification?**
   <details><summary>Answer</summary>Yes — Now Assist can generate Virtual Agent topic descriptions/roles/steps (AI Agent Studio), generate Virtual Agent prompts, generate Integration Hub spokes from API documentation snippets, and generate Flow Designer flows from natural language. It does not autonomously deploy to production without human review.</details>

6. **Which breadcrumb opens Now Assist Skill Kit?**
   <details><summary>Answer</summary>All > AI Skill Kit > ...</details>

---

## Official Learning Resources

- [Now Assist Skill Kit (NASK) — Exploring AI Skill Kit](https://www.servicenow.com/docs/r/intelligent-experiences/now-assist-skill-kit/exploring-now-assist-skill-kit.html)
- [Create a skill — Now Assist Skill Kit](https://www.servicenow.com/docs/r/yokohama/intelligent-experiences/now-assist-skill-kit/create-new-skill.html)
- [Create spoke using Now Assist spoke generation skill](https://www.servicenow.com/docs/r/build-workflows/workflow-studio/create-spk-now-spk-gen.html)
- [AI Control Tower Administration](https://learn.servicenow.com/learning-plans/ai-control-tower)
- [AI Agent Studio — Run and test AI agents](https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB2696826)
- [ServiceNow AI Features packaging (Foundation/Advanced/Prime)](https://findtorontoevents.ca/servicenow/AIFeaturesOct2026/index.html)
- [Now Assist for ITSM: Incident Summarization](https://learn.servicenow.com/learning-plans/now-assist-itsm-incident-summarization)
- [Predictive Intelligence: Classification](https://learn.servicenow.com/learning-plans/predictive-intelligence-classification)
- [Predictive Intelligence: Similarity](https://learn.servicenow.com/learning-plans/predictive-intelligence-similarity)
- [AI Agent Studio](https://learn.servicenow.com/learning-plans/ai-agent-studio)
- [AI Control Tower](https://learn.servicenow.com/learning-plans/ai-control-tower)

---

*Part of the ServiceNow Module Guides. Verify specifics against your instance’s entitlements, release, and official ServiceNow documentation.*
