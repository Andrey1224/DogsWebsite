import { ShieldCheck } from 'lucide-react';

export function HealthBadge() {
  return (
    <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-700/50 bg-[#1E293B] p-4">
      <div className="rounded-full bg-green-500/20 p-2">
        <ShieldCheck className="text-green-400" size={20} />
      </div>
      <div>
        <div className="text-sm font-bold text-white">Vet-checked before go-home</div>
        <div className="text-xs text-slate-400">Age-appropriate vaccinations and microchip.</div>
      </div>
    </div>
  );
}
