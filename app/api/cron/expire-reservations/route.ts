import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/client";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }

  const headerValue = request.headers.get("authorization");
  return headerValue === `Bearer ${cronSecret}`;
}

export async function POST(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.rpc("expire_pending_reservations");

    if (error) {
      console.error("[Cron] Failed to expire reservations:", error);
      return NextResponse.json(
        { error: "Failed to expire reservations" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      expired: typeof data === "number" ? data : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
