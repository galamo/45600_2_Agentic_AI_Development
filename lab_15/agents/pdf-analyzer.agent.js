import { createAgent } from "langchain";
import { ChatOpenRouter } from "@langchain/openrouter";
import { createExtractPdfTextTool } from "../tools/extract-pdf-text.tool.js";

/**
 * WHAT IS A SKILL?
 * ─────────────────────────────────────────────────────────────────────────────
 * In LangChain, a "skill" is a specialized sub-agent: a full agent instance
 * scoped to one specific capability, with its own model, system prompt, and tools.
 *
 * Unlike a plain tool (a single function call), a skill can:
 *   • Call multiple tools in sequence (e.g. read PDF → inspect a section → summarize)
 *   • Reason step-by-step about what it needs to do
 *   • Handle internal errors and adapt without surfacing complexity to the caller
 *   • Be reused across different main agents as a building block
 *
 * The main agent treats the skill as a black box — it passes inputs and receives
 * a structured result. It doesn't know (or care) how the skill works internally.
 *
 * Agent hierarchy in this lab:
 *
 *   Main Agent  (agent.js)
 *     └── analyze_pdf tool           wraps this skill; the only PDF tool the main agent sees
 *           └── PDF Analyzer Skill   ← THIS FILE — the sub-agent
 *                 └── extract_pdf_text tool   pure I/O, no AI (pdf-parse)
 *
 * How createAgent works:
 *   createAgent({ model, tools, systemPrompt }) returns a ReAct-style agent executor.
 *   On invoke(), it runs a loop:
 *     1. LLM decides whether to call a tool or return a final answer.
 *     2. If a tool is called, its result is added to the message history.
 *     3. The LLM sees the result and decides its next step.
 *   The loop ends when the LLM produces a text response without tool calls.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const PDF_ANALYZER_SYSTEM_PROMPT = `You are a document analysis expert.

Your job is to analyze PDF documents and return structured insights.

Steps you MUST follow:
1. Call extract_pdf_text with the PDF path the user provided.
2. Read the returned text carefully.
3. Return a structured analysis report containing:

   ## Document Type
   (e.g. research paper, invoice, contract, manual, report, presentation, etc.)

   ## Summary
   3–5 sentences capturing the main content and purpose.

   ## Key Topics / Sections
   Bullet list of the main topics or sections covered.

   ## Key Entities
   People, organizations, dates, amounts, or locations mentioned (if any).

   ## Conclusions / Action Items
   Main takeaways, recommendations, or action items (if any).

Rules:
- Only use information from extract_pdf_text — do not invent content.
- If the tool returns an error, report it clearly and explain what might have gone wrong.
- If the text was truncated (the document is very long), note that in the summary.`;

/**
 * Factory — creates a ready-to-use PDF Analyzer Skill.
 *
 * @param {{ apiKey: string, modelId?: string }} options
 * @returns {ReturnType<typeof createAgent>}
 */
export function createPdfAnalyzerSkill({ apiKey, modelId = "openai/gpt-4.1-mini" }) {
  const model = new ChatOpenRouter({
    model: modelId,
    apiKey,
    temperature: 0.2,
    maxTokens: 2000,
  });

  // The skill registers its own private tool.
  // The main agent never sees extract_pdf_text — it's internal to this skill.
  const extractPdfTextTool = createExtractPdfTextTool();

  return createAgent({
    model,
    tools: [extractPdfTextTool],
    systemPrompt: PDF_ANALYZER_SYSTEM_PROMPT,
  });
}

/**
 * Run the PDF Analyzer Skill and return the final analysis as a string.
 *
 * @param {{ apiKey: string, modelId?: string, pdfPath: string }} options
 * @returns {Promise<string>}
 */
export async function analyzePdf({ apiKey, modelId, pdfPath }) {
  const skill = createPdfAnalyzerSkill({ apiKey, modelId });

  const result = await skill.invoke({
    messages: [
      {
        role: "user",
        content: `Please analyze this PDF document: ${pdfPath}`,
      },
    ],
  });

  // Walk the message list from the end to find the skill's final AI response.
  const messages = result?.messages ?? [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const isAI = msg?.type === "ai" || msg?.role === "assistant";
    if (!isAI) continue;
    const content = typeof msg.content === "string" ? msg.content : String(msg.content ?? "");
    if (content.trim()) return content.trim();
  }

  throw new Error("PDF Analyzer Skill returned no analysis.");
}
