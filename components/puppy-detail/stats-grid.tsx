import { Calendar, Dna, Star, Weight } from 'lucide-react';

type StatsGridProps = {
  birthDate: string | null;
  gender: string;
  color: string;
  weight: string;
};

function formatBirthDate(birthDate: string | null): string {
  if (!birthDate) return 'Contact for details';

  try {
    const date = new Date(birthDate);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return birthDate;
  }
}

function formatGender(gender: string): string {
  return gender.charAt(0).toUpperCase() + gender.slice(1);
}

export function StatsGrid({ birthDate, gender, color, weight }: StatsGridProps) {
  const formattedDate = formatBirthDate(birthDate);
  const formattedGender = formatGender(gender);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* DOB */}
      <div className="rounded-2xl border border-slate-700/50 bg-[#1E293B]/50 p-4">
        <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
          <Calendar size={14} className="text-orange-500" /> DOB
        </div>
        <div className="font-medium text-white">{formattedDate}</div>
      </div>

      {/* Gender */}
      <div className="rounded-2xl border border-slate-700/50 bg-[#1E293B]/50 p-4">
        <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
          <Dna size={14} className="text-blue-500" /> Gender
        </div>
        <div className="font-medium text-white">{formattedGender}</div>
      </div>

      {/* Color */}
      <div className="rounded-2xl border border-slate-700/50 bg-[#1E293B]/50 p-4">
        <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
          <Star size={14} className="text-purple-500" /> Color
        </div>
        <div className="font-medium text-white">{color}</div>
      </div>

      {/* Est. Weight */}
      <div className="rounded-2xl border border-slate-700/50 bg-[#1E293B]/50 p-4">
        <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
          <Weight size={14} className="text-green-500" /> Est. Weight
        </div>
        <div className="font-medium text-white">{weight}</div>
      </div>
    </div>
  );
}
