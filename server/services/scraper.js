import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Radar Scanner Service
 * Continuously discovers hackathons and student competitions from real APIs & sources
 */

// Live Devpost API fetcher (multiple pages)
export async function scanDevpost() {
  const allHackathons = [];
  try {
    for (let page = 1; page <= 4; page++) {
      const url = `https://devpost.com/api/hackathons?page=${page}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        timeout: 8000
      });

      const items = response.data?.hackathons || [];
      if (!items.length) break;

      for (const item of items) {
        // Clean prize text
        let prizeClean = item.prize_amount ? item.prize_amount.replace(/<[^>]*>/g, '').trim() : '';
        if (!prizeClean) prizeClean = '$10.000+ Ödül ve Bulut Kredisi';

        // Extract themes
        const categories = [];
        if (item.themes && Array.isArray(item.themes)) {
          for (const t of item.themes) {
            const name = t.name.toLowerCase();
            if (name.includes('ai') || name.includes('machine learning')) categories.push('AI');
            if (name.includes('web') || name.includes('open') || name.includes('dev')) categories.push('Yazılım');
            if (name.includes('social') || name.includes('good') || name.includes('education')) categories.push('Sosyal İnovasyon');
            if (name.includes('health') || name.includes('life')) categories.push('Biyoteknoloji');
            if (name.includes('climate') || name.includes('green') || name.includes('energy')) categories.push('İklim');
          }
        }
        if (categories.length === 0) categories.push('Yazılım', 'AI');

        // Estimate deadline from time_left_to_submission or submission_period_dates
        let deadline = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
        if (item.time_left_to_submission) {
          const matchDays = item.time_left_to_submission.match(/(\d+)\s*day/i);
          const matchHours = item.time_left_to_submission.match(/(\d+)\s*hour/i);
          if (matchDays) {
            deadline = new Date(Date.now() + parseInt(matchDays[1]) * 24 * 60 * 60 * 1000).toISOString();
          } else if (matchHours) {
            deadline = new Date(Date.now() + parseInt(matchHours[1]) * 60 * 60 * 1000).toISOString();
          }
        }

        const isOnline = item.displayed_location?.location?.toLowerCase().includes('online') || !item.displayed_location?.location;

        allHackathons.push({
          id: 'devpost-' + item.id,
          title: item.title,
          organizer: item.organization_name || 'Global Tech Sponsor',
          description: `Devpost küresel online hackathonu. ${item.registrations_count ? item.registrations_count.toLocaleString() + ' kayıtlı yarışmacı.' : ''} ${item.submission_period_dates ? 'Tarihler: ' + item.submission_period_dates : ''}`,
          scope: 'Global',
          riskReward: 'High Risk - High Reward',
          format: isOnline ? 'Online' : 'Hybrid',
          location: item.displayed_location?.location || 'Online',
          categories: Array.from(new Set(categories)),
          eligibility: 'Lise ve üniversite seviyesinde açık global katılım (13+ yaş)',
          awards: prizeClean,
          registrationDeadline: deadline,
          eventDate: item.submission_period_dates || 'Aktif Yarışma',
          url: item.url.startsWith('http') ? item.url : `https://${item.url}`,
          status: 'active',
          userStatus: 'none',
          notes: 'Devpost üzerinden doğrudan kayıt ve proje submission gerektirir.',
          source: 'Devpost Canlı Radar',
          verified: true
        });
      }
    }

    return allHackathons;
  } catch (error) {
    console.warn('Devpost API çekme uyarısı:', error.message);
    return allHackathons;
  }
}

/**
 * Smart URL Parser / Scraper
 */
export async function parseCompetitionUrl(targetUrl) {
  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const title = $('meta[property="og:title"]').attr('content') || $('title').text().trim() || 'Yeni Keşfedilen Etkinlik';
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || $('p').first().text().trim() || 'Açıklama web sitesinde belirtilmiştir.';
    
    const textContent = $('body').text().toLowerCase();
    
    const categories = [];
    if (textContent.includes('yapay zeka') || textContent.includes('ai') || textContent.includes('machine learning')) categories.push('AI');
    if (textContent.includes('yazılım') || textContent.includes('software') || textContent.includes('hackathon') || textContent.includes('kod')) categories.push('Yazılım');
    if (textContent.includes('girişim') || textContent.includes('startup') || textContent.includes('business') || textContent.includes('ideathon')) categories.push('Girişimcilik');
    if (textContent.includes('iklim') || textContent.includes('climate') || textContent.includes('sürdürülebilirlik') || textContent.includes('green')) categories.push('İklim');
    if (textContent.includes('uzay') || textContent.includes('space') || textContent.includes('nasa') || textContent.includes('havacılık')) categories.push('Uzay');
    if (textContent.includes('biyo') || textContent.includes('biotech') || textContent.includes('sağlık') || textContent.includes('health')) categories.push('Biyoteknoloji');
    if (textContent.includes('robot') || textContent.includes('mekatronik') || textContent.includes('hardware')) categories.push('Robotik');
    if (categories.length === 0) categories.push('Teknoloji');

    const isTurkish = textContent.includes('türkiye') || targetUrl.includes('.tr') || textContent.includes('lise') || textContent.includes('üniversite');
    const scope = isTurkish ? 'Türkiye' : 'Global';
    const riskReward = scope === 'Global' ? 'High Risk - High Reward' : 'Medium Risk';

    let format = 'Online';
    if (textContent.includes('yüz yüze') || textContent.includes('kampüs') || textContent.includes('in-person')) {
      format = 'Yüz Yüze';
    } else if (textContent.includes('hibrit') || textContent.includes('hybrid')) {
      format = 'Hybrid';
    }

    return {
      id: 'parsed-' + Date.now(),
      title: title.replace(/(\r\n|\n|\r)/gm, " ").trim(),
      organizer: new URL(targetUrl).hostname.replace('www.', ''),
      description: description.slice(0, 300) + '...',
      scope,
      riskReward,
      format,
      location: format === 'Online' ? 'Online' : 'Belirtilen Lokasyon',
      categories: Array.from(new Set(categories)),
      eligibility: 'Lise ve gençlik kategorisi (Web sitesini teyit ediniz)',
      awards: 'Sertifika, Ödül ve Prestij',
      registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      eventDate: 'Detaylar resmi sitede',
      url: targetUrl,
      status: 'active',
      userStatus: 'none',
      notes: 'Otomatik AI/Web Parser tarafından algılandı.',
      source: 'Radar URL Algılayıcı',
      verified: false
    };
  } catch (error) {
    throw new Error('Web sayfası okunamadı: ' + error.message);
  }
}
