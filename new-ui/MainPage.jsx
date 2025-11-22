import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Star,
  MapPin,
  ArrowUpRight,
  UserCircle2,
  Heart,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  PlayCircle,
} from 'lucide-react';

// --- Данные ---
const reviews = [
  {
    id: 1,
    date: 'Oct 14, 2025',
    title: 'It was a great experience',
    text: 'We picked up our puppy last week and the experience was flawless. The vet said he creates the standard for the breed. Highly recommend to anyone looking for a healthy pup!',
    author: 'Sarah W.',
    location: 'Huntsville, AL',
    rating: 5,
  },
  {
    id: 2,
    date: 'Nov 02, 2025',
    title: 'Second bulldog from EBL',
    text: "Both puppies came home healthy and social. Payment and pickup were simple. The absolute best family to work with. We wouldn't go anywhere else.",
    author: 'Natalie C.',
    location: 'Mobile, AL',
    rating: 5,
  },
  {
    id: 3,
    date: 'Dec 21, 2025',
    title: 'Amazing Temperament',
    text: 'Whatever they are doing raising these pups, it works. Our little guy is so calm and loving with our kids. Worth every penny.',
    author: 'James R.',
    location: 'Birmingham, AL',
    rating: 5,
  },
];

const features = [
  {
    title: 'Health-first standards',
    desc: 'AKC pedigrees, OFA screenings, and transparent vet documentation for every sire and dam.',
    icon: <Heart className="text-orange-400" size={24} />,
  },
  {
    title: 'Curated matches',
    desc: 'Filter by breed, color, and temperament to find the bulldog that fits your family routine.',
    icon: <CheckCircle2 className="text-orange-400" size={24} />,
  },
  {
    title: 'Guided ownership',
    desc: 'Personal support before and after adoption, plus secure deposits handled via Stripe & PayPal.',
    icon: <ShieldCheck className="text-orange-400" size={24} />,
  },
];

const faqs = [
  {
    q: 'How do I place a deposit?',
    a: "Open the puppy's detail page and tap Reserve with Stripe or PayPal. The $300 deposit immediately marks the puppy as reserved.",
  },
  {
    q: 'Is the deposit refundable?',
    a: 'Deposits are non-refundable because we pause all other inquiries for that puppy. However, it can be transferred to another litter.',
  },
  {
    q: 'What are the pickup options?',
    a: 'You can pick up in Montgomery by appointment or choose courier delivery. We partner with trusted ground transport and flight nannies.',
  },
];

// --- Компоненты ---

const NavButton = ({ children, primary }) => (
  <button
    className={`
    px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2
    ${
      primary
        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600'
    }
  `}
  >
    {children}
  </button>
);

