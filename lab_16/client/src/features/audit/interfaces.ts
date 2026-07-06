import type { AuditEntry } from "../../interfaces";

export interface AuditTableProps {
  entries: AuditEntry[];
}

export const ACTION_LABELS: Record<AuditEntry["action"], string> = {
  login: "Login",
  logout: "Logout",
  upload_audio: "Upload Audio",
};
