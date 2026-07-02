import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { analyzePdf } from "../agents/pdf-analyzer.agent.js";

/**
 * MAIN AGENT TOOL — wraps the PDF Analyzer Skill.
 *
 * This is the only PDF-related tool the main agent knows about.
 * Internally it runs a full sub-agent (the skill) that handles
 * extraction and analysis on its own.
 *
 * Why wrap a skill inside a tool?
 *   The main agent communicates with its capabilities through tools.
 *   Wrapping the skill in a tool lets the main agent call it like any
 *   other function — no knowledge of sub-agents or internal steps required.
 *
 * Full data flow:
 *
 *   Main Agent
 *     calls → analyze_pdf tool        (this file)
 *               calls → analyzePdf()
 *                         runs → PDF Analyzer Skill    (agents/pdf-analyzer.agent.js)
 *                                   calls → extract_pdf_text   (tools/extract-pdf-text.tool.js)
 *                                             reads PDF via pdf-parse (no AI)
 *                                   LLM analyzes extracted text
 *                         ← returns structured analysis string
 *               ← returns analysis string to main agent
 *     presents result to the user
 */
export function createAnalyzePdfTool({ apiKey, modelId }) {
  return tool(
    async ({ pdfPath }) => {
      try {
        const analysis = await analyzePdf({ apiKey, modelId, pdfPath });
        return analysis;
      } catch (err) {
        return `Error analyzing PDF: ${err.message || String(err)}`;
      }
    },
    {
      name: "analyze_pdf",
      description:
        "Analyze a PDF document using the PDF Analyzer Skill (sub-agent). " +
        "Extracts text and returns a structured report covering document type, " +
        "summary, key topics, entities, and conclusions.",
      schema: z.object({
        pdfPath: z.string().describe("Absolute path to the PDF file to analyze."),
      }),
    },
  );
}
