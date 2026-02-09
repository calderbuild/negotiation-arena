import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SECONDME_BASE = "https://app.mindos.com/gate/lab";
const SECONDME_OAUTH_URL = "https://go.second.me/oauth/";
const COOKIE_NAME = "secondme_session";

export interface SecondMeUser {
  userId: string;
  name: string;
  avatar: string;
  bio: string;
}

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  user: SecondMeUser;
  expiresAt: number;
}

/**
 * Build the SecondMe OAuth authorization URL.
 * `state` is a random CSRF token stored in a short-lived cookie.
 */
export function getLoginUrl(redirectUri: string, state: string): string {
  const clientId = process.env.SECONDME_CLIENT_ID;
  if (!clientId) throw new Error("SECONDME_CLIENT_ID not configured");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
  });

  return `${SECONDME_OAUTH_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for access + refresh tokens.
 */
export async function exchangeCode(
  code: string,
  redirectUri: string,
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const clientId = process.env.SECONDME_CLIENT_ID;
  const clientSecret = process.env.SECONDME_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("SecondMe OAuth credentials not configured");
  }

  const res = await fetch(`${SECONDME_BASE}/api/oauth/token/code`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  return json.data ?? json;
}

/**
 * Fetch the authenticated user's profile from SecondMe.
 */
export async function fetchUserInfo(accessToken: string): Promise<SecondMeUser> {
  const res = await fetch(`${SECONDME_BASE}/api/secondme/user/info`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch user info (${res.status}): ${text}`);
  }

  const json = await res.json();
  const data = json.data ?? json;
  return {
    userId: data.user_id ?? data.id ?? "",
    name: data.name ?? data.username ?? "User",
    avatar: data.avatarUrl ?? data.avatar ?? "",
    bio: data.bio ?? data.description ?? "",
  };
}

/**
 * Read the session from the cookie. Returns null if not logged in.
 */
export async function getSession(): Promise<SessionData | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    const data: SessionData = JSON.parse(
      Buffer.from(raw, "base64").toString("utf-8"),
    );
    if (data.expiresAt < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Write session data into an httpOnly cookie on the response.
 */
export async function setSession(data: SessionData): Promise<void> {
  const store = await cookies();
  const encoded = Buffer.from(JSON.stringify(data)).toString("base64");
  store.set(COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7200, // 2 hours, matching token lifetime
  });
}

/**
 * Clear the session cookie.
 */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/**
 * Set the CSRF state cookie for OAuth flow.
 */
export async function setStateCookie(state: string): Promise<void> {
  const store = await cookies();
  store.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300, // 5 minutes
  });
}

/**
 * Read and consume the CSRF state cookie.
 */
export async function consumeStateCookie(): Promise<string | null> {
  const store = await cookies();
  const value = store.get("oauth_state")?.value ?? null;
  if (value) store.delete("oauth_state");
  return value;
}

/**
 * Helper: create a redirect response (Next.js route handlers).
 */
export function redirect(url: string): NextResponse {
  return NextResponse.redirect(url);
}
