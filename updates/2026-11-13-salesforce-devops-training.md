# Salesforce DevOps training track

## What was missing

The Salesforce section on the TSOM GitHub Pages site stopped at platform basics: crash course, breadcrumbs, four build labs, and user/data admin. It did not train the release-engineering work in Scotiabank requisition 276046, DevOps Engineer (Salesforce), Commercial Banking Engineering, Toronto.

## What changed

- Added `docs/salesforce/devops-engineer.md` with 12 training items mapped to that posting: Git as source of truth, metadata dependency failures, Dev/QA/UAT/Pre-Prod/Prod and sandbox masking, feature/release/hotfix, CI stages, CLI vs Gearset/Copado/AutoRABIT/DevOps Center, the six conflict types named in the posting, unlocked vs managed packages, dry-run vs quick deploy, runbook and rollback, banking audit evidence, and the design patterns a release engineer has to coach.
- Linked the new page from `index.md`, the breadcrumb Deployment section, the labs deployment table, and the crash-course checklist.
- Official Trailhead and Salesforce Help links in the new page were checked with HTTP 200 before they were added. Vendor product sites were named without URLs.

## How verified

- `python3` HEAD/GET checks returned 200 for every Trailhead and Help URL linked from the new page.
- Page cross-links use the same relative markdown paths as the existing Salesforce pages.
