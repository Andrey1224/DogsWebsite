const VERIFY_ENDPOINT = "https://hcaptcha.com/siteverify";

type VerificationResponse = {
  success: boolean;
  "error-codes"?: string[];
};

type VerifyResult =
  | { ok: true }
  | { ok: false; message: string };

function formatErrorCodes(codes?: string[]) {
  if (!codes || codes.length === 0) {
    return undefined;
  }
  return codes.join(", ");
}

export async function verifyHCaptcha(token: string, remoteIp?: string | null): Promise<VerifyResult> {
  const bypassToken = process.env.HCAPTCHA_BYPASS_TOKEN;
  const isNonProduction = process.env.NODE_ENV !== "production";

  if (bypassToken && token === bypassToken && isNonProduction) {
    return { ok: true };
  }

  const secret = process.env.HCAPTCHA_SECRET_KEY;

  if (!secret) {
    const message =
      process.env.NODE_ENV === "production"
        ? "Captcha misconfigured. Contact the site owner."
        : "Set HCAPTCHA_SECRET_KEY to enable captcha validation.";
    return { ok: false, message };
  }

  const params = new URLSearchParams();
  params.set("response", token);
  params.set("secret", secret);
  if (remoteIp) {
    params.set("remoteip", remoteIp);
  }

  const response = await fetch(VERIFY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    return {
      ok: false,
      message: `Captcha verification failed (status ${response.status}). Try again shortly.`,
    };
  }

  const payload = (await response.json()) as VerificationResponse;

  if (!payload.success) {
    const codes = formatErrorCodes(payload["error-codes"]);
    return {
      ok: false,
      message: codes ? `Captcha rejected (${codes}).` : "Captcha rejected. Please try again.",
    };
  }

  return { ok: true };
}
