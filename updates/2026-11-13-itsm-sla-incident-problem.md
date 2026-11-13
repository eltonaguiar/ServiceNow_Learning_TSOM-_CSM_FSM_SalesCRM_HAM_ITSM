# ITSM guide — SLA tables and incident/problem distinctions

## What was wrong

`docs/modules/itsm/itsm-guide.md` told readers to pause `task_sla` from a business rule when an incident was resolved, called the running clock an "SLA Definition", and drew a request as the output of a change. It never said which table makes a clock attach to an incident, a task, or both.

## What changed

- Replaced the pause script with a read-only `task_sla` check. Pause, stop, and cancel stay on `contract_sla`.
- Documented `contract_sla` as the definition and `task_sla` as the engine-owned clock. There is no `sla_definition` table.
- Added the attach rule: Table = `incident` versus Table = `task`, and a from-scratch test for a customer resolution SLA plus a vendor underpinning contract.
- Added the records that sit next to incident and problem: request, incident task, parent incident, major incident, outage, known error, problem task, and change. Each row names the table and what that record is not.
- Corrected the relationship diagram so `task_sla` does not extend `task`.

## How verified

- The page is the GitHub Pages source for the ITSM guide. Cross-links use the existing heading anchors.
- Table names match the platform dictionary: `contract_sla`, `task_sla`, `incident`, `incident_task`, `problem`, `problem_task`, `cmdb_ci_outage`.
