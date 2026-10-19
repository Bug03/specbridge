# SpecBridge

**Help AI agents understand why a ticket exists before they touch the code.**

SpecBridge connects a Jira ticket to the project requirements behind it, gives a coding agent the relevant context, and helps the team review whether the finished change matches the plan.

## Why use it?

- **Developers** spend less time searching for the right project context before asking an agent to work.
- **PMs** can see which requirements a ticket covers and where the team still needs an answer.
- **Reviewers** can check a change against its intent, with evidence they can inspect.

## How it works

1. Choose a Jira ticket.
2. Connect the project requirements that apply.
3. Give the coding agent a clear brief, then review the resulting change together.

SpecBridge is designed to run inside your own environment. You control how it connects to Jira, your code, and the AI service you choose.

## Try it

The first runnable flow reads a Jira issue, connects it to an OpenSpec requirement, and produces a context brief. Set it up in `.env` by following the [quickstart](docs/quickstart.md).

## Project status

SpecBridge is an early open-source project. The Jira-to-spec context flow is the first working slice; PR review, AI providers, ChunkHound, and Docker deployment are still planned.

## Get involved

We welcome feedback from developers, product managers, and maintainers. Start with the [product overview](docs/product-brief.md), see the [roadmap](docs/roadmap.md), or help shape the work in GitHub Issues.

Technical details for contributors are in the [implementation plan](docs/implementation-plan.md). The current CLI runs locally in your environment; a self-hosted service deployment guide will follow.

## License

MIT. See [LICENSE](LICENSE).
