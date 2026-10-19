# PR intent review

## Purpose

Help reviewers compare a pull request with the Jira issue and accepted requirements that motivated the change.

## Requirements

### Requirement: Compare implementation evidence with linked intent

The system SHALL map review observations to the Jira issue and linked requirement/scenario where possible.

#### Scenario: PR provides evidence for a linked scenario

- **WHEN** a reviewer examines a PR associated with a Jira issue that has linked scenarios
- **THEN** the review report shows the relevant scenario and implementation evidence
- **AND** it identifies the file, line, and commit revision supporting the observation

### Requirement: Represent review coverage honestly

The system SHALL distinguish covered, partial, unclear, not covered, and not checked states.

#### Scenario: Evidence is insufficient

- **WHEN** the diff and available checks do not establish whether a requirement is satisfied
- **THEN** the report marks the requirement unclear or not checked
- **AND** it explains what evidence is missing

### Requirement: Recheck findings on new revisions

The system SHALL associate findings with a reviewed commit and support rechecking them when the pull request head changes.

#### Scenario: Pull request receives a new commit

- **WHEN** a new head revision is reviewed
- **THEN** findings can be marked resolved, still present, regressed, new, or unable to verify
- **AND** the prior review remains associated with its original commit
