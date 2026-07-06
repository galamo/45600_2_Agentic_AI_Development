import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { AuditActionType, AuditEntry } from "../interfaces";

interface AuditContextValue {
  entries: AuditEntry[];
  logAction: (userId: number, userName: string, action: AuditActionType, details?: string) => void;
}

const AuditContext = createContext<AuditContextValue | null>(null);

let nextId = 1;

export function AuditProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  const logAction = useCallback(
    (userId: number, userName: string, action: AuditActionType, details?: string) => {
      setEntries((prev) => [
        {
          id: nextId++,
          userId,
          userName,
          action,
          timestamp: new Date(),
          details,
        },
        ...prev,
      ]);
    },
    [],
  );

  const value = useMemo(() => ({ entries, logAction }), [entries, logAction]);

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error("useAudit must be used within an AuditProvider");
  }
  return context;
}
