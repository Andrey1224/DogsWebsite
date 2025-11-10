import { Resend } from "resend";
import { generateOwnerNotificationEmail } from "./simple-templates";
import type { Inquiry } from "@/lib/supabase/types";

// Create a factory function for better testability
function createResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

let resendClient: ReturnType<typeof createResendClient> | null = null;

function getResendClient() {
  if (!resendClient) {
    resendClient = createResendClient();
  }
  return resendClient;
}

interface OwnerNotificationParams {
  inquiry: {
    name: string;
    email: string;
    phone?: string;
    message: string;
    puppy_id?: string;
    puppy_slug?: string;
    created_at: string;
    source: string;
  };
}

export async function sendOwnerNotification({
  inquiry,
}: OwnerNotificationParams) {
  try {
    const { data, error } = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: [process.env.OWNER_EMAIL || "nepod77@gmail.com"],
      subject: `🐾 New Inquiry: ${inquiry.name} - Exotic Bulldog Legacy`,
      replyTo: inquiry.email,
      html: generateOwnerNotificationEmail({
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        message: inquiry.message,
        puppy_id: inquiry.puppy_id,
        puppy_slug: inquiry.puppy_slug,
        timestamp: new Date(inquiry.created_at).toLocaleString(),
        source: inquiry.source || "form",
      }),
    });

    if (error) {
      console.error("Failed to send owner notification email:", error);
      throw error;
    }

    console.log("✅ Owner notification email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending owner notification email:", error);
    throw error;
  }
}

export async function sendOwnerNotificationRaw(inquiry: Inquiry) {
  return sendOwnerNotification({
    inquiry: {
      name: inquiry.name || "Unknown",
      email: inquiry.email || "unknown@example.com",
      phone: inquiry.phone || undefined,
      message: inquiry.message || "",
      puppy_id: inquiry.puppy_id || undefined,
      puppy_slug: undefined, // We'll need to fetch this from puppy table if needed
      created_at: inquiry.created_at || new Date().toISOString(),
      source: inquiry.source || "form",
    },
  });
}

// Export for testing
export function resetResendClient() {
  resendClient = null;
}