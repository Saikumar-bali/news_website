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

const FEEDS              = require('./sources');
const { translateArticle } = require('./translator');

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
const MAX_PER_FEED     = 15;    // articles per feed
const MAX_TOTAL        = 100;   // articles in news.json
const MAX_PER_CATEGORY = 50;    // articles per category file
const TRANSLATE_LIMIT  = pLimit(3); // 3 concurrent translations max

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

  // 3. Translate to Telugu
  const translated = await translateAll(unique);

  // 4. Write JSON
  writeJsonFiles(translated);

  console.log('\n═══════════════════════════════════════════════');
  console.log('✅  Scraper finished successfully!');
  console.log('═══════════════════════════════════════════════');
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
