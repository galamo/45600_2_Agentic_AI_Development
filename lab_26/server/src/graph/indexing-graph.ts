// USED_SKILL_(langchain-openrouter-agent)
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { analyzeImageWithAgent } from "../agents/image-indexing.agent.js";
import { logger } from "../lib/logger.js";
import { getEmbeddingService } from "../services/openrouter-embedding.service.js";
import { getPgVectorService } from "../services/pgvector.service.js";
import type { SavedImage } from "../services/image-storage.service.js";
import type { ImageDocumentRow, ImageIndex } from "../types/image-rag.types.js";

const CLIENT_ERROR_MESSAGE = "Something Went Wrong";

const IndexingState = Annotation.Root({
  savedImage: Annotation<SavedImage>(),
  index: Annotation<ImageIndex | undefined>(),
  embedding: Annotation<number[] | undefined>(),
  storedRow: Annotation<ImageDocumentRow | undefined>(),
  error: Annotation<string | undefined>(),
  clientMessage: Annotation<string | undefined>(),
});



type IndexingStateType = typeof IndexingState.State;

async function analyzeImageNode(state: IndexingStateType) {
  try {
    console.log("=====================")
    console.log("=====================")
    console.log("=====================")
    console.log("=====================")
    console.log("=====================")
    // throw new Error("ERRORR WITH AGENT IMAGE INDEXING");
    const index = await analyzeImageWithAgent(state.savedImage.absolutePath);
    return { index };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return {
      error: `There is an error in the analyzeImage function (agent): ${detail}`,
    };
  }
}

function routeAfterAnalyzeImage(
  state: IndexingStateType
): "embedIndex" | "handleError" {
  return state.error ? "handleError" : "embedIndex";
}

async function handleErrorNode(state: IndexingStateType) {
  const error =
    state.error ?? "There is an error in the analyzeImage function (agent)";

  logger.error(error, {
    node: "handleError",
    imageId: state.savedImage.id,
    clientMessage: CLIENT_ERROR_MESSAGE,
  });

  return {
    error,
    clientMessage: CLIENT_ERROR_MESSAGE,
  };
}

async function embedIndexNode(state: IndexingStateType) {
  if (!state.index) {
    throw new Error("Indexing graph: missing image index before embedding.");
  }

  const embedding = await getEmbeddingService().embedText(state.index.indexedText);
  return { embedding };
}

async function storeDocumentNode(state: IndexingStateType) {
  if (!state.index || !state.embedding) {
    throw new Error("Indexing graph: missing index or embedding before storage.");
  }

  const storedRow = await getPgVectorService().insertImageDocument({
    id: state.savedImage.id,
    originalFilename: state.savedImage.originalFilename,
    storedFilename: state.savedImage.storedFilename,
    imageUrl: state.savedImage.imageUrl,
    mimeType: state.savedImage.mimeType,
    sizeBytes: state.savedImage.sizeBytes,
    index: state.index,
    embedding: state.embedding,
  });

  return { storedRow };
}

export function createIndexingGraph() {
  return new StateGraph(IndexingState)
    .addNode("analyzeImage", analyzeImageNode)
    .addNode("handleError", handleErrorNode)
    .addNode("embedIndex", embedIndexNode)
    .addNode("storeDocument", storeDocumentNode)
    .addEdge(START, "analyzeImage")
    .addConditionalEdges("analyzeImage", routeAfterAnalyzeImage, {
      embedIndex: "embedIndex",
      handleError: "handleError",
    })
    .addEdge("handleError", END)
    .addEdge("embedIndex", "storeDocument")
    .addEdge("storeDocument", END)
    .compile();
}

export type IndexingGraphSuccess = {
  ok: true;
  index: ImageIndex;
  storedRow: ImageDocumentRow;
};

export type IndexingGraphFailure = {
  ok: false;
  error: string;
  clientMessage: string;
};

export type IndexingGraphResult = IndexingGraphSuccess | IndexingGraphFailure;

export async function runIndexingGraph(
  savedImage: SavedImage
): Promise<IndexingGraphResult> {
  const graph = createIndexingGraph();
  const result = await graph.invoke({ savedImage });

  if (result.error || result.clientMessage) {
    return {
      ok: false,
      error: result.error ?? "There is an error in the analyzeImage function (agent)",
      clientMessage: result.clientMessage ?? CLIENT_ERROR_MESSAGE,
    };
  }

  if (!result.index || !result.storedRow) {
    throw new Error("Indexing graph did not produce a stored document.");
  }

  return {
    ok: true,
    index: result.index,
    storedRow: result.storedRow,
  };
}

export function getIndexingGraphInfo() {
  return {
    flow: "savedImage → analyzeImage → (embedIndex → storeDocument | handleError)",
    nodes: ["analyzeImage", "embedIndex", "storeDocument", "handleError"],
  };
}
