import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { runResearcher } from "../agents/researcher.agent.js";
import { runWriter } from "../agents/writer.agent.js";
import { logger } from "../lib/logger.js";

/**
 * Shared graph state:
 *   userQuery → researcher → researchNotes → writer → finalAnswer
 */
const GraphState = Annotation.Root({
  userQuery: Annotation<string>(),
  researchNotes: Annotation<string | undefined>(),
  finalAnswer: Annotation<string | undefined>(),
});

type GraphStateType = typeof GraphState.State;

async function researcherNode(state: GraphStateType) {
  const researchNotes = await runResearcher(state.userQuery);
  return { researchNotes };
}

async function writerNode(state: GraphStateType) {
  if (!state.researchNotes) {
    throw new Error("Writer node: missing researchNotes from researcher.");
  }

  const finalAnswer = await runWriter(state.userQuery, state.researchNotes);
  return { finalAnswer };
}

export function createResearchWriteGraph() {
  return new StateGraph(GraphState)
    .addNode("researcher", researcherNode)
    .addNode("writer", writerNode)
    .addEdge(START, "researcher")
    .addEdge("researcher", "writer")
    .addEdge("writer", END)
    .compile();
}

export async function runResearchWriteGraph(userQuery: string) {
  logger.info("LangGraph invoke", { userQuery });

  const graph = createResearchWriteGraph();
  const result = await graph.invoke({ userQuery });

  if (!result.researchNotes || !result.finalAnswer) {
    throw new Error("Graph did not produce researchNotes and finalAnswer.");
  }

  return {
    userQuery: result.userQuery,
    researchNotes: result.researchNotes,
    finalAnswer: result.finalAnswer,
  };
}

export function getGraphInfo() {
  return {
    flow: "userQuery → researcher (skills: research-outline) → writer (skills: clear-writing) → finalAnswer",
    nodes: ["researcher", "writer"],
    skills: {
      researcher: ["/skills/research-outline/"],
      writer: ["/skills/clear-writing/"],
    },
  };
}
