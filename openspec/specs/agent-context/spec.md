# Agent context briefs

## Purpose

Provide coding agents with a compact, portable, source-linked brief for a Jira work item.

## Requirements

### Requirement: Include traceable project context

The system SHALL produce a context brief that identifies the Jira issue and each included requirement source.

#### Scenario: Brief includes linked requirements

- **WHEN** a user requests context for an issue with linked OpenSpec references
- **THEN** the brief includes the issue key, linked requirement/scenario content, repository revision, and source paths
- **AND** the brief distinguishes source facts from generated explanations

### Requirement: Surface unresolved questions

The system SHALL identify missing or ambiguous context instead of presenting assumptions as accepted requirements.

#### Scenario: Ticket and spec do not provide expected behavior

- **WHEN** the system cannot determine expected behavior from the issue and linked specs
- **THEN** the brief lists the unresolved question
- **AND** it does not label the requirement as covered

### Requirement: Export portable formats

The system SHALL support exporting the context brief in a human-readable format and a machine-readable format.

#### Scenario: Agent consumes context

- **WHEN** a user exports a brief for an agent
- **THEN** the brief can be consumed without a SpecBridge-specific agent integration
- **AND** source references remain present in the export
