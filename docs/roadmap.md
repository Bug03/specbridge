# Roadmap

This is a proposed build order, not a delivery promise. Each milestone should end with something a contributor can run or inspect. The detailed plan and acceptance criteria are in [implementation-plan.md](implementation-plan.md).

## M0 — Agree on the product contract

- [x] Define the product boundaries and public contribution path.
- [x] Adopt OpenSpec for versioned requirements.
- [x] Set self-hosting as the first deployment target.
- [ ] Agree on supported first target: Jira Cloud, GitHub, OpenSpec Markdown, ChunkHound, and one reviewer CLI.

## M1 — Self-hosted foundation

- [ ] Docker Compose quickstart and persistent storage.
- [ ] Health/readiness checks, config validation, backup/restore notes.
- [ ] Secrets supplied by the operator, redacted logs, no telemetry by default.
- [ ] Document outbound network/data flow, including optional model provider egress.

## M2 — Jira + OpenSpec context

- [ ] Read Jira issues with least-privilege access.
- [ ] Discover OpenSpec requirement/scenario references in a configured repository.
- [ ] Link issue keys to explicit requirement/scenario IDs and source revision.
- [ ] Detect stale links and missing/ambiguous acceptance criteria.
- [ ] Export portable Markdown and JSON context briefs with provenance.

## M3 — ChunkHound codebase context

- [ ] Index configured repositories and support exclusions/ignore rules.
- [ ] Provide exact and semantic search to a review session through MCP.
- [ ] Retrieve related symbols/call sites and relevant code research when needed.
- [ ] Verify every code citation against the checked-out revision.
- [ ] Keep indexing and embedding provider configuration operator-controlled.

## M4 — AI review adapters

- [ ] Define a provider-neutral review request/result contract.
- [ ] Integrate one reviewer first: Codex CLI or Claude Code CLI.
- [ ] Return schema-validated findings with source evidence and confidence.
- [ ] Add the second reviewer adapter without changing report/domain schemas.
- [ ] Default to read-only; prevent automatic fixes, approvals, merges, and comments.

## M5 — PR review and closure loop

- [ ] Fetch GitHub PR base/head, metadata, checks, and diff.
- [ ] Compare PR to Jira intent and linked OpenSpec scenarios.
- [ ] Show product coverage and engineering risk separately.
- [ ] Re-review after a new head and classify findings as resolved/still present/regressed/new/unverified.
- [ ] Draft one review summary for user preview before posting.

## M6 — Community onboarding

- [ ] Publish a reproducible self-hosted release with upgrade instructions.
- [ ] Add sanitized example repositories, sample tickets, and expected reports.
- [ ] Publish a landing page after the workflow works end to end.
- [ ] Add contribution guides, issue templates, security reporting, and roadmap discussions.

## Explicitly out of scope until later

- Automatic merge or approval.
- Mandatory use of a paid embedding/model API.
- Running arbitrary PR build/test scripts in the main application process.
- Copying entire specs into Jira issues as unsynced duplicate text.
- Multi-tenant SaaS control plane before the self-hosted workflow is useful.
