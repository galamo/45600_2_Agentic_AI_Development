// USED_SKILL_(langchain-openrouter-agent)
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { rerankWithAgent } from "../agents/reranker.agent.js";
import { getEmbeddingService } from "../services/openrouter-embedding.service.js";
import { getPgVectorService } from "../services/pgvector.service.js";
import type {
  SearchImageResponse,
  VectorSearchCandidate,
} from "../types/image-rag.types.js";

const VECTOR_CANDIDATE_LIMIT = 20;

const SearchState = Annotation.Root({
  query: Annotation<string>(),
  embedding: Annotation<number[] | undefined>(),
  candidates: Annotation<VectorSearchCandidate[] | undefined>(),
  results: Annotation<SearchImageResponse["results"] | undefined>(),
});

type SearchStateType = typeof SearchState.State;

async function embedQueryNode(state: SearchStateType) {
  const embedding = await getEmbeddingService().embedText(state.query);
  return { embedding };
}

async function retrieveCandidatesNode(state: SearchStateType) {
  if (!state.embedding) {
    throw new Error("Search graph: missing query embedding before retrieval.");
  }

  const candidates = await getPgVectorService().searchByEmbedding(
    state.embedding,
    VECTOR_CANDIDATE_LIMIT
  );

  return { candidates };
}

async function rerankCandidatesNode(state: SearchStateType) {
  const candidates = state.candidates ?? [];

  if (candidates.length === 0) {
    return { results: [] };
  }

  const reranked = await rerankWithAgent({
    query: state.query,
    candidates: candidates.map((candidate) => ({
      id: candidate.id,
      title: candidate.title,
      description: candidate.description,
      tags: candidate.tags,
      objects: candidate.objects,
      extractedText: candidate.extractedText,
      indexedText: candidate.indexedText,
      similarity: candidate.similarity,
    })),
  });

  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));

  const results = reranked.results
    .map((item) => {
      const candidate = candidateById.get(item.id);
      if (!candidate) return null;

      return {
        id: candidate.id,
        imageUrl: candidate.imageUrl,
        title: candidate.title,
        description: candidate.description,
        tags: candidate.tags,
        objects: candidate.objects,
        similarity: candidate.similarity,
        relevanceScore: item.relevanceScore,
        rerankerReason: item.reason,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return { results };
}

export function createSearchGraph() {
  return new StateGraph(SearchState)
    .addNode("embedQuery", embedQueryNode)
    .addNode("retrieveCandidates", retrieveCandidatesNode)
    .addNode("rerankCandidates", rerankCandidatesNode)
    .addEdge(START, "embedQuery")
    .addEdge("embedQuery", "retrieveCandidates")
    .addEdge("retrieveCandidates", "rerankCandidates")
    .addEdge("rerankCandidates", END)
    .compile();
}

export async function runSearchGraph(query: string): Promise<SearchImageResponse> {
  const trimmed = query.trim();
  const graph = createSearchGraph();
  const result = await graph.invoke({ query: trimmed }); //state!!!!

  return {
    query: trimmed,
    results: result.results ?? [],
  };
}

export function getSearchGraphInfo() {
  return {
    flow: "query → embedQuery → retrieveCandidates → rerankCandidates",
    nodes: ["embedQuery", "retrieveCandidates", "rerankCandidates"],
  };
}
