import { Resend } from "resend";
import { generateCustomerConfirmationEmail } from "./simple-templates";
import { getEmailDeliveryReason, shouldSendTransactionalEmails } from "./delivery-control";

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

interface CustomerConfirmationParams {
  name: string;
  email: string;
}

export async function sendCustomerConfirmation({
  name,
  email,
}: CustomerConfirmationParams) {
  if (!shouldSendTransactionalEmails()) {
    console.info(
      `[Email] Skipping customer confirmation (delivery disabled: ${getEmailDeliveryReason()})`,
    );
    return { success: true, data: { skipped: true } };
  }

  try {
    const { data, error } = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: [email],
      subject: "Your Exotic Bulldog Legacy Inquiry - We'll Be in Touch Soon! 🐾",
      html: generateCustomerConfirmationEmail(name),
    });

    if (error) {
      console.error("Failed to send customer confirmation email:", error);
      throw error;
    }

    console.log("✅ Customer confirmation email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending customer confirmation email:", error);
    throw error;
  }
}

// Export for testing
export function resetResendClient() {
  resendClient = null;
}
