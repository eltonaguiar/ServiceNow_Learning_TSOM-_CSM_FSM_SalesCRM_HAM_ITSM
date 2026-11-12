---
layout: default
title: TSOM Diagrams — Core Concepts Slideshow
---

# TSOM Diagrams — Core Concepts Slideshow

Back to the [guide index](./index.md) · [TSOM guide](../docs/modules/tsom/tsom-guide/) · [TSOM capabilities](../docs/modules/tsom/tsom-capabilities/)

---

## TSOM Core Concept Diagrams

Three diagrams walk through TSOM's core flows: how alarms become incidents, how telecom inventory is modeled, and how a failure ripples up to affected customers.

<div class="diagram-slideshow">
  <div class="slide-nav">
    <button id="tsom-diagram-prev" aria-label="Previous diagram">&#9664;</button>
    <span id="tsom-diagram-counter">1 / 3</span>
    <button id="tsom-diagram-next" aria-label="Next diagram">&#9654;</button>
  </div>

  <!-- Slide 1: Alarm → Event → Alert → Incident Flow -->
  <div class="slide" id="tsom-slide-1">
    <h3>1. Alarm → Event → Alert → Incident Flow</h3>
    <div class="mermaid">
flowchart TD
    NMS["NMS / EMS / OSS<br/>Nokia · Ericsson · Cisco · ..."]
    Event["em_event<br/>raw observation - something happened"]
    Rules["Event Rules<br/>filter, map severity, assign CI"]
    Alert["em_alert<br/>scored, de-duplicated, attached to a CI"]
    Corr["Alert Correlation<br/>400 port-down -> 1 circuit-down"]
    Incident["incident<br/>one ticket the NOC works"]
    Clear["Clear<br/>device reports recovery -> alert closes"]

    NMS -->|trap / syslog / API| Event
    Event --> Rules
    Rules --> Alert
    Alert --> Corr
    Corr --> Incident
    Incident -->|resolved| Clear
    Clear --> Alert

    style NMS fill:#e58a8a,color:#000
    style Event fill:#e5b567,color:#000
    style Alert fill:#4cc38a,color:#000
    style Corr fill:#0a0d10,stroke:#e5b567
    style Incident fill:#10141a

    </div>
    <p class="slide-caption">TSOM ingests raw observations from network management systems, scores and de-duplicates them into alerts, correlates storms into single incidents — so the NOC works one ticket instead of a wall of alarms.</p>
  </div>

  <!-- Slide 2: Telecom CI Hierarchy -->
  <div class="slide hidden" id="tsom-slide-2">
    <h3>2. Telecom CI Hierarchy</h3>
    <div class="mermaid">
graph TD
    svc["Customer Service<br/>Voice / Data / VPN<br/>cmdb_ci_service"]
    circuit["Circuit<br/>fibre / MPLS / leased line"]
    ne["Network Element<br/>router / switch / OLT<br/>(Optical Line Terminal)"]
    card["Card / Slot"]
    port["Port / Interface"]

    svc -->|runs over| circuit
    circuit -->|terminates at| ne
    ne -->|contains| card
    card -->|has| port

    style svc fill:#4cc38a,color:#000
    style circuit fill:#e5b567,color:#000
    style ne fill:#0a0d10,stroke:#e5b567

    </div>
    <p class="slide-caption">TSOM models the telecom network as a CI hierarchy — from the customer service down to individual ports. Only the service layer is visible to customers; everything below it is CMDB + TNI inventory.</p>
  </div>

  <!-- Slide 3: Service → Customer Impact Map -->
  <div class="slide hidden" id="tsom-slide-3">
    <h3>3. Service → Customer Impact Map (Blast Radius)</h3>
    <div class="mermaid">
flowchart TD
    Port["Router port fails"]
    Circuit["Circuit down"]
    Service["Customer service degraded - fiber broadband"]
    Subscribers["40 subscribers affected"]
    Incident["One incident raised - not 40"]

    Port --> Circuit
    Circuit --> Service
    Service --> Subscribers
    Subscribers --> Incident

    style Port fill:#e58a8a,color:#fff
    style Circuit fill:#e5b567,color:#000
    style Service fill:#4cc38a,color:#000
    style Subscribers fill:#0a0d10,stroke:#e5b567
    style Incident fill:#10141a

    </div>
    <p class="slide-caption">When a port fails, impact walks upward through the relationships: port → circuit → service → subscribers → one incident. TSOM's job is to raise one prioritised work item instead of a wall of alarms.</p>
  </div>
</div>

---

### How to read these diagrams

| Diagram | What it shows | Why it matters for TSOM |
|---------|---------------|------------------------|
| **Alarm → Event → Alert → Incident** | The assurance pipeline from NMS trap to NOC ticket | Correlation is what turns a storm of port-down alarms into a single circuit-down incident — this is TSOM's core value |
| **Telecom CI Hierarchy** | Customer Service → Circuit → Network Element → Card → Port | TSOM reuses CMDB classes and adds telecom-specific ones; the hierarchy is how impact walks upward |
| **Service → Customer Impact Map** | Blast radius from port failure to affected subscribers | One incident, not 40 — TSOM prioritises work by customer impact, not by alarm volume |

---

### Related content

- [TSOM Guide — full module reference](../docs/modules/tsom/tsom-guide/)
- [TSOM Capabilities — breadcrumb map & component list](../docs/modules/tsom/tsom-capabilities/)

<style>
.diagram-slideshow { margin: 1.5em 0; border: 1px solid var(--border-color, #333); border-radius: 8px; background: var(--card-bg, #1a1a1a); }
.slide-nav { display: flex; justify-content: space-between; align-items: center; padding: 0.75em 1em; border-bottom: 1px solid var(--border-color, #333); }
.slide-nav button { background: var(--btn-bg, #333); color: var(--btn-fg, #fff); border: 1px solid var(--border-color, #555); padding: 0.4em 0.8em; border-radius: 4px; cursor: pointer; font-size: 1.2em; }
.slide-nav button:hover { background: var(--btn-hover, #555); }
.slide { padding: 1.5em; display: none; }
.slide.visible { display: block; }
.slide h3 { margin-top: 0; color: var(--accent, #4cc38a); }
.slide-caption { margin-top: 1em; font-size: 0.95em; color: var(--muted, #aaa); font-style: italic; }
.mermaid { margin: 1em 0; }
</style>
<script>
(function() {
  var slideIds = ['tsom-slide-1', 'tsom-slide-2', 'tsom-slide-3'];
  var slides = slideIds.map(function(id) { return document.getElementById(id); });
  var counter = document.getElementById('tsom-diagram-counter');
  var prevBtn = document.getElementById('tsom-diagram-prev');
  var nextBtn = document.getElementById('tsom-diagram-next');
  var current = 0;
  var total = 3;

  function showSlide(n) {
    slides.forEach(function(s, i) {
      s.classList.toggle('visible', i === n);
      s.classList.toggle('hidden', i !== n);
    });
    if (counter) counter.textContent = (n + 1) + ' / ' + total;
    if (prevBtn) prevBtn.disabled = (n === 0);
    if (nextBtn) nextBtn.disabled = (n === total - 1);
  }

  if (prevBtn) prevBtn.addEventListener('click', function() { if (current > 0) { current--; showSlide(current); } });
  if (nextBtn) nextBtn.addEventListener('click', function() { if (current < total - 1) { current++; showSlide(current); } });

  showSlide(0);
})();
</script>
