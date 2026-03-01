// firebase.js — Push scraped data to Firebase Realtime Database

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let db = null;

function initFirebase() {
  if (admin.apps.length > 0) {
    db = admin.database();
    return db;
  }

  try {
    // Load service account from JSON file
    const serviceAccountPath = path.join(__dirname, '..', 'functions', 'news-webscrap.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.warn('⚠️ Service account JSON not found');
      return null;
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    if (!serviceAccount.project_id) {
      console.warn('⚠️ Firebase credentials missing');
      return null;
    }

    // Load database URL from .env
    const dotenv = require('dotenv');
    const envPath = path.join(__dirname, '..', '.env');
    dotenv.config({ path: envPath });

    const databaseURL = process.env.VITE_FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`;

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: databaseURL
    });

    db = admin.database();
    console.log('✅ Firebase Realtime Database initialized');
    return db;
  } catch (err) {
    console.error('❌ Firebase init failed:', err.message);
    return null;
  }
}

async function pushToFirebase(articles) {
  if (!db) {
    db = initFirebase();
  }
  
  if (!db) {
    console.log('⚠️ Firebase not available, skipping push');
    return false;
  }

  try {
    const ref = db.ref('news');
    
    // Fetch existing articles to deduplicate and maintain history
    const snapshot = await ref.once('value');
    const existing = snapshot.val() || {};
    
    // Merge: Keep existing, overwrite with new if ID matches
    // This ensures we don't lose old news but always have latest info
    const merged = { ...existing };
    articles.forEach(article => {
      merged[article.id] = article;
    });
    
    // Convert to array, sort by date, and keep latest 500
    let allArticles = Object.values(merged);
    allArticles.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    allArticles = allArticles.slice(0, 500);
    
    // Re-build update object
    const finalUpdate = {};
    allArticles.forEach(a => {
      finalUpdate[a.id] = a;
    });
    
    // Set the cleaned, sorted, and limited set back to Firebase
    await ref.set(finalUpdate);
    console.log(`✅ Pushed to Firebase. Now tracking ${allArticles.length} total articles.`);
    return true;
  } catch (err) {
    console.error('❌ Firebase push failed:', err.message);
    return false;
  }
}

async function pushMeta(meta) {
  if (!db) {
    db = initFirebase();
  }
  
  if (!db) return false;
  
  try {
    const ref = db.ref('meta/info');
    await ref.set(meta);
    console.log('✅ Pushed meta to Firebase');
    return true;
  } catch (err) {
    console.error('❌ Meta push failed:', err.message);
    return false;
  }
}

module.exports = { initFirebase, pushToFirebase, pushMeta };
