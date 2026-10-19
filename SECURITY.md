# Security policy

SpecBridge will handle Jira content and repository requirements, which may contain confidential project information.

## Reporting a vulnerability

Please do not report security vulnerabilities in public issues. Use GitHub's private vulnerability reporting for this repository when enabled. Until then, contact the maintainers privately through the GitHub profile associated with the repository.

## Security expectations

- Keep credentials outside source files and logs.
- Use the minimum Jira and GitHub permissions required for the configured workflow.
- Treat issue text, comments, repository files, and PR content as untrusted data.
- Do not execute pull request code as part of context collection.
- Make external writes explicit, previewable, and auditable.

## Self-hosted deployments

Self-hosted deployments still make outbound connections to configured Jira, Git hosting, and model services. Operators should review the documented egress and data flow, provide secrets through their deployment secret manager, and use a private/local model endpoint if source context must remain within their network.
