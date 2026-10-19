# SpecBridge

**Review pull requests with clear evidence for both developers and product managers.**

SpecBridge is being built for evidence-backed PR reviews. The target deep-review flow uses ChunkHound and a reranker model in local Docker containers, with Codex CLI or Claude Code CLI selected by the user. Jira and OpenSpec add product intent when available.

## Why use it?

- **Developers** spend less time searching for the right project context before asking an agent to work.
- **PMs** can see which requirements a ticket covers and where the team still needs an answer.
- **Reviewers** can check a change against its intent, with evidence they can inspect.

## How it works

1. Start the local retrieval services and choose a reviewer CLI.
2. Give SpecBridge a GitHub PR URL.
3. Inspect staged, evidence-backed findings tied to the exact PR revision; decide what to do as a team.

SpecBridge is designed to run inside your own environment. You control how it connects to Jira, your code, and the AI service you choose.

For the planned deep-review stack, code embeddings can run locally or use OpenRouter `baai/bge-m3`; ChunkHound and the reranker stay local in Docker. The OpenRouter option sends indexed source text to OpenRouter and its serving provider.

The proposed local default is Qwen3-Embedding-0.6B served by Ollama in Docker. Users can choose local BGE-M3 or provide another OpenAI-compatible embedding endpoint. Embeddings are separate from the local reranker. See the [embedding options](docs/embedding-options.md).

## Try it

The current prototype supports an experimental, single-pass Codex CLI review. Follow the [prototype quickstart](docs/quickstart.md). It does not yet include the required ChunkHound/reranker stack, Claude selection, staged analysis, or review UI, so it is not the complete deep-review workflow described above. The [AI setup prompt](docs/AI-SETUP-PROMPT.md) is the onboarding prompt planned for the completed local stack.

## Sample review

You can review SpecBridge sample outputs in [English](docs/examples/sample-review.md) and [Vietnamese](docs/examples/sample-review-vi.md). Both reports use a fictional repository and findings; no real project review is included.

## Project status

SpecBridge is an early open-source project. PR intake, a one-pass Codex CLI prototype, and Jira/OpenSpec context generation are available experimentally. Local Docker code retrieval, local reranking, selectable Codex/Claude adapters, resumable deep review, and the review UI remain in development.

## Get involved

We welcome feedback from developers, product managers, and maintainers. Start with the [product overview](docs/product-brief.md), see the [roadmap](docs/roadmap.md), or help shape the work in GitHub Issues.

The [review method](docs/review-method.md) describes how findings stay grounded and review output remains under human control. See the [setup experience](docs/setup-experience.md) for the one-command onboarding design and the [AI setup prompt](docs/AI-SETUP-PROMPT.md). Technical details are in the [implementation plan](docs/implementation-plan.md).

## License

MIT. See [LICENSE](LICENSE).
