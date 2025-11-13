type DeliveryMode = "auto" | "always" | "never";

function getDeliveryMode(): DeliveryMode {
  const rawValue = (process.env.RESEND_DELIVERY_MODE ?? "auto").toLowerCase();
  if (rawValue === "always" || rawValue === "never") {
    return rawValue;
  }
  return "auto";
}

export function shouldSendTransactionalEmails(): boolean {
  const mode = getDeliveryMode();
  if (mode === "always") {
    return true;
  }
  if (mode === "never") {
    return false;
  }
  return process.env.NODE_ENV === "production";
}

export function getEmailDeliveryReason(): string {
  const mode = getDeliveryMode();
  if (mode === "always") {
    return "forced";
  }
  if (mode === "never") {
    return "explicitly disabled";
  }
  return process.env.NODE_ENV === "production"
    ? "production environment"
    : "non-production environment";
}
