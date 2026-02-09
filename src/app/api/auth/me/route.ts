import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ logged_in: false });
  }

  return NextResponse.json({
    logged_in: true,
    user: session.user,
  });
}
