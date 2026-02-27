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

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function getNews(category = 'all', count = 50) {
  const newsRef = collection(db, 'news');
  let q = query(newsRef, orderBy('published_at', 'desc'), limit(count));
  
  if (category && category !== 'all') {
    q = query(newsRef, orderBy('published_at', 'desc'), limit(count));
  }
  
  const snapshot = await getDocs(q);
  let articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  if (category && category !== 'all') {
    articles = articles.filter(a => a.category === category);
  }
  
  return articles;
}

export async function getMeta() {
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
}
