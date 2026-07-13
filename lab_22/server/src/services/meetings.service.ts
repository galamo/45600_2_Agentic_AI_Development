import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import type { CreateMeetingInput, Meeting } from "../types/meeting.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "..", "data", "meetings.json");

async function readMeetings(): Promise<Meeting[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as Meeting[];
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      await fs.writeFile(DATA_PATH, "[]\n", "utf-8");
      return [];
    }
    throw err;
  }
}

async function writeMeetings(meetings: Meeting[]): Promise<void> {
  await fs.writeFile(DATA_PATH, `${JSON.stringify(meetings, null, 2)}\n`, "utf-8");
}

export async function listMeetings(): Promise<Meeting[]> {
  const meetings = await readMeetings();
  return meetings.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export async function createMeeting(input: CreateMeetingInput): Promise<Meeting> {
  const meetings = await readMeetings();
  const meeting: Meeting = {
    id: uuidv4(),
    ...input,
    createdAt: new Date().toISOString(),
  };
  meetings.push(meeting);
  await writeMeetings(meetings);
  return meeting;
}

export async function deleteMeeting(id: string): Promise<boolean> {
  const meetings = await readMeetings();
  const index = meetings.findIndex((m) => m.id === id);
  if (index === -1) {
    return false;
  }
  meetings.splice(index, 1);
  await writeMeetings(meetings);
  return true;
}

export async function getRawJson(): Promise<string> {
  try {
    return await fs.readFile(DATA_PATH, "utf-8");
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return "[]\n";
    }
    throw err;
  }
}
