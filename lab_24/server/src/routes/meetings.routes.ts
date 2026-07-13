import { Router } from "express";
import {
  getMeeting,
  getMeetings,
  postMeeting,
  removeMeeting,
} from "../controllers/meetings.controller.js";

const router = Router();

router.get("/meetings", getMeetings);
router.get("/meetings/:id", getMeeting);
router.post("/meetings", postMeeting);
router.delete("/meetings/:id", removeMeeting);

export default router;
