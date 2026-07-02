# PDF Analyzer Agent

LangChain agent that receives a PDF path and uses a **PDF Analyzer Skill** (sub-agent) to parse and analyze it.

## Setup

```bash
cd lab_15
npm install
cp .env.example .env
# Edit .env and set OPENROUTER_API_KEY
```

## Run

```bash
npm run agent -- ./document.pdf
```

With debug trace (shows agent iterations and tool calls):

```bash
npm run agent -- --debug ./report.pdf
```

## Environment

| Variable             | Description                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `OPENROUTER_API_KEY` | Required — from [OpenRouter keys](https://openrouter.ai/keys)    |
| `OPENROUTER_MODEL`   | Main agent model. Default: `openai/gpt-4.1-mini`                |
| `SKILL_MODEL`        | PDF Analyzer Skill model. Defaults to `OPENROUTER_MODEL`        |

---

## What is a Skill in LangChain?

A **skill** is a specialized sub-agent — a full `createAgent` instance scoped to one capability, with its own model, system prompt, and private tools.

### Plain tool vs. Skill

| | Plain tool | Skill |
|---|---|---|
| What it is | A single function | A full agent (LLM + tools) |
| Can reason? | No | Yes — multi-step |
| Can use tools internally? | No | Yes — its own private tools |
| Visible to caller? | Yes | No (black box) |
| When to use | Simple, stateless I/O | Complex, multi-step work |

### How `createAgent` works

```js
const agent = createAgent({ model, tools, systemPrompt });
const result = await agent.invoke({ messages: [...] });
```

Internally it runs a **ReAct loop** until the LLM produces a final text answer:

```
LLM receives message history
  → decides: call a tool OR answer
  → if tool: result appended to history → loop again
  → if answer: loop ends, result returned
```

Both the main agent and the skill use `createAgent` — they just have different tools and system prompts scoped to their roles.

---

## Architecture

```
Main Agent  (agent.js)
  └── analyze_pdf tool          tools/analyze-pdf.tool.js
        └── PDF Analyzer Skill  agents/pdf-analyzer.agent.js   ← the skill
              └── extract_pdf_text tool   tools/extract-pdf-text.tool.js
                    └── pdf-parse (no AI)  utils/pdf-reader.util.js
```

### Main Agent
- Receives a PDF path from the CLI
- Has one tool: `analyze_pdf` (wrapping the skill)
- Presents the result to the user

### PDF Analyzer Skill (`agents/pdf-analyzer.agent.js`)
- Self-contained sub-agent focused entirely on PDF analysis
- Has one private tool: `extract_pdf_text`
- Calls the tool to read the PDF, then uses the LLM to produce a structured report:
  - Document type
  - Summary
  - Key topics / sections
  - Key entities (people, orgs, dates, amounts)
  - Conclusions / action items

### `extract_pdf_text` tool (`tools/extract-pdf-text.tool.js`)
- Used **inside** the skill — the main agent never sees it
- Pure I/O: reads the PDF with `pdf-parse`, no AI
- Returns text, page count, and document metadata

### `analyze_pdf` tool (`tools/analyze-pdf.tool.js`)
- The bridge between the main agent and the skill
- The main agent calls this tool; the tool runs the full skill internally

---

## File structure

```
lab_15/
├── agent.js                         Main agent entry point
├── agents/
│   └── pdf-analyzer.agent.js        PDF Analyzer Skill (sub-agent)
├── tools/
│   ├── analyze-pdf.tool.js          Tool wrapping the skill (used by main agent)
│   └── extract-pdf-text.tool.js     Tool used by the skill (pdf-parse, no AI)
├── utils/
│   └── pdf-reader.util.js           PDF reading utility
├── .env.example
└── package.json
```

---

## Using a different model per layer

You can run the main agent on a fast/cheap model and the skill on a more capable one:

```env
OPENROUTER_MODEL=openai/gpt-4.1-nano
SKILL_MODEL=openai/gpt-4.1
```

This is one of the advantages of skills — each layer can have its own model, temperature, and token budget optimized for its specific task.
