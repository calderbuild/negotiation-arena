import { SecondMeInstance } from "./types";

const PUBLIC_API_BASE = "https://app.secondme.io";
const LOCAL_API_BASE = "http://localhost:8002";
const CALL_TIMEOUT_MS = 15_000;
const MAX_TOKENS = 800;

// Validate instance ID to prevent path traversal
function validateInstanceId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

/**
 * Fetch list of online Second Me instances from the public API.
 */
export async function listInstances(): Promise<SecondMeInstance[]> {
  const res = await fetch(`${PUBLIC_API_BASE}/api/upload/list?page_size=100`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`Failed to list instances: ${res.status}`);
  }
  const json = await res.json();
  const items = json?.data?.items ?? [];
  return items.filter((i: SecondMeInstance) => i.status === "online");
}

/**
 * Call Second Me Chat API and return the complete buffered response.
 * Consumes SSE stream internally, returns full text when done.
 */
export async function chatWithInstance(
  instanceId: string,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  if (!validateInstanceId(instanceId)) {
    throw new Error(`Invalid instance ID: ${instanceId}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);

  try {
    const res = await fetch(
      `${PUBLIC_API_BASE}/api/chat/${instanceId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          metadata: {
            enable_l0_retrieval: true,
            role_id: "default_role",
          },
          temperature: 0.7,
          max_tokens: MAX_TOKENS,
          stream: true,
        }),
        signal: controller.signal,
      },
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Second Me API error ${res.status}: ${text}`);
    }

    return await consumeSSEStream(res);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Read an OpenAI-compatible SSE stream and buffer the complete response text.
 */
async function consumeSSEStream(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process complete SSE lines
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // Keep incomplete line in buffer

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (delta) {
          result += delta;
        }
      } catch {
        // Skip malformed JSON chunks
      }
    }
  }

  if (!result) {
    throw new Error("Empty response from Second Me");
  }

  return result;
}
