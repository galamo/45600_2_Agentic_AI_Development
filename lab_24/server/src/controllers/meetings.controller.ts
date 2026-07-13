import type { Request, Response } from "express";
import { z } from "zod";
import {
  createMeeting,
  deleteMeeting,
  getMeetingById,
  listMeetings,
} from "../services/meetings.service.js";

const createMeetingSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  date: z.string().trim().min(1, "Date is required"),
  time: z.string().trim().min(1, "Time is required"),
  duration: z.coerce.number().int().min(5).max(480).optional(),
  participants: z.array(z.string().trim().min(1)).optional(),
  description: z.string().trim().optional(),
});

export async function getMeetings(_req: Request, res: Response): Promise<void> {
  const meetings = await listMeetings();
  res.json(meetings);
}

export async function getMeeting(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const meeting = await getMeetingById(id);
  if (!meeting) {
    res.status(404).json({ error: "Meeting not found" });
    return;
  }
  res.json(meeting);
}

export async function postMeeting(req: Request, res: Response): Promise<void> {
  const parsed = createMeetingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }

  const meeting = await createMeeting(parsed.data);
  res.status(201).json(meeting);
}

export async function removeMeeting(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const deleted = await deleteMeeting(id);
  if (!deleted) {
    res.status(404).json({ error: "Meeting not found" });
    return;
  }
  res.status(204).send();
}
