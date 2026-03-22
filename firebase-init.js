// ─── MilEd.One — Firebase Client Configuration ───
// Setup: Replace every REPLACE_WITH_* value with your Firebase project config.
// Firebase Console → Project Settings → General → Your apps → Web app → Config
//
// These values are NOT secret — they identify your project to Firebase services.
// Security is enforced via Firebase Security Rules and ID token verification.
//
// Also required in Firebase Console:
//   Authentication → Sign-in method → Google → Enable
//   Authentication → Settings → Authorized domains → add your Netlify domain

window.MILED_FIREBASE_CONFIG = {
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "REPLACE_WITH_YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL:       "REPLACE_WITH_YOUR_DATABASE_URL",
  projectId:         "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket:     "REPLACE_WITH_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId:             "REPLACE_WITH_YOUR_APP_ID"
};
