export type DeliveryOption = { type: string; description: string };
export type Testimonial = { name: string; city: string; text: string };
export type FaqItem = { question: string; answer: string };
export type FamilyNote = {
  heading: string;
  text: string;
  links: { label: string; href: string }[];
};

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
  familyNote?: FamilyNote;
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
      'Looking for a French or English bulldog puppy near Birmingham, AL? Exotic Bulldog Legacy is about an hour away with vet-checked pups, transparent records, and flexible delivery options.',
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
          'A $300 non-refundable deposit secures your pick from the litter. The deposit is applied to the final purchase price.',
      },
      {
        question: 'What health documentation comes with a Birmingham puppy?',
        answer:
          'Every puppy goes home vet-checked with up-to-date, age-appropriate vaccinations and microchipping. Ask us for available health-testing documentation — the same standard applies regardless of how you receive your puppy. Guarantee terms are outlined in the signed contract.',
      },
    ],
    familyNote: {
      heading: 'Birmingham Families',
      text: 'We are currently collecting approved stories from Birmingham-area families. In the meantime, you can read verified reviews from our puppy families or contact us with questions about pickup and delivery near Birmingham.',
      links: [
        { label: 'Read verified reviews', href: '/reviews' },
        { label: 'Contact us', href: '/contact' },
      ],
    },
    localContext: [
      'Birmingham families can plan an appointment near Falkville or ask about ground and flight-nanny delivery. Availability, transport timing, and the puppy’s go-home date should be confirmed before making travel plans.',
      'For a comfortable ride home, bring a secured travel crate or restraint, water, cooling supplies during warm weather, and the veterinarian contact you plan to use after pickup.',
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
          'Ask us for available parent health-testing documentation. Puppies receive age-appropriate vaccinations, deworming, a full veterinary exam, and a health certificate before going home. Guarantee terms are outlined in the signed contract.',
      },
    ],
    localContext: [
      'Huntsville and Madison families usually choose pickup by appointment near Falkville or coordinate delivery when schedules make the drive difficult. Confirm the puppy’s availability and pickup window before traveling.',
      'Military moves and work schedules can change quickly, so contact us before placing a deposit if your timing depends on a PCS date, deployment, or a specific delivery window.',
    ],
    nearbyAreas: ['Madison', 'Decatur', 'Athens', 'Hartselle', 'Scottsboro', 'Muscle Shoals'],
  },
  {
    slug: 'cullman-al',
    city: 'Cullman',
    state: 'AL',
    metaTitle: 'Bulldog Puppies Near Cullman, Alabama',
    metaDescription:
      'Browse French and English Bulldog puppies near Cullman, Alabama. Exotic Bulldog Legacy is based near Falkville with pickup by appointment, health records, and vet-checked puppies.',
    heroTitle: 'French & English Bulldog Puppies Near Cullman, Alabama',
    heroText:
      'Exotic Bulldog Legacy is based near Falkville, roughly 20 minutes north of Cullman. Local families can browse current puppy profiles online, review health and deposit policies, and arrange pickup by appointment after choosing the right French or English Bulldog for their home.',
    driveTimeMinutes: 20,
    deliveryOptions: [
      {
        type: 'Local Pickup by Appointment',
        description:
          'Cullman families are close enough for a straightforward pickup near Falkville. We confirm the appointment and share the private pickup details after a puppy is reserved.',
      },
      {
        type: 'Ground Meetup Coordination',
        description:
          'When timing and puppy readiness allow, we can discuss a mutually convenient ground meetup. Contact us before reserving if a meetup is important to your plans.',
      },
      {
        type: 'Nationwide Delivery',
        description:
          'If the puppy is going to a family member outside North Alabama, ask about professional ground transport or in-cabin flight nanny delivery.',
      },
    ],
    faq: [
      {
        question: 'How close is Exotic Bulldog Legacy to Cullman?',
        answer:
          'We are based near Falkville, approximately 16 miles or about 20 minutes north of Cullman in normal driving conditions. Travel time varies by your starting point, traffic, and weather. The private pickup location is shared after a puppy is reserved.',
      },
      {
        question: 'Do you have a public storefront in Cullman?',
        answer:
          'No. We are a breeder operating by appointment near Falkville, not a walk-in pet store or public Cullman storefront. Contact us first to confirm puppy availability and the appropriate next step.',
      },
      {
        question: 'What comes with a puppy picked up near Cullman?',
        answer:
          'Each puppy goes home with age-appropriate vaccination and deworming records, a veterinary health certificate, and microchipping. The puppy profile and policies explain the available records and guarantee terms in more detail.',
      },
      {
        question: 'How do I reserve a Bulldog puppy near Cullman?',
        answer:
          'Start with the current puppy profiles, contact us with questions, and review the health and deposit policies. A $300 non-refundable deposit reserves an available puppy and is applied to the final purchase price.',
      },
    ],
    localContext: [
      'Cullman County is centrally positioned along Interstate 65 between Huntsville and Birmingham, while our pickup area near Falkville is a short drive north of Cullman. That makes an appointment practical for many North Alabama families without claiming a separate Cullman storefront.',
      'Before leaving home, confirm the puppy’s status and pickup time. Bring a secured crate or canine restraint, water, cleanup supplies, and a plan for a veterinary visit after the puppy settles in.',
    ],
    nearbyAreas: ['Good Hope', 'Hanceville', 'Vinemont', 'West Point', 'Fairview', 'Holly Pond'],
  },
  {
    slug: 'decatur-al',
    city: 'Decatur',
    state: 'AL',
    metaTitle: 'Bulldog Puppies Near Decatur, Alabama',
    metaDescription:
      'Explore French and English Bulldog puppies near Decatur, Alabama. Our Falkville-area pickup location is about 30 minutes away, with health records, support, and delivery options.',
    heroTitle: 'French & English Bulldog Puppies Near Decatur, Alabama',
    heroText:
      'Decatur and Morgan County families are within an easy drive of our Falkville-area pickup location. Browse available puppies, compare our health and reservation policies, and contact Exotic Bulldog Legacy to plan a safe pickup or discuss delivery options.',
    driveTimeMinutes: 30,
    deliveryOptions: [
      {
        type: 'Pickup by Appointment',
        description:
          'Falkville is roughly 20 miles south of Decatur. Once a puppy is reserved, we coordinate a private pickup window that works for the puppy’s go-home schedule.',
      },
      {
        type: 'Ground Meetup Coordination',
        description:
          'A ground meetup may be possible depending on timing, distance, and puppy readiness. Ask before placing a deposit if you cannot travel to the pickup area.',
      },
      {
        type: 'Flight Nanny Delivery',
        description:
          'For families connecting through Huntsville International Airport or traveling from farther away, professional in-cabin flight nanny delivery may be available.',
      },
    ],
    faq: [
      {
        question: 'How far is the pickup area from Decatur?',
        answer:
          'Falkville is roughly 20 miles south of Decatur, commonly around a 30-minute drive in normal conditions. Your actual time depends on your starting point, traffic, and weather. We confirm the private pickup details after reservation.',
      },
      {
        question: 'Do you serve Hartselle and Priceville families?',
        answer:
          'Yes. Hartselle, Priceville, Trinity, and other Morgan County families can use the same appointment and delivery process. Contact us to confirm current puppy availability before planning a visit.',
      },
      {
        question: 'Can I meet an available puppy before pickup?',
        answer:
          'Visits are handled by appointment and depend on puppy age, vaccination status, breeder schedule, and biosecurity. Contact us about the specific puppy so we can explain the safest available option.',
      },
      {
        question: 'What health protection is included for Decatur buyers?',
        answer:
          'The same health standards apply to every buyer: age-appropriate vaccinations and deworming, a veterinary health certificate, and microchipping. Review the written policies for guarantee terms before reserving.',
      },
    ],
    localContext: [
      'Decatur sits on the Tennessee River in North Alabama, with Interstate 65 east of downtown. Falkville is approximately 20 miles south, so most Decatur-area pickups can be planned as a short same-day drive.',
      'Keep the return trip calm and climate controlled. Bring a secured crate or restraint, water, cleanup supplies, and avoid unnecessary public pet areas until your veterinarian confirms an appropriate vaccination and socialization plan.',
    ],
    nearbyAreas: ['Hartselle', 'Priceville', 'Trinity', 'Somerville', 'Danville', 'Moulton'],
  },
];

export function getLocationBySlug(slug: string): Location | undefined {
  return locations.find((loc) => loc.slug === slug);
}

export function getIndexableLocations(): Location[] {
  return locations.filter((loc) => loc.isIndexable !== false);
}
