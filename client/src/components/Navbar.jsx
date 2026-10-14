import React from 'react';
import { 
  Radar, 
  PlusCircle, 
  Calendar, 
  Kanban, 
  Sparkles, 
  Globe, 
  Flag, 
  Clock, 
  RotateCw 
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  stats, 
  onOpenAddModal, 
  onTriggerScan, 
  isScanning 
}) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
              <Radar className={`h-6 w-6 ${isScanning ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 text-lg">
                  FENTEK RADAR
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                  v2.0 Scout
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Küresel ve Ulusal Yarışma / Hackathon Avcısı
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-sm">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all font-medium ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radar className="h-4 w-4" />
              <span>Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all font-medium ${
                activeTab === 'calendar'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Takvim</span>
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all font-medium ${
                activeTab === 'tracker'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Kanban className="h-4 w-4" />
              <span className="flex items-center gap-1.5">
                Takım Takibi
                {stats.myApplicationsCount > 0 && (
                  <span className="bg-cyan-500 text-slate-950 text-xs px-1.5 py-0.2 rounded-full font-bold">
                    {stats.myApplicationsCount}
                  </span>
                )}
              </span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Scan Radar Button */}
            <button
              onClick={onTriggerScan}
              disabled={isScanning}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all border ${
                isScanning
                  ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-800/60 hover:border-cyan-500 shadow-sm'
              }`}
              title="Devpost ve küresel kaynaklarda yeni yarışma tara"
            >
              <RotateCw className={`h-4 w-4 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden md:inline">
                {isScanning ? 'Taranıyor...' : 'Radarı Tara'}
              </span>
            </button>

            {/* Add Custom / Parse URL Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Etkinlik Ekle</span>
            </button>
          </div>

        </div>

        {/* Quick Stats Bar */}
        <div className="py-2 border-t border-slate-800/60 flex items-center gap-4 text-xs overflow-x-auto no-scrollbar text-slate-400">
          <div className="flex items-center gap-1.5 shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Toplam: <strong className="text-slate-200">{stats.total}</strong></span>
          </div>
          <div className="h-3 w-px bg-slate-800 shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <span>Global (High-Reward): <strong className="text-cyan-300">{stats.global}</strong></span>
          </div>
          <div className="h-3 w-px bg-slate-800 shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <Flag className="h-3.5 w-3.5 text-rose-400" />
            <span>Türkiye: <strong className="text-rose-300">{stats.turkey}</strong></span>
          </div>
          <div className="h-3 w-px bg-slate-800 shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Bu Ay Kapananlar: <strong className="text-amber-300">{stats.closingSoon}</strong></span>
          </div>
        </div>

      </div>
    </header>
  );
}
