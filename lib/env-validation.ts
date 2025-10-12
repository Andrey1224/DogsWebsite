export interface EnvConfig {
  required: Record<string, { pattern?: RegExp; description: string }>;
  optional: Record<string, { pattern?: RegExp; description: string }>;
}

export function validateEnvironment(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const required = {
    NEXT_PUBLIC_SITE_URL: {
      pattern: /^https?:\/\/.+/,
      description: "Site URL (http://localhost:3000 or https://domain.com)"
    },
    SUPABASE_URL: {
      pattern: /^https:\/\/.+\.supabase\.co$/,
      description: "Supabase project URL"
    },
    SUPABASE_ANON_KEY: {
      pattern: /^eyJ/,
      description: "Supabase anonymous key"
    },
    NEXT_PUBLIC_CONTACT_PHONE: {
      pattern: /^\+\d{10,15}$/,
      description: "Contact phone in E.164 format (+12055551234)"
    },
    NEXT_PUBLIC_CONTACT_EMAIL: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      description: "Contact email address"
    },
  };

  const recommended = {
    RESEND_API_KEY: {
      pattern: /^re_[a-zA-Z0-9_]+$/,
      description: "Resend API key for email notifications"
    },
    OWNER_EMAIL: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      description: "Owner email for notifications"
    },
    NEXT_PUBLIC_GA_MEASUREMENT_ID: {
      pattern: /^G-[A-Z0-9]+$/,
      description: "Google Analytics 4 measurement ID"
    },
    NEXT_PUBLIC_CRISP_WEBSITE_ID: {
      pattern: /^[a-f0-9-]{36}$/,
      description: "Crisp chat website ID"
    },
    NEXT_PUBLIC_CONTACT_LATITUDE: {
      pattern: /^-?\d+(\.\d+)?$/,
      description: "Business latitude in decimal degrees"
    },
    NEXT_PUBLIC_CONTACT_LONGITUDE: {
      pattern: /^-?\d+(\.\d+)?$/,
      description: "Business longitude in decimal degrees"
    },
    NEXT_PUBLIC_CONTACT_HOURS: {
      pattern: undefined,
      description: "JSON array of business hours"
    },
    NEXT_PUBLIC_CONTACT_ADDRESS: {
      pattern: undefined,
      description: "Full mailing address (Street, City, ST ZIP, Country)"
    },
    // Payment processing (Stripe)
    STRIPE_SECRET_KEY: {
      pattern: /^sk_(test|live)_[a-zA-Z0-9]+$/,
      description: "Stripe secret key (sk_test_... or sk_live_...)"
    },
    STRIPE_WEBHOOK_SECRET: {
      pattern: /^whsec_(test_)?[a-zA-Z0-9]+$/,
      description: "Stripe webhook secret (whsec_...)"
    },
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
      pattern: /^pk_(test|live)_[a-zA-Z0-9]+$/,
      description: "Stripe publishable key (pk_test_... or pk_live_...)"
    },
    // Payment processing (PayPal)
    PAYPAL_CLIENT_ID: {
      pattern: undefined,
      description: "PayPal client ID"
    },
    PAYPAL_CLIENT_SECRET: {
      pattern: undefined,
      description: "PayPal client secret"
    },
    PAYPAL_ENV: {
      pattern: /^(sandbox|live)$/,
      description: "PayPal environment (sandbox or live)"
    },
    // Server-side analytics
    GA4_API_SECRET: {
      pattern: undefined,
      description: "GA4 API secret for Measurement Protocol"
    },
    META_CONVERSION_API_TOKEN: {
      pattern: undefined,
      description: "Meta Conversion API access token"
    },
  };

  // Check required variables
  for (const [key, config] of Object.entries(required)) {
    const value = process.env[key];
    if (!value) {
      errors.push(`❌ Missing required environment variable: ${key} (${config.description})`);
      continue;
    }

    if (config.pattern && !config.pattern.test(value)) {
      errors.push(`❌ Invalid format for ${key}: ${config.description}. Current value: ${value}`);
    }
  }

  // Check recommended variables with warnings
  for (const [key, config] of Object.entries(recommended)) {
    const value = process.env[key];
    if (!value) {
      warnings.push(`⚠️  Recommended environment variable missing: ${key} (${config.description})`);
      continue;
    }

    if (config.pattern && !config.pattern.test(value)) {
      warnings.push(`⚠️  Invalid format for ${key}: ${config.description}. Current value: ${value}`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateContactLinks() {
  const errors: string[] = [];

  // Phone validation
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE;
  if (!phone || !/^\+\d{10,15}$/.test(phone)) {
    errors.push("Invalid phone format. Use E.164 format: +12055551234");
  }

  // Email validation
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email format");
  }

  // WhatsApp validation (uses same phone)
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP;
  if (whatsapp && !/^\d{10,15}$/.test(whatsapp)) {
    errors.push("Invalid WhatsApp number format (use digits only)");
  }

  // Telegram validation
  const telegram = process.env.NEXT_PUBLIC_TELEGRAM_USERNAME;
  if (telegram && !/^[a-zA-Z0-9_]{5,32}$/.test(telegram.replace("@", ""))) {
    errors.push("Invalid Telegram username format (5-32 chars, alphanumeric + underscore)");
  }

  return errors;
}

// Development-only validation
export function validateDevelopmentEnvironment() {
  if (process.env.NODE_ENV !== "development") return;

  console.log("🔍 Validating development environment...");

  const envValidation = validateEnvironment();
  const contactValidation = validateContactLinks();

  if (!envValidation.valid) {
    console.error("\n❌ Environment validation failed:");
    envValidation.errors.forEach(error => console.error(`  ${error}`));
  }

  if (envValidation.warnings.length > 0) {
    console.warn("\n⚠️  Environment validation warnings:");
    envValidation.warnings.forEach(warning => console.warn(`  ${warning}`));
  }

  if (contactValidation.length > 0) {
    console.error("\n❌ Contact links validation failed:");
    contactValidation.forEach(error => console.error(`  ${error}`));
  }

  if (envValidation.valid && envValidation.warnings.length === 0 && contactValidation.length === 0) {
    console.log("✅ Environment validation passed!");
  } else if (envValidation.valid && contactValidation.length === 0) {
    console.log("✅ Environment validation passed (with warnings)");
  }

  console.log(""); // Empty line for spacing
}

// Production validation
export function validateProductionEnvironment() {
  const envValidation = validateEnvironment();
  const contactValidation = validateContactLinks();
  const allErrors = [...envValidation.errors, ...contactValidation];

  if (allErrors.length > 0) {
    console.error("\n🚨 Production environment validation failed:");
    allErrors.forEach(error => console.error(`  ${error}`));
    console.error("\nPlease fix these issues before deploying to production.");
    return false;
  }

  if (envValidation.warnings.length > 0) {
    console.warn("\n⚠️  Production environment warnings:");
    envValidation.warnings.forEach(warning => console.warn(`  ${warning}`));
  }

  console.log("✅ Production environment validation passed!");
  return true;
}
