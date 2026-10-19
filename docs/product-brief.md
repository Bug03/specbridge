# Product brief

## Vision

Help teams review pull requests against both the code and the intent behind the work, with traceable evidence and human control.

## Users

- **Product managers:** connect outcomes and acceptance criteria to the work item and see what remains unclear.
- **Developers:** give agents the relevant requirements, scenarios, conventions, and prior decisions without manually hunting across tools.
- **Reviewers and tech leads:** check a PR against the intent of its ticket, understand impact, and verify findings after new commits.

## Core workflow

`GitHub PR → isolated subject snapshot → Codex/Claude review → evidence-backed findings → optional Jira/OpenSpec context → human triage`

The first useful output is an evidence-backed PR review, not an autonomous approval. Developers need implementation findings with a concrete failure path; PMs need to see whether changed behavior matches the ticket and accepted requirements. Missing or conflicting intent is surfaced as a question instead of guessed. Codex CLI and Claude Code CLI are reviewer options behind the same provider-neutral contract; neither gets permission to change code or publish a review in the initial flow.

## Product boundaries

- Jira remains the work tracker and owns assignee/status.
- OpenSpec remains the accepted requirement source in Git.
- SpecBridge owns the links, provenance, freshness checks, context assembly, and review trace.
- Agents can propose edits; a person accepts changes to canonical specs or Jira.

## Deployment and data control

Self-hosting is a first-class deployment goal. A team should be able to run the service in its own network and manage its own database, credentials, backups, and retention. The core workflow must not depend on a SpecBridge-operated cloud control plane.

Self-hosting does not automatically mean zero data egress: the service must reach Jira, configured Git hosting, and any configured model endpoint. Document these connections. Do not send source context to a model provider unless the team has explicitly configured that provider; support private or local model endpoints where practical.

## Success signals

- A developer can review a PR against its exact base and head revisions.
- A PM can see which requirements a PR addresses and where acceptance criteria need clarification.
- Every finding points to evidence in the reviewed revision and distinguishes PR-introduced behavior from pre-existing debt.
- Every context item can be traced to a source revision.
- Users can detect stale links when a spec changes.
- Findings can be rechecked after a new commit without pretending the old evidence is current.

## Non-goals for the first milestone

- Replacing Jira, OpenSpec, GitHub, or the team's coding agent.
- Automatically approving or merging pull requests.
- Copying entire specs into every ticket.
- Claiming complete coverage when source information or tests are missing.
