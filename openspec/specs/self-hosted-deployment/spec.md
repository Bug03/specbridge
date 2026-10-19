# Self-hosted deployment

## Purpose

Allow a team to run SpecBridge inside infrastructure it controls without depending on a SpecBridge-operated cloud service.

## Requirements

### Requirement: Run the core workflow in customer-controlled infrastructure

The system SHALL support a documented deployment operated by the customer.

#### Scenario: Team deploys SpecBridge internally

- **WHEN** an administrator follows the supported self-hosting guide
- **THEN** the application and persistent data run in infrastructure selected by that team
- **AND** the core Jira-to-spec context workflow does not require a SpecBridge-hosted control plane

### Requirement: Disclose external network dependencies

The system SHALL document each external service that receives requests or data from a self-hosted deployment.

#### Scenario: Team configures Jira and a model provider

- **WHEN** an administrator configures Jira and an LLM endpoint
- **THEN** the deployment guide identifies the required outbound connections
- **AND** it explains what context is sent to each configured service

### Requirement: Keep secrets under operator control

The system SHALL let the operator provide integration credentials through deployment secrets or environment configuration.

#### Scenario: Application starts with integration credentials

- **WHEN** Jira or Git credentials are configured
- **THEN** the application does not require those values to be committed to the repository
- **AND** routine application logs do not reveal the secret values

### Requirement: Persist and back up customer data

The system SHALL document which data is persisted and how an operator can back it up and restore it.

#### Scenario: Operator backs up a self-hosted instance

- **WHEN** an operator follows the backup guide
- **THEN** the guide identifies application state and database data required for restoration
- **AND** it documents the supported restore procedure

### Requirement: Start required code-context services locally

The deployment SHALL provide ChunkHound and a reranker model as local Docker services with persistent model/index storage and health checks.

#### Scenario: Operator starts the deep-review stack

- **WHEN** the operator follows the documented local setup
- **THEN** one supported Docker Compose command starts the required services
- **AND** the health check verifies ChunkHound and the reranker before a deep review can run
- **AND** the operator can select Codex CLI or Claude Code CLI without changing source files

#### Scenario: Operator selects hosted embeddings

- **WHEN** the operator chooses OpenRouter `baai/bge-m3` for embeddings
- **THEN** the guide identifies OpenRouter and its serving provider as data recipients for indexed source text
- **AND** the local reranker remains a required Docker service
