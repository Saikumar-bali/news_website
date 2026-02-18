# 📰 తాజా వార్తలు — Telugu News Website

> India news scraped every 5 minutes, translated to Telugu, served as a static website — **100% FREE**

---

## 🏗️ Architecture

```
GitHub Actions (cron every 5 min — FREE on public repo)
       ↓
scraper/index.js (fetches 17 Indian RSS feeds)
       ↓
translator.js (Google Translate → Telugu, no API key)
       ↓
data/*.json (committed back to repo)
       ↓
GitHub Pages (static website reads JSON)
```

---

## 📁 Folder Structure

```
news_website_and_app/
├── .github/
│   └── workflows/
│       └── scrape.yml        ← Cron job (every 5 minutes)
├── scraper/
│   ├── index.js              ← Main scraper
│   ├── sources.js            ← All RSS feed URLs
│   ├── translator.js         ← Telugu translation (free)
│   └── package.json
├── data/                     ← AUTO-UPDATED by cron
│   ├── news.json             ← All latest news
│   ├── india.json
│   ├── telangana.json
│   ├── andhra.json
│   ├── business.json
│   ├── sports.json
│   ├── tech.json
│   ├── politics.json
│   └── meta.json
├── public/
│   └── index.html            ← Telugu news website
└── index.html                ← GitHub Pages entry point
```

---

## 🚀 Deployment (Step by Step)

### Step 1 — Create GitHub Repo (PUBLIC)
1. Go to https://github.com/new
2. Name it: `telugu-news` (or anything)
3. Set to **Public** ← IMPORTANT for free unlimited Actions
4. Click "Create repository"

### Step 2 — Push This Project
```bash
cd D:\news_website_and_app
git init
git add .
git commit -m "🚀 Initial commit — Telugu News App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/telugu-news.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. Go to your repo on GitHub
2. Settings → Pages
3. Source: **Deploy from a branch**
4. Branch: `main` → `/ (root)`
5. Save

Your website will be live at:
```
https://YOUR_USERNAME.github.io/telugu-news/
```

### Step 4 — GitHub Actions will auto-run!
- Go to **Actions** tab in your repo
- You'll see "Telugu News Scraper" workflow
- It runs automatically every 5 minutes
- Each run: fetches news → translates to Telugu → commits to `/data/`

---

## 📰 News Sources (Free RSS — No API Key)

| Source | Category | Language |
|--------|----------|----------|
| NDTV | India | English → Telugu |
| Times of India | India | English → Telugu |
| Hindustan Times | India | English → Telugu |
| The Hindu | India, AP, Telangana | English → Telugu |
| India Today | India | English → Telugu |
| Eenadu | Telangana | Telugu ✅ |
| Sakshi | Telangana | Telugu ✅ |
| Andhra Jyothy | Andhra | Telugu ✅ |
| Economic Times | Business | English → Telugu |
| Moneycontrol | Business | English → Telugu |
| LiveMint | Business | English → Telugu |
| ESPNCricinfo | Sports | English → Telugu |
| Sportstar | Sports | English → Telugu |
| YourStory | Tech | English → Telugu |
| Inc42 | Tech | English → Telugu |
| NDTV Politics | Politics | English → Telugu |

---

## 🔤 Translation

- **Primary**: Google Translate unofficial API (free, no key needed)
- **Fallback**: MyMemory API (free, 1000 words/day)
- Telugu RSS sources (Eenadu, Sakshi, Andhra Jyothy) are **NOT translated** — used as-is

---

## 💰 Cost

| Service | Cost |
|---------|------|
| GitHub (public repo) | ₹0 |
| GitHub Actions (public) | ₹0 (Unlimited) |
| GitHub Pages | ₹0 |
| Google Translate (unofficial) | ₹0 |
| **Total** | **₹0/month** |

---

## 📊 JSON API Format

Your data files are accessible at:
```
https://YOUR_USERNAME.github.io/telugu-news/data/news.json
https://YOUR_USERNAME.github.io/telugu-news/data/india.json
https://YOUR_USERNAME.github.io/telugu-news/data/telangana.json
https://YOUR_USERNAME.github.io/telugu-news/data/meta.json
```

### Article Object:
```json
{
  "id": "md5hash",
  "title": "English headline",
  "title_te": "తెలుగు శీర్షిక",
  "summary": "English summary",
  "summary_te": "తెలుగు సారాంశం",
  "url": "https://source.com/article",
  "image": "https://cdn.source.com/image.jpg",
  "published_at": "2026-02-18T10:30:00.000Z",
  "source": "NDTV",
  "category": "india",
  "translated": true
}
```

---

## ⚠️ Notes

- GitHub Actions minimum cron interval is **5 minutes** — perfectly matched
- If GitHub Actions usage hits limits (unlikely on public repo), change cron to `*/10 * * * *`
- The website auto-refreshes every 5 minutes in the browser too
- Images are served directly from news sources (no storage needed)
