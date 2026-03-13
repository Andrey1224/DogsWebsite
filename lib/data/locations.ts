export type DeliveryOption = { type: string; description: string };
export type Testimonial = { name: string; city: string; text: string };
export type FaqItem = { question: string; answer: string };

export type Location = {
  slug: string;
  city: string;
  state: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroText: string;
  driveTimeMinutes?: number;
  deliveryOptions: DeliveryOption[];
  localTestimonials?: Testimonial[];
  faq: FaqItem[];
  localContext?: string[];
  nearbyAreas?: string[];
  isIndexable?: boolean;
};

export const locations: Location[] = [
  {
    slug: 'birmingham-al',
    city: 'Birmingham',
    state: 'AL',
    metaTitle: 'French & English Bulldog Puppies Near Birmingham, AL',
    metaDescription:
      'Looking for a French or English bulldog puppy near Birmingham, AL? Exotic Bulldog Legacy is about an hour away with health-guaranteed pups, transparent pedigrees, and flexible delivery options.',
    heroTitle: 'Bulldog Puppies for Birmingham Families',
    heroText:
      'Metro Birmingham families have been trusting Exotic Bulldog Legacy for health-tested, lovingly raised French and English bulldogs. Whether you live in Hoover, Vestavia Hills, Mountain Brook, or downtown Birmingham, we make the pickup process straightforward — and we ship nationwide for families who prefer a flight nanny.',
    driveTimeMinutes: 60,
    deliveryOptions: [
      {
        type: 'Pickup by Appointment',
        description:
          'Schedule a visit to our kennel about an hour from Birmingham. We share the address after a deposit is placed for privacy and safety.',
      },
      {
        type: 'Flight Nanny Delivery',
        description:
          'A professional pet nanny hand-delivers your puppy in-cabin directly to Birmingham-Shuttlesworth International Airport (BHM). No cargo holds — ever.',
      },
      {
        type: 'Ground Transport',
        description:
          'For Birmingham metro buyers, we can arrange a meet-up at a mutually convenient location. Contact us to discuss options.',
      },
    ],
    localTestimonials: [
      {
        name: 'Melissa T.',
        city: 'Hoover, AL',
        text: 'I was nervous about finding a trustworthy breeder. Exotic Bulldog Legacy answered every question, sent weekly photos, and our little Biscuit arrived perfectly healthy. Worth every mile of the drive.',
      },
      {
        name: 'DeShawn R.',
        city: 'Birmingham, AL',
        text: "The flight nanny option made everything so easy. Our French bulldog was delivered right to the airport — calm, healthy, and already socialized. We couldn't be happier.",
      },
      {
        name: 'Carla W.',
        city: 'Vestavia Hills, AL',
        text: 'After two bad experiences with other breeders, I was skeptical. But the health guarantees, vet records, and constant communication made me feel completely at ease. Our girl Luna is perfect.',
      },
    ],
    faq: [
      {
        question: 'How far is the kennel from Birmingham?',
        answer:
          'Our kennel is approximately one hour from the Birmingham metro area. We share the exact address after a deposit is placed for privacy and safety. Most Birmingham families find the drive well worth it.',
      },
      {
        question: 'Can you deliver a puppy to Birmingham without me driving?',
        answer:
          'Yes. We offer flight nanny delivery directly to Birmingham-Shuttlesworth International Airport (BHM). A professional nanny accompanies your puppy in-cabin — no cargo. We also offer ground transport meet-ups for Birmingham metro buyers.',
      },
      {
        question: 'What deposit is required to reserve a Birmingham puppy?',
        answer:
          'A $500 non-refundable deposit secures your pick from the litter. The deposit is applied to the final purchase price. We accept major credit cards, PayPal, and bank transfer.',
      },
      {
        question: 'Are your puppies health-guaranteed for Birmingham buyers?',
        answer:
          'Absolutely. All puppies come with a 1-year genetic health guarantee, up-to-date vaccinations, a health certificate from our licensed vet, and microchipping. The guarantee is the same regardless of how you receive your puppy.',
      },
    ],
    nearbyAreas: ['Hoover', 'Vestavia Hills', 'Mountain Brook', 'Homewood', 'Pelham', 'Trussville'],
  },
  {
    slug: 'huntsville-al',
    city: 'Huntsville',
    state: 'AL',
    metaTitle: 'French & English Bulldog Puppies Near Huntsville, AL',
    metaDescription:
      'Exotic Bulldog Legacy serves Huntsville, AL families — including tech professionals and military families — with health-tested French and English bulldog puppies. Flight nanny and pickup options available.',
    heroTitle: 'Bulldog Puppies for Huntsville & Rocket City Families',
    heroText:
      "Huntsville's tech community and military families deserve a breeder who takes health and transparency as seriously as they do. Exotic Bulldog Legacy offers rigorously health-tested French and English bulldogs with full vet records, genetic testing, and a support team that stays in touch long after your puppy comes home.",
    driveTimeMinutes: 45,
    deliveryOptions: [
      {
        type: 'Pickup by Appointment',
        description:
          'Our kennel is under an hour from Huntsville. Schedule a visit at a time that works for your schedule — evenings and weekends available.',
      },
      {
        type: 'Flight Nanny Delivery',
        description:
          'We deliver directly to Huntsville International Airport (HSV) via professional in-cabin flight nanny. Ideal for active-duty families with demanding schedules.',
      },
      {
        type: 'Military Family Coordination',
        description:
          'Flexible scheduling and deposit holds for Redstone Arsenal and other military families. We understand PCS moves and deployment timelines — just ask.',
      },
    ],
    localTestimonials: [
      {
        name: 'Jason & Amy K.',
        city: 'Madison, AL',
        text: 'As a dual-military family, our schedule is unpredictable. The team at Exotic Bulldog Legacy held our pick for us and worked around our availability. Our French bulldog Max is an absolute joy.',
      },
      {
        name: 'Priya S.',
        city: 'Huntsville, AL',
        text: "We did extensive research before choosing a breeder. The genetic testing, transparency about the parents' health, and genuine follow-up support set them apart. Couldn't recommend more highly.",
      },
    ],
    faq: [
      {
        question: 'How far is the kennel from Huntsville?',
        answer:
          'Our kennel is approximately 45 minutes from Huntsville. We share the full address after a deposit is placed. Most Huntsville families make a relaxed day trip of the visit.',
      },
      {
        question: 'Do you accommodate military families at Redstone Arsenal?',
        answer:
          'Yes. We offer flexible deposit holds and scheduling for active-duty and reserve military families. We understand PCS timelines and deployment schedules and are happy to work around them. Just mention your situation when you reach out.',
      },
      {
        question: 'Can you fly a puppy to Huntsville International Airport?',
        answer:
          'Yes. We use professional in-cabin flight nannies who deliver your puppy directly to Huntsville International Airport (HSV). Your puppy travels in the cabin — never in cargo.',
      },
      {
        question: 'What health testing do your bulldogs receive?',
        answer:
          'All breeding adults are OFA-evaluated and tested for breed-specific genetic conditions. Puppies receive age-appropriate vaccinations, deworming, a full veterinary exam, and a health certificate before going home. A 1-year genetic health guarantee is included.',
      },
    ],
    nearbyAreas: ['Madison', 'Decatur', 'Athens', 'Hartselle', 'Scottsboro', 'Muscle Shoals'],
  },
];

export function getLocationBySlug(slug: string): Location | undefined {
  return locations.find((loc) => loc.slug === slug);
}

export function getIndexableLocations(): Location[] {
  return locations.filter((loc) => loc.isIndexable !== false);
}
