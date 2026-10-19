# AI setup prompt for SpecBridge

When the local Docker review stack is implemented, users can copy the prompt below and give it to an AI coding assistant running in the SpecBridge checkout. The assistant should first inspect the repository's current setup files and tailor commands to what is actually present.

> **Project status:** The current prototype does not yet implement the complete ChunkHound + local Docker reranker stack, selectable Codex/Claude reviewers, or staged review UI. This prompt must be validated against the shipped setup files before calling it a supported one-shot installer.

## Copy this prompt

```text
You are helping me set up SpecBridge for local PR reviews. Work from the SpecBridge repository already open in this workspace.

Goal
- Help me get the complete review workflow ready on this machine.
- ChunkHound and the reranker model must run in local Docker containers.
- Let me choose Codex CLI or Claude Code CLI as the reviewer. Do not assume I use both.
- Keep GitHub comments, approvals, Jira writes, code edits, and PR scripts disabled. This setup is for read-only review and local output.

First inspect the project
1. Read README.md, docs/quickstart.md, docs/implementation-plan.md, docs/review-method.md, .env.example, and the actual Docker Compose/configuration files present in this checkout.
2. Compare the docs with the current code. Do not invent commands, service names, ports, environment variables, or capabilities.
3. Tell me which required features are implemented in this checkout and which are still missing. If the required local ChunkHound and reranker services or selected reviewer adapter are not implemented, stop before claiming setup is complete. You may still diagnose the machine and give me the exact implementation gap.

Ask me only for choices you cannot infer:
- Reviewer: Codex CLI or Claude Code CLI?
- Embeddings: recommended local Qwen3-Embedding-0.6B, local BGE-M3, your existing OpenAI-compatible endpoint, or OpenRouter `baai/bge-m3`?
- Repository to review, if I have not provided a GitHub PR URL.
- Jira/OpenSpec context is optional; ask only if I want ticket/spec intent included.

Check this machine before changing anything
- Check OS/architecture, available memory and disk, Docker Engine/Desktop and Compose, Git, GitHub CLI (`gh`), and the selected reviewer CLI.
- Check whether the selected CLI is signed in without printing tokens or secrets. For GitHub, report only the active account name and whether it can read the requested repository.
- Check whether the required containers and their health endpoints work. Check model/index storage and available disk before downloading model weights or indexing a repository.
- Do not dump environment variables, credential files, browser storage, API tokens, or private keys into chat or logs.

Set up from the repository's supported files
- Use the repository's documented Docker Compose command and `.env.example`; do not create an alternate deployment configuration unless the docs explicitly require it.
- Preserve existing `.env` files. If one is missing, copy the example and ask me to enter secrets directly into the local file; never ask me to paste a secret into chat.
- Start only the documented local services. Confirm ChunkHound and the reranker are healthy before indexing or reviewing.
- Use persistent volumes for model weights and index data if the project supports them. Explain the approximate additional disk needed before downloads.
- Configure the reviewer choice through the supported environment/configuration interface, not by editing application source code.
- If OpenRouter embeddings are selected, explain that indexed source text is sent to OpenRouter and its serving provider, and wait for my choice before storing the API key. The reranker must still stay local in Docker.
- Do not install system software, change shell profiles, grant new account permissions, push commits, change GitHub/Jira, or post anything externally without asking me first.

Verify setup safely
- Run only documented health checks, version checks, and read-only connectivity checks.
- Confirm Docker service health, ChunkHound indexing/retrieval availability, local reranker availability, and the selected reviewer CLI/model readiness.
- If the project provides a sample repository or fixture, use it. Do not start a review on a real private PR until I provide the URL and confirm the selected provider.
- Never run PR build scripts, tests, or other code from an untrusted PR as part of setup.

Optimize for this machine and my constraints
- Recommend embedding and reranker model settings separately based on available memory, GPU support, and disk. Prefer smaller models when hardware is constrained, but do not change the configured models without showing me the trade-off.
- Recommend ChunkHound exclusions for generated files, dependencies, build output, secrets, and large binary assets; use the project's supported ignore mechanism.
- Recommend between local Qwen3-Embedding-0.6B, local BGE-M3, the user's own endpoint, and OpenRouter `baai/bge-m3` based on available hardware, privacy, network access, latency, and cost. Clearly distinguish the embedding model from the separate local reranker.
- Recommend review depth and timeout/budget settings that allow discovery, focused analysis, independent evidence validation, and synthesis without repeating completed stages.
- Keep project files, tokens, and source code out of public logs. Do not claim that a review is complete if any required retrieval or validation stage is skipped or failed.

Finish with a short setup report
- What I chose: reviewer, embedding mode, and optional Jira/OpenSpec context.
- What is ready: each local service, reviewer CLI, model, index, and repository access check.
- What data leaves this machine, if anything.
- Storage/model downloads and resource recommendations.
- Exact command to start a review and where its report will appear.
- Any missing steps, errors, or actions that still need me.
```

## Keeping this prompt reliable

When a setup command, service name, model default, or environment variable changes, update this prompt from the shipped `.env.example`, Compose file, and quickstart. Verify it against a clean local environment before describing it as a one-shot setup guide.
