import { app, startAutoScanDaemon, executeRadarScan } from './app.js';

const PORT = process.env.PORT || 5000;

startAutoScanDaemon();

app.listen(PORT, () => {
  console.log(`🚀 Radar Backend API çalışıyor: http://localhost:${PORT}`);
  setTimeout(() => {
    executeRadarScan().catch(err => console.log('Başlangıç taraması:', err.message));
  }, 2000);
});
