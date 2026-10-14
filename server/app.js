import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanDevpost, parseCompetitionUrl } from './services/scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const DATA_FILE = path.join(__dirname, 'data', 'competitions.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper to read competitions data
export function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Veri okuma hatası:', err);
    return [];
  }
}

// Helper to write competitions data
export function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Veri yazma hatası:', err);
    return false;
  }
}

// Active Radar State & Activity Logs
export const radarState = {
  isAutoScanning: true,
  intervalMinutes: 30,
  lastScanTime: null,
  nextScanTime: null,
  isScanningNow: false,
  logs: [
    { time: new Date().toLocaleTimeString('tr-TR'), message: '🛰️ Radar motoru başlatıldı. Otonom izleme devrede.' }
  ]
};

export function addRadarLog(message) {
  const time = new Date().toLocaleTimeString('tr-TR');
  radarState.logs.unshift({ time, message });
  if (radarState.logs.length > 50) radarState.logs.pop();
  console.log(`[RADAR ${time}] ${message}`);
}

// Core scan execution logic
export async function executeRadarScan() {
  if (radarState.isScanningNow) return { newCount: 0, message: 'Tarama zaten devam ediyor.' };

  radarState.isScanningNow = true;
  addRadarLog('🔍 Devpost & Küresel Hackathon API kanalları taranıyor...');

  try {
    const liveDevpost = await scanDevpost();
    addRadarLog(`📡 Devpost üzerinden ${liveDevpost.length} aktif küresel yarışma sinyali alındı.`);

    const current = readData();
    let newItemsCount = 0;

    for (const item of liveDevpost) {
      const exists = current.some(c => 
        c.title.toLowerCase() === item.title.toLowerCase() ||
        (c.url && item.url && c.url === item.url)
      );

      if (!exists) {
        current.unshift(item);
        newItemsCount++;
      }
    }

    if (newItemsCount > 0) {
      writeData(current);
      addRadarLog(`✨ Radarda ${newItemsCount} adet YENİ yarışma yakalandı ve veri tabanına eklendi!`);
    } else {
      addRadarLog('✅ Tüm yarışmalar zaten güncel. Kaçırılan yeni bir etkinlik yok.');
    }

    radarState.lastScanTime = new Date().toISOString();
    radarState.nextScanTime = new Date(Date.now() + radarState.intervalMinutes * 60 * 1000).toISOString();
    radarState.isScanningNow = false;

    return {
      newCount: newItemsCount,
      totalCount: current.length,
      message: newItemsCount > 0
        ? `Radarda ${newItemsCount} adet yeni küresel etkinlik keşfedildi!`
        : 'Radar güncel! Zaten bilinen etkinliklerin tümü sisteminizde kayıtlı.'
    };
  } catch (error) {
    radarState.isScanningNow = false;
    addRadarLog(`❌ Tarama hatası: ${error.message}`);
    throw error;
  }
}

// Background Cron / Interval Daemon
let scanIntervalTimer = null;
export function startAutoScanDaemon() {
  if (scanIntervalTimer) clearInterval(scanIntervalTimer);
  
  radarState.nextScanTime = new Date(Date.now() + radarState.intervalMinutes * 60 * 1000).toISOString();

  scanIntervalTimer = setInterval(async () => {
    if (radarState.isAutoScanning) {
      addRadarLog('⏰ Otomatik zamanlanmış arka plan taraması tetiklendi.');
      try {
        await executeRadarScan();
      } catch (e) {
        console.error('Oto tarama hatası:', e.message);
      }
    }
  }, radarState.intervalMinutes * 60 * 1000);
}

