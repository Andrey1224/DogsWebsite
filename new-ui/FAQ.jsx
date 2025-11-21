import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  Truck,
  Stethoscope,
} from 'lucide-react';

// --- Data Categorized ---
const faqData = [
  {
    category: 'Reservation & Payments',
    icon: <CreditCard size={20} className="text-orange-400" />,
    items: [
      {
        q: 'How do I place a deposit?',
        a: "It's simple and secure. Open the puppy's detail page and tap 'Reserve' to pay via Stripe or PayPal. The $300 deposit immediately marks the puppy as reserved while we finalize your contract and pickup timeline.",
      },
      {
        q: 'Is the deposit refundable?',
        a: 'Deposits are non-refundable because we pause all other inquiries for that puppy, turning away other potential families. However, life happens! If your timing changes, we can transfer the deposit to another available or upcoming puppy by agreement.',
      },
      {
        q: 'How do I know the site is legitimate?',
        a: "We value transparency. All payments are processed by Stripe or PayPal—we never ask for direct wire transfers to unknown accounts. You'll receive automated confirmations, a legal contract, and ongoing video communication from our team for full peace of mind.",
      },
    ],
  },
  {
    category: 'Pickup & Logistics',
    icon: <Truck size={20} className="text-blue-400" />,
    items: [
      {
        q: 'What are the pickup and delivery options?',
        a: "You have options! You can pick up in person in Montgomery, AL by appointment. Alternatively, we partner with trusted ground transport and 'flight nannies' who fly with the puppy in-cabin to your nearest airport. Travel fees are quoted at cost.",
      },
      {
        q: 'Can we visit before reserving?',
        a: 'Yes! Kennel visits are available by appointment once you complete our inquiry form. For families who cannot travel to Alabama, we also provide live video walkthroughs (FaceTime/Zoom) so you can meet the puppies virtually.',
      },
    ],
  },
  {
    category: 'Health & Papers',
    icon: <Stethoscope size={20} className="text-green-400" />,
    items: [
      {
        q: 'What documents come with the puppy?',
        a: 'Every puppy goes home with a licensed veterinary health certificate, a detailed vaccination and deworming record, microchip registration details, and our custom starter guide for nutrition and training.',
      },
    ],
  },
];

export default function FaqPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategory, setOpenCategory] = useState(0); // Default open first category
  const [openItem, setOpenItem] = useState(0); // Default open first item

  // Filter logic
  const filteredData = faqData
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.a.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans pb-20">
      {/* --- Header & Search --- */}
      <div className="pt-32 pb-16 px-6 md:px-12 max-w-5xl mx-auto relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="text-center mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-1.5 mb-6">
            <HelpCircle size={14} className="text-orange-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              Support Center
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">How can we help you?</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Explore the breeding standards, reservation process, and go-home preparation steps that
            guide every Exotic Bulldog Legacy placement.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
            <div className="relative flex items-center bg-[#1E293B] rounded-full border border-slate-700 shadow-2xl">
              <Search className="ml-4 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search for 'deposit', 'delivery', 'diet'..."
                className="w-full bg-transparent border-none px-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- FAQ Accordion --- */}
      <div className="max-w-3xl mx-auto px-6 md:px-12 pb-24">
        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No answers found for "{searchTerm}". Try a different keyword.
          </div>
        ) : (
          <div className="space-y-12">
            {filteredData.map((cat, catIdx) => (
              <div key={catIdx} className="animate-fadeIn">
                {/* Category Title */}
                {!searchTerm && (
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-2">
                    {cat.icon}
                    <h3 className="text-xl font-bold text-slate-200">{cat.category}</h3>
                  </div>
                )}

                <div className="space-y-4">
                  {cat.items.map((item, itemIdx) => {
                    // Create unique ID for state management
                    const uniqueId = `${catIdx}-${itemIdx}`;
                    const isOpen = openCategory === catIdx && openItem === itemIdx;

                    return (
                      <div
                        key={itemIdx}
                        onClick={() => {
                          if (isOpen) {
                            setOpenItem(-1); // Close if already open
                          } else {
                            setOpenCategory(catIdx);
                            setOpenItem(itemIdx);
                          }
                        }}
                        className={`
                          group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden
                          ${
                            isOpen
                              ? 'bg-[#151e32] border-orange-500/50 shadow-lg shadow-orange-500/5'
                              : 'bg-[#111827] border-slate-800 hover:border-slate-600'
                          }
                        `}
                      >
                        <div className="p-6 flex justify-between items-start gap-4">
                          <h4
                            className={`font-semibold text-lg leading-snug ${isOpen ? 'text-orange-400' : 'text-slate-200 group-hover:text-white'}`}
                          >
                            {item.q}
                          </h4>
                          <ChevronDown
                            className={`flex-shrink-0 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-orange-500' : ''}`}
                          />
                        </div>

                        <div
                          className={`
                            grid transition-all duration-300 ease-in-out
                            ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
                          `}
                        >
                          <div className="overflow-hidden">
                            <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-slate-700/50 pt-4 mt-2">
                              {item.a}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Contact Footer --- */}
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="bg-gradient-to-r from-[#1E293B] to-[#1a2333] rounded-[2rem] p-8 md:p-12 border border-slate-700/50 text-center relative overflow-hidden">
          {/* Decor */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            We love connecting with future bulldog families. Contact us to schedule a kennel visit,
            video call, or to request health docs.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-slate-200 transition-colors">
              <MessageCircle size={18} /> Chat with us
            </button>
            <button className="flex items-center gap-2 border border-slate-600 text-white font-medium px-6 py-3 rounded-full hover:bg-slate-800 transition-colors">
              <Mail size={18} /> Email Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
