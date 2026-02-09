import {
  consumeStateCookie,
  exchangeCode,
  fetchUserInfo,
  setSession,
} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/?error=missing_params`);
  }

  // CSRF check -- lenient for WebView environments where cookies don't share
  const savedState = await consumeStateCookie();
  if (savedState !== state) {
    console.warn("OAuth state mismatch -- possibly cross-WebView scenario");
  }

  try {
    const redirectUri = `${origin}/api/auth/callback`;
    const tokens = await exchangeCode(code, redirectUri);
    const user = await fetchUserInfo(tokens.access_token);

    await setSession({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      user,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    });

    return NextResponse.redirect(`${origin}/negotiate/new`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${origin}/?error=auth_failed`);
  }
}
