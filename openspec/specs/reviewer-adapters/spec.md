# Reviewer adapters

## Purpose

Support more than one coding-agent reviewer without coupling product findings and report formats to provider-specific output.

## Requirements

### Requirement: Normalize provider results

The system SHALL normalize every supported reviewer result into a versioned SpecBridge finding schema.

#### Scenario: Provider returns a review

- **WHEN** a configured reviewer completes a run
- **THEN** the adapter records provider/model/run metadata and parses its result into the shared schema
- **AND** invalid schema or citation data is surfaced as a validation issue

### Requirement: Keep review runs read-only

The system SHALL configure review adapters so they do not edit the repository or publish external comments.

#### Scenario: Agent proposes a change while reviewing

- **WHEN** the reviewer attempts to edit code, approve, merge, or post a comment
- **THEN** the review mode does not perform that action
- **AND** any suggested fix is returned as text for a human to inspect

### Requirement: Support explicit provider selection

The system SHALL allow the operator to select a supported reviewer for a run and record that choice.

#### Scenario: Team uses Codex or Claude

- **WHEN** an operator selects Codex CLI or Claude Code CLI
- **THEN** the matching adapter executes with the configured model and permission policy
- **AND** the common report structure remains unchanged
