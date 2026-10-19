# Jira and OpenSpec linking

## Purpose

Allow a team to associate Jira work items with accepted, versioned requirements and scenarios in an OpenSpec repository without copying the canonical spec into every issue.

## Requirements

### Requirement: Link a Jira issue to explicit spec references

The system SHALL allow a user to associate a Jira issue with one or more requirement or scenario references from a configured OpenSpec repository.

#### Scenario: User links a requirement to an issue

- **WHEN** a user selects a Jira issue and an OpenSpec requirement or scenario
- **THEN** the system records the issue key, repository, spec path, reference identifier, and source revision
- **AND** the system shows the link and its provenance to the user

### Requirement: Detect stale spec references

The system SHALL indicate when a linked spec reference no longer matches the current configured revision.

#### Scenario: Spec changes after linking

- **WHEN** the linked spec file changes at a newer repository revision
- **THEN** the system marks the link as stale or requiring review
- **AND** the system preserves the previously linked revision for auditability

### Requirement: Preserve source-of-truth boundaries

The system SHALL treat Jira as the source for work-item status and ownership, and OpenSpec as the source for accepted requirements.

#### Scenario: Generate an agent context brief

- **WHEN** the system prepares context for an agent from a Jira issue
- **THEN** it includes linked spec references and source revisions
- **AND** it does not silently replace accepted Jira or OpenSpec content with generated text
