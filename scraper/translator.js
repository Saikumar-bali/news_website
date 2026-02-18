// ============================================================
//  translator.js — Free Telugu translation
//  Uses Google Translate unofficial endpoint (no API key needed)
//  Fallback: MyMemory free API (1000 words/day)
// ============================================================

const fetch = require('node-fetch');

// Delay helper to avoid rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Translate text to Telugu using Google Translate (free, no key)
 * @param {string} text - English text to translate
 * @param {string} from - source language code (default: 'en')
 * @returns {string} - Telugu translated text
 */
async function translateToTelugu(text, from = 'en') {
  if (!text || text.trim() === '') return '';

  // If already Telugu, return as is
  if (from === 'te') return text;

  // Clean and limit text (Google has ~5000 char limit per request)
  const cleanText = text.trim().slice(0, 1000);

  try {
    // ── PRIMARY: Google Translate unofficial API ──────────────
    const encoded = encodeURIComponent(cleanText);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=te&dt=t&q=${encoded}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 8000
    });

    if (!res.ok) throw new Error(`Google Translate HTTP ${res.status}`);

    const data = await res.json();

    // Google returns nested arrays: [[["translated","original",null,null,10]],...]
    const translated = data[0]
      .map(part => part[0])
      .filter(Boolean)
      .join('');

    if (translated) return translated;
    throw new Error('Empty response from Google Translate');

  } catch (err) {
    console.warn(`⚠️ Google Translate failed: ${err.message} — trying MyMemory...`);

    // ── FALLBACK: MyMemory free API ───────────────────────────
    try {
      await delay(500);
      const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText.slice(0, 500))}&langpair=${from}|te`;
      const mmRes = await fetch(mmUrl, { timeout: 8000 });
      const mmData = await mmRes.json();

      if (mmData.responseStatus === 200 && mmData.responseData?.translatedText) {
        return mmData.responseData.translatedText;
      }
      throw new Error('MyMemory also failed');
    } catch (fallbackErr) {
      console.error(`❌ All translators failed for: "${cleanText.slice(0, 50)}..."`);
      return cleanText; // Return original if both fail
    }
  }
}

/**
 * Translate both title and summary of an article
 * Adds small delay between calls to respect rate limits
 */
async function translateArticle(article, index = 0) {
  // Already Telugu — skip
  if (article.language === 'te') {
    return {
      ...article,
      title_te: article.title,
      summary_te: article.summary,
      translated: false
    };
  }

  // Small stagger delay to avoid hammering the API
  await delay(index * 150);

  const [title_te, summary_te] = await Promise.all([
    translateToTelugu(article.title),
    translateToTelugu(article.summary)
  ]);

  return {
    ...article,
    title_te,
    summary_te,
    translated: true
  };
}

module.exports = { translateToTelugu, translateArticle };
