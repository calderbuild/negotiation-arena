import { getSession as getAuthSession } from "@/lib/auth";
import { createSession } from "@/lib/negotiation";
import { CreateNegotiationRequest } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body: CreateNegotiationRequest = await req.json();

  // Basic validation
  if (!body.topic || !body.instance_a_id || !body.instance_b_id || !body.position_a || !body.position_b) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  // Validate instance IDs
  const idPattern = /^[a-zA-Z0-9_-]+$/;
  if (!idPattern.test(body.instance_a_id) || !idPattern.test(body.instance_b_id)) {
    return NextResponse.json(
      { error: "Invalid instance ID format" },
      { status: 400 },
    );
  }

  // Inject OAuth access token from cookie if user is logged in
  const authSession = await getAuthSession();
  if (authSession?.accessToken) {
    body.accessToken = authSession.accessToken;
  }

  const session = createSession(body);
  return NextResponse.json({
    session_id: session.id,
    session_config: {
      id: session.id,
      topic: session.topic,
      instance_a_id: session.instance_a_id,
      instance_a_name: session.instance_a_name,
      position_a: session.position_a,
      instance_b_id: session.instance_b_id,
      instance_b_name: session.instance_b_name,
      position_b: session.position_b,
      accessToken: session.accessToken,
      red_line_a: session.red_line_a,
      red_line_b: session.red_line_b,
      created_at: session.created_at,
    },
  });
}
