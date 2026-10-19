# Roadmap

SpecBridge is a PR review tool first. Each milestone should end with something a contributor can run or inspect. The detailed design is in [implementation-plan.md](implementation-plan.md).

## M0 — Product contract

- [x] Define developers and PMs as first users.
- [x] Adopt OpenSpec for versioned requirements.
- [x] Make review read-only by default; require a person before any external write.

## M1 — Review a PR with one command

- [x] Accept a GitHub PR URL and fetch its metadata with `gh`.
- [x] Review from a disposable checkout with Codex CLI in read-only mode.
- [x] Verify the captured base/head SHAs and derive the diff from those exact revisions.
- [x] Print a local report tied to both SHAs; do not post comments.
- [ ] Validate every finding's file and line against the pinned checkout before presenting results.
- [ ] Exercise the flow against a repository the operator account can access.

The first PR review command is implemented. Live review is still unverified because the current GitHub CLI account cannot access the example `Academy-Plus/nsa-lms` repository.

## M2 — Add product intent when available

- [x] Read Jira issue fields with read-only access.
- [x] Discover OpenSpec requirements and let the operator select relevant sections.
- [x] Export a source-linked context brief as Markdown or JSON.
- [ ] Link PRs to Jira issues and selected requirements without making Jira a prerequisite for review.
- [ ] Detect stale links and missing or conflicting acceptance criteria.

## M3 — Add codebase search

- [ ] Use ChunkHound for targeted symbol and call-site discovery when configured.
- [ ] Verify every retrieved citation against the exact PR checkout.
- [ ] Fall back explicitly to direct Git/search inspection when ChunkHound is unavailable.
- [ ] Let the operator control indexing, embeddings, exclusions, and model egress.

## M4 — Add the second reviewer

- [x] Start with Codex CLI.
- [ ] Add Claude Code behind the same reviewer contract.
- [ ] Validate findings and evidence consistently across providers.

## M5 — Improve review quality and follow-up

- [ ] Separate contract conformance, implementation correctness, and maintainability findings.
- [ ] Distinguish PR-introduced issues from pre-existing debt using the base diff.
- [ ] Save review state so runs can resume and later heads can be re-reviewed.
- [ ] Classify findings as resolved, still present, regressed, new, or unverified.
- [ ] Draft any GitHub comment for preview and require explicit approval before posting.

## M6 — Self-hosted release and community onboarding

- [ ] Publish a reproducible local/self-hosted release with upgrade and cleanup guidance.
- [ ] Add sanitized example PRs, expected reports, and troubleshooting.
- [ ] Publish the landing page after the workflow works end to end.
- [ ] Maintain contribution guides, issue templates, and security reporting.

## Explicitly out of scope for now

- Automatic PR approval or merge.
- Running arbitrary PR build or test scripts in the main SpecBridge process.
- Mandatory paid model or embedding API.
- Multi-tenant hosted service before the local workflow is useful.
