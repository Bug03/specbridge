# Local embedding model recommendation

This page is about **embeddings only**. It does not replace the required local Docker reranker. The planned stack runs a separate local reranker service for every embedding choice.

## Recommended default: Qwen3-Embedding-0.6B through Ollama

Use `qwen3-embedding:0.6b` as the one-click local default, served by an Ollama container. It is a practical setup balance for SpecBridge because:

- Qwen's embedding family is designed for text embedding, and its model card lists code retrieval and multilingual retrieval among its supported evaluation tasks.
- The 0.6B Ollama variant is listed at about 639 MB on disk with a 32K context window, making the initial download manageable for a developer workstation. Runtime memory use is higher than the file size.
- Ollama has a simple model pull flow and an OpenAI-compatible embeddings endpoint. ChunkHound documents using local Ollama through `provider: "openai"` with an explicit model and `base_url`.
- Qwen3-Embedding has larger 4B and 8B sizes available for users willing to trade more resources for possible retrieval gains.

**Important limit:** published model evaluations are not a guarantee that this model is best for every repository. SpecBridge should ship it as a practical default, then measure retrieval quality on a small code-review fixture set before calling it the quality winner.

## Alternatives

| Model / path | When to choose it | Trade-off |
| --- | --- | --- |
| `qwen3-embedding:0.6b` (Ollama) | Recommended default for a local, low-friction setup. | ~639 MB listed model download; still consumes additional RAM/CPU while embedding. |
| `bge-m3` (Ollama) | User wants the same BGE-M3 family as the OpenRouter option, but locally. | ~1.2 GB listed download; multilingual and supports dense, sparse, and multi-vector modes, though the initial ChunkHound integration may use only the dense embedding path. |
| User's own OpenAI-compatible endpoint | Team already serves an embedding model locally or on an internal network. | Requires endpoint URL, model name, and possibly local authentication. SpecBridge should validate the endpoint before indexing. |
| OpenRouter `baai/bge-m3` | User prefers a hosted embedding API to avoid downloading/running an embedding model. | Sends indexed source text outside the machine and has usage-based pricing. The local reranker remains required. |

Tiny general-purpose models such as `nomic-embed-text` are easy to pull, but the Qwen3 default is a better first choice for this product because its model card explicitly includes code retrieval and multilingual coverage. If users have an existing preferred model, an advanced endpoint override should remain available instead of requiring source changes.

## Planned one-command behavior

The setup command should:

1. Offer `Local recommended (Qwen3 0.6B)`, `Local BGE-M3`, `My OpenAI-compatible endpoint`, and `OpenRouter BGE-M3`.
2. Start only the needed embedding provider. Local choices start the Ollama Docker service and pull the selected model once into a persistent volume; the hosted choice skips that service.
3. Always start the separate local Docker reranker.
4. Generate ChunkHound's embedding and reranker settings internally. For the local model, the embedding `base_url` points to Ollama; the reranker URL points separately to the local reranker container.
5. Test one embedding request and one rerank request, then show the selected model, data path, disk use, and readiness before indexing.
6. Save the model and endpoint selection so subsequent runs do not ask again; allow changing it later with a setup/config command.

The current code does not implement this flow yet. Keep this recommendation provisional until the model is evaluated on representative repositories and the Docker path is verified on macOS ARM64 and Linux x86_64.

## Quality evaluation before release

Compare at least Qwen3-Embedding-0.6B, local BGE-M3, and OpenRouter BGE-M3 on the same sanitized review fixtures. Measure:

- whether the correct file/symbol appears in the top 5 and top 10 retrieved chunks;
- recall for known call sites and related implementation files;
- indexing time, query latency, peak memory, and model download size;
- the reranker's ability to move the useful chunks above irrelevant matches;
- whether results change when code comments, identifiers, and ticket text mix English and Vietnamese.

Use those results to decide whether the default should change. Do not compare models by the number of findings an LLM reports.

## References

- [Qwen3-Embedding-0.6B model card](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B)
- [Qwen3-Embedding Ollama library and model sizes](https://ollama.com/library/qwen3-embedding)
- [ChunkHound configuration for local OpenAI-compatible endpoints and Ollama](https://chunkhound.ai/docs/configuration/)
- [BGE-M3 model card](https://huggingface.co/BAAI/bge-m3)
- [Ollama BGE-M3 library and model size](https://ollama.com/library/bge-m3)
