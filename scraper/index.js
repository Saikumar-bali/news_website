// ============================================================
//  index.js — Main entry point
//  1. Fetch all India RSS feeds
//  2. Translate titles + summaries to Telugu (free)
//  3. Write JSON files to /data/
//  4. GitHub Actions commits them automatically
// ============================================================

const Parser  = require('rss-parser');
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');
const pLimit  = require('p-limit');
const fetch   = require('node-fetch');

const FEEDS              = require('./sources');
const { translateArticle } = require('./translator');
const { initFirebase, pushToFirebase, pushMeta, closeFirebase } = require('./firebase');

// ── Anti-blocking: Rotate User-Agents ───────────────────────────
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
];

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ── Anti-blocking: Rate limiter ───────────────────────────────
const FETCH_LIMIT = pLimit(2); // Only 2 concurrent article fetches
const fetchDelay = 2500; // 2.5 seconds between requests per domain

const domainLastFetch = new Map();

async function rateLimitForDomain(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const now = Date.now();
    const lastFetch = domainLastFetch.get(domain) || 0;
    const waitTime = Math.max(0, fetchDelay - (now - lastFetch));
    
    if (waitTime > 0) {
      console.log(`  ⏳ Waiting ${waitTime/1000}s for ${domain}...`);
      await new Promise(r => setTimeout(r, waitTime));
    }
    domainLastFetch.set(domain, Date.now());
  } catch (e) {}
}

// ── Fetch full article content ──────────────────────────────────
async function fetchFullArticle(article) {
  if (article.summary && article.summary.length > 50) {
    return article; // Already has summary, skip
  }
  
  try {
    await rateLimitForDomain(article.url);
    
    const res = await fetch(article.url, {
      headers: {
        'User-Agent': getRandomUA(),
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const html = await res.text();
    
    // Extract article content - try multiple selectors
    const contentPatterns = [
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]*class="[^"]*article[-_]?body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*story[-_]?content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*content[-_]?body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*id="[^"]*article[-_]?body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*td-post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i
    ];
    
    let content = '';
    for (const pattern of contentPatterns) {
      const match = html.match(pattern);
      if (match) {
        content = match[1];
        break;
      }
    }
    
    if (!content) {
      // Fallback: get all paragraphs
      const paragraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
      content = paragraphs.slice(0, 15).join(' '); // Increase to 15 paragraphs
    }
    
    // Extract text from HTML
    const extractedSummary = cleanText(content).slice(0, 3000); // Increase to 3000 chars for "complete" feel
    
    // Try to find image in meta tags if not already present
    let image = article.image;
    if (!image) {
      const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
      image = (ogImageMatch?.[1] || twitterImageMatch?.[1]) || null;
    }

    if (extractedSummary.length > 20) {
      return { ...article, summary: extractedSummary, image: image || article.image };
    }
  } catch (err) {
    console.warn(`  ⚠️ Failed to fetch full article: ${article.url.slice(0, 50)}... (${err.message})`);
  }
  
  return article;
}

// ── RSS Parser setup ─────────────────────────────────────────
const rssParser = new Parser({
  timeout: 10000,
  customFields: {
    item: [
      'media:content',
      'media:thumbnail',
      'enclosure',
      'itunes:image'
    ]
  }
});

// ── Config ───────────────────────────────────────────────────
const DATA_DIR         = path.join(__dirname, '..', 'data');
const MAX_PER_FEED     = 25;    // articles per feed
const MAX_TOTAL        = 500;   // articles in news.json
const MAX_PER_CATEGORY = 100;   // articles per category file
const TRANSLATE_LIMIT  = pLimit(3); // 3 concurrent translations max
const FETCH_FULL_ARTICLES = true; // Enable full article fetching
const USE_FIREBASE     = true;  // Push to Firebase instead of local files

// ── Helpers ──────────────────────────────────────────────────
function makeId(url, title) {
  return crypto.createHash('md5').update(url || title || Math.random().toString()).digest('hex');
}

function extractImage(item) {
  return (
    item['media:content']?.$?.url     ||
    item['media:thumbnail']?.$?.url   ||
    item.enclosure?.url               ||
    item['itunes:image']?.$?.href     ||
    extractImgFromHtml(item.content || item['content:encoded'] || '')
  );
}

function extractImgFromHtml(html) {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || null;
}

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, '')      // strip HTML tags
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/\s+/g,    ' ')
    .trim();
}

