import Parser from 'rss-parser';
import fetch from 'node-fetch';
import crypto from 'crypto';
import pLimit from 'p-limit';

const FEEDS = [
  { url: 'https://feeds.feedburner.com/ndtvnews-top-stories', category: 'india', source: 'NDTV', language: 'en' },
  { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', category: 'india', source: 'Times of India', language: 'en' },
  { url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', category: 'india', source: 'Hindustan Times', language: 'en' },
  { url: 'https://www.thehindu.com/news/national/?service=rss', category: 'india', source: 'The Hindu', language: 'en' },
  { url: 'https://www.indiatoday.in/rss/1206578', category: 'india', source: 'India Today', language: 'en' },
  { url: 'https://www.eenadu.net/rss/telangana-news.xml', category: 'telangana', source: 'Eenadu', language: 'te' },
  { url: 'https://www.sakshi.com/rss.xml', category: 'telangana', source: 'Sakshi', language: 'te' },
  { url: 'https://www.andhrajyothy.com/rss', category: 'andhra', source: 'Andhra Jyothy', language: 'te' },
  { url: 'https://economictimes.indiatimes.com/rssfeedsdefault.cms', category: 'business', source: 'Economic Times', language: 'en' },
  { url: 'https://www.moneycontrol.com/rss/latestnews.xml', category: 'business', source: 'Moneycontrol', language: 'en' },
  { url: 'https://www.livemint.com/rss/news', category: 'business', source: 'LiveMint', language: 'en' },
  { url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml', category: 'sports', source: 'ESPNCricinfo', language: 'en' },
  { url: 'https://sportstar.thehindu.com/cricket/?service=rss', category: 'sports', source: 'Sportstar', language: 'en' },
  { url: 'https://yourstory.com/feed', category: 'tech', source: 'YourStory', language: 'en' },
  { url: 'https://inc42.com/feed/', category: 'tech', source: 'Inc42', language: 'en' },
  { url: 'https://techcrunch.com/feed/', category: 'tech', source: 'TechCrunch', language: 'en' },
  { url: 'https://www.theverge.com/rss/index.xml', category: 'tech', source: 'The Verge', language: 'en' },
  { url: 'https://wired.com/feed/rss', category: 'tech', source: 'Wired', language: 'en' },
  { url: 'https://feeds.feedburner.com/hackaday/LNRb', category: 'tech', source: 'Hackaday', language: 'en' },
  { url: 'https://dev.to/feed', category: 'tech', source: 'Dev.to', language: 'en' },
  { url: 'https://www.zdnet.com/news/rss.xml', category: 'tech', source: 'ZDNet', language: 'en' },
  { url: 'https://feeds.feedburner.com/ndtvnews-politics-news', category: 'politics', source: 'NDTV Politics', language: 'en' },
  { url: 'https://www.thehindu.com/news/national/andhra-pradesh/?service=rss', category: 'andhra', source: 'The Hindu AP', language: 'en' },
  { url: 'https://www.thehindu.com/news/national/telangana/?service=rss', category: 'telangana', source: 'The Hindu Telangana', language: 'en' }
];

const rssParser = new Parser({
  timeout: 10000,
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure', 'itunes:image']
  }
});

const MAX_PER_FEED = 25;
const MAX_TOTAL = 500;
const TRANSLATE_LIMIT = pLimit(3);
const FETCH_LIMIT = pLimit(2);

function makeId(url, title) {
  return crypto.createHash('md5').update(url || title || Math.random().toString()).digest('hex');
}

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchFullArticle(article) {
  if (article.summary && article.summary.length > 100) return article;
  try {
    const res = await fetch(article.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000
    });
    if (!res.ok) return article;
    const html = await res.text();
    
    const paragraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
    const content = paragraphs.slice(0, 15).join(' ');
    const summary = cleanText(content).slice(0, 3000);
    
    let image = article.image;
    if (!image) {
      const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      image = ogMatch?.[1] || null;
    }

    return { ...article, summary: summary || article.summary, image: image || article.image };
  } catch (e) {
    return article;
  }
}

async function translateToTelugu(text, from = 'en') {
  if (!text || text.trim() === '') return '';
  if (from === 'te') return text;
  const cleanTxt = text.trim().slice(0, 4000);
  try {
    const encoded = encodeURIComponent(cleanTxt);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=te&dt=t&q=${encoded}`;
    const res = await fetch(url, { timeout: 8000 });
    const data = await res.json();
    return data[0]?.map(p => p[0])?.filter(Boolean)?.join('') || cleanTxt;
  } catch {
    return cleanTxt;
  }
}

async function translateArticle(article, index = 0) {
  if (article.language === 'te') {
    return { ...article, title_te: article.title, summary_te: article.summary, translated: false };
  }
  const [title_te, summary_te] = await Promise.all([
    translateToTelugu(article.title),
    translateToTelugu(article.summary)
  ]);
  return { ...article, title_te, summary_te, translated: true };
}

export async function handler(event, context) {
  try {
    const admin = await import('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
        databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
      });
    }
    const db = admin.database();

    const result = await Promise.all(FEEDS.map(async feed => {
      try {
        const feedData = await rssParser.parseURL(feed.url);
        return feedData.items.slice(0, MAX_PER_FEED).map(item => ({
          id: makeId(item.link, item.title),
          title: cleanText(item.title),
          summary: cleanText(item.contentSnippet || item.summary || ''),
          url: item.link || '',
          image: null,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          source: feed.source,
          category: feed.category,
          language: feed.language
        }));
      } catch { return []; }
    }));

    let articles = [].concat(...result);
    const seen = new Set();
    articles = articles.filter(a => seen.has(a.id) ? false : seen.add(a.id));

    const enriched = await Promise.all(articles.map(a => FETCH_LIMIT(() => fetchFullArticle(a))));
    const translated = await Promise.all(enriched.map((a, i) => TRANSLATE_LIMIT(() => translateArticle(a, i))));

    const ref = db.ref('news');
    const snapshot = await ref.once('value');
    const existing = snapshot.val() || {};
    const merged = { ...existing };
    translated.forEach(a => { merged[a.id] = a; });
    
    let allArticles = Object.values(merged);
    allArticles.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    allArticles = allArticles.slice(0, MAX_TOTAL);
    
    const finalUpdate = {};
    allArticles.forEach(a => { finalUpdate[a.id] = a; });
    await ref.set(finalUpdate);

    await db.ref('meta/info').set({
      last_updated: new Date().toISOString(),
      total_articles: allArticles.length,
      categories: [...new Set(allArticles.map(a => a.category))],
      sources: [...new Set(allArticles.map(a => a.source))]
    });

    return { statusCode: 200, body: JSON.stringify({ success: true, count: allArticles.length }) };
  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
