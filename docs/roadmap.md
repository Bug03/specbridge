# Roadmap

This roadmap describes intent, not delivery promises. Scope will change as contributors test the workflow.

## M0 — Project foundation

- [x] Define product boundaries and public contribution path.
- [x] Adopt OpenSpec for versioned product requirements.
- [ ] Agree on the first Jira-to-spec context workflow.
- [x] Set self-hosting as the first deployment target.

## M1 — Read-only Jira to agent context

- [ ] Connect to a Jira Cloud site with least-privilege read access.
- [ ] Discover OpenSpec requirements and scenarios in a repository.
- [ ] Link an issue to explicit requirement/scenario IDs.
- [ ] Detect missing references and stale spec revisions.
- [ ] Export a portable Markdown and JSON context brief with provenance.
- [ ] Run the service from a documented self-hosted deployment with persistent storage.
- [ ] Document required outbound connections, secrets, backups, and retention.

## M2 — PR intent review

- [ ] Compare a PR with its Jira issue and linked requirements.
- [ ] Show coverage as covered, partial, unclear, not covered, or not checked.
- [ ] Ground each finding in a source path, line, and commit SHA.
- [ ] Recheck findings when the PR head changes.

## M3 — Team workflow

- [ ] Draft Jira description/acceptance-criteria updates for human review.
- [ ] Draft OpenSpec changes from reviewed implementation evidence.
- [ ] Add team-level rules, audit trail, and configurable retention.
- [ ] Support more Git providers and ticket systems based on community demand.

## M4 — Public onboarding

- [ ] Publish a landing page after the core tool workflow is usable.
- [ ] Explain self-hosted installation, Jira connection, spec linking, and agent context with a step-by-step demo.
- [ ] Include a realistic sample report, security/data-flow explanation, and contributor links.
