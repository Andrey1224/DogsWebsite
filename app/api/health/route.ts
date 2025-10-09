import { NextResponse } from "next/server";
import { validateEnvironment, validateContactLinks } from "@/lib/env-validation";
import { createSupabaseClient } from "@/lib/supabase/client";

export async function GET() {
  const startTime = Date.now();

  try {
    // Environment validation
    const envValidation = validateEnvironment();
    const contactValidation = validateContactLinks();

    const healthData: {
      status: "ok" | "degraded" | "error";
      timestamp: string;
      environment: string | undefined;
      uptime_ms: number;
      response_time_ms?: number;
      services: {
        environment: {
          status: string;
          errors: string[];
          warnings: string[];
        };
        contact_links: {
          status: string;
          errors: string[];
        };
        database?: {
          status: string;
          error?: string;
        };
        email?: {
          status: string;
          error?: string;
          note?: string;
        };
        analytics?: {
          status: string;
          services: string[];
        };
      };
    } = {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime_ms: Date.now() - startTime,
      services: {
        environment: {
          status: envValidation.valid ? (envValidation.warnings.length > 0 ? "warning" : "ok") : "error",
          errors: envValidation.errors,
          warnings: envValidation.warnings,
        },
        contact_links: {
          status: contactValidation.length === 0 ? "ok" : "error",
          errors: contactValidation,
        },
      },
    };

    // Test database connection
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase
        .from("inquiries")
        .select("count")
        .limit(1)
        .single();

      healthData.services.database = {
        status: error ? "error" : "ok",
        error: error?.message,
      };
    } catch (dbError) {
      healthData.services.database = {
        status: "error",
        error: dbError instanceof Error ? dbError.message : "Unknown database error",
      };
    }

    // Test email service (Resend)
    if (process.env.RESEND_API_KEY) {
      try {
        const response = await fetch("https://api.resend.com/domains", {
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
        });

        if (response.ok) {
          healthData.services.email = {
            status: "ok",
          };
        } else {
          const errorData = await response.json().catch(() => ({}));
          // Handle restricted API keys (can only send emails, not check domains)
          if (errorData.message === "This API key is restricted to only send emails") {
            healthData.services.email = {
              status: "ok",
              note: "API key has send-only permissions (expected behavior)",
            };
          } else {
            healthData.services.email = {
              status: "error",
              error: `Email service error: ${errorData.message || "Authentication failed"}`,
            };
          }
        }
      } catch {
        healthData.services.email = {
          status: "error",
          error: "Email service connection failed",
        };
      }
    } else {
      healthData.services.email = {
        status: "not_configured",
        error: "RESEND_API_KEY not set",
      };
    }

    // Analytics check
    const analyticsServices = [];
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      analyticsServices.push("ga4");
    }
    if (process.env.META_PIXEL_ID) {
      analyticsServices.push("meta_pixel");
    }

    healthData.services.analytics = {
      status: analyticsServices.length > 0 ? "ok" : "not_configured",
      services: analyticsServices,
    };

    // Determine overall health status
    const hasErrors = Object.values(healthData.services).some(
      (service) => service && service.status === "error"
    );

    const hasWarnings = Object.values(healthData.services).some(
      (service) => service && service.status === "warning"
    );

    const hasNotConfigured = Object.values(healthData.services).some(
      (service) => service && service.status === "not_configured"
    );

    if (hasErrors) {
      healthData.status = "error";
    } else if (hasWarnings || hasNotConfigured) {
      healthData.status = "degraded";
    } else {
      healthData.status = "ok";
    }

    healthData.response_time_ms = Date.now() - startTime;

    // Return appropriate HTTP status
    const statusCode = healthData.status === "ok" ? 200 :
                      healthData.status === "degraded" ? 200 : 503;

    return NextResponse.json(healthData, { status: statusCode });

  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        details: error instanceof Error ? error.message : "Unknown error",
        response_time_ms: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}