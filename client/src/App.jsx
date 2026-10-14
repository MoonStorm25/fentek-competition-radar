import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RadarStatusWidget from './components/RadarStatusWidget';
import FilterBar from './components/FilterBar';
import CompetitionCard from './components/CompetitionCard';
import CalendarView from './components/CalendarView';
import KanbanTracker from './components/KanbanTracker';
import AddCompetitionModal from './components/AddCompetitionModal';
import SheetImportModal from './components/SheetImportModal';
import { 
  Sparkles, 
  RotateCw, 
  AlertCircle, 
  CheckCircle2, 
  SearchX, 
  Compass, 
  Flame, 
  Globe 
} from 'lucide-react';
import './App.css';

export default function App() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'calendar' | 'tracker'
  const [isScanning, setIsScanning] = useState(false);
  const [scanNotification, setScanNotification] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSheetImportOpen, setIsSheetImportOpen] = useState(false);

  const [filters, setFilters] = useState({
    query: '',
    scope: 'Tümü',
    riskReward: 'Tümü',
    format: 'Tümü',
    category: 'Tümü'
  });

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/competitions');
      const data = await res.json();
      if (data.success) {
        setCompetitions(data.data);
      }
    } catch (err) {
      console.error('Yarışmalar yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  // Trigger live radar scan across global feeds
  const handleTriggerScan = async () => {
    setIsScanning(true);
    setScanNotification(null);
    try {
      const res = await fetch('/api/radar/scan', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setScanNotification({
          type: 'success',
          text: data.message
        });
        fetchCompetitions();
      } else {
        setScanNotification({
          type: 'error',
          text: data.message || 'Tarama tamamlanamadı.'
        });
      }
    } catch (err) {
      setScanNotification({
        type: 'error',
        text: 'Radar servisine ulaşılamadı: ' + err.message
      });
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanNotification(null), 6000);
    }
  };

  // Update student application tracking status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/competitions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userStatus: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setCompetitions(prev => prev.map(c => c.id === id ? { ...c, userStatus: newStatus } : c));
      }
    } catch (err) {
      console.error('Durum güncellenemedi:', err);
    }
  };

  // Delete competition
  const handleDelete = async (id) => {
    if (!window.confirm('Bu yarışmayı listeden kaldırmak istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/competitions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCompetitions(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Silme hatası:', err);
    }
  };

  // Export iCalendar (.ics)
  const handleExportCalendar = (id) => {
    window.open(`/api/calendar/ics/${id}`, '_blank');
  };

  const handleResetFilters = () => {
    setFilters({
      query: '',
      scope: 'Tümü',
      riskReward: 'Tümü',
      format: 'Tümü',
      category: 'Tümü'
    });
  };

  // Filtered items computation
  const filteredCompetitions = competitions.filter(item => {
    // Search query
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const match = 
        item.title.toLowerCase().includes(q) ||
        item.organizer.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categories.some(c => c.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Scope
    if (filters.scope !== 'Tümü' && item.scope.toLowerCase() !== filters.scope.toLowerCase()) {
      return false;
    }

    // Risk / Reward
    if (filters.riskReward !== 'Tümü' && item.riskReward !== filters.riskReward) {
      return false;
    }

    // Format
    if (filters.format !== 'Tümü' && item.format.toLowerCase() !== filters.format.toLowerCase()) {
      return false;
    }

    // Category
    if (filters.category !== 'Tümü' && !item.categories.includes(filters.category)) {
      return false;
    }

    return true;
  });

  // Calculate live stats
  const now = new Date();
  const next30Days = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
  const stats = {
    total: competitions.length,
    global: competitions.filter(c => c.scope === 'Global').length,
    turkey: competitions.filter(c => c.scope === 'Türkiye').length,
    closingSoon: competitions.filter(c => {
      const d = new Date(c.registrationDeadline);
      return d >= now && d <= next30Days;
    }).length,
    myApplicationsCount: competitions.filter(c => c.userStatus && c.userStatus !== 'none').length
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onTriggerScan={handleTriggerScan}
        isScanning={isScanning}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Active Radar Status & Controller Widget */}
        <RadarStatusWidget
          onTriggerScan={handleTriggerScan}
          isScanning={isScanning}
          onOpenSheetImport={() => setIsSheetImportOpen(true)}
        />

        {/* Real-time Notification Banner */}
        {scanNotification && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold transition-all ${
            scanNotification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {scanNotification.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
              )}
              <span>{scanNotification.text}</span>
            </div>
            <button
              onClick={() => setScanNotification(null)}
              className="px-2 py-1 bg-black/30 hover:bg-black/50 rounded-lg text-xs"
            >
              Tamam
            </button>
          </div>
        )}

        {/* Tab 1: Radar (List / Grid View) */}
        {activeTab === 'list' && (
          <div>
            {/* Filter controls */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              onResetFilters={handleResetFilters}
            />

            {/* Results count & status */}
            <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
              <span className="font-medium">
                Gösterilen: <strong className="text-slate-200">{filteredCompetitions.length}</strong> / Toplam <strong className="text-cyan-400">{competitions.length}</strong> yarışma
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Sıralama: En Yakın Son Başvuru Tarihi
              </span>
            </div>

            {/* Grid of competition cards */}
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-500">
                <RotateCw className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
                <p className="text-sm">Yarışmalar ve radarlar taranıyor...</p>
              </div>
            ) : filteredCompetitions.length === 0 ? (
              <div className="py-20 bg-slate-900/40 border border-slate-800 rounded-3xl text-center p-8">
                <SearchX className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-300 mb-1">
                  Aramanıza uygun etkinlik bulunamadı
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                  Filtreleri temizleyebilir veya yeni bir yarışma linki ekleyerek radarınıza dahil edebilirsiniz.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl transition-all"
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCompetitions.map(comp => (
                  <CompetitionCard
                    key={comp.id}
                    competition={comp}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDelete}
                    onExportCalendar={handleExportCalendar}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Calendar View */}
        {activeTab === 'calendar' && (
          <CalendarView
            competitions={competitions}
            onExportCalendar={handleExportCalendar}
          />
        )}

        {/* Tab 3: Kanban Team Tracker */}
        {activeTab === 'tracker' && (
          <KanbanTracker
            competitions={competitions}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            🚀 <strong>Fentek Competition Radar</strong> — Fen & Teknoloji Liseliler İçin Geliştirildi.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>High Risk • High Reward</span>
            <span>•</span>
            <span>TÜBİTAK & Teknofest</span>
            <span>•</span>
            <span>Global Hackathons</span>
          </div>
        </div>
      </footer>

      {/* Add Competition Modal */}
      <AddCompetitionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSuccess={(newComp) => {
          setCompetitions(prev => [newComp, ...prev]);
          setScanNotification({
            type: 'success',
            text: `"${newComp.title}" başarıyla radara eklendi!`
          });
        }}
      />

      {/* Google Sheet / CSV Import Modal */}
      <SheetImportModal
        isOpen={isSheetImportOpen}
        onClose={() => setIsSheetImportOpen(false)}
        onImportSuccess={() => {
          fetchCompetitions();
          setScanNotification({
            type: 'success',
            text: 'Google Sheet verileri başarıyla sisteme aktarıldı!'
          });
        }}
      />

    </div>
  );
}
