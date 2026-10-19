# Product brief

## Vision

Help teams carry accepted product and engineering intent from project specs into Jira work, coding agents, and PR review—with traceable evidence and human control.

## Users

- **Product managers:** connect outcomes and acceptance criteria to the work item and see what remains unclear.
- **Developers:** give agents the relevant requirements, scenarios, conventions, and prior decisions without manually hunting across tools.
- **Reviewers and tech leads:** check a PR against the intent of its ticket, understand impact, and verify findings after new commits.

## Core workflow

`OpenSpec requirement → Jira issue link → ChunkHound code context → Codex/Claude review → PR evidence → reviewed spec update`

The first useful output is a context brief, not an autonomous approval. It should include ticket facts, linked requirement/scenario text, source revisions, ChunkHound-retrieved code context, relevant project guidance, and unresolved questions. Codex CLI and Claude Code CLI are reviewer options behind the same provider-neutral contract; neither gets permission to change code or publish a review in the initial review flow.

## Product boundaries

- Jira remains the work tracker and owns assignee/status.
- OpenSpec remains the accepted requirement source in Git.
- SpecBridge owns the links, provenance, freshness checks, context assembly, and review trace.
- Agents can propose edits; a person accepts changes to canonical specs or Jira.

## Deployment and data control

Self-hosting is a first-class deployment goal. A team should be able to run the service in its own network and manage its own database, credentials, backups, and retention. The core workflow must not depend on a SpecBridge-operated cloud control plane.

Self-hosting does not automatically mean zero data egress: the service must reach Jira, configured Git hosting, and any configured model endpoint. Document these connections. Do not send source context to a model provider unless the team has explicitly configured that provider; support private or local model endpoints where practical.

## Success signals

- A developer can prepare a grounded agent brief for a Jira issue without manually searching multiple documents.
- A PM can see which requirements are linked and which acceptance criteria need clarification.
- Every context item can be traced to a source revision.
- Users can detect stale links when a spec changes.
- In later PR review, findings can be mapped back to requirements and rechecked on a new commit.

## Non-goals for the first milestone

- Replacing Jira, OpenSpec, GitHub, or the team's coding agent.
- Automatically approving or merging pull requests.
- Copying entire specs into every ticket.
- Claiming complete coverage when source information or tests are missing.
