import React from 'react';
import {
  ShieldCheck,
  CreditCard,
  Plane,
  FileText,
  RefreshCw,
  Lock,
  CheckCircle2,
  Info,
} from 'lucide-react';

const policies = [
  {
    id: 1,
    title: 'Deposit Policy',
    icon: <CreditCard size={24} className="text-orange-400" />,
    content: (
      <>
        A <span className="text-white font-bold">$300 deposit</span> reserves your selected puppy
        and is applied to the final balance. Because we pause all other inquiries, deposits are
        non-refundable. If schedules change, we can transfer the deposit to another litter by mutual
        agreement.
      </>
    ),
  },
  {
    id: 2,
    title: 'Health Guarantee',
    icon: <ShieldCheck size={24} className="text-green-400" />,
    content: (
      <>
        Every puppy receives a comprehensive vet exam, age-appropriate vaccinations, and a
        microchip. We guarantee against life-threatening congenital conditions for{' '}
        <span className="text-white font-bold">12 months</span> and require notification within 48
        hours of detection.
      </>
    ),
  },
  {
    id: 3,
    title: 'Delivery & Pickup',
    icon: <Plane size={24} className="text-blue-400" />,
    content: (
      <>
        Pickup takes place in Montgomery, AL by appointment.{' '}
        <span className="text-white font-bold">Flight nanny transport</span> is available across the
        Southeast; travel fees are quoted at cost and must be paid prior to departure.
      </>
    ),
  },
  {
    id: 4,
    title: 'Refunds & Exchanges',
    icon: <RefreshCw size={24} className="text-purple-400" />,
    content: (
      <>
        Once reserved, refunds are not provided unless a licensed veterinarian documents a health
        concern prior to pickup. In that case, we offer a{' '}
        <span className="text-white font-bold">replacement puppy</span> from the next available
        litter or a full deposit return.
      </>
    ),
  },
  {
    id: 5,
    title: 'Privacy & Payments',
    icon: <Lock size={24} className="text-rose-400" />,
    content: (
      <>
        We process payments exclusively through{' '}
        <span className="text-white font-bold">Stripe and PayPal</span>—no wire transfers. Customer
        data is used only for contracts and vet records and is never shared with third parties.
      </>
    ),
  },
  {
    id: 6,
    title: 'Documents & Contracts',
    icon: <FileText size={24} className="text-yellow-400" />,
    content: (
      <>
        Adoption contracts, medical records, and AKC paperwork are compiled in a{' '}
        <span className="text-white font-bold">secure client portal</span> before go-home day.
        Co-ownership requests are reviewed on a case-by-case basis.
      </>
    ),
  },
];

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans pb-20">
      {/* --- Header --- */}
      <div className="pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto relative">
        {/* Abstract Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-gradient-to-b from-blue-900/20 to-transparent blur-[100px] rounded-full pointer-events-none" />

        <div className="text-center relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-1.5 mb-6">
            <Info size={14} className="text-blue-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              Transparency First
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Clear policies for a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              transparent adoption journey
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            We operate with clarity and care so every family knows exactly what to expect. No hidden
            clauses, just honest commitments.
          </p>
        </div>
      </div>

      {/* --- Trust Signals Bar --- */}
      <div className="max-w-5xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1E293B]/30 border border-slate-800 p-4 rounded-xl flex items-center gap-3 justify-center">
            <CheckCircle2 className="text-green-400" size={20} />
            <span className="font-semibold text-slate-300">AKC Registered</span>
          </div>
          <div className="bg-[#1E293B]/30 border border-slate-800 p-4 rounded-xl flex items-center gap-3 justify-center">
            <CheckCircle2 className="text-green-400" size={20} />
            <span className="font-semibold text-slate-300">Vet Certified</span>
          </div>
          <div className="bg-[#1E293B]/30 border border-slate-800 p-4 rounded-xl flex items-center gap-3 justify-center">
            <CheckCircle2 className="text-green-400" size={20} />
            <span className="font-semibold text-slate-300">Secure Payments</span>
          </div>
        </div>
      </div>

      {/* --- Policies Grid --- */}
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="bg-[#151e32] rounded-[2rem] p-8 border border-slate-800 hover:border-slate-600 hover:bg-[#1a253a] transition-all duration-300 group hover:shadow-xl hover:shadow-blue-900/5"
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[#0B1120] flex items-center justify-center border border-slate-800 group-hover:scale-110 transition-transform duration-300 flex-shrink-0 shadow-inner">
                  {policy.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-100 transition-colors">
                    {policy.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{policy.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Footer Note --- */}
      <div className="max-w-3xl mx-auto mt-20 px-6 text-center">
        <p className="text-slate-500 text-sm">
          These policies are part of our legal contract provided upon reservation.
          <br className="hidden md:block" />
          Have a specific situation not covered here?{' '}
          <button className="text-orange-400 hover:underline">Contact us</button> to discuss.
        </p>
      </div>
    </div>
  );
}
