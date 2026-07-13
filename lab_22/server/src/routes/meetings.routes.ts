import { Router } from "express";
import {
  getMeetings,
  getMeetingsRaw,
  postMeeting,
  removeMeeting,
} from "../controllers/meetings.controller.js";

const router = Router();

router.get("/meetings/raw", getMeetingsRaw);
router.get("/meetings", getMeetings);
router.post("/meetings", postMeeting);
router.delete("/meetings/:id", removeMeeting);

export default router;
