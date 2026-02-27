# 📰 Telugu News App - Modern Stack

> News scraped every 5 minutes, translated to Telugu — **100% FREE**

---

## 🏗️ Architecture

```
Netlify Scheduled Function (every 5 min — FREE)
       ↓
scraper → fetches 18 Indian RSS feeds
       ↓
translator → Google Translate → Telugu (free)
       ↓
Firebase Firestore (stores articles)
       ↓
Svelte + Vite (frontend reads from Firestore)
       ↓
Netlify (hosting)
```

---

## 🚀 Setup (Step by Step)

### Step 1 — Create Firebase Project
1. Go to https://console.firebase.google.com
2. Create new project
3. Enable **Firestore Database** (start in test mode)
4. Go to Project Settings → Service Accounts
5. Generate new private key → copy JSON

### Step 2 — Create Netlify Site
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Create site from this folder
netlify init
```

### Step 3 — Set Environment Variables
In Netlify Dashboard → Site settings → Environment variables:

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:...:web:...
```

Also add `FIREBASE_SERVICE_ACCOUNT` with the entire JSON from Step 1.

### Step 4 — Deploy
```bash
# Push to GitHub, then connect to Netlify
# OR deploy directly:
netlify deploy --prod
```

---

## 📁 New Project Structure

```
telugu-news-app/
├── src/
│   ├── components/
│   │   ├── NewsCard.svelte
│   │   ├── CategoryFilter.svelte
│   │   ├── Header.svelte
│   │   └── Loading.svelte
│   ├── App.svelte
│   ├── main.js
│   └── firebase.js
├── functions/
│   ├── scrape.js         ← Main scraper logic
│   ├── scheduled-scrape.js
│   └── package.json
├── netlify.toml
├── package.json
├── vite.config.js
└── svelte.config.js
```

---

## 💰 Cost

| Service | Free Tier | Cost |
|---------|-----------|------|
| Firebase Firestore | 50K reads/day | ₹0 |
| Netlify Functions | 125K req/month | ₹0 |
| Netlify Hosting | 100GB/month | ₹0 |
| Google Translate | 500K chars/month | ₹0 |
| **Total** | | **₹0/month** |

---

## 🔧 Development

```bash
# Install dependencies
npm install
cd functions && npm install && cd ..

# Run locally
netlify dev
```

---

## 📱 Features

- Real-time news from 18 Indian sources
- Automatic Telugu translation
- Category filtering (India, Telangana, Andhra, Business, Sports, Tech, Politics)
- Auto-refresh every 5 minutes
- Mobile responsive design
- Offline support (PWA ready)

---

## 📱 Features

