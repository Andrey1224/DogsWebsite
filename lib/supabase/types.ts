export type Parent = {
  id: string;
  name: string;
  slug: string | null;
  breed: "french_bulldog" | "english_bulldog" | null;
  sex: "male" | "female" | null;
  birth_date: string | null;
  weight_lbs: number | null;
  color: string | null;
  description: string | null;
  health_clearances: string[] | null;
  photo_urls: string[] | null;
  video_urls: string[] | null;
  created_at: string | null;
};

export type Litter = {
  id: string;
  name: string | null;
  slug: string | null;
  sire_id: string | null;
  dam_id: string | null;
  mating_date: string | null;
  due_date: string | null;
  born_at: string | null;
  notes: string | null;
  created_at: string | null;
};

export type PuppyStatus = "available" | "reserved" | "sold" | "upcoming";

export type Puppy = {
  id: string;
  litter_id: string | null;
  sire_id: string | null;
  dam_id: string | null;
  name: string | null;
  slug: string | null;
  sex: "male" | "female" | null;
  color: string | null;
  birth_date: string | null;
  price_usd: number | null;
  status: PuppyStatus;
  weight_oz: number | null;
  description: string | null;
  photo_urls: string[] | null;
  video_urls: string[] | null;
  paypal_enabled: boolean | null;
  stripe_payment_link: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type Reservation = {
  id: string;
  puppy_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  channel:
    | "site"
    | "whatsapp"
    | "telegram"
    | "instagram"
    | "facebook"
    | "phone"
    | null;
  status: "pending" | "paid" | "refunded" | "canceled" | null;
  deposit_amount: number | null;
  stripe_payment_intent: string | null;
  payment_provider: "stripe" | "paypal" | null;
  paypal_order_id: string | null;
  notes: string | null;
  created_at: string | null;
};

export type Inquiry = {
  id: string;
  source:
    | "form"
    | "whatsapp"
    | "telegram"
    | "instagram"
    | "facebook"
    | "phone"
    | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  puppy_id: string | null;
  utm: Record<string, unknown> | null;
  client_ip: string | null;
  created_at: string | null;
};

export type PuppyWithRelations = Puppy & {
  litter: Litter | null;
  parents: {
    sire: Parent | null;
    dam: Parent | null;
  } | null;
};
