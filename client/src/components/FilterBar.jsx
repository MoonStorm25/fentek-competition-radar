import React from 'react';
import { Search, Filter, X, Sparkles, Flame, Shield, Globe, MapPin } from 'lucide-react';

const CATEGORIES = [
  'Tümü',
  'AI',
  'Yazılım',
  'Girişimcilik',
  'Uzay',
  'İklim',
  'Biyoteknoloji',
  'Temel Bilimler',
  'Sosyal İnovasyon'
];

export default function FilterBar({ filters, setFilters, onResetFilters }) {
  const hasActiveFilters = 
    filters.query !== '' || 
    filters.scope !== 'Tümü' || 
    filters.riskReward !== 'Tümü' || 
    filters.format !== 'Tümü' || 
    filters.category !== 'Tümü';

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-8 backdrop-blur-sm shadow-xl">
      {/* Top row: Search input + Scope toggles */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mb-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            placeholder="Yarışma, teknoloji, organizatör veya ödül ara (örn: Diamond, NASA, TÜBİTAK, AI)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
          />
          {filters.query && (
            <button
              onClick={() => setFilters({ ...filters, query: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Scope Pill Selectors (Global vs Türkiye) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/90 rounded-xl border border-slate-800/90 text-xs font-semibold">
          <button
            onClick={() => setFilters({ ...filters, scope: 'Tümü' })}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filters.scope === 'Tümü'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tüm Kapsam
          </button>
          <button
            onClick={() => setFilters({ ...filters, scope: 'Global' })}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              filters.scope === 'Global'
                ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-800/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Global (High-Reward)</span>
          </button>
          <button
            onClick={() => setFilters({ ...filters, scope: 'Türkiye' })}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              filters.scope === 'Türkiye'
                ? 'bg-rose-950/90 text-rose-300 border border-rose-800/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Türkiye</span>
          </button>
        </div>

      </div>

      {/* Second row: Risk/Reward Profile, Format & Clear */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60 text-xs">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Alan:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilters({ ...filters, category: cat })}
                className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Risk / Reward & Format Selectors */}
        <div className="flex items-center gap-2">
          {/* Format */}
          <select
            value={filters.format}
            onChange={(e) => setFilters({ ...filters, format: e.target.value })}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-cyan-500"
          >
            <option value="Tümü">Format: Tümü</option>
            <option value="Online">Online</option>
            <option value="Yüz Yüze">Yüz Yüze</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          {/* Risk Profile */}
          <select
            value={filters.riskReward}
            onChange={(e) => setFilters({ ...filters, riskReward: e.target.value })}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-cyan-500"
          >
            <option value="Tümü">Risk/Ödül Profili: Tümü</option>
            <option value="High Risk - High Reward">🔥 High Risk - High Reward</option>
            <option value="Medium Risk">⚡ Dengeli (Medium Risk)</option>
            <option value="Low Risk - High Participation">🛡️ Yerel / Güvenli Katılım</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors ml-1 px-2 py-1"
              title="Filtreleri Temizle"
            >
              <X className="h-3.5 w-3.5" />
              <span>Temizle</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
