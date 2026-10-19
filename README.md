# SpecBridge

**Review pull requests with clear evidence for both developers and product managers.**

SpecBridge reviews a PR in an isolated, read-only checkout. Jira and OpenSpec add product intent and acceptance criteria when available; they are context for the review, not a prerequisite to start one.

## Why use it?

- **Developers** spend less time searching for the right project context before asking an agent to work.
- **PMs** can see which requirements a ticket covers and where the team still needs an answer.
- **Reviewers** can check a change against its intent, with evidence they can inspect.

## How it works

1. Give SpecBridge a GitHub PR URL.
2. Review the change for product conformance, implementation risks, and maintainability.
3. Inspect findings tied to the exact PR revision; decide what to do as a team.

SpecBridge is designed to run inside your own environment. You control how it connects to Jira, your code, and the AI service you choose.

## Try it

Start a read-only Codex review with the [quickstart](docs/quickstart.md). No Jira setup is needed for a basic PR review.

## Project status

SpecBridge is an early open-source project. The first PR-first Codex CLI flow is available experimentally. Jira/OpenSpec context, ChunkHound search, Claude support, and self-hosted service deployment are being added in stages.

## Get involved

We welcome feedback from developers, product managers, and maintainers. Start with the [product overview](docs/product-brief.md), see the [roadmap](docs/roadmap.md), or help shape the work in GitHub Issues.

The [review method](docs/review-method.md) describes how findings stay grounded and review output remains under human control. Technical details are in the [implementation plan](docs/implementation-plan.md).

## License

MIT. See [LICENSE](LICENSE).
