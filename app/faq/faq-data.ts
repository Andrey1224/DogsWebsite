// FAQ data - shared between server and client components
import type { LucideIcon } from 'lucide-react';
import { CreditCard, Truck, Stethoscope, Heart, Award, MessageCircle } from 'lucide-react';

export type FaqCategory = {
  category: string;
  icon: LucideIcon;
  iconColor: string;
  items: { question: string; answer: string }[];
};

export const faqData: FaqCategory[] = [
  {
    category: 'Reservation & Payments',
    icon: CreditCard,
    iconColor: 'text-orange-400',
    items: [
      {
        question: 'How do I place a deposit?',
        answer:
          "It's simple and secure. Open the puppy's detail page and tap 'Reserve' to pay via Stripe or PayPal. The $300 deposit immediately marks the puppy as reserved while we finalize your contract and pickup timeline.",
      },
      {
        question: 'Is the deposit refundable?',
        answer:
          'Deposits are non-refundable because we pause all other inquiries for that puppy, turning away other potential families. However, life happens! If your timing changes, we can transfer the deposit to another available or upcoming puppy by agreement.',
      },
      {
        question: 'How do I know the site is legitimate?',
        answer:
          "We value transparency. All payments are processed by Stripe or PayPal—we never ask for direct wire transfers to unknown accounts. You'll receive automated confirmations, a legal contract, and ongoing video communication from our team for full peace of mind.",
      },
      {
        question: 'What is the price range for your puppies?',
        answer:
          "Pricing varies based on the individual puppy and current availability. For the most accurate pricing, please contact us or check the puppy's listing. Final price is confirmed at the time of reservation.",
      },
      {
        question: 'Is there a price difference between French Bulldogs and English Bulldogs?',
        answer:
          "Yes, pricing can differ by breed and by each puppy's individual qualities. We'll always confirm the exact price before reservation.",
      },
      {
        question: 'What factors influence the price?',
        answer:
          'Price is based on the individual puppy and may include factors such as breed, pedigree, structure, rarity of color/markings, and overall quality. Availability and demand can also affect pricing.',
      },
    ],
  },
  {
    category: 'Pickup & Delivery',
    icon: Truck,
    iconColor: 'text-blue-400',
    items: [
      {
        question: 'What are the pickup and delivery options?',
        answer:
          "You have options! You can pick up in person in Montgomery, AL by appointment. Alternatively, we partner with trusted ground transport and 'flight nannies' who fly with the puppy in-cabin to your nearest airport. Travel fees are quoted at cost.",
      },
      {
        question: 'Can we visit before reserving?',
        answer:
          'Yes! Kennel visits are available by appointment once you complete our inquiry form. For families who cannot travel to Alabama, we also provide live video walkthroughs (FaceTime/Zoom) so you can meet the puppies virtually.',
      },
      {
        question: 'Do you offer delivery, and how much does it cost?',
        answer:
          'Yes. We offer local pickup in the Montgomery, Alabama area and delivery options such as flight nanny transport. Delivery pricing depends on destination, timing, and carrier availability—contact us for a quote.',
      },
      {
        question: 'How long does flight nanny delivery take?',
        answer:
          "Timing depends on flight schedules and destination. We'll confirm the estimated delivery timeline once travel arrangements are selected and booked.",
      },
      {
        question: 'What age are puppies when they go home?',
        answer:
          'Puppies go home when they are age-appropriate and cleared for transition. Exact timing depends on the puppy and veterinary guidance, and it will be confirmed before pickup/delivery.',
      },
    ],
  },
  {
    category: 'Health & Veterinary',
    icon: Stethoscope,
    iconColor: 'text-green-400',
    items: [
      {
        question: 'What documents come with the puppy?',
        answer:
          'Every puppy goes home with a licensed veterinary health certificate, a detailed vaccination and deworming record, microchip registration details, and our custom starter guide for nutrition and training.',
      },
      {
        question: 'What vaccinations does the puppy receive before going home?',
        answer:
          "Puppies receive age-appropriate veterinary care and vaccinations based on their age at pickup. You'll receive the puppy's health and vaccination records at transfer.",
      },
      {
        question: 'Do you do genetic testing on the parents?',
        answer:
          "Our breeding program prioritizes health and quality. Some parents may have health and/or genetic screening depending on the pairing. If you want details for a specific litter, we can share what's available for that pairing.",
      },
      {
        question: 'What does the 12-month health guarantee cover?',
        answer:
          'We provide a 12-month health guarantee as outlined in our written policy/contract. Coverage and requirements (such as veterinary exam timing) are defined in the agreement.',
      },
      {
        question: 'What is NOT covered by the health guarantee?',
        answer:
          'Exclusions and limitations are listed in the written policy/contract. In general, coverage is subject to proper care, timely veterinary follow-ups, and the terms stated in the agreement.',
      },
    ],
  },
  {
    category: 'Breeding Program',
    icon: Heart,
    iconColor: 'text-rose-400',
    items: [
      {
        question: 'How often do you have new litters?',
        answer:
          'We have limited, planned litters throughout the year. Timing varies based on our breeding program and availability.',
      },
      {
        question: 'Can I reserve a puppy from a future litter?',
        answer:
          'Yes—future litter reservations may be possible with an approved application and deposit, depending on availability and the specific pairing.',
      },
      {
        question: 'What breeds do you offer?',
        answer:
          'We primarily focus on French Bulldogs and English Bulldogs. If we have additional breeds or special pairings available, they will be listed on the website.',
      },
    ],
  },
  {
    category: 'AKC Registration',
    icon: Award,
    iconColor: 'text-purple-400',
    items: [
      {
        question: 'Are all puppies AKC registered?',
        answer:
          "AKC paperwork and registration details (if applicable) are explained during the purchase process and included in your client documents. Please contact us about the specific puppy you're interested in.",
      },
      {
        question: 'Is registration included in the price?',
        answer:
          'This depends on the puppy and the agreement terms. We will confirm what is included before reservation.',
      },
      {
        question: 'Do you offer breeding rights?',
        answer:
          'Breeding rights may be available for approved homes and require a separate agreement. Please contact us to discuss your goals and eligibility.',
      },
    ],
  },
  {
    category: 'Ongoing Support',
    icon: MessageCircle,
    iconColor: 'text-cyan-400',
    items: [
      {
        question: 'What support do you provide after purchase?',
        answer:
          'We provide ongoing support and are available to answer questions as your puppy grows. We want every family to feel confident after bringing their puppy home.',
      },
      {
        question: 'Do you provide feeding/vet recommendations?',
        answer:
          'Yes. We provide general care guidance (feeding, routine, transition tips) and can share recommendations when requested.',
      },
      {
        question: 'Can I reach out months after purchase?',
        answer: "Absolutely. You're welcome to contact us anytime with questions.",
      },
    ],
  },
];

// Flattened FAQ items for JSON-LD schema
export const faqItemsFlat = faqData.flatMap((cat) =>
  cat.items.map((item) => ({ question: item.question, answer: item.answer })),
);
