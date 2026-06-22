/**
 * Creates the Quiz MCP server with tools and prompts.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  listTopics,
  getNextQuestion,
  checkAnswer,
  getTopic,
} from "./lib/quiz-store.js";

const topicSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  questionCount: z.number(),
});

const listTopicsOutputSchema = z.object({
  topics: z.array(topicSummarySchema),
});

const getQuestionOutputSchema = z.object({
  error: z.string().optional(),
  done: z.boolean().optional(),
  message: z.string().optional(),
  topicId: z.string().optional(),
  topicName: z.string().optional(),
  questionId: z.string().optional(),
  question: z.string().optional(),
});

const checkAnswerOutputSchema = z.object({
  correct: z.boolean(),
  feedback: z.string(),
  expectedAnswer: z.string().nullable(),
  questionId: z.string().optional(),
});

function structuredToolResult(structuredContent) {
  return {
    content: [{ type: "text", text: JSON.stringify(structuredContent, null, 2) }],
    structuredContent,
  };
}

export function createQuizMcpServer() {
  const server = new McpServer(
    { name: "lab10-quiz-mcp", version: "1.0.0" },
    { capabilities: { tools: {}, prompts: {} } }
  );

  server.registerTool(
    "list_topics",
    {
      description: "List available quiz topics with question counts.",
      inputSchema: z.object({}),
      outputSchema: listTopicsOutputSchema,
    },
    async () => {
      const topics = listTopics();
      return {
        content: [{ type: "text", text: JSON.stringify(topics, null, 2) }],
        structuredContent: { topics },
      };
    }
  );

  server.registerTool(
    "get_question",
    {
      description:
        "Fetch the next quiz question for a topic. Pass afterQuestionId to get the following question, or omit it for the first question.",
      inputSchema: z.object({
        topicId: z.string().describe("Topic id, e.g. mcp, langchain, agents"),
        afterQuestionId: z
          .string()
          .optional()
          .nullable()
          .describe("Previous question id; omit for the first question"),
      }),
      outputSchema: getQuestionOutputSchema,
    },
    async ({ topicId, afterQuestionId }) => {
      const topic = getTopic(topicId);
      if (!topic) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: `Unknown topic: ${topicId}` }) }],
          isError: true,
        };
      }

      const question = getNextQuestion(topicId, afterQuestionId ?? null);
      if (!question) {
        return structuredToolResult({
          done: true,
          message: `No more questions in topic "${topic.name}".`,
        });
      }

      return structuredToolResult({
        topicId,
        topicName: topic.name,
        questionId: question.id,
        question: question.question,
      });
    }
  );

  server.registerTool(
    "check_answer",
    {
      description: "Validate the user's answer for a quiz question.",
      inputSchema: z.object({
        topicId: z.string().describe("Topic id"),
        questionId: z.string().describe("Question id from get_question"),
        userAnswer: z.string().describe("The user's answer text"),
      }),
      outputSchema: checkAnswerOutputSchema,
    },
    async ({ topicId, questionId, userAnswer }) => {
      const result = checkAnswer(topicId, questionId, userAnswer);
      return structuredToolResult(result);
    }
  );

  server.registerPrompt(
    "start_quiz",
    {
      description: "Start a quiz session on a topic. Returns instructions for the quiz agent.",
      argsSchema: {
        topicId: z.string().describe("Topic id: mcp, langchain, or agents"),
      },
    },
    async ({ topicId }) => {
      const topic = getTopic(topicId);
      if (!topic) {
        return {
          messages: [
            {
              role: "user",
              content: { type: "text", text: `Unknown topic: ${topicId}` },
            },
          ],
        };
      }

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `Start a quiz on "${topic.name}" (${topic.questions.length} questions).`,
                "Use get_question to fetch each question one at a time.",
                "Ask the user to answer. When they respond, use check_answer to validate.",
                "Give brief feedback, then fetch the next question until done.",
                "Do not answer quiz questions yourself — only ask and evaluate.",
              ].join(" "),
            },
          },
        ],
      };
    }
  );

  return server;
}
