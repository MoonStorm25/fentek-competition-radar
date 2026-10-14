import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  Terminal, 
  RotateCw, 
  ShieldCheck, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  FileSpreadsheet,
  Activity
} from 'lucide-react';

export default function RadarStatusWidget({ 
  onTriggerScan, 
  isScanning, 
  onOpenSheetImport 
}) {
  const [radarData, setRadarData] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [autoEnabled, setAutoEnabled] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/radar/status');
      const data = await res.json();
      if (data.success) {
        setRadarData(data.data);
        setAutoEnabled(data.data.isAutoScanning);
      }
    } catch (err) {
      console.warn('Radar durum bilgisi alınamadı:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll status every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleToggleAuto = async () => {
    const nextVal = !autoEnabled;
    setAutoEnabled(nextVal);
    try {
      await fetch('/api/radar/toggle-auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextVal })
      });
      fetchStatus();
    } catch (err) {
      console.error('Radar ayar hatası:', err);
    }
  };

  const handleIntervalChange = async (e) => {
    const minutes = e.target.value;
    try {
      await fetch('/api/radar/toggle-auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalMinutes: minutes })
      });
      fetchStatus();
    } catch (err) {
      console.error('Interval hatası:', err);
    }
  };

  const lastScanFormatted = radarData?.lastScanTime 
    ? new Date(radarData.lastScanTime).toLocaleTimeString('tr-TR')
    : 'Az önce';

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30 border border-cyan-900/60 rounded-3xl p-4 sm:p-5 mb-6 shadow-2xl relative overflow-hidden">
      
      {/* Background Animated Pulse Ring */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 pointer-events-none opacity-20">
        <div className="w-80 h-80 rounded-full border border-cyan-400 animate-ping" />
        <div className="w-60 h-60 rounded-full border border-cyan-500 absolute inset-0 m-auto" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Left Side: Radar Status & Live Badge */}
        <div className="flex items-center gap-3.5">
          {/* Animated Radar Pulse Core */}
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/30">
              <Radar className={`h-6 w-6 ${isScanning || radarData?.isScanningNow ? 'animate-spin text-cyan-300' : ''}`} />
            </div>
            {autoEnabled && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                <span>Otonom Canlı Radar: {autoEnabled ? 'AKTİF & İZLEMEDE' : 'DURAKLATILDI'}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                {radarData?.totalCompetitions || 0} Etkinlik İzleniyor
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-0.5">
              Devpost API, Küresel Hackathonlar ve Türk İnovasyon Portalları arka planda düzenli taranıyor.
            </p>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
              <span>Son Tarama: <strong className="text-slate-200">{lastScanFormatted}</strong></span>
              <span>•</span>
              <span>Periyot: 
                <select 
                  value={radarData?.intervalMinutes || 30}
                  onChange={handleIntervalChange}
                  className="bg-slate-950 text-cyan-300 text-[11px] font-bold rounded px-1.5 py-0.5 ml-1 border border-slate-800 outline-none"
                >
                  <option value={15}>15 dk</option>
                  <option value={30}>30 dk</option>
                  <option value={60}>1 saat</option>
                  <option value={180}>3 saat</option>
                </select>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap self-stretch lg:self-auto justify-end">
          
          {/* Google Sheet / CSV Import Button */}
          <button
            onClick={onOpenSheetImport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 transition-all cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Google Sheet / CSV Aktar</span>
          </button>

          {/* Terminal Logs Toggle */}
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
          >
            <Terminal className="h-3.5 w-3.5 text-cyan-400" />
            <span>Radar Logları</span>
            {showLogs ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {/* Trigger Scan Button */}
          <button
            onClick={onTriggerScan}
            disabled={isScanning || radarData?.isScanningNow}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isScanning || radarData?.isScanningNow
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30 cursor-pointer'
            }`}
          >
            <RotateCw className={`h-3.5 w-3.5 ${isScanning || radarData?.isScanningNow ? 'animate-spin' : ''}`} />
            <span>{isScanning || radarData?.isScanningNow ? 'Taranıyor...' : 'Şimdi Tara'}</span>
          </button>

        </div>

      </div>

      {/* Expandable Live Terminal Log Box */}
      {showLogs && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Terminal className="h-3.5 w-3.5" />
              <span>RADAR CANLI AKIŞ TERMINALİ</span>
            </span>
            <span className="text-[10px] text-slate-500">Son 50 işlem kaydı</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin text-slate-300 text-[11px]">
            {radarData?.logs?.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-500 shrink-0">[{log.time}]</span>
                <span className={log.message.includes('YENİ') ? 'text-amber-300 font-bold' : log.message.includes('❌') ? 'text-rose-400' : 'text-slate-300'}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
