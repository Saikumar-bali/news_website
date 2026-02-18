// ============================================================
//  sources.js — All free India RSS feeds (no API key needed)
// ============================================================

const FEEDS = [

  // ── INDIA GENERAL ─────────────────────────────────────────
  {
    url: 'https://feeds.feedburner.com/ndtvnews-top-stories',
    category: 'india',
    source: 'NDTV',
    language: 'en'
  },
  {
    url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
    category: 'india',
    source: 'Times of India',
    language: 'en'
  },
  {
    url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
    category: 'india',
    source: 'Hindustan Times',
    language: 'en'
  },
  {
    url: 'https://www.thehindu.com/news/national/?service=rss',
    category: 'india',
    source: 'The Hindu',
    language: 'en'
  },
  {
    url: 'https://feeds.feedburner.com/ndtvnews-india-news',
    category: 'india',
    source: 'NDTV India',
    language: 'en'
  },
  {
    url: 'https://www.indiatoday.in/rss/1206578',
    category: 'india',
    source: 'India Today',
    language: 'en'
  },

  // ── ANDHRA PRADESH & TELANGANA (Telugu sources — no translation needed) ──
  {
    url: 'https://www.eenadu.net/rss/telangana-news.xml',
    category: 'telangana',
    source: 'Eenadu',
    language: 'te'              // Already Telugu — skip translation
  },
  {
    url: 'https://www.sakshi.com/rss.xml',
    category: 'telangana',
    source: 'Sakshi',
    language: 'te'
  },
  {
    url: 'https://www.andhrajyothy.com/rss',
    category: 'andhra',
    source: 'Andhra Jyothy',
    language: 'te'
  },

  // ── BUSINESS & FINANCE ────────────────────────────────────
  {
    url: 'https://economictimes.indiatimes.com/rssfeedsdefault.cms',
    category: 'business',
    source: 'Economic Times',
    language: 'en'
  },
  {
    url: 'https://www.moneycontrol.com/rss/latestnews.xml',
    category: 'business',
    source: 'Moneycontrol',
    language: 'en'
  },
  {
    url: 'https://www.livemint.com/rss/news',
    category: 'business',
    source: 'LiveMint',
    language: 'en'
  },

  // ── SPORTS / CRICKET ──────────────────────────────────────
  {
    url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml',
    category: 'sports',
    source: 'ESPNCricinfo',
    language: 'en'
  },
  {
    url: 'https://sportstar.thehindu.com/cricket/?service=rss',
    category: 'sports',
    source: 'Sportstar',
    language: 'en'
  },

  // ── TECHNOLOGY & STARTUPS ─────────────────────────────────
  {
    url: 'https://yourstory.com/feed',
    category: 'tech',
    source: 'YourStory',
    language: 'en'
  },
  {
    url: 'https://inc42.com/feed/',
    category: 'tech',
    source: 'Inc42',
    language: 'en'
  },

  // ── POLITICS ──────────────────────────────────────────────
  {
    url: 'https://feeds.feedburner.com/ndtvnews-politics-news',
    category: 'politics',
    source: 'NDTV Politics',
    language: 'en'
  },
  {
    url: 'https://www.thehindu.com/news/national/andhra-pradesh/?service=rss',
    category: 'andhra',
    source: 'The Hindu AP',
    language: 'en'
  },
  {
    url: 'https://www.thehindu.com/news/national/telangana/?service=rss',
    category: 'telangana',
    source: 'The Hindu Telangana',
    language: 'en'
  }

];

module.exports = FEEDS;
