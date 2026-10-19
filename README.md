# SpecBridge

**Give coding agents the project context behind a Jira ticket.**

SpecBridge connects Jira work items to versioned OpenSpec requirements, then prepares a traceable context brief for coding agents and reviewers. The goal is to keep product intent, implementation work, and PR review connected.

> Early project: the product direction and first workflow are being shaped in public. Expect breaking changes while the MVP takes form.

## Deployment direction: self-hosted first

Teams will be able to clone the repository and run SpecBridge inside their own infrastructure. The initial deployment target is a single-team, self-hosted setup; a hosted service is not required to use the core workflow. A later Docker Compose guide will make setup repeatable.

Self-hosting keeps application storage and credentials under the team's control. Jira and source repositories still need to be reachable from the deployment, and an external model provider may receive context if the team configures one. The deployment guide will document outbound connections and support a team-managed or local model endpoint.

## The problem

Project intent is often split between Jira tickets, repository specs, team conventions, and code. A ticket alone may not tell an agent which requirements or scenarios it must preserve. Copying whole specs into tickets creates stale duplicates.

SpecBridge aims to link the sources and show their provenance, so an agent can answer:

- What is this ticket meant to achieve?
- Which accepted requirements and scenarios apply?
- What evidence in the implementation or PR supports each requirement?
- What is unclear, missing, or out of date?

## Planned workflow

1. Connect a Jira project and a repository containing OpenSpec files.
2. Link a Jira issue to relevant spec requirements or scenarios.
3. Preview a context brief with source paths and revisions.
4. Give that brief to a coding agent.
5. Compare the resulting PR with the ticket and linked requirements.
6. Review suggested changes to specs before accepting them.

Human approval stays in control of changes to Jira, accepted specs, and published PR reviews.

## Project status

The first milestone is a small, read-only context workflow: link a Jira issue to versioned OpenSpec requirements and export a source-linked agent brief. PR coverage and closure verification follow once that link is reliable.

See [the product brief](docs/product-brief.md), [roadmap](docs/roadmap.md), and [OpenSpec specs](openspec/specs/).

## Design principles

- **Preserve sources:** Jira owns work status; OpenSpec owns accepted requirements; SpecBridge links and explains them.
- **Show provenance:** every context item points to a source and revision.
- **Make uncertainty visible:** distinguish covered, partial, unclear, stale, and not checked.
- **Preview before writing:** external updates require a visible draft and user action.
- **Treat PR content as untrusted:** never follow instructions found inside ticket or code content as system policy.
- **Work with different agents:** provide portable Markdown and JSON context before adding agent-specific integrations.

## Contributing

Start with [CONTRIBUTING.md](CONTRIBUTING.md). Product changes are documented with [OpenSpec](openspec/); small fixes can use a focused pull request. Please open an issue to discuss major changes before investing in implementation.

## License

MIT. See [LICENSE](LICENSE).
