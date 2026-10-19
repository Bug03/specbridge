# Setup experience design

## Goal

Make the required local code-context stack feel like one setup action. Users should not need to learn ChunkHound's configuration files, MCP transport, or Docker service names to run a review.

## User flow

The target first-run path is:

1. Clone SpecBridge and run `specbridge setup` (or give the AI setup prompt to an assistant in the repository).
2. Choose one reviewer already installed on the host: Codex CLI or Claude Code CLI.
3. Choose embeddings: recommended local Qwen3-Embedding-0.6B through Ollama, local BGE-M3, an existing OpenAI-compatible endpoint, or OpenRouter `baai/bge-m3`.
4. Authenticate to GitHub with `gh` if needed, then start a review with a PR URL.

Jira and OpenSpec are optional. They are introduced only when the user wants ticket intent included in a review.

## What SpecBridge handles

- Check Docker Engine/Desktop, architecture, free disk, `gh`, and the selected reviewer CLI before downloading anything.
- Build or pull a version-pinned ChunkHound image maintained by SpecBridge. The current ChunkHound onboarding documents a CLI install, index command, and MCP configuration; it does not give this product a one-command Docker setup, so SpecBridge must own that packaging and keep it tested.
- Start ChunkHound, the selected embedding service if needed, and the local reranker through one Compose workflow. The reranker is always local in Docker and remains separate from the embedding model.
- Generate ChunkHound settings internally, including its rerank endpoint/format. Do not ask the user to edit `.chunkhound.json` or hand-wire MCP.
- Store model weights and indexes in named persistent volumes so restarts do not trigger repeated downloads or indexing.
- Index the pinned review checkout, show file/chunk progress and duration, and cache results by repository, commit, and embedding model.
- Run a doctor/preflight with plain-language errors and one suggested fix for each failed check.
- Save reviewer choice and non-secret preferences locally; put API keys in a gitignored `.env` or prompt directly in the terminal with hidden input.

## Embedding choices

| Choice | Setup behavior | Privacy and resource trade-off |
| --- | --- | --- |
| Local model | Start the local embedding service in Docker and download/cache its model once. Offer Qwen3-Embedding-0.6B as the default and BGE-M3 as an alternative. | Embedding requests stay on the machine; uses local disk and CPU/GPU resources. Docker on Apple Silicon should be treated as CPU inference unless native Metal is used outside Docker. |
| OpenAI-compatible endpoint | Validate the URL and model name supplied by the operator. | Lets a team reuse an existing local/internal model service; network path depends on the configured endpoint. |
| OpenRouter `baai/bge-m3` | Ask for an OpenRouter key locally, configure the API endpoint, and test one embedding request. | Less local model setup and hardware use; usage cost depends on current pricing and indexed volume. Indexed source text is sent to OpenRouter and the provider serving the request. |

All choices use the same local ChunkHound index and local Docker reranker. The model, index revision, duration, and embedding mode must be visible in the run record. See the [embedding options](embedding-options.md) for the recommended default and evaluation plan.

Local embeddings do not make the full review offline: the selected Codex/Claude CLI may send review context to its configured model service. Setup must show both egress paths separately.

## Keep the setup small

- Do not require `.env` edits for users who select local embeddings and already have their CLIs authenticated.
- Ask for only the choices needed to proceed; do not make Jira, OpenSpec, embedding API keys, and both reviewer CLIs mandatory.
- Start containers and indexing from the setup/review commands. Do not tell users to run separate commands for every service.
- Show model download size and free-disk checks before downloading. Provide a small CPU-friendly default and let the operator change it.
- Make setup and indexing progress distinct from review analysis. Let indexing resume after interruption.
- Keep `docker compose logs`, reset-index, and stop commands available as advanced troubleshooting; hide them from the happy path.

## Completion criteria

- A clean supported machine can go from clone to healthy local ChunkHound + reranker with one guided setup command.
- The user never edits ChunkHound JSON or MCP configuration by hand.
- Codex and Claude are selectable without changing project source.
- Local embeddings, a custom OpenAI-compatible endpoint, and OpenRouter `baai/bge-m3` all work; reranking stays local in every case.
- A stopped Docker daemon, incompatible architecture, insufficient disk, invalid OpenRouter key, or failed model download produces a clear actionable message.
- A review cannot be labeled complete unless the required index and reranking stages ran successfully.
- The AI setup prompt matches the actual shipped commands and is verified on a clean environment before release.
