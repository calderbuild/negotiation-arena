import { fetchEventSource } from "@microsoft/fetch-event-source";
import { CreateNegotiationRequest, NegotiationMessage, NegotiationSummary } from "./types";

export async function createNegotiation(
  req: CreateNegotiationRequest,
): Promise<string> {
  const res = await fetch("/api/negotiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  // Persist session config for serverless cross-instance recovery
  if (data.session_config) {
    try {
      sessionStorage.setItem(`negotiation_${data.session_id}`, JSON.stringify(data.session_config));
    } catch {
      // sessionStorage unavailable
    }
  }
  return data.session_id;
}

export interface NegotiationCallbacks {
  onSessionInfo?: (data: { topic: string }) => void;
  onStatus: (data: { phase: string; speaker: "A" | "B"; round: number }) => void;
  onMessage: (msg: NegotiationMessage) => void;
  onSummary: (summary: NegotiationSummary) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export async function streamNegotiation(
  sessionId: string,
  callbacks: NegotiationCallbacks,
): Promise<void> {
  // Recover session config from sessionStorage for serverless cross-instance recovery
  let body: string | undefined;
  try {
    const config = sessionStorage.getItem(`negotiation_${sessionId}`);
    if (config) body = config;
  } catch {
    // sessionStorage unavailable
  }

  let finished = false;

  await fetchEventSource(`/api/negotiate/${sessionId}/stream`, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : {},
    body,
    openWhenHidden: true,
    onmessage(ev) {
      const data = JSON.parse(ev.data);
      switch (ev.event) {
        case "session_info":
          callbacks.onSessionInfo?.(data);
          break;
        case "status":
          callbacks.onStatus(data);
          break;
        case "message":
          callbacks.onMessage(data);
          break;
        case "summary":
          callbacks.onSummary(data);
          break;
        case "done":
          finished = true;
          callbacks.onDone();
          break;
        case "error":
          callbacks.onError(data.error);
          break;
      }
    },
    onclose() {
      // Server closed the connection -- do NOT retry
      throw new Error("stream closed");
    },
    onerror(err) {
      if (!finished) {
        callbacks.onError(err?.message || "Connection lost");
      }
      throw err; // Stop retrying
    },
  });
}

export interface SecondMeInstanceInfo {
  upload_name: string;
  instance_id: string;
  description: string;
  status: string;
}

export async function fetchInstances(): Promise<SecondMeInstanceInfo[]> {
  const res = await fetch("/api/instances");
  const data = await res.json();
  return data.instances || [];
}
