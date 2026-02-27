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

const MAX_PER_FEED = 15;
const MAX_TOTAL = 100;
const TRANSLATE_LIMIT = pLimit(3);

function makeId(url, title) {
  return crypto.createHash('md5').update(url || title || Math.random().toString()).digest('hex');
}

function extractImage(item) {
  return (
    item['media:content']?.$?.url ||
    item['media:thumbnail']?.$?.url ||
    item.enclosure?.url ||
    item['itunes:image']?.$?.href ||
    extractImgFromHtml(item.content || item['content:encoded'] || '')
  );
}

function extractImgFromHtml(html) {
  const match = html?.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || null;
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

async function translateToTelugu(text, from = 'en') {
  if (!text || text.trim() === '') return '';
  if (from === 'te') return text;

  const cleanTxt = text.trim().slice(0, 1000);

  try {
    const encoded = encodeURIComponent(cleanTxt);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=te&dt=t&q=${encoded}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 8000
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translated = data[0]?.map(part => part[0])?.filter(Boolean)?.join('') || '';
    if (translated) return translated;
    throw new Error('Empty response');
  } catch (err) {
    console.warn('Google Translate failed, trying MyMemory:', err.message);
    try {
      const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanTxt.slice(0, 500))}&langpair=${from}|te`;
      const mmRes = await fetch(mmUrl, { timeout: 8000 });
      const mmData = await mmRes.json();
      if (mmData.responseStatus === 200 && mmData.responseData?.translatedText) {
        return mmData.responseData.translatedText;
      }
    } catch {}
    return cleanTxt;
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateArticle(article, index = 0) {
  if (article.language === 'te') {
    return { ...article, title_te: article.title, summary_te: article.summary, translated: false };
  }

  await delay(index * 150);
  const [title_te, summary_te] = await Promise.all([
    translateToTelugu(article.title),
    translateToTelugu(article.summary)
  ]);

  return { ...article, title_te, summary_te, translated: true };
}

async function fetchAllFeeds() {
  const articles = [];

  for (const feed of FEEDS) {
    try {
      console.log(`Fetching: ${feed.source}`);
      const result = await rssParser.parseURL(feed.url);

      for (const item of result.items.slice(0, MAX_PER_FEED)) {
        const title = cleanText(item.title);
        const summary = cleanText(item.contentSnippet || item.summary || '');
        const url = item.link || '';

        if (!title) continue;

        articles.push({
          id: makeId(url, title),
          title,
          summary,
          url,
          image: extractImage(item) || null,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          source: feed.source,
          category: feed.category,
          language: feed.language,
          title_te: '',
          summary_te: '',
          translated: false
        });
      }
    } catch (err) {
      console.error(`${feed.source} FAILED: ${err.message}`);
    }
  }

  return articles;
}

function deduplicateArticles(articles) {
  const seen = new Set();
  return articles.filter(a => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}

export async function handler(event, context) {
  try {
    console.log('Starting scraper...');
    
    const admin = await import('firebase-admin');
    if (!admin.apps.length) {
      await admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
      });
    }
    const db = admin.firestore();

    const raw = await fetchAllFeeds();
    const unique = deduplicateArticles(raw);
    
    console.log(`Translating ${unique.length} articles...`);
    const translated = await Promise.all(
      unique.map((article, i) => TRANSLATE_LIMIT(() => translateArticle(article, i)))
    );

    translated.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    const finalArticles = translated.slice(0, MAX_TOTAL);

    const batch = db.batch();
    const newsRef = db.collection('news');
    
    const existingSnapshot = await newsRef.get();
    existingSnapshot.forEach(doc => batch.delete(doc.ref));
    
    for (const article of finalArticles) {
      batch.set(newsRef.doc(article.id), article);
    }

    const metaRef = db.collection('meta').doc('stats');
    batch.set(metaRef, {
      last_updated: new Date().toISOString(),
      total_articles: finalArticles.length,
      categories: [...new Set(finalArticles.map(a => a.category))],
      sources: [...new Set(finalArticles.map(a => a.source))]
    });

    await batch.commit();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, count: finalArticles.length })
    };
  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
