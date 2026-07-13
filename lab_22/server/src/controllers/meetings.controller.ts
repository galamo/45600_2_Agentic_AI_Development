import type { Request, Response } from "express";
import { z } from "zod";
import {
  createMeeting,
  deleteMeeting,
  getRawJson,
  listMeetings,
} from "../services/meetings.service.js";

const createMeetingSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  date: z.string().datetime({ message: "Date must be a valid ISO datetime" }),
  durationMinutes: z.coerce.number().int().min(5).max(480),
  attendees: z.array(z.string().trim().min(1)).min(1, "At least one attendee is required"),
  description: z.string().trim().optional(),
});

export async function getMeetings(_req: Request, res: Response): Promise<void> {
  const meetings = await listMeetings();
  res.json({ data: meetings });
}

export async function postMeeting(req: Request, res: Response): Promise<void> {
  const parsed = createMeetingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }

  const meeting = await createMeeting(parsed.data);
  res.status(201).json({ data: meeting });
}

export async function removeMeeting(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const deleted = await deleteMeeting(id);
  if (!deleted) {
    res.status(404).json({ error: "Meeting not found" });
    return;
  }
  res.json({ data: { id } });
}

export async function getMeetingsRaw(_req: Request, res: Response): Promise<void> {
  const raw = await getRawJson();
  res.type("application/json").send(raw);
}
