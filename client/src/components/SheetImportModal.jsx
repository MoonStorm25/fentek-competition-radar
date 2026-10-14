import React, { useState } from 'react';
import { X, FileSpreadsheet, Upload, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function SheetImportModal({ isOpen, onClose, onImportSuccess }) {
  const [csvText, setCsvText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvText(event.target?.result || '');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvText.trim()) {
      setStatusMessage({ type: 'error', text: 'Lütfen CSV içeriği yapıştırın veya dosya yükleyin.' });
      return;
    }

    setIsImporting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/import/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: data.message || `${data.importedCount} yarışma başarıyla aktarıldı!`
        });
        setTimeout(() => {
          onImportSuccess();
          onClose();
        }, 1500);
      } else {
        setStatusMessage({
          type: 'error',
          text: data.message || 'İçe aktarma esnasında hata oluştu.'
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Bağlantı hatası: ' + err.message
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mb-3">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-100">
            Google Sheet & CSV İçe Aktarma
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Elinizdeki Google Sheets tablosunu radar sisteminize toplu olarak yükleyin.
          </p>
        </div>

        {/* Step by step guide */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-5 text-xs text-slate-300 space-y-2">
          <span className="font-bold text-emerald-400 block mb-1">📋 Google Sheets'ten Nasıl İndirilir?</span>
          <p>
            1. Google Sheets tablonuzu açın. <br />
            2. Sol üstten <strong>Dosya (File) ➔ İndir (Download) ➔ Virgülle ayrılmış değerler (.csv)</strong> seçin. <br />
            3. İndirilen dosyayı buraya yükleyin veya not defteriyle açıp içeriğini aşağıdaki kutuya yapıştırın.
          </p>
        </div>

        {/* Upload file or paste text */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              1. Dosya Yükle (.csv veya .txt)
            </label>
            <input
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleFileUpload}
              className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">
              2. Veya CSV Metnini Doğrudan Buraya Yapıştırın
            </label>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`Yarışma Adı, Düzenleyen, Son Başvuru, Web Sitesi, Kategori, Kapsam\nDiamond Challenge, Horn Ent, 2025-01-16, https://..., Girişimcilik, Global`}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting || !csvText.trim()}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{isImporting ? 'Aktarılıyor...' : 'Yarışmaları Radara Ekle'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
