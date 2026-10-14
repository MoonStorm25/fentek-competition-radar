import React, { useState } from 'react';
import { X, Sparkles, Link, Plus, Loader2 } from 'lucide-react';

export default function AddCompetitionModal({ isOpen, onClose, onAddSuccess }) {
  const [urlInput, setUrlInput] = useState('');
  const [isParsingUrl, setIsParsingUrl] = useState(false);
  const [parseError, setParseError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    organizer: '',
    description: '',
    scope: 'Global',
    riskReward: 'High Risk - High Reward',
    format: 'Online',
    location: 'Online Platform',
    categories: ['Yazılım', 'AI'],
    eligibility: 'Lise Öğrencileri',
    awards: '$10.000 Ödül ve Mentorluk',
    registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
    eventDate: 'Önümüzdeki Ay',
    url: '',
    notes: ''
  });

  if (!isOpen) return null;

  // Auto-parse URL using backend scraper
  const handleParseUrl = async () => {
    if (!urlInput.startsWith('http')) {
      setParseError('Lütfen http:// veya https:// ile başlayan geçerli bir link girin.');
      return;
    }
    setParseError('');
    setIsParsingUrl(true);

    try {
      const res = await fetch('/api/radar/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          title: data.data.title || prev.title,
          organizer: data.data.organizer || prev.organizer,
          description: data.data.description || prev.description,
          scope: data.data.scope || prev.scope,
          riskReward: data.data.riskReward || prev.riskReward,
          format: data.data.format || prev.format,
          categories: data.data.categories?.length ? data.data.categories : prev.categories,
          url: urlInput
        }));
      } else {
        setParseError(data.message || 'Sayfa analiz edilemedi, lütfen alanları elle doldurun.');
      }
    } catch (err) {
      setParseError('Bağlantı hatası: ' + err.message);
    } finally {
      setIsParsingUrl(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      alert('Lütfen en azından Başlık ve Web Sitesi linkini doldurunuz.');
      return;
    }

    try {
      const res = await fetch('/api/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          registrationDeadline: new Date(formData.registrationDeadline).toISOString()
        })
      });

      const resData = await res.json();
      if (resData.success) {
        onAddSuccess(resData.data);
        onClose();
      }
    } catch (error) {
      alert('Yarışma eklenirken hata oluştu: ' + error.message);
    }
  };

  const handleCategoryToggle = (cat) => {
    setFormData(prev => {
      const exists = prev.categories.includes(cat);
      if (exists) {
        return { ...prev, categories: prev.categories.filter(c => c !== cat) };
      } else {
        return { ...prev, categories: [...prev.categories, cat] };
      }
    });
  };

  const availableCategories = ['AI', 'Yazılım', 'Girişimcilik', 'Uzay', 'İklim', 'Biyoteknoloji', 'Temel Bilimler', 'Sosyal İnovasyon'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Plus className="h-5 w-5 text-cyan-400" />
            <span>Yeni Yarışma / Etkinlik Ekle</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gözünüze çarpan bir yarışma linkini yapıştırın veya detayları manuel girin.
          </p>
        </div>

        {/* Auto Parse by URL Box */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-cyan-900/60 mb-6">
          <label className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Akıllı Link Ayrıştırıcı (Otomatik Doldur)</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://ornekyarisma.org veya hackathon linki..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
            <button
              type="button"
              onClick={handleParseUrl}
              disabled={isParsingUrl || !urlInput}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
            >
              {isParsingUrl ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              <span>{isParsingUrl ? 'Taranıyor...' : 'Analiz Et'}</span>
            </button>
          </div>
          {parseError && <p className="text-[11px] text-rose-400 mt-2">{parseError}</p>}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Yarışma / Etkinlik Adı *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Örn: Diamond Challenge 2025"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Düzenleyen Kurum / Sponsor</label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                placeholder="Örn: NASA / Delaware Univ / TÜBİTAK"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Açıklama & Detaylar</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Yarışmanın konusu, aşamaları ve hedefleri..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Kapsam</label>
              <select
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
              >
                <option value="Global">🌍 Global</option>
                <option value="Türkiye">🇹🇷 Türkiye</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Risk / Ödül Profili</label>
              <select
                value={formData.riskReward}
                onChange={(e) => setFormData({ ...formData, riskReward: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
              >
                <option value="High Risk - High Reward">🔥 High Risk - High Reward</option>
                <option value="Medium Risk">⚡ Medium Risk</option>
                <option value="Low Risk - High Participation">🛡️ Yerel / Güvenli Katılım</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Format</label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
              >
                <option value="Online">Online</option>
                <option value="Yüz Yüze">Yüz Yüze</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Son Başvuru Tarihi *</label>
              <input
                type="date"
                required
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Web Sitesi / Başvuru URL *</label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Kimler Katılabilir? (Kitle / Yaş)</label>
              <input
                type="text"
                value={formData.eligibility}
                onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                placeholder="Örn: 9-12. sınıf lise öğrencileri"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Ödüller / Prestij</label>
              <input
                type="text"
                value={formData.awards}
                onChange={(e) => setFormData({ ...formData, awards: e.target.value })}
                placeholder="Örn: $100.000 Ödül / YKS Ek Puanı"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Categories tag selection */}
          <div>
            <label className="block text-slate-400 font-bold mb-1.5">Alanlar & Etiketler</label>
            <div className="flex flex-wrap gap-1.5">
              {availableCategories.map(cat => {
                const active = formData.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryToggle(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      active 
                        ? 'bg-cyan-600 text-white shadow-sm' 
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    #{cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Özel Not / Strateji İpucu</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Örn: Yunanistan yarı finaline başvuru avantajlı."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-cyan-500/20"
            >
              Yarışmayı Kaydet
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
