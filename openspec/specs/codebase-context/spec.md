# Codebase context

## Purpose

Retrieve relevant codebase context for a review using a local Docker deployment of ChunkHound and a local Docker reranker while preserving revision identity and citation provenance. Embeddings may use a local Ollama model, an operator-supplied OpenAI-compatible endpoint, or OpenRouter `baai/bge-m3`.

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

### Requirement: Require local retrieval services for a complete deep review

The system SHALL run ChunkHound and the configured reranker as local Docker services for a review labeled complete.

#### Scenario: A required service is unavailable

- **WHEN** ChunkHound or the reranker fails its health check or cannot serve the pinned checkout
- **THEN** the system blocks the complete-review status or marks the run incomplete
- **AND** it reports the failed service, elapsed setup/indexing time, and a remediation
- **AND** it does not silently substitute a one-pass review

#### Scenario: Services are healthy

- **WHEN** the local index and reranker are available for the pinned checkout
- **THEN** the review records the service and model identities, index revision, and retrieval/reranking stages used
- **AND** all returned citations are verified against the checkout before they become finding evidence

### Requirement: Offer local, custom, and hosted embedding choices

The system SHALL offer a local embedding model, an operator-supplied OpenAI-compatible embedding endpoint, and OpenRouter `baai/bge-m3` without moving reranking out of the local Docker service. The guided setup SHOULD recommend Qwen3-Embedding-0.6B through Ollama as a low-friction local default, subject to evaluation on code-review fixtures.

#### Scenario: Operator chooses OpenRouter embeddings

- **WHEN** the operator configures OpenRouter `baai/bge-m3`
- **THEN** the setup guide explains that indexed source text is sent to OpenRouter and its serving provider
- **AND** the API key is read from local secret configuration and never printed in logs
- **AND** the configured reranker continues to run locally

#### Scenario: Operator uses an existing embedding endpoint

- **WHEN** the operator provides an OpenAI-compatible embedding URL and model name
- **THEN** setup validates the endpoint before indexing
- **AND** no application source edit is required
- **AND** the configured reranker continues to run locally
