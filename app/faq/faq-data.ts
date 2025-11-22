// FAQ data - shared between server and client components
import type { LucideIcon } from 'lucide-react';
import { CreditCard, Truck, Stethoscope } from 'lucide-react';

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
    ],
  },
  {
    category: 'Pickup & Logistics',
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
    ],
  },
  {
    category: 'Health & Papers',
    icon: Stethoscope,
    iconColor: 'text-green-400',
    items: [
      {
        question: 'What documents come with the puppy?',
        answer:
          'Every puppy goes home with a licensed veterinary health certificate, a detailed vaccination and deworming record, microchip registration details, and our custom starter guide for nutrition and training.',
      },
    ],
  },
];

// Flattened FAQ items for JSON-LD schema
export const faqItemsFlat = faqData.flatMap((cat) =>
  cat.items.map((item) => ({ question: item.question, answer: item.answer })),
);
