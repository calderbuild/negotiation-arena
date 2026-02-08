const CALL_TIMEOUT_MS = 30_000;
const MAX_TOKENS = 800;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Call the OpenAI-compatible LLM API and return the complete response.
 * Uses streaming to buffer the full response text.
 */
export async function chatCompletion(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || "https://newapi.deepwisdom.ai/v1";
  const model = process.env.LLM_MODEL || "deepseek-chat";

  if (!apiKey) {
    throw new Error("LLM_API_KEY is not configured");
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: MAX_TOKENS,
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`LLM API error ${res.status}: ${text}`);
    }

    return await consumeSSEStream(res);
  } finally {
    clearTimeout(timeout);
  }
}

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

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

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
        // Skip malformed chunks
      }
    }
  }

  if (!result) {
    throw new Error("Empty response from LLM");
  }

  return result;
}
