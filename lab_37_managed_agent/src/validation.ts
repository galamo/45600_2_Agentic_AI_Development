import { z } from "zod";

export const askInputSchema = z.object({
  message: z.string().trim().min(1, "message is required"),
});

export type AskInput = z.infer<typeof askInputSchema>;
