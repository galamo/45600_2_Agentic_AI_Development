import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { readPdfFile } from "../utils/pdf-reader.util.js";

// Maximum characters extracted from the PDF to avoid overflowing the LLM context window.
const MAX_TEXT_LENGTH = 15_000;

/**
 * SKILL-INTERNAL TOOL
 *
 * This tool lives INSIDE the PDF Analyzer Skill (sub-agent).
 * The main agent never sees it — it is private to the skill.
 *
 * Responsibilities:
 *   - Read the PDF file from disk using pdf-parse (no AI involved)
 *   - Return raw text, page count, and document metadata
 *
 * Pattern: Skills (sub-agents) own their tools. Keeping this tool
 * inside the skill means the main agent stays simple and focused on
 * orchestration, while the skill handles all PDF-specific I/O.
 */
export function createExtractPdfTextTool() {
  return tool(
    async ({ pdfPath }) => {
      try {
        const { text, numPages, info } = await readPdfFile(pdfPath);
        const trimmed = text.trim();

        if (!trimmed) {
          return JSON.stringify({
            success: false,
            error: "PDF contains no extractable text. It may be image-based or encrypted.",
          });
        }

        const truncated = trimmed.length > MAX_TEXT_LENGTH;
        return JSON.stringify({
          success: true,
          numPages,
          info,
          text: trimmed.slice(0, MAX_TEXT_LENGTH),
          truncated,
          charCount: trimmed.length,
        });
      } catch (err) {
        return JSON.stringify({ success: false, error: err.message || String(err) });
      }
    },
    {
      name: "extract_pdf_text",
      description:
        "Read a PDF file from disk and extract its full text content. " +
        "Returns extracted text, page count, and document metadata.",
      schema: z.object({
        pdfPath: z.string().describe("Absolute path to the PDF file."),
      }),
    },
  );
}
