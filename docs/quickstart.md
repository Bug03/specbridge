# Run a PR review

The primary SpecBridge flow starts with a GitHub pull request. Jira and OpenSpec are optional context; you do not need a `.env` file for a basic review.

## You need

- Node.js 20 or newer.
- GitHub CLI (`gh`). Sign in with an account that can access the repository. Public repositories can be read without private-repository permissions.
- Codex CLI, signed in on this machine.

Check GitHub access with:

```sh
gh auth status
```

## Start a review

From any directory where the SpecBridge source is available:

```sh
node /path/to/specbridge/src/cli.js review https://github.com/owner/repository/pull/123
```

Replace `/path/to/specbridge` with the location where you cloned SpecBridge. The command fetches the pull request into a temporary checkout, asks Codex to review it read-only, prints a local report, then removes the temporary checkout. It does not modify your working repository or post a comment on GitHub.

To save the report:

```sh
node /path/to/specbridge/src/cli.js review https://github.com/owner/repository/pull/123 --output review.md
```

If GitHub says it cannot resolve the repository, check that the URL is correct and the signed-in account has access. Sign in with `gh auth login` if needed. Private repositories require an account that is a member or collaborator.

## Add Jira context

The Jira context command is a separate, optional workflow. Create a local `.env` for Jira credentials:

```sh
node /path/to/specbridge/src/cli.js init
```

Fill in Jira site URL, account email, and a read-only API token. Then run:

```sh
node /path/to/specbridge/src/cli.js context PROJ-123
```

SpecBridge scans the current directory for OpenSpec requirements and lets you choose the sections relevant to the Jira issue. The `.env` file is ignored by Git. Never commit or share it.

## Current limits

- The Codex reviewer is implemented, but live review depends on `gh` access to the target repository and a working Codex CLI login.
- Jira/OpenSpec context is not yet automatically attached to a PR review.
- ChunkHound search, Claude review, saved review history, and GitHub comment publishing are not implemented.
- GitHub comments and approvals are never written by the current review command.
