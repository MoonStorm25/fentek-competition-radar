import React from 'react';
import { 
  Users, 
  ExternalLink, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Trophy, 
  CheckCircle, 
  Sparkles,
  Inbox
} from 'lucide-react';

const COLUMNS = [
  { id: 'interested', title: 'İlgileniyoruz / Havuz', icon: Inbox, color: 'border-amber-500/50 text-amber-400 bg-amber-950/20' },
  { id: 'team_building', title: 'Takım Kuruluyor', icon: Users, color: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/20' },
  { id: 'applied', title: 'Başvuru Yapıldı', icon: CheckCircle, color: 'border-indigo-500/50 text-indigo-400 bg-indigo-950/20' },
  { id: 'finalist', title: 'Finalist / Derece', icon: Trophy, color: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/20' }
];

export default function KanbanTracker({ competitions, onUpdateStatus }) {
  // Move item between statuses
  const moveItem = (id, direction) => {
    const currentComp = competitions.find(c => c.id === id);
    if (!currentComp) return;

    const sequence = ['interested', 'team_building', 'applied', 'finalist'];
    const currentIndex = sequence.indexOf(currentComp.userStatus);
    
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < sequence.length) {
      onUpdateStatus(id, sequence[newIndex]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-400" />
          <span>Fentek Takım & Başvuru Takip Panosu</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Hangi yarışmaya hangi aşamada hazırlandığınızı takip edin. Kartların altındaki oklara basarak aşamalar arasında ilerleyin.
        </p>
      </div>

      {/* 4 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map(col => {
          const colItems = competitions.filter(c => c.userStatus === col.id);
          const ColIcon = col.icon;

          return (
            <div 
              key={col.id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[450px]"
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between p-3 rounded-xl border mb-3 ${col.color}`}>
                <div className="flex items-center gap-2 font-bold text-xs">
                  <ColIcon className="h-4 w-4" />
                  <span>{col.title}</span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-950 text-slate-200">
                  {colItems.length}
                </span>
              </div>

              {/* Items in Column */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-600 text-xs border border-dashed border-slate-800 rounded-xl">
                    Henüz bu aşamada yarışma yok.
                  </div>
                ) : (
                  colItems.map(item => {
                    const deadlineFormatted = new Date(item.registrationDeadline).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short'
                    });

                    return (
                      <div 
                        key={item.id}
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all shadow-md group"
                      >
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            item.scope === 'Global' ? 'bg-cyan-950 text-cyan-300' : 'bg-rose-950 text-rose-300'
                          }`}>
                            {item.scope}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.format}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 line-clamp-2 mb-1">
                          {item.title}
                        </h4>
                        
                        <p className="text-[11px] text-slate-400 mb-2">
                          {item.organizer}
                        </p>

                        <div className="flex items-center gap-1 text-[11px] text-amber-300/90 font-mono mb-3">
                          <Clock className="h-3 w-3" />
                          <span>Son: {deadlineFormatted}</span>
                        </div>

                        {/* Card controls (Move left / right / external) */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                          {/* Previous stage */}
                          {col.id !== 'interested' ? (
                            <button
                              onClick={() => moveItem(item.id, 'prev')}
                              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                              title="Önceki Aşamaya Taşı"
                            >
                              <ArrowLeft className="h-3.5 w-3.5" />
                            </button>
                          ) : <div />}

                          {/* Link */}
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                          >
                            <span>Detay</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>

                          {/* Next stage */}
                          {col.id !== 'finalist' ? (
                            <button
                              onClick={() => moveItem(item.id, 'next')}
                              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                              title="Sonraki Aşamaya Taşı"
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          ) : <div />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
