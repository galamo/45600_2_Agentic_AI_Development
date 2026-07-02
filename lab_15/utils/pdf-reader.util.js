import { readFile } from "fs/promises";

// pdf-parse/lib/pdf-parse.js is used instead of the default entry point to
// avoid a side-effect in the package that runs a test file on import.
import pdfParse from "pdf-parse/lib/pdf-parse.js";

/**
 * Read a PDF file from disk and extract its text content.
 * Pure utility — no AI, no LangChain. Just pdf-parse I/O.
 *
 * @param {string} pdfPath - Absolute path to the PDF file
 * @returns {{ text: string, numPages: number, info: Record<string, unknown> }}
 */
export async function readPdfFile(pdfPath) {
  const buffer = await readFile(pdfPath);
  const data = await pdfParse(buffer);
  return {
    text: data.text ?? "",
    numPages: data.numpages ?? 0,
    info: data.info ?? {},
  };
}
