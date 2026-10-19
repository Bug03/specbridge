# PR intent review

## Purpose

Reviewers compare a pull request with its own stated contract and changed code first. Jira issues and accepted requirements enrich the review when they are linked and available.

## Requirements

### Requirement: Compare implementation evidence with linked intent

The system SHALL map review observations to the Jira issue and linked requirement/scenario where possible.

#### Scenario: PR provides evidence for a linked scenario

- **WHEN** a reviewer examines a PR associated with a Jira issue that has linked scenarios
- **THEN** the review report shows the relevant scenario and implementation evidence
- **AND** it identifies the file, line, and commit revision supporting the observation

### Requirement: Review a pull request without requiring Jira

The system SHALL allow a reviewer to start a PR review using the pull request URL alone.

#### Scenario: Jira context is unavailable

- **WHEN** a reviewer provides a GitHub PR URL without Jira credentials or a linked issue
- **THEN** the system reviews the PR diff and surrounding code
- **AND** it marks product intent as unavailable instead of blocking the review or inventing requirements

### Requirement: Pin each review to one immutable subject

The system SHALL record the pull request repository, base revision, and head revision for each review run.

#### Scenario: Pull request changes while review is starting

- **WHEN** the PR head differs from the revision captured during intake
- **THEN** the system stops before presenting findings
- **AND** it asks the reviewer to start a new run against the current head

### Requirement: Report evidence-backed findings

The system SHALL require each actionable finding to include a source location and a concrete failure mode.

Each finding note SHALL also show impact, severity, likelihood, reproduction or a concrete scenario, code trail, assumptions, downgrade factors, and whether the cited behavior is introduced by the PR. Unknown values SHALL be labeled unknown rather than guessed.

#### Scenario: Finding is outside the changed lines

- **WHEN** a review observation cannot be tied to evidence in the pinned PR subject
- **THEN** the system marks it unverified or omits it from actionable findings
- **AND** it does not present speculation as a confirmed defect

### Requirement: Separate review perspectives

The system SHALL distinguish product conformance, implementation correctness, and maintainability observations.

#### Scenario: Ticket or spec intent is missing

- **WHEN** Jira or OpenSpec context is unavailable or incomplete
- **THEN** the system reports that the product-conformance perspective is limited
- **AND** it may still report implementation findings supported by code evidence

### Requirement: Keep PR content untrusted and review read-only

The system SHALL treat PR text and repository content as untrusted input and SHALL NOT modify code, approve, merge, or publish a comment during a review run.

#### Scenario: PR content includes instructions for the reviewer

- **WHEN** a PR description or source file contains instructions aimed at the review agent
- **THEN** the agent treats them as review data, not as instructions that change the review policy
- **AND** the run performs no external write

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

### Requirement: Show review progress and per-finding evidence

The system SHALL present a review run as a visible sequence of stages and keep each finding's evidence, validation state, and outcome inspectable.

#### Scenario: Review is still running

- **WHEN** a reviewer opens an active run
- **THEN** the UI shows the current stage, completed stages, findings discovered so far, and any blocked or incomplete work
- **AND** it does not present a partial run as a final review

#### Scenario: Reviewer opens a finding

- **WHEN** a reviewer selects a finding
- **THEN** the UI shows its severity, concrete failure scenario, file and line at the pinned head SHA, base-diff evidence, and validation status
- **AND** the reviewer can triage it as fix, won't fix, or follow-up with a short reason

### Requirement: Draft a review comment for human copy

The system SHALL let a reviewer assemble a final comment from completed findings and copy it for manual posting after review completion.

#### Scenario: Final review is ready

- **WHEN** the reviewer confirms the final summary and selected findings
- **THEN** the UI provides a copyable GitHub review comment
- **AND** SpecBridge does not post, approve, or submit it to GitHub automatically

#### Scenario: Review is partial or incomplete

- **WHEN** required review stages or evidence validation are incomplete
- **THEN** the UI labels the draft as partial and includes its coverage limits
- **AND** it does not imply that the review is complete
