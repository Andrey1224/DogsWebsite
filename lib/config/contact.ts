export type ContactChannel = {
  id: "call" | "sms" | "whatsapp" | "telegram" | "email";
  label: string;
  href: string;
};

export type ContactCard = ContactChannel & {
  value: string;
  description: string;
};

export const CONTACT_DETAILS = {
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
