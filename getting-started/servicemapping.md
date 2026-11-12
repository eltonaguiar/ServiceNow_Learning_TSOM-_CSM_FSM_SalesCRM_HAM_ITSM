# Getting Started — Service Mapping

One page, written for someone who has a Personal Developer Instance and an interview next month.
The same five sections as every other getting-started guide so you can compare modules side by side:

1. **What you actually build** — the objects and the tables that hold them
2. **Out-of-the-box features** — what to use before you write a line of script
3. **Key table hierarchy** — the parent/child relationships that explain the module
4. **Reusable code and metadata** — copy-paste script includes, business rules, and the `sys_*` records you will actually edit
5. **Integrations, a first lab, and the mistakes reviewers flag**

---

## 1. What you actually build

Service Mapping builds **mapped application services** — logical groupings of CIs that support a business service, with discovered relationships between them.

| Object | What it is | Table |
|--------|-----------|-------|
| Application service | The business service you're mapping (e.g. "Online Banking") | `cmdb_ci_service_discovered` |
| Discovered CI | Server, app, or database found by patterns | `cmdb_ci_appl`, `cmdb_ci_server` |
| CI relationship | "IIS runs on WEB01", "Tomcat depends on SQL Server" | `cmdb_ci_rel_ci` |
| Base CI | Every discovered item starts here | `cmdb_ci` |

The entry point is typically a URL, hostname, or IP address. From there, pattern-based discovery walks outbound connections recursively until it hits a configured boundary.

## 2. Out-of-the-box features

| Feature | What it does |
|---------|--------------|
| Pattern-based top-down discovery | Starts at an entry point, follows dependencies, builds the map |
| Traffic-based discovery | Finds connections patterns may miss |
| Tag-based mapping | Groups CIs by cloud/infrastructure tags |
| Predictive Intelligence | Suggests service relationships from ML fingerprints |
| Manual mapping | Administrator selects CIs and defines membership |
| Dynamic CI Groups | Query-based CI collections that stay current |
| Service map visualization | Graphical dependency map |

## 3. Key table hierarchy

```
cmdb_ci_service_discovered  (Application Service)
        │
        ├──► cmdb_rel_ci ──► cmdb_ci_appl   (IIS, Tomcat, SQL Server)
        │                   type: Runs on::Runs / Depends on::Used by
        │
        ├──► cmdb_rel_ci ──► cmdb_ci_server (WEB01, APP01, DB01)
        │
        └──► cmdb_ci_service        (Logical business service view)
```

**Interview distinction:**

* **Horizontal Discovery** = What devices and applications exist? (fills `cmdb_ci`, `cmdb_ci_server`)
* **Top-down Service Mapping** = Which components support this service, and how are they connected? (fills `cmdb_ci_service_discovered` + `cmdb_rel_ci`)

## 4. Reusable code and metadata

### Scoped application

| Scope Aspect | Detail |
|--------------|--------|
| Scope | `com.snc.service_mapping` |
| Key tables | `cmdb_ci_service_discovered`, `cmdb_rel_ci`, `cmdb_ci_appl`, `cmdb_ci_server`, `cmdb_ci` |
| Roles | `itil`, `admin`, `sm_admin` |

### Script Include: Service Mapping Helper

```javascript
var ServiceMappingHelper = Class.create();
ServiceMappingHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getMappedCIs: function() {
        var serviceSysId = this.getParameter('sys_id');
        var gr = new GlideRecord('cmdb_rel_ci');
        gr.addQuery('parent', serviceSysId);
        gr.query();
        var cis = [];
        while (gr.next()) {
            cis.push(gr.getValue('child'));
        }
        return JSON.stringify(cis);
    },
    type: 'ServiceMappingHelper'
});
```

### Key fields

| Table | Field | Why it matters |
|-------|-------|----------------|
| `cmdb_ci_service_discovered` | `name` | The application service name |
| `cmdb_ci_service_discovered` | `entry_point` | URL / hostname / IP where discovery starts |
| `cmdb_ci_service_discovered` | `discovery_method` | Top-down, traffic-based, tag-based, manual, dynamic CI group |
| `cmdb_rel_ci` | `parent` / `child` | The two CIs in the relationship |
| `cmdb_rel_ci` | `type` | Relationship type (Runs on::Runs, Depends on::Used by) |

## 5. Integrations, lab, and mistakes

### Integrations

| Integration | Direction | Protocol |
|-------------|-----------|----------|
| Discovery (MID Server) | Inbound | Discovery / MID Server / ECC Queue |
| CMDB | Bidirectional | Internal |
| Service Graph Connectors | Inbound | REST / API |
| Event Management | Inbound | EM |
| Flow Designer | Outbound | Flow Designer |

### Lab: Create your first mapped application service

1. **Navigate** to All > Service Mapping > Application Services > All
2. **Click New** — Name: "Online Banking Demo", Discovery method: Top-down, Entry point: a URL or IP you control
3. **Submit** and note the sys_id
4. **Run** a Discovery schedule targeting the entry point's host (via the MID Server)
5. **Open** the application service → related **Service Map**
6. **Verify** discovered CIs appear (web server, app server, database) with relationships drawn
7. **Inspect** `cmdb_rel_ci` to confirm relationship rows exist

### Common mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| No entry point defined | Map stays empty | Always set a URL, hostname, or IP |
| Credentials not configured | MID Server can't authenticate | Set Discovery credentials per OS/application |
| MID Server can't reach the network segment | No CIs discovered | Place a MID Server in each network zone |
| Treating it as one-time task | Map goes stale after changes | Schedule recurring Discovery |
| Creating every CI manually | Doesn't scale; defeats the purpose | Use patterns first; manual only for exceptions |