export default function RedesignedLanding() {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [openFaq, setOpenFaq] = useState(0);

  const nextSlide = () => setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));

  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans selection:bg-orange-500/30">
      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-20 px-6 md:px-20 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold tracking-wider uppercase">
              <Star size={12} className="fill-orange-400" />
              Premium Breeder in Alabama
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
              Trusted bulldogs, <br /> raised with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                southern warmth
              </span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-lg leading-relaxed">
              Discover a curated catalog of champion-line bulldogs bred for health, temperament, and
              lifelong companionship.
            </p>
            <div className="flex flex-wrap gap-4">
              <NavButton primary>
                View available puppies <ArrowUpRight size={18} />
              </NavButton>
              <NavButton>
                Schedule a video call <PlayCircle size={18} />
              </NavButton>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-[3rem] overflow-hidden border border-slate-700/50 shadow-2xl shadow-orange-900/20 rotate-2 hover:rotate-0 transition-transform duration-700">
              <img
                src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
                alt="Happy Bulldog"
                className="w-full h-[500px] object-cover"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/80 via-transparent to-transparent" />

              {/* Floating Badge */}
              <div className="absolute bottom-8 left-8 bg-[#1E293B]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-600/50 flex gap-4 items-center max-w-xs">
                <div className="bg-green-500/20 p-2 rounded-full">
                  <ShieldCheck className="text-green-400" size={24} />
                </div>
                <div>
                  <p className="font-bold text-sm">Health Guarantee</p>
                  <p className="text-xs text-slate-400">Vet-checked & vaccinated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 bg-[#0f1629]">
        <div className="max-w-7xl mx-auto px-6 md:px-20">
          <div className="mb-16 md:flex justify-between items-end">
            <div className="max-w-2xl">
              <h3 className="text-orange-400 font-bold tracking-wider text-sm mb-4 uppercase">
                About the breeder
              </h3>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                A family-run program built on trust
              </h2>
              <p className="text-slate-400">
                We blend veterinary best practices with genuine love for the breed.
              </p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-slate-300 hover:text-white transition-colors mt-6 md:mt-0 group">
              Learn more about us{' '}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-[#1E293B] p-8 rounded-3xl border border-slate-700/50 hover:border-orange-500/30 transition-colors group"
              >
                <div className="bg-[#0B1120] w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-[#0B1120] relative overflow-hidden">
        {/* Decor */}
        <div className="absolute right-0 top-1/4 w-96 h-96 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-orange-400 font-bold tracking-wider text-sm mb-3 uppercase">
              Quick Answers
            </h3>
            <h2 className="text-3xl md:text-4xl font-bold">Your questions, answered</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                onClick={() => setOpenFaq(idx === openFaq ? -1 : idx)}
                className={`
                    cursor-pointer rounded-2xl transition-all duration-300 overflow-hidden border
                    ${openFaq === idx ? 'bg-[#1E293B] border-orange-500/30' : 'bg-[#111827] border-slate-800 hover:border-slate-700'}
                  `}
              >
                <div className="p-6 flex justify-between items-center">
                  <h4
                    className={`font-semibold text-lg ${openFaq === idx ? 'text-white' : 'text-slate-300'}`}
                  >
                    {faq.q}
                  </h4>
                  <ChevronDown
                    className={`text-slate-500 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-orange-400' : ''}`}
                  />
                </div>
                <div
                  className={`px-6 pb-6 text-slate-400 leading-relaxed ${openFaq === idx ? 'block' : 'hidden'}`}
                >
                  {faq.a}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button className="text-sm text-slate-400 hover:text-white border border-slate-700 px-6 py-2 rounded-full transition-colors">
              See all FAQs
            </button>
          </div>
        </div>
      </section>

      {/* --- CAROUSEL SECTION (Redesigned) --- */}
      <section className="py-24 bg-[#0f1629] overflow-hidden flex items-center relative">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-12 items-center px-6 md:px-20">
          {/* Left Static Content */}
          <div className="lg:col-span-1 space-y-6 z-20">
            <h3 className="text-orange-400 font-bold tracking-wider text-sm uppercase">
              Featured Raves
            </h3>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              What our <br />
              <span className="text-orange-500">customers</span> <br />
              are saying
            </h2>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Real stories from families who found their perfect companions with us.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <NavButton primary>
                Read all reviews <ArrowUpRight size={18} />
              </NavButton>
            </div>
          </div>

          {/* Right Carousel Section */}
          <div className="lg:col-span-2 relative h-[450px]">
            {/* Navigation */}
            <div className="absolute -top-16 right-0 flex gap-3 z-30">
              <button
                onClick={prevSlide}
                className="p-3 rounded-full border border-slate-700 bg-[#0f1629] hover:border-orange-500 text-slate-300 hover:text-orange-500 transition-all"
              >
                <ArrowLeft size={22} />
              </button>
              <button
                onClick={nextSlide}
                className="p-3 rounded-full border border-slate-700 bg-[#0f1629] hover:border-orange-500 text-slate-300 hover:text-orange-500 transition-all"
              >
                <ArrowRight size={22} />
              </button>
            </div>

            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center perspective-1000">
              {reviews.map((review, index) => {
                let position = index - currentIndex;
                if (currentIndex === 0 && index === reviews.length - 1) position = -1;
                if (currentIndex === reviews.length - 1 && index === 0) position = 1;

                const isActive = position === 0;
                const isPrev = position === -1;
                const isNext = position === 1;

                if (
                  Math.abs(position) > 1 &&
                  !(currentIndex === 0 && index === reviews.length - 1) &&
                  !(currentIndex === reviews.length - 1 && index === 0)
                ) {
                  return null;
                }

                return (
                  <div
                    key={review.id}
                    className={`
                      absolute w-[90%] md:w-[550px] p-8 rounded-3xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
                      flex flex-col justify-between h-full min-h-[380px]
                      ${
                        isActive
                          ? 'bg-[#1E293B] scale-100 opacity-100 z-20 translate-x-0 shadow-2xl shadow-orange-500/10 border border-slate-700/50'
                          : 'bg-[#111827] scale-90 opacity-40 z-10 blur-[1px] pointer-events-none border border-transparent'
                      }
                      ${isPrev ? '-translate-x-[15%] md:-translate-x-[60%] rotate-[-2deg]' : ''}
                      ${isNext ? 'translate-x-[15%] md:translate-x-[60%] rotate-[2deg]' : ''}
                    `}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className="fill-orange-400 text-orange-400" />
                          ))}
                        </div>
                        <span className="text-slate-500 text-sm font-medium">{review.date}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4 leading-snug">
                        {review.title}
                      </h3>
                      <p className="text-slate-300 leading-relaxed text-base">"{review.text}"</p>
                    </div>
                    <div className="flex justify-between items-end mt-8 pt-6 border-t border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-orange-300">
                          <UserCircle2 />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{review.author}</h4>
                          <div className="flex items-center gap-1 text-slate-500 text-xs">
                            <MapPin size={12} />
                            <span>{review.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA FOOTER --- */}
      <section className="py-20 px-6 md:px-20 bg-[#0B1120]">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#1E293B] to-[#1a2333] p-12 rounded-[3rem] text-center relative overflow-hidden border border-slate-700/50 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">
            Ready to find your perfect bulldog?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto relative z-10">
            Browse our curated catalog of available puppies or schedule a kennel visit.
          </p>
          <div className="flex justify-center gap-4 relative z-10">
            <NavButton primary>View available puppies</NavButton>
            <NavButton>Schedule a visit</NavButton>
          </div>
        </div>
      </section>
    </div>
  );
}