function istTime() {
  return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

// ── Step 1: Fetch all RSS feeds ───────────────────────────────
async function fetchAllFeeds() {
  const articles = [];

  for (const feed of FEEDS) {
    try {
      console.log(`📡 Fetching: ${feed.source}`);
      const result = await rssParser.parseURL(feed.url);

      for (const item of result.items.slice(0, MAX_PER_FEED)) {
        const title   = cleanText(item.title);
        const summary = cleanText(item.contentSnippet || item.summary || '');
        const url     = item.link || '';

        if (!title) continue;

        articles.push({
          id:           makeId(url, title),
          title,
          summary,
          url,
          image:        extractImage(item) || null,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          source:       feed.source,
          category:     feed.category,
          language:     feed.language || 'en',
          // Telugu fields filled in Step 2
          title_te:     '',
          summary_te:   '',
          translated:   false
        });
      }

      console.log(`  ✅ ${feed.source}: fetched ${result.items.length} items`);
    } catch (err) {
      console.error(`  ❌ ${feed.source} FAILED: ${err.message}`);
    }
  }

  return articles;
}

// ── Step 2: Remove duplicates ─────────────────────────────────
function deduplicateArticles(articles) {
  const seen = new Set();
  return articles.filter(a => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}

// ── Step 3: Translate all articles to Telugu ──────────────────
async function translateAll(articles) {
  console.log(`\n🔤 Translating ${articles.length} articles to Telugu...`);

  const translated = await Promise.all(
    articles.map((article, i) =>
      TRANSLATE_LIMIT(() => translateArticle(article, i))
    )
  );

  const successCount = translated.filter(a => a.translated).length;
  console.log(`  ✅ Translated: ${successCount} | Already Telugu: ${articles.length - successCount}`);

  return translated;
}

// ── Step 4: Write JSON files ──────────────────────────────────
function writeJsonFiles(articles) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const now = new Date().toISOString();

  // Sort newest first
  articles.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

  // ── news.json (all categories, latest 100) ──
  const newsJson = {
    updated_at:     now,
    updated_at_IST: istTime(),
    count:          Math.min(articles.length, MAX_TOTAL),
    articles:       articles.slice(0, MAX_TOTAL)
  };
  writeFile('news.json', newsJson);

  // ── Per-category JSON files ──
  const categories = [...new Set(articles.map(a => a.category))];
  for (const cat of categories) {
    const catArticles = articles.filter(a => a.category === cat).slice(0, MAX_PER_CATEGORY);
    writeFile(`${cat}.json`, {
      updated_at:     now,
      updated_at_IST: istTime(),
      category:       cat,
      count:          catArticles.length,
      articles:       catArticles
    });
  }

  // ── meta.json ──
  const sources = [...new Set(articles.map(a => a.source))];
  const meta = {
    last_updated:     now,
    last_updated_IST: istTime(),
    total_articles:   articles.length,
    categories,
    sources,
    feeds_count:      FEEDS.length,
    data_files:       ['news.json', ...categories.map(c => `${c}.json`)]
  };
  writeFile('meta.json', meta);

  console.log(`\n📁 Written files:`);
  console.log(`   data/news.json         (${newsJson.count} articles)`);
  categories.forEach(c => console.log(`   data/${c}.json`));
  console.log(`   data/meta.json`);
}

function writeFile(filename, data) {
  fs.writeFileSync(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2),
    'utf8'
  );
}

// ── MAIN ─────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('📰  Telugu News Scraper');
  console.log(`🕐  ${istTime()} IST`);
  console.log('═══════════════════════════════════════════════\n');

  // 1. Fetch
  const raw = await fetchAllFeeds();
  console.log(`\n📊 Total fetched: ${raw.length} articles`);

  // 2. Deduplicate
  const unique = deduplicateArticles(raw);
  console.log(`🔁 After dedup:  ${unique.length} unique articles`);

  // 3. Fetch full articles for missing summaries
  let articlesToTranslate = unique;
  if (FETCH_FULL_ARTICLES) {
    console.log(`\n📥 Fetching full articles for missing summaries...`);
    const emptySummary = unique.filter(a => !a.summary || a.summary.length < 50);
    console.log(`  Need to fetch: ${emptySummary.length} articles`);
    
    const withFullContent = await Promise.all(
      emptySummary.map((article, i) => 
        FETCH_LIMIT(() => fetchFullArticle(article))
      )
    );
    
    // Merge back
    articlesToTranslate = unique.map(a => {
      const filled = withFullContent.find(f => f.id === a.id);
      return filled && filled.summary !== a.summary ? filled : a;
    });
    
    const nowHasSummary = articlesToTranslate.filter(a => a.summary && a.summary.length > 50).length;
    console.log(`  ✅ Full content fetched: ${nowHasSummary} articles now have summaries`);
  }

  // 4. Translate to Telugu
  const translated = await translateAll(articlesToTranslate);

  // 5. Save data (Firebase AND local)
  if (USE_FIREBASE) {
    console.log('\n🔥 Pushing to Firebase...');
    initFirebase();
    
    // Sort and limit
    translated.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    const articles = translated.slice(0, MAX_TOTAL);
    
    await pushToFirebase(articles);
    
    // Push meta
    const categories = [...new Set(articles.map(a => a.category))];
    const sources = [...new Set(articles.map(a => a.source))];
    const meta = {
      last_updated: new Date().toISOString(),
      last_updated_IST: istTime(),
      total_articles: articles.length,
      categories,
      sources,
      feeds_count: FEEDS.length
    };
    await pushMeta(meta);
    
    console.log('✅ Firebase push complete!');
  }

  // Always write local JSON files as well for the frontend
  writeJsonFiles(translated);

  console.log('\n═══════════════════════════════════════════════');
  console.log('✅  Scraper finished successfully!');
  console.log('═══════════════════════════════════════════════');

  await closeFirebase();
  process.exit(0);
}

main().catch(async err => {
  console.error('💥 Fatal error:', err);
  await closeFirebase();
  process.exit(1);
});
