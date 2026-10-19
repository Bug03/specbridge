# Try the first SpecBridge flow

This early CLI release creates a context brief from one Jira issue and the OpenSpec sections you link to it. Jira access is read-only. The brief is saved locally; it is not sent to an AI provider.

## You need

- Node.js 20 or newer.
- A Jira Cloud site and an account with read access to the project.
- A Jira API token for that account.
- An OpenSpec repository checked out on the same machine.

## Set up

From the SpecBridge repository, create a local `.env` file:

```sh
node src/cli.js init
```

Edit `.env` and set the Jira site, email, token, issue key, repository root, OpenSpec file, and exact heading. The heading must match a Markdown heading in the file. For example:

```dotenv
SPECBRIDGE_JIRA_BASE_URL=https://your-domain.atlassian.net
SPECBRIDGE_JIRA_EMAIL=you@example.com
SPECBRIDGE_JIRA_API_TOKEN=your-api-token
SPECBRIDGE_JIRA_ISSUE=PROJ-123
SPECBRIDGE_REPOSITORY_ROOT=.
SPECBRIDGE_SPEC_FILE=openspec/specs/jira-spec-linking/spec.md
SPECBRIDGE_SPEC_HEADING=Requirement: Link a Jira issue to explicit spec references
```

Then create a brief:

```sh
node src/cli.js context
node src/cli.js context --format json --output context-brief.json
```

The Markdown brief prints to the terminal by default. `--output context-brief.md` saves it to a file instead. The JSON format is intended for later agent integrations. The `.env` file is loaded automatically and is ignored by Git. You can pass an issue key after `context` to override `SPECBRIDGE_JIRA_ISSUE` for one run.

## Optional advanced config

For multiple Jira-to-spec mappings, you can still use a JSON config with `--config`. Paths are relative to the config file:

```json
{
  "jira": { "baseUrl": "https://your-domain.atlassian.net" },
  "repositoryRoot": ".",
  "links": {
    "PROJ-123": [
      {
        "file": "openspec/specs/jira-spec-linking/spec.md",
        "heading": "Requirement: Link a Jira issue to explicit spec references"
      }
    ]
  }
}
```

The selected section includes nested scenarios up to the next heading at the same or a higher level. A missing file or heading is reported as an error instead of being silently skipped. Jira text and spec text are treated as source material, not instructions for SpecBridge itself.

## Current limits

- One issue is fetched per command; Jira comments and attachments are not included.
- The simple `.env` setup links one configured issue to one OpenSpec section. There is no shared link database or stale-link history yet.
- The brief identifies the repository's current Git commit when available; it does not yet verify that Jira and specs came from the same checkout.
- There is no ChunkHound, Codex, Claude, GitHub PR, Docker, or web interface in this slice.

The Jira connector uses the Jira Cloud issue endpoint and requests only summary, description, status, type, labels, and project fields. See [Atlassian's issue API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/) and [API token guidance](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/).
