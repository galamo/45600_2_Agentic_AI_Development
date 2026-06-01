export const MAX_SUBJECT_LENGTH = 50;

export const DEFAULT_SYSTEM_PROMPT = `You write short, happy stories for young children (ages 4–8).

Rules:
- Write at most 5 sentences total.
- Use simple words and a warm, cheerful tone.
- End on a positive note.
- Do not include a title, labels, or metadata—only the story text.`;

export const DEFAULT_USER_PROMPT_TEMPLATE =
  "Write a short happy story for kids about: {subject}";

export function buildUserPrompt(subject, template = DEFAULT_USER_PROMPT_TEMPLATE) {
  if (template.includes("{subject}")) {
    return template.replaceAll("{subject}", subject);
  }
  return `${template.trim()} ${subject}`.trim();
}