// GET all competitions with filtering
app.get('/api/competitions', (req, res) => {
  const { q, category, scope, riskReward, format, userStatus } = req.query;
  let items = readData();

  if (q) {
    const query = q.toLowerCase();
    items = items.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.organizer.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.categories.some(c => c.toLowerCase().includes(query))
    );
  }

  if (category && category !== 'All' && category !== 'Tümü') {
    items = items.filter(item => item.categories.includes(category));
  }

  if (scope && scope !== 'All' && scope !== 'Tümü') {
    items = items.filter(item => item.scope.toLowerCase() === scope.toLowerCase());
  }

  if (riskReward && riskReward !== 'All' && riskReward !== 'Tümü') {
    items = items.filter(item => item.riskReward === riskReward);
  }

  if (format && format !== 'All' && format !== 'Tümü') {
    items = items.filter(item => item.format.toLowerCase() === format.toLowerCase());
  }

  if (userStatus && userStatus !== 'All' && userStatus !== 'Tümü') {
    items = items.filter(item => item.userStatus === userStatus);
  }

  items.sort((a, b) => new Date(a.registrationDeadline) - new Date(b.registrationDeadline));
  res.json({ success: true, count: items.length, data: items });
});

// GET Radar Status & Activity Log
app.get('/api/radar/status', (req, res) => {
  res.json({
    success: true,
    data: {
      ...radarState,
      totalCompetitions: readData().length
    }
  });
});

// POST Toggle Auto Scanning or change interval
app.post('/api/radar/toggle-auto', (req, res) => {
  const { enabled, intervalMinutes } = req.body;
  if (enabled !== undefined) radarState.isAutoScanning = Boolean(enabled);
  if (intervalMinutes) {
    radarState.intervalMinutes = parseInt(intervalMinutes);
    startAutoScanDaemon();
  }
  addRadarLog(`⚙️ Radar ayarı güncellendi: Otomatik=${radarState.isAutoScanning}, Aralık=${radarState.intervalMinutes} dk.`);
  res.json({ success: true, data: radarState });
});

