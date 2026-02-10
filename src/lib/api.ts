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

  try {
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
        // Server closed the connection -- throw to prevent retry
        throw new Error("stream closed");
      },
      onerror(err) {
        if (!finished) {
          callbacks.onError(err?.message || "Connection lost");
        }
        throw err; // Stop retrying
      },
    });
  } catch {
    // Expected: onclose/onerror throw to stop fetch-event-source from retrying.
    // Only surface unexpected errors that happened before the stream finished.
    if (!finished) {
      callbacks.onError("Connection lost");
    }
  }
}

export interface SecondMeInstanceInfo {
  upload_name: string;
  instance_id: string;
  description: string;
  status: string;
}

export async function fetchNegotiationSummary(
  sessionId: string,
  messages: NegotiationMessage[],
): Promise<NegotiationSummary> {
  let topic = "", position_a = "", position_b = "";
  let red_line_a = "", red_line_b = "";
  try {
    const config = JSON.parse(sessionStorage.getItem(`negotiation_${sessionId}`) || "{}");
    topic = config.topic || "";
    position_a = config.position_a || "";
    position_b = config.position_b || "";
    red_line_a = config.red_line_a || "";
    red_line_b = config.red_line_b || "";
  } catch {
    // sessionStorage unavailable
  }

  const res = await fetch("/api/negotiate/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, position_a, position_b, messages, red_line_a, red_line_b }),
  });

  if (!res.ok) {
    throw new Error(`Summary request failed: ${res.status}`);
  }

  return res.json();
}

export async function fetchInstances(): Promise<SecondMeInstanceInfo[]> {
  const res = await fetch("/api/instances");
  const data = await res.json();
  return data.instances || [];
}
