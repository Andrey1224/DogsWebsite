export type ContactChannel = {
  id: "call" | "sms" | "whatsapp" | "telegram" | "email";
  label: string;
  href: string;
};

export type ContactCard = ContactChannel & {
  value: string;
  description: string;
};

function readEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  return raw.trim().replace(/^"|"$/g, "");
}

function normalizeE164(raw?: string): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (!cleaned) return undefined;
  if (cleaned.startsWith("+")) return cleaned;
  return `+${cleaned}`;
}

function formatDisplayPhone(e164?: string, fallback?: string): string | undefined {
  if (!e164) return fallback;
  const match = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
  }
  return e164;
}

function buildWhatsappLink(raw?: string, fallback?: string): string | undefined {
  const cleaned = raw?.replace(/\D/g, "");
  if (cleaned) {
    return `https://wa.me/${cleaned}`;
  }
  if (fallback) return fallback;
  return undefined;
}

function buildTelegramLink(username?: string, fallback?: string): { handle?: string; link?: string } {
  if (!username) {
    return { handle: undefined, link: fallback };
  }
  const handle = username.startsWith("@") ? username.slice(1) : username;
  return {
    handle,
    link: `https://t.me/${handle}`,
  };
}

const DEFAULTS = {
  phone: {
    display: "+1 (205) 555-1234",
    e164: "+12055551234",
  },
  email: {
    address: "hello@exoticbulldoglevel.com",
  },
  whatsapp: {
    link: "https://wa.me/12055551234",
  },
  telegram: {
    handle: "exoticbulldoglevel",
    link: "https://t.me/exoticbulldoglevel",
  },
} as const;

const envPhoneRaw = readEnv("NEXT_PUBLIC_CONTACT_PHONE");
const envPhoneE164 = normalizeE164(envPhoneRaw);
const phoneDisplay = formatDisplayPhone(envPhoneE164, envPhoneRaw) ?? DEFAULTS.phone.display;
const phoneE164 = envPhoneE164 ?? DEFAULTS.phone.e164;

const emailAddress = readEnv("NEXT_PUBLIC_CONTACT_EMAIL") ?? DEFAULTS.email.address;
const whatsAppLink = buildWhatsappLink(readEnv("NEXT_PUBLIC_WHATSAPP"), DEFAULTS.whatsapp.link);
const telegramDetails = buildTelegramLink(readEnv("NEXT_PUBLIC_TELEGRAM_USERNAME"), DEFAULTS.telegram.link);

export const CONTACT_DETAILS = {
  phone: {
    display: phoneDisplay,
    e164: phoneE164,
  },
  email: {
    address: emailAddress,
  },
  whatsapp: {
    link: whatsAppLink ?? DEFAULTS.whatsapp.link,
  },
  telegram: {
    handle: telegramDetails.handle ?? DEFAULTS.telegram.handle,
    link: telegramDetails.link ?? DEFAULTS.telegram.link,
  },
} as const;

export const CONTACT_CHANNELS: ContactChannel[] = [
  { id: "call", label: "Call", href: `tel:${CONTACT_DETAILS.phone.e164}` },
  { id: "sms", label: "Text", href: `sms:${CONTACT_DETAILS.phone.e164}` },
  { id: "whatsapp", label: "WhatsApp", href: CONTACT_DETAILS.whatsapp.link },
  { id: "telegram", label: "Telegram", href: CONTACT_DETAILS.telegram.link },
  { id: "email", label: "Email", href: `mailto:${CONTACT_DETAILS.email.address}` },
];

export const CONTACT_CARDS: ContactCard[] = [
  {
    id: "call",
    label: "Call or text",
    value: CONTACT_DETAILS.phone.display,
    href: `tel:${CONTACT_DETAILS.phone.e164}`,
    description: "Available 9am–7pm CT. Leave a voicemail after hours and we’ll return it within a business day.",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: CONTACT_DETAILS.phone.display,
    href: CONTACT_DETAILS.whatsapp.link,
    description: "Instant messaging with photos/videos of current puppies and facility tours.",
  },
  {
    id: "email",
    label: "Email",
    value: CONTACT_DETAILS.email.address,
    href: `mailto:${CONTACT_DETAILS.email.address}`,
    description: "Detailed questions, vet references, and contract requests.",
  },
];

export const CONTACT_COPY = {
  crisp: {
    welcome:
      "Hi there! Tell us about the bulldog you’re looking for and we’ll share photos, pricing, and timelines.",
    offline:
      `We’re currently away. Tap WhatsApp or call the team at ${CONTACT_DETAILS.phone.display} for the fastest reply.`,
  },
};
