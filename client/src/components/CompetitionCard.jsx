import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ExternalLink, 
  Award, 
  Users, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Download, 
  Trash2, 
  Edit3, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

export default function CompetitionCard({ 
  competition, 
  onUpdateStatus, 
  onDelete, 
  onExportCalendar 
}) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(competition.registrationDeadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(competition.registrationDeadline));
    }, 60000); // update every minute
    return () => clearInterval(timer);
  }, [competition.registrationDeadline]);

  function calculateTimeLeft(deadlineStr) {
    if (!deadlineStr) return { days: 0, hours: 0, isExpired: true };
    const diff = new Date(deadlineStr).getTime() - new Date().getTime();
    if (diff <= 0) {
      return { days: 0, hours: 0, isExpired: true };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours, isExpired: false };
  }

  // Status mapping
  const statusOptions = [
    { value: 'none', label: 'Takip Durumu: Boşta', color: 'text-slate-400 bg-slate-900 border-slate-700' },
    { value: 'interested', label: '📌 İlgileniyoruz', color: 'text-amber-300 bg-amber-950/80 border-amber-800' },
    { value: 'team_building', label: '👥 Takım Kuruluyor', color: 'text-cyan-300 bg-cyan-950/80 border-cyan-800' },
    { value: 'applied', label: '🚀 Başvuru Yapıldı', color: 'text-indigo-300 bg-indigo-950/80 border-indigo-800' },
    { value: 'finalist', label: '🏆 Finalist / Derece', color: 'text-emerald-300 bg-emerald-950/80 border-emerald-800' }
  ];

  const currentStatusObj = statusOptions.find(o => o.value === competition.userStatus) || statusOptions[0];

  // Format readable deadline
  const formattedDeadline = new Date(competition.registrationDeadline).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className={`relative bg-slate-900/80 border rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between hover:border-slate-600 hover:shadow-2xl ${
      competition.riskReward.includes('High Risk') 
        ? 'border-amber-900/40 hover:border-amber-500/50' 
        : 'border-slate-800 hover:border-cyan-500/40'
    }`}>
      
      {/* Top Header: Badges & Source */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Scope Badge */}
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              competition.scope === 'Global'
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                : 'bg-rose-950/80 text-rose-300 border-rose-800'
            }`}>
              {competition.scope === 'Global' ? '🌍 Global' : '🇹🇷 Türkiye'}
            </span>

            {/* Risk/Reward Badge */}
            <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
              competition.riskReward.includes('High Risk')
                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                : competition.riskReward.includes('Medium')
                ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
            }`}>
              {competition.riskReward}
            </span>

            {/* Format Badge */}
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
              {competition.format}
            </span>
          </div>

          {/* Source tag */}
          <span className="text-[10px] text-slate-500 font-mono">
            {competition.source || 'Radar'}
          </span>
        </div>

        {/* Title & Organizer */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 leading-snug">
            {competition.title}
          </h3>
          <p className="text-xs text-cyan-400/90 font-medium mt-0.5">
            {competition.organizer}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
          {competition.description}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 mb-4">
          <div className="flex items-start gap-2 text-slate-300">
            <Users className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Kitle / Şart:</span>
              <span className="text-slate-200 line-clamp-1">{competition.eligibility}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-slate-300">
            <Award className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Ödül & Prestij:</span>
              <span className="text-amber-200 line-clamp-1">{competition.awards}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-slate-300">
            <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Lokasyon:</span>
              <span className="text-slate-200 line-clamp-1">{competition.location}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-slate-300">
            <Calendar className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Son Başvuru:</span>
              <span className="text-indigo-200 font-semibold">{formattedDeadline}</span>
            </div>
          </div>
        </div>

        {/* Categories tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {competition.categories?.map(tag => (
            <span key={tag} className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60">
              #{tag}
            </span>
          ))}
        </div>

        {/* Notes (if any) */}
        {competition.notes && (
          <div className="text-[11px] bg-indigo-950/30 border border-indigo-900/40 rounded-lg p-2.5 text-indigo-200/90 mb-4 flex items-start gap-2">
            <span className="font-bold text-indigo-400">💡 İpucu:</span>
            <span>{competition.notes}</span>
          </div>
        )}
      </div>

      {/* Bottom Footer: Countdown + Team Status + Actions */}
      <div className="pt-3 border-t border-slate-800 flex flex-col gap-3">
        
        {/* Countdown & Status Select */}
        <div className="flex items-center justify-between gap-2">
          {/* Live Countdown Badge */}
          <div className="flex items-center gap-1.5">
            <Clock className={`h-4 w-4 ${timeLeft.isExpired ? 'text-slate-500' : timeLeft.days <= 5 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-xs font-mono font-bold">
              {timeLeft.isExpired ? (
                <span className="text-slate-500">Süre Doldu</span>
              ) : (
                <span className={timeLeft.days <= 5 ? 'text-rose-400 font-extrabold' : 'text-amber-300'}>
                  {timeLeft.days} gün {timeLeft.hours} saat kaldı
                </span>
              )}
            </span>
          </div>

          {/* Student Application Status dropdown */}
          <div className="relative">
            <select
              value={competition.userStatus || 'none'}
              onChange={(e) => onUpdateStatus(competition.id, e.target.value)}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer ${currentStatusObj.color}`}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Calendar export & Delete */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onExportCalendar(competition.id)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title="Google / Apple Takvimime Ekle (.ics)"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(competition.id)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition-colors border border-slate-700 hover:border-rose-800"
              title="Listeden Kaldır"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* External Link Button */}
          <a
            href={competition.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/20"
          >
            <span>Resmi Site / Başvur</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

      </div>

    </div>
  );
}
