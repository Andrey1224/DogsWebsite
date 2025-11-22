import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MessageCircle,
  Send,
  Copy,
  Check,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';

const ContactMethod = ({ icon, title, value, sub, action, actionLabel }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#151e32] p-8 rounded-[2rem] border border-slate-800 hover:border-orange-500/30 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-900/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-opacity opacity-0 group-hover:opacity-100" />

      <div className="w-14 h-14 bg-[#0B1120] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-slate-800">
        {icon}
      </div>

      <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">{title}</h3>
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      <p className="text-slate-500 text-sm mb-8 leading-relaxed">{sub}</p>

      <div className="flex gap-3">
        <button className="flex-1 bg-slate-800 hover:bg-orange-500 hover:text-white text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
          {actionLabel}
        </button>
        <button
          onClick={handleCopy}
          className="px-4 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
        </button>
      </div>
    </div>
  );
};

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState('idle');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    setTimeout(() => setFormStatus('success'), 1500);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans pb-20">
      {/* --- Header --- */}
      <div className="pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
          <div>
            <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-1.5 mb-6">
              <MessageCircle size={14} className="text-green-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                Concierge Service
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Let's plan your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
                bulldog match
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-lg">
              Share a bit about your family, desired timing, and any must-have traits so we can
              recommend the right puppy.
            </p>
          </div>

          <div className="flex gap-8 text-sm text-slate-500 lg:justify-end pb-2">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-orange-400" />
              <span>Montgomery, AL</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-orange-400" />
              <span>9am – 7pm CT (Mon-Sat)</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Contact Cards Grid --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ContactMethod
            icon={<Phone className="text-blue-400" />}
            title="Call or Text"
            value="+1 (772) 777-9442"
            sub="Available 9am–7pm CT. Leave a voicemail after hours and we'll return it within a business day."
            actionLabel="Call Now"
          />
          <ContactMethod
            icon={<MessageCircle className="text-green-400" />}
            title="WhatsApp"
            value="+1 (772) 777-9442"
            sub="Best for international families. Get instant photos, videos, and facility tours."
            actionLabel="Chat on WhatsApp"
          />
          <ContactMethod
            icon={<Mail className="text-purple-400" />}
            title="Email"
            value="nepod77@gmail.com"
            sub="Detailed questions, vet references, and specific contract requests."
            actionLabel="Send Email"
          />
        </div>
      </div>

      {/* --- Inquiry Form Section --- */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 relative">
        {/* Decorative Elements */}
        <div className="absolute -left-4 top-20 w-24 h-24 bg-blue-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute -right-4 bottom-20 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-20 pointer-events-none" />

        <div className="bg-[#1E293B]/80 backdrop-blur-2xl border border-slate-700 rounded-[2.5rem] p-8 md:p-16 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left: Context */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Send an introduction</h3>
                <p className="text-slate-400 leading-relaxed">
                  Let us know the puppy you're eyeing, your preferred timeline, and how you'd like
                  us to connect.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-800 p-2 rounded-lg text-orange-400 mt-1">
                    <Check size={16} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Priority Waitlist</h4>
                    <p className="text-slate-500 text-xs">Get notified before public listing.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-slate-800 p-2 rounded-lg text-orange-400 mt-1">
                    <Check size={16} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Facetime Meet & Greet</h4>
                    <p className="text-slate-500 text-xs">Schedule a live video call.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              {formStatus === 'success' ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6">
                    <Check size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Inquiry Received!</h3>
                  <p className="text-slate-400">We'll be in touch within 24 hours.</p>
                  <button
                    onClick={() => setFormStatus('idle')}
                    className="mt-8 text-orange-400 hover:text-orange-300 text-sm font-bold"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                        Your Name
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Jane Doe"
                        className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                        Email
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="you@example.com"
                        className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                      How can we help?
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about the puppy you're interested in, your timeline, and any must-have traits..."
                      className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                    />
                  </div>

                  <button
                    disabled={formStatus === 'submitting'}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {formStatus === 'submitting' ? (
                      'Sending...'
                    ) : (
                      <>
                        Share my inquiry <Send size={18} />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-slate-500">
                    We respond within one business day. By submitting, you consent to be contacted
                    about current and upcoming litters.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
