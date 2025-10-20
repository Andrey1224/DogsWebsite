type Coordinates = {
  latitude: number;
  longitude: number;
};

type HoursEntry = {
  day: string;
  opens: string;
  closes: string;
};

const DEFAULT_HOURS: HoursEntry[] = [
  { day: "Monday", opens: "09:00", closes: "19:00" },
  { day: "Tuesday", opens: "09:00", closes: "19:00" },
  { day: "Wednesday", opens: "09:00", closes: "19:00" },
  { day: "Thursday", opens: "09:00", closes: "19:00" },
  { day: "Friday", opens: "09:00", closes: "19:00" },
  { day: "Saturday", opens: "09:00", closes: "17:00" },
];

const DEFAULT_ADDRESS = {
  streetAddress: "Private kennel (appointment only)",
  addressLocality: "Montgomery",
  addressRegion: "AL",
  postalCode: "36117",
  addressCountry: "US",
};

function readEnvNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseAddress(raw?: string) {
  if (!raw) {
    return {
      ...DEFAULT_ADDRESS,
      formatted: `${DEFAULT_ADDRESS.streetAddress}, ${DEFAULT_ADDRESS.addressLocality}, ${DEFAULT_ADDRESS.addressRegion} ${DEFAULT_ADDRESS.postalCode}`,
    };
  }

  const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 3) {
    return {
      ...DEFAULT_ADDRESS,
      formatted: raw,
    };
  }

  const [streetAddress, addressLocality, regionPostal, addressCountry = "US"] = parts;
  const regionMatch = regionPostal.match(/([A-Za-z]{2})\s+(\d{5})/);

  const addressRegion = regionMatch?.[1] ?? DEFAULT_ADDRESS.addressRegion;
  const postalCode = regionMatch?.[2] ?? DEFAULT_ADDRESS.postalCode;
  const normalizedCountry = addressCountry.trim().toUpperCase();
  const addressCountryIso = normalizedCountry === "USA" ? "US" : normalizedCountry;

  return {
    streetAddress,
    addressLocality,
    addressRegion,
    postalCode,
    addressCountry: addressCountryIso,
    formatted: `${streetAddress}, ${addressLocality}, ${addressRegion} ${postalCode}`,
  };
}

function readHours(): HoursEntry[] {
  const raw = process.env.NEXT_PUBLIC_CONTACT_HOURS;
  if (!raw) {
    return DEFAULT_HOURS;
  }

  try {
    const parsed = JSON.parse(raw) as HoursEntry[];
    if (Array.isArray(parsed) && parsed.every((entry) => entry.day && entry.opens && entry.closes)) {
      return parsed;
    }
  } catch {
    // fall back to textual parsing below
  }

  if (typeof raw === "string") {
    const segments = raw.split(";").map((segment) => segment.trim()).filter(Boolean);
    if (segments.length > 0) {
      const parsed: HoursEntry[] = segments.map((segment) => {
        const [dayPart, timePart] = segment.split(/\s*:\s*/);
        if (!dayPart || !timePart) {
          return null;
        }
        const [opens, closes] = timePart.split(/\s*-\s*/);
        if (!opens || !closes) {
          return null;
        }
        return {
          day: dayPart,
          opens,
          closes,
        };
      }).filter((entry): entry is HoursEntry => Boolean(entry));

      if (parsed.length > 0) {
        return parsed;
      }
    }
  }

  return DEFAULT_HOURS;
}

const BUSINESS_COORDINATES: Coordinates = {
  latitude: readEnvNumber("NEXT_PUBLIC_CONTACT_LATITUDE", 32.3668),
  longitude: readEnvNumber("NEXT_PUBLIC_CONTACT_LONGITUDE", -86.3000),
};

const address = parseAddress(process.env.NEXT_PUBLIC_CONTACT_ADDRESS);

export const BUSINESS_PROFILE = {
  name: "Exotic Bulldog Level",
  legalName: "Exotic Bulldog Level Kennels LLC",
  description:
    "Responsible French & English bulldog breeding program in Montgomery, Alabama with concierge placement support.",
  slogan: "Trusted French & English bulldogs raised with southern warmth.",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@exoticbulldoglegacy.com",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+12055551234",
  address,
  areaServed: ["Alabama", "Georgia", "Florida", "Tennessee"],
  priceRange: "$$$",
  logo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://exoticbulldoglegacy.com"}/favicon.ico`,
  imageGallery: [
    "/reviews/sarah-charlie.webp",
    "/reviews/mark-lisa-duke.webp",
    "/reviews/cameron-milo.webp",
  ],
  coordinates: BUSINESS_COORDINATES,
  hours: readHours(),
  mapEmbedUrl: `https://maps.google.com/maps?q=${BUSINESS_COORDINATES.latitude},${BUSINESS_COORDINATES.longitude}&z=13&output=embed`,
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${BUSINESS_COORDINATES.latitude},${BUSINESS_COORDINATES.longitude}`,
};
