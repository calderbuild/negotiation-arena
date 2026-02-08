import { listInstances } from "@/lib/secondme";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const instances = await listInstances();
    return NextResponse.json({ instances });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch instances";
    return NextResponse.json({ instances: [], error: msg }, { status: 502 });
  }
}
