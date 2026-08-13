import { useEffect, useState } from "react";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function JwtInspectorPanel({ accessToken }: { accessToken: string }) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const payload = decodeJwtPayload(accessToken);

  useEffect(() => {
    if (!payload?.exp) return;
    const tick = () => setSecondsLeft(Math.max(0, Math.floor((Number(payload.exp) * 1000 - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [payload]);

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="dot" />
        <h3>JWT Inspector</h3>
      </div>
      <p>This decodes the access token client-side (no signature verification) purely for education.</p>
      <pre>{JSON.stringify(payload, null, 2)}</pre>
      <p>
        Expires in: <strong className="mono">{secondsLeft ?? "…"}s</strong>
      </p>
    </div>
  );
}
