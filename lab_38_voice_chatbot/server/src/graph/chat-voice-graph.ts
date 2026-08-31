import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { runChatAgent } from "../agents/chat.agent";
import { textToSpeech } from "../services/elevenlabs.service";
import { logger } from "../lib/logger";

/**
 * LangGraph flow:
 *   question → chatAgent (OpenRouter) → elevenLabsTts → { answer, audioBase64 }
 */
const GraphState = Annotation.Root({
  question: Annotation<string>(),
  answer: Annotation<string | undefined>(),
  audioBase64: Annotation<string | undefined>(),
  mimeType: Annotation<"audio/mpeg" | undefined>(),
});

type GraphStateType = typeof GraphState.State;

async function chatAgentNode(state: GraphStateType) {
  const answer = await runChatAgent(state.question);
  return { answer };
}

async function ttsNode(state: GraphStateType) {
  if (!state.answer) {
    throw new Error("TTS node: missing answer from chat agent.");
  }

  const speech = await textToSpeech(state.answer);
  return {
    audioBase64: speech.audioBase64,
    mimeType: speech.mimeType,
  };
}

export function createChatVoiceGraph() {
  return new StateGraph(GraphState)
    .addNode("chatAgent", chatAgentNode)
    .addNode("elevenLabsTts", ttsNode)
    .addEdge(START, "chatAgent")
    .addEdge("chatAgent", "elevenLabsTts")
    .addEdge("elevenLabsTts", END)
    .compile();
}

export type ChatVoiceResult = {
  answer: string;
  audioBase64: string;
  mimeType: "audio/mpeg";
};

export async function runChatVoiceGraph(question: string): Promise<ChatVoiceResult> {
  logger.info("LangGraph chat-voice invoke", { questionLength: question.length });

  const graph = createChatVoiceGraph();
  const result = await graph.invoke({ question });

  if (!result.answer || !result.audioBase64 || !result.mimeType) {
    throw new Error("Graph did not produce answer and audio.");
  }

  return {
    answer: result.answer,
    audioBase64: result.audioBase64,
    mimeType: result.mimeType,
  };
}
