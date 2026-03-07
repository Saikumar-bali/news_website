# 📰 Telugu News App - Modern Stack

> News scraped every 5 minutes, translated to Telugu — **100% FREE**

🔗 **Live Demo**: [https://news-website-2ev.pages.dev](https://news-website-2ev.pages.dev)

---

## 🏗️ Architecture

```
Cloudflare Pages Function (scheduled via Cron Trigger)
       ↓
scraper → fetches 24 Indian RSS feeds
       ↓
translator → Google Translate → Telugu (free)
       ↓
Firebase Firestore (stores articles)
       ↓
Svelte + Vite (frontend reads from Firestore)
       ↓
Cloudflare Pages (hosting + CDN)
```

---

## 🚀 Setup (Step by Step)

### Step 1 — Create Firebase Project
1. Go to https://console.firebase.google.com
2. Create new project
3. Enable **Firestore Database** (start in test mode)
4. Go to Project Settings → Service Accounts
5. Generate new private key → copy JSON content

### Step 2 — Create Cloudflare Pages Site

#### Option A: Via Dashboard
1. Go to https://dash.cloudflare.com
2. Navigate to **Pages** → **Create a project**
3. Connect your Git repository (GitHub/GitLab)
4. Configure build settings:
   - **Framework preset**: `Svelte`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

#### Option B: Via Wrangler CLI
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the project
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=telugu-news-app
```

### Step 3 — Set Environment Variables

In Cloudflare Dashboard → Pages → Your Project → **Settings** → **Environment Variables**:

#### Production Variables:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:...:web:...
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}  ← Full JSON from Step 1
```

### Step 4 — Setup Scheduled Scraper (Cron Trigger)

#### Via Dashboard:
1. Go to **Workers & Pages** → Your Pages project
2. Navigate to **Functions** → **Triggers**
3. Add **Cron Trigger**: `0 */5 * * * *` (every 5 minutes)

#### Via wrangler.toml:
```toml
[triggers]
crons = ["0 */5 * * * *"]
```

Then deploy:
```bash
wrangler pages deploy dist --project-name=telugu-news-app
```

---

## 📁 Project Structure

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
│   ├── firebase.js
│   └── 404.html              ← SPA routing fallback
├── functions/
│   ├── scrape.js             ← Main scraper logic
│   ├── scheduled-scrape.js   ← Scheduled trigger handler
│   ├── [[path]].js           ← SPA rewrite function (prevents 404s)
│   └── package.json
├── public/
│   └── _routes.json          ← Cloudflare Pages routing rules
├── data/                     ← Static data files
├── dist/                     ← Build output (auto-generated)
├── package.json
├── vite.config.js
├── svelte.config.js
└── README.md
```

---

## 💰 Cost (100% Free Tier)

| Service | Free Tier Limit | Cost |
|---------|----------------|------|
| Firebase Firestore | 50K reads/day, 1GB storage | ₹0 |
| Cloudflare Pages | Unlimited requests, 100GB bandwidth/month | ₹0 |
| Cloudflare Workers | 100K requests/day | ₹0 |
| Google Translate API | 500K chars/month | ₹0 |
| **Total** | | **₹0/month** |

---

## 🔧 Development

```bash
# Install root dependencies
npm install

# Install functions dependencies
cd functions && npm install && cd ..

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🌐 Deployment Commands

### Cloudflare Pages (Recommended)
```bash
# Build
npm run build

# Deploy
wrangler pages deploy dist --project-name=telugu-news-app
```

### Alternative: Direct Git Deployment
1. Push code to GitHub/GitLab
2. Connect repository in Cloudflare Pages dashboard
3. Auto-deploy on every push

---

## 📱 Features

- ✅ Real-time news from **24 Indian sources**
- ✅ Automatic **Telugu translation** (Google Translate)
- ✅ Category filtering:
  - India
  - Telangana
  - Andhra Pradesh
  - Business
  - Sports
  - Technology
  - Politics
- ✅ Auto-refresh every **5 minutes**
- ✅ Mobile responsive design
- ✅ Offline support (PWA ready)
- ✅ SEO-friendly meta tags
- ✅ Fast CDN (Cloudflare)

---

## 🔐 Security Notes

- Never commit `.env` files or Firebase service account keys to Git
- Use `.env.example` as a template for local development
- Store `FIREBASE_SERVICE_ACCOUNT` in Cloudflare Pages environment variables only
- Enable Firestore security rules in production

---

## 🛠️ Troubleshooting

### 404 Errors on Page Refresh
Cloudflare Pages uses `[[path]].js` function to rewrite all routes to `index.html` for SPA client-side routing. Ensure:
1. `functions/[[path]].js` exists
2. Build process copies it to `dist/`

### Scheduled Function Not Running
1. Verify Cron trigger is set in Cloudflare Dashboard
2. Check function logs in **Workers & Pages** → Your project → **Functions** → **Logs**
3. Ensure `FIREBASE_SERVICE_ACCOUNT` environment variable is set correctly

### Build Fails
```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

---

## 📄 License

MIT License - Free for personal and commercial use

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Built with ❤️ for Telugu readers worldwide**
