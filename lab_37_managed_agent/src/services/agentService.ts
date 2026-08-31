import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config";

const client = new Anthropic({ apiKey: config.anthropicApiKey });

/**
 * Runs one turn against the Managed Agent: creates a session seeded with the
 * user's message, streams events until the session goes idle (or terminates),
 * and returns the concatenated text from the agent's reply.
 */
export async function askAgent(message: string): Promise<string> {
  console.log(message)
  
  const session = await client.beta.sessions.create({
    agent: config.agentId,
    environment_id: config.environmentId,
    initial_events: [
      {
        type: "user.message",
        content: [{ type: "text", text: message }],
      },
    ],
  });

  const stream = await client.beta.sessions.events.stream(session.id);

  const textParts: string[] = [];
  let sessionErrorMessage: string | undefined;

  for await (const event of stream) {
    if (event.type === "agent.message") {
      for (const block of event.content) {
        if (block.type === "text") {
          textParts.push(block.text);
        }
      }
    } else if (event.type === "session.error") {
      sessionErrorMessage = event.error?.message ?? "Unknown session error";
      break;
    } else if (event.type === "session.status_terminated") {
      break;
    } else if (event.type === "session.status_idle") {
      if (event.stop_reason?.type !== "requires_action") {
        break;
      }
    }
  }

  // Best-effort cleanup; failures here shouldn't fail the request.
  void client.beta.sessions.archive(session.id).catch(() => undefined);

  if (sessionErrorMessage) {
    throw new Error(`Agent session error: ${sessionErrorMessage}`);
  }

  if (textParts.length === 0) {
    throw new Error("Agent returned no text response");
  }

  return textParts.join("");
}
