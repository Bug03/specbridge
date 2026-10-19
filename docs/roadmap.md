# Roadmap

SpecBridge is a PR review tool first. Each milestone should end with something a contributor can run or inspect. The detailed design is in [implementation-plan.md](implementation-plan.md).

## M0 — Product contract

- [x] Define developers and PMs as first users.
- [x] Adopt OpenSpec for versioned requirements.
- [x] Make review read-only by default; require a person before any external write.

## M1 — Local review stack and guided setup

- [ ] Start ChunkHound and the reranker model in local Docker containers with persistent storage and health checks.
- [ ] Offer local Qwen3-Embedding-0.6B by default, local BGE-M3, a user-supplied OpenAI-compatible endpoint, or OpenRouter `baai/bge-m3`; disclose data egress for hosted embeddings.
- [ ] Benchmark embedding choices on code-review fixtures before declaring a quality winner.
- [ ] Configure required services and reviewer selection through one guided `.env` / setup flow.
- [ ] Add preflight for Docker, GitHub access, selected reviewer CLI, ChunkHound, reranker, and embedding configuration.
- [ ] Hide ChunkHound JSON/MCP wiring behind `specbridge setup`; cache index/model data and make interrupted indexing resumable.
- [ ] Block or mark incomplete any review where required local retrieval services are unavailable.

## M2 — Review a PR with one command

- [x] Accept a GitHub PR URL and fetch its metadata with `gh`.
- [x] Review from a disposable checkout with Codex CLI in read-only mode.
- [x] Verify the captured base/head SHAs and derive the diff from those exact revisions.
- [x] Print a local report tied to both SHAs; do not post comments.
- [ ] Validate every finding's file and line against the pinned checkout before presenting results.
- [x] Exercise the flow against a private repository the operator account can access.

The first local PR review confirmed the basic intake and review path with one Codex pass. Staged discovery, independent finding validation, resumable progress, and a final coverage gate remain outstanding. See [first-run findings](first-run-findings.md).

## M3 — Add product intent when available

- [x] Read Jira issue fields with read-only access.
- [x] Discover OpenSpec requirements and let the operator select relevant sections.
- [x] Export a source-linked context brief as Markdown or JSON.
- [ ] Link PRs to Jira issues and selected requirements without making Jira a prerequisite for review.
- [ ] Detect stale links and missing or conflicting acceptance criteria.

## M4 — Add deep, verified code context

- [ ] Use local Docker ChunkHound for targeted symbol and call-site discovery.
- [ ] Rerank retrieved code with the configured local Docker reranker.
- [ ] Verify every retrieved citation against the exact PR checkout.
- [ ] Record ChunkHound, embedding, and reranker identities with each review run.
- [ ] Report service failure as blocked/incomplete instead of silently falling back to one-pass analysis.
- [ ] Let the operator control indexing, embeddings, exclusions, and model egress.

## M5 — User-selectable reviewer providers

- [ ] Let the user select Codex CLI or Claude Code CLI through configuration or per run.
- [ ] Run both through the same read-only provider contract and finding schema.
- [ ] Validate findings and evidence consistently across providers.

## M6 — Improve review quality and follow-up

- [ ] Run a staged review: discover affected areas, analyze each change, cross-check findings, then synthesize.
- [ ] Separate contract conformance, implementation correctness, and maintainability findings.
- [ ] Distinguish PR-introduced issues from pre-existing debt using the base diff.
- [ ] Validate each finding's path, line, scenario, and origin against the pinned base/head revisions.
- [ ] Save review state so runs can resume and later heads can be re-reviewed.
- [ ] Classify findings as resolved, still present, regressed, new, or unverified.
- [ ] Report checked, partial, skipped, and failed work without treating partial analysis as final.

## M7 — Review workspace UI

- [ ] Show run history, current stage, duration, and partial findings while a review runs.
- [ ] Let users open each finding to inspect evidence and triage it as fix, won't fix, or follow-up.
- [ ] Build a final summary from findings the reviewer selected.
- [ ] Offer a copyable GitHub review comment only after the user reviews the final draft; never post it automatically.

## M8 — Self-hosted release and community onboarding

- [ ] Publish a reproducible local/self-hosted release with upgrade and cleanup guidance.
- [ ] Add an AI setup prompt that checks prerequisites, guides local services and reviewer setup, and recommends quality/performance settings.
- [ ] Validate the prompt against a clean machine and keep it aligned with actual setup commands.
- [ ] Add sanitized example PRs, expected reports, and troubleshooting.
- [ ] Publish the landing page after the workflow works end to end.
- [ ] Maintain contribution guides, issue templates, and security reporting.

## Explicitly out of scope for now

- Automatic PR approval or merge.
- Running arbitrary PR build or test scripts in the main SpecBridge process.
- Mandatory paid model or embedding API.
- Multi-tenant hosted service before the local workflow is useful.
