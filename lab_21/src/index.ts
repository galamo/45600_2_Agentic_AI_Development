import "dotenv/config";
import { analyzeImageKeywords } from "./agent/image-keywords-agent.js";

function usage() {
  console.log(`Usage: npm run agent -- <image-path>

Analyze an image and print extracted keywords.

Options:
  --json    Output full JSON result
  --help    Show this help

Environment (.env):
  OPENROUTER_API_KEY        Required
  OPENROUTER_VISION_MODEL   Default: openai/gpt-4o-mini

Example:
  npm run agent -- ../image.png
  npm run agent -- ../images/story-daisy-the-dragon-lived-on-a-sunny-hill-a-2026-07-01T07-54-28-465Z.png --json
`);
}

function parseArgs(argv: string[]) {
  const args = { imagePath: "", json: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      return { help: true as const };
    }
    if (arg === "--json") {
      args.json = true;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    args.imagePath = arg;
  }

  return args;
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if ("help" in parsed) {
    usage();
    return;
  }

  if (!parsed.imagePath) {
    usage();
    process.exit(1);
  }

  const modelId =
    process.env.OPENROUTER_VISION_MODEL?.trim() || "openai/gpt-4o-mini";

  console.log(`Model: ${modelId}`);
  console.log(`Image: ${parsed.imagePath}\n`);

  const result = await analyzeImageKeywords(parsed.imagePath);

  if (parsed.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log("Keywords:");
  for (const keyword of result.keywords) {
    console.log(`- ${keyword}`);
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
});
