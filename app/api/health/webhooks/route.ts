/**
 * Webhook Health Check Endpoint
 *
 * Monitors the health of webhook integrations by checking:
 * - Recent webhook events processing status
 * - Failed webhook events count
 * - Last successful webhook timestamp
 *
 * Returns 200 OK if webhooks are healthy, 503 Service Unavailable if issues detected
 */

import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WebhookHealthStatus {
  healthy: boolean;
  timestamp: string;
  checks: {
    stripe: WebhookProviderHealth;
    paypal: WebhookProviderHealth;
  };
  summary: {
    totalEvents: number;
    recentEvents: number;
    failedEvents: number;
    lastEventTime: string | null;
  };
}

interface WebhookProviderHealth {
  healthy: boolean;
  recentEvents: number;
  failedEvents: number;
  lastSuccessTime: string | null;
  lastFailureTime: string | null;
  errorRate: number;
}

/**
 * Health check thresholds
 */
const HEALTH_CHECK_CONFIG = {
  // Time window for recent events check (in minutes)
  RECENT_WINDOW_MINUTES: 60,
  // Maximum acceptable error rate (0-1)
  MAX_ERROR_RATE: 0.2, // 20%
  // Maximum time since last successful webhook (in minutes)
  MAX_STALE_MINUTES: 1440, // 24 hours
};

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    const now = new Date();
    const recentCutoff = new Date(
      now.getTime() - HEALTH_CHECK_CONFIG.RECENT_WINDOW_MINUTES * 60 * 1000
    );

    // Fetch recent webhook events
    const { data: allEvents, error: allEventsError } = await supabase
      .from("webhook_events")
      .select("*")
      .gte("created_at", recentCutoff.toISOString())
      .order("created_at", { ascending: false });

    if (allEventsError) {
      console.error("[Health Check] Failed to fetch webhook events:", allEventsError);
      return NextResponse.json(
        {
          healthy: false,
          error: "Failed to query webhook events",
          timestamp: now.toISOString(),
        },
        { status: 503 }
      );
    }

    const events = allEvents || [];

    // Calculate provider-specific health
    const stripeHealth = calculateProviderHealth(
      events.filter((e) => e.provider === "stripe"),
      now
    );
    const paypalHealth = calculateProviderHealth(
      events.filter((e) => e.provider === "paypal"),
      now
    );

    // Calculate overall summary
    const { data: totalEventsData } = await supabase
      .from("webhook_events")
      .select("id", { count: "exact", head: true });

    const totalEvents = totalEventsData?.length || 0;

    const failedEvents = events.filter(
      (e) => e.payload && typeof e.payload === "object" && "error" in e.payload
    ).length;

    const lastEvent = events[0];

    const summary = {
      totalEvents,
      recentEvents: events.length,
      failedEvents,
      lastEventTime: lastEvent?.created_at || null,
    };

    // Determine overall health
    const isHealthy =
      stripeHealth.healthy &&
      paypalHealth.healthy &&
      (events.length === 0 || // No events is acceptable
        failedEvents / events.length <= HEALTH_CHECK_CONFIG.MAX_ERROR_RATE);

    const healthStatus: WebhookHealthStatus = {
      healthy: isHealthy,
      timestamp: now.toISOString(),
      checks: {
        stripe: stripeHealth,
        paypal: paypalHealth,
      },
      summary,
    };

    return NextResponse.json(healthStatus, {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[Health Check] Unexpected error:", error);
    return NextResponse.json(
      {
        healthy: false,
        error: "Internal server error during health check",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

/**
 * Calculate health metrics for a specific payment provider
 */
function calculateProviderHealth(
  events: Array<{
    created_at: string;
    payload: unknown;
  }>,
  now: Date
): WebhookProviderHealth {
  if (events.length === 0) {
    return {
      healthy: true, // No events is acceptable (might not have activity yet)
      recentEvents: 0,
      failedEvents: 0,
      lastSuccessTime: null,
      lastFailureTime: null,
      errorRate: 0,
    };
  }

  const failedEvents = events.filter(
    (e) => e.payload && typeof e.payload === "object" && "error" in e.payload
  );

  const successEvents = events.filter(
    (e) => !e.payload || typeof e.payload !== "object" || !("error" in e.payload)
  );

  const errorRate = events.length > 0 ? failedEvents.length / events.length : 0;

  const lastSuccess = successEvents[0];
  const lastFailure = failedEvents[0];

  // Check if provider is stale (no successful events in last 24h)
  const isStale =
    lastSuccess &&
    new Date(now.getTime() - new Date(lastSuccess.created_at).getTime()).getMinutes() >
      HEALTH_CHECK_CONFIG.MAX_STALE_MINUTES;

  const isHealthy = errorRate <= HEALTH_CHECK_CONFIG.MAX_ERROR_RATE && !isStale;

  return {
    healthy: isHealthy,
    recentEvents: events.length,
    failedEvents: failedEvents.length,
    lastSuccessTime: lastSuccess?.created_at || null,
    lastFailureTime: lastFailure?.created_at || null,
    errorRate: Math.round(errorRate * 100) / 100, // Round to 2 decimals
  };
}
