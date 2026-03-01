import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  console.log('Firebase initialized');
} catch (e) {
  console.error('Firebase init error:', e);
}

export { db };

const sampleArticles = [
  {
    id: '1',
    title: 'Test News Article - India',
    title_te: 'భారతదేశం లో టెస్ట్ వార్త',
    summary: 'This is sample news while real data loads.',
    summary_te: ' వాస్తవ డేటా లోడ్ అయ్యే వరకు ఇది నమूना వార్త.',
    url: 'https://ndtv.com',
    image: null,
    published_at: new Date().toISOString(),
    source: 'NDTV',
    category: 'india',
    translated: true
  }
];

export async function getNews(category = 'all', count = 50) {
  if (!db) {
    console.log('Firebase not initialized, returning sample data');
    return sampleArticles;
  }
  
  try {
    const newsRef = ref(db, 'news');
    const snapshot = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn('Firebase request timed out for news');
        resolve({ val: () => null }); // Resolve with empty data
      }, 10000); // 10s timeout
      
      onValue(newsRef, (snapshot) => {
        clearTimeout(timeout);
        resolve(snapshot);
      }, { onlyOnce: true });
    });
    
    let data = snapshot.val();
    if (!data) {
      console.log('No data in Firebase, returning sample');
      return sampleArticles;
    }
    
    let articles = Object.entries(data).map(([id, value]) => ({
      id,
      ...value
    }));
    
    articles.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    articles = articles.slice(0, count);
    
    if (category && category !== 'all') {
      articles = articles.filter(a => a.category === category);
    }
    
    if (articles.length === 0) {
      return sampleArticles;
    }
    
    console.log('Loaded', articles.length, 'articles from Firebase');
    return articles;
  } catch (e) {
    console.error('Error fetching news:', e);
    return sampleArticles;
  }
}

export async function getMeta() {
  if (!db) {
    return {
      last_updated: new Date().toISOString(),
      total_articles: 1,
      categories: ['india']
    };
  }
  
  try {
    const metaRef = ref(db, 'meta/info');
    const snapshot = await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('Firebase request timed out for meta');
        resolve({ val: () => null });
      }, 10000);
      
      onValue(metaRef, (snapshot) => {
        clearTimeout(timeout);
        resolve(snapshot);
      }, { onlyOnce: true });
    });
    
    const data = snapshot.val();
    if (!data) {
      return {
        last_updated: new Date().toISOString(),
        total_articles: 0,
        categories: []
      };
    }
    
    return data;
  } catch (e) {
    console.error('Error fetching meta:', e);
    return {
      last_updated: new Date().toISOString(),
      total_articles: 1,
      categories: ['india']
    };
  }
}
