# Run the current prototype

This guide describes what is runnable today. The current PR command is an experimental single-pass Codex review; it does **not** yet meet the planned complete-review requirement for local ChunkHound, a local Docker reranker, selectable Codex/Claude, staged validation, or the review UI.

## Prerequisites

- Node.js 20 or newer.
- GitHub CLI (`gh`) signed in with access to the target repository.
- Codex CLI installed and signed in.

Check access with:

```sh
gh auth status
```

## Start a prototype review

```sh
node /path/to/specbridge/src/cli.js review https://github.com/owner/repository/pull/123
```

Replace `/path/to/specbridge` with the location where you cloned SpecBridge. The command fetches the pull request into a temporary checkout, asks Codex to review it read-only, prints a local report, then removes the temporary checkout. It does not modify your working repository or post a comment on GitHub. The report is in English by default. Choose Vietnamese with `--language vi` (or `--lang vi`):

```sh
node /path/to/specbridge/src/cli.js review https://github.com/owner/repository/pull/123 --language vi
```

To save the report:

```sh
node /path/to/specbridge/src/cli.js review https://github.com/owner/repository/pull/123 --output review.md
```

To save a Vietnamese report, use `--language vi --output review.md`; SpecBridge saves it as `review-vi.md`. English keeps the requested filename unchanged. Reports separate **Business review** (user outcomes and stated requirements) from **Technical review** (evidence-backed implementation findings), followed by coverage and limits. When Jira/OpenSpec context is not available, business conformance is marked unknown rather than inferred.

The Codex CLI model defaults to `gpt-5.6-terra` in this prototype. Set `SPECBRIDGE_CODEX_MODEL` to a model supported by your Codex account if needed.

## Add Jira context

The Jira context command is separate from PR review. Create a local `.env` template:

```sh
node /path/to/specbridge/src/cli.js init
```

Fill in Jira site URL, account email, and a read-only API token, then run:

```sh
node /path/to/specbridge/src/cli.js context PROJ-123
```

Use the Atlassian account email that created the API token and the site URL origin, such as `https://your-domain.atlassian.net` (do not paste a project or board URL). SpecBridge checks Jira authentication before looking up the issue. An HTTP 401 means Jira rejected the email/token pair; replace the token and confirm the account email. After authentication succeeds, an HTTP 404 means the issue key may be wrong or the account may not have Browse Projects access. See Atlassian's [API token and Basic authentication guide](https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/).

The `.env` file is ignored by Git. Never commit or share it. If a token has been exposed, revoke it in Atlassian and create a replacement.

## Planned full review setup

The full workflow is not implemented yet. It will require local Docker services for ChunkHound and reranking, and will let the operator choose Codex CLI or Claude Code CLI. Until those required stages are available, treat the current output as a preliminary review rather than a complete deep review. See the [implementation plan](implementation-plan.md) and [AI setup prompt](AI-SETUP-PROMPT.md).
