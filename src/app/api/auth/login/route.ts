import { getLoginUrl, setStateCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/callback`;

  const state = randomUUID();
  await setStateCookie(state);

  const loginUrl = getLoginUrl(redirectUri, state);
  return NextResponse.redirect(loginUrl);
}
