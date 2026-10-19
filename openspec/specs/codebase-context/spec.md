# Codebase context

## Purpose

Retrieve relevant codebase context for a review using ChunkHound while preserving revision identity and citation provenance.

## Requirements

### Requirement: Search a pinned repository revision

The system SHALL associate code-context retrieval with a specific repository revision.

#### Scenario: Retrieve code context for a PR

- **WHEN** a review requests code context for a pull request
- **THEN** the retrieval is scoped to the configured checkout and head revision
- **AND** the run records the ChunkHound/index identity used

### Requirement: Verify code citations

The system SHALL verify returned file and line citations against the checked-out revision before displaying them as evidence.

#### Scenario: Retrieved citation does not resolve

- **WHEN** a retrieved citation references a missing path or invalid line range
- **THEN** the citation is marked invalid or omitted from verified evidence
- **AND** the report records that verification failed

### Requirement: Report retrieval capability honestly

The system SHALL distinguish exact search, semantic search, and LLM-backed research capabilities.

#### Scenario: Semantic provider is not configured

- **WHEN** only exact/regex search is available
- **THEN** the review may use that search mode
- **AND** the report does not claim semantic coverage or deep code research ran