// POST Manual Trigger Radar Scan
app.post('/api/radar/scan', async (req, res) => {
  try {
    const result = await executeRadarScan();
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST Import from CSV / Sheet data
app.post('/api/import/csv', (req, res) => {
  const { csvText } = req.body;
  if (!csvText) {
    return res.status(400).json({ success: false, message: 'CSV içeriği bulunamadı.' });
  }

  try {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      return res.status(400).json({ success: false, message: 'En az 1 başlık ve 1 veri satırı gereklidir.' });
    }

    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(delimiter).map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
    
    const items = readData();
    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map(p => p.replace(/^["']|["']$/g, '').trim());
      if (parts.length < 2) continue;

      const row = {};
      headers.forEach((h, idx) => {
        row[h] = parts[idx] || '';
      });

      const title = row['title'] || row['yarışma adı'] || row['yarışma'] || row['etkinlik'] || row['isim'] || parts[0];
      const organizer = row['organizer'] || row['düzenleyen'] || row['kurum'] || parts[1] || 'Belirtilmedi';
      const deadlineRaw = row['deadline'] || row['son başvuru'] || row['tarih'] || parts[2] || '';
      const url = row['url'] || row['link'] || row['website'] || parts[3] || 'https://google.com';
      const categoryRaw = row['kategori'] || row['alan'] || parts[4] || 'Teknoloji';
      const scope = (row['kapsam'] || parts[5] || '').toLowerCase().includes('türkiye') ? 'Türkiye' : 'Global';
      const awards = row['ödül'] || row['awards'] || 'Sertifika ve Ödül';

      if (!title || title.length < 2) continue;

      const exists = items.some(c => c.title.toLowerCase() === title.toLowerCase());
      if (!exists) {
        let deadline = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
        if (deadlineRaw) {
          const parsedD = new Date(deadlineRaw);
          if (!isNaN(parsedD.getTime())) {
            deadline = parsedD.toISOString();
          }
        }

        const newItem = {
          id: 'imported-' + Date.now() + '-' + i,
          title,
          organizer,
          description: `Google Sheet / CSV üzerinden içe aktarıldı. ${row['açıklama'] || ''}`,
          scope,
          riskReward: scope === 'Global' ? 'High Risk - High Reward' : 'Medium Risk',
          format: 'Hybrid',
          location: scope === 'Global' ? 'Online / Global' : 'Türkiye',
          categories: [categoryRaw],
          eligibility: 'Lise / Gençlik',
          awards,
          registrationDeadline: deadline,
          eventDate: deadlineRaw || 'Yakında',
          url,
          status: 'active',
          userStatus: 'none',
          notes: 'Google Sheet içe aktarma listesinden.',
          source: 'Google Sheet CSV',
          verified: true
        };

        items.unshift(newItem);
        importedCount++;
      }
    }

    if (importedCount > 0) {
      writeData(items);
      addRadarLog(`📥 Google Sheet / CSV üzerinden ${importedCount} yeni yarışma başarıyla yüklendi!`);
    }

    res.json({
      success: true,
      importedCount,
      totalCount: items.length,
      message: `${importedCount} adet yarışma listenize başarıyla eklendi!`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'CSV parse hatası: ' + error.message });
  }
});

// POST new competition manually
app.post('/api/competitions', (req, res) => {
  const items = readData();
  const newItem = {
    id: req.body.id || 'comp-' + Date.now(),
    title: req.body.title || 'Başlıksız Etkinlik',
    organizer: req.body.organizer || 'Belirtilmedi',
    description: req.body.description || '',
    scope: req.body.scope || 'Global',
    riskReward: req.body.riskReward || 'High Risk - High Reward',
    format: req.body.format || 'Online',
    location: req.body.location || 'Online',
    categories: req.body.categories || ['Teknoloji'],
    eligibility: req.body.eligibility || 'Lise öğrencileri',
    awards: req.body.awards || 'Ödül ve Sertifika',
    registrationDeadline: req.body.registrationDeadline || new Date().toISOString(),
    eventDate: req.body.eventDate || 'Yakında',
    url: req.body.url || '#',
    status: req.body.status || 'active',
    userStatus: req.body.userStatus || 'none',
    notes: req.body.notes || '',
    source: 'Manuel Eklendi',
    verified: true
  };

  items.unshift(newItem);
  writeData(items);
  addRadarLog(`➕ Manuel yeni etkinlik eklendi: "${newItem.title}"`);
  res.status(201).json({ success: true, data: newItem });
});

// PUT update competition
app.put('/api/competitions/:id', (req, res) => {
  const items = readData();
  const index = items.findIndex(item => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Yarışma bulunamadı' });
  }

  items[index] = { ...items[index], ...req.body };
  writeData(items);
  res.json({ success: true, data: items[index] });
});

// DELETE competition
app.delete('/api/competitions/:id', (req, res) => {
  const items = readData();
  const filtered = items.filter(item => item.id !== req.params.id);

  if (items.length === filtered.length) {
    return res.status(404).json({ success: false, message: 'Yarışma bulunamadı' });
  }

  writeData(filtered);
  res.json({ success: true, message: 'Yarışma silindi' });
});

// POST parse competition URL automatically
app.post('/api/radar/parse-url', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, message: 'Geçerli bir URL giriniz.' });
  }

  try {
    const parsed = await parseCompetitionUrl(url);
    res.json({ success: true, data: parsed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET export iCalendar (.ics) format
app.get('/api/calendar/ics/:id', (req, res) => {
  const items = readData();
  const item = items.find(c => c.id === req.params.id);

  if (!item) {
    return res.status(404).send('Yarışma bulunamadı');
  }

  const deadline = new Date(item.registrationDeadline);
  const formatDateICS = (d) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startStr = formatDateICS(deadline);
  const endStr = formatDateICS(new Date(deadline.getTime() + 60 * 60 * 1000));

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fentek Competition Radar//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${item.id}@competitionradar.local`,
    `DTSTAMP:${formatDateICS(new Date())}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:🚨 SON BAŞVURU: ${item.title}`,
    `DESCRIPTION:${item.description.replace(/\n/g, '\\n')}\\n\\nDetay ve Başvuru: ${item.url}`,
    `LOCATION:${item.location || 'Online'}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P3D',
    'ACTION:DISPLAY',
    `DESCRIPTION:3 Gün Kaldı: ${item.title} Başvurusu Bitiyor!`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${item.id}-deadline.ics"`);
  res.send(icsContent);
});

export default app;
