import { getSession as getAuthSession } from "@/lib/auth";
import { generateSummary } from "@/lib/negotiation";
import { NegotiationMessage } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  const body: {
    topic: string;
    position_a: string;
    position_b: string;
    messages: NegotiationMessage[];
  } = await req.json();

  if (!body.topic || !body.messages?.length) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const authSession = await getAuthSession();
  const summary = await generateSummary(
    body.topic,
    body.position_a,
    body.position_b,
    body.messages,
    authSession?.accessToken,
  );

  return Response.json(summary);
}
