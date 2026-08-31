import { z } from "zod";

export const chatInputSchema = z.object({
  message: z
    .string({ required_error: "message is required" })
    .trim()
    .min(1, "message must not be empty"),
});

export type ChatInput = z.infer<typeof chatInputSchema>;
