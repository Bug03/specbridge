# Product brief

## Vision

Help teams review pull requests against both the code and the intent behind the work, with traceable evidence and human control.

## Users

- **Product managers:** connect outcomes and acceptance criteria to the work item and see what remains unclear.
- **Developers:** give agents the relevant requirements, scenarios, conventions, and prior decisions without manually hunting across tools.
- **Reviewers and tech leads:** check a PR against the intent of its ticket, understand impact, and verify findings after new commits.

## Core workflow

`GitHub PR → pinned checkout → ChunkHound retrieval + local Docker reranking → chosen Codex/Claude reviewer → validated findings → optional Jira/OpenSpec intent → human triage`

The first useful output is an evidence-backed PR review, not an autonomous approval. Developers need implementation findings with a concrete failure path; PMs need to see whether changed behavior matches the ticket and accepted requirements. Missing or conflicting intent is surfaced as a question instead of guessed. Codex CLI and Claude Code CLI are reviewer options behind the same provider-neutral contract; neither gets permission to change code or publish a review in the initial flow.

## Product boundaries

- Jira remains the work tracker and owns assignee/status.
- OpenSpec remains the accepted requirement source in Git.
- SpecBridge owns the links, provenance, freshness checks, context assembly, and review trace.
- Agents can propose edits; a person accepts changes to canonical specs or Jira.

## Deployment and data control

Self-hosting is a first-class deployment goal. A team should be able to run the service in its own network and manage its own database, credentials, backups, and retention. The core workflow must not depend on a SpecBridge-operated cloud control plane.

ChunkHound and the reranker are required local Docker services for a complete deep review. The operator chooses either Codex CLI or Claude Code CLI for the reasoning reviewer. Embeddings may use a local model, the team's OpenAI-compatible endpoint, or OpenRouter `baai/bge-m3`; when hosted embeddings are selected, disclose that indexed source text is sent to that provider. The proposed local default is Qwen3-Embedding-0.6B via Ollama, pending code-review fixture evaluation. The reranker remains local in every mode. Self-hosting does not automatically mean zero data egress: the service may reach GitHub, Jira, the chosen reviewer, and an embedding endpoint. Do not send source context to a model provider unless the team explicitly configures it.

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

## Review quality requirements

- A complete deep review requires a healthy local ChunkHound index and a healthy local Docker reranker. If either is unavailable, block the deep review or clearly label the run incomplete; never silently fall back to a single-pass review.
- Let each operator choose Codex CLI or Claude Code CLI. Both use the same finding schema, read-only policy, and evidence validation.
- Stage work into discovery, focused analysis, independent finding validation, and synthesis. Persist stage results so limits and interruptions do not discard completed work.
- Show elapsed setup/indexing time separately from agent analysis and finding validation.
