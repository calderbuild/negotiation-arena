import { clearSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await clearSession();
  return NextResponse.redirect(`${req.nextUrl.origin}/`);
}
