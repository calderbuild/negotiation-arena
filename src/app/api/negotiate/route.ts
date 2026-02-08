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

  const session = createSession(body);
  return NextResponse.json({ session_id: session.id });
}
