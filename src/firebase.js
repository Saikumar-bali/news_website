import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.error('Firebase init error:', e);
}

const sampleArticles = [
  {
    id: '1',
    title: 'Test News Article - India',
    title_te: ' భారతదేశం లో టె�్ట్ వార్త',
    summary: 'This is sample news while real data loads.',
    summary_te: ' వాస్త� డేటా లోడ్ అయ్యే వరకు ఇది నমूना వార్త.',
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
    const newsRef = collection(db, 'news');
    const q = query(newsRef, orderBy('published_at', 'desc'), limit(count));
    
    const snapshot = await getDocs(q);
    let articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (category && category !== 'all') {
      articles = articles.filter(a => a.category === category);
    }
    
    if (articles.length === 0) {
      return sampleArticles;
    }
    
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
    const metaRef = collection(db, 'meta');
    const snapshot = await getDocs(metaRef);
    if (snapshot.empty) {
      return {
        last_updated: new Date().toISOString(),
        total_articles: 0,
        categories: []
      };
    }
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (e) {
    console.error('Error fetching meta:', e);
    return {
      last_updated: new Date().toISOString(),
      total_articles: 1,
      categories: ['india']
    };
  }
}
