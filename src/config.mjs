// Central config for the HerCommerce Automation Bot.
// The Firebase apiKey below is NOT a secret — it is already public in HerCommerce's
// deployed site (every Firebase web app ships this in its client bundle by design).
// Firestore Security Rules, not this key, are what actually protects the data. Real
// secrets (Meta/TikTok access tokens) live in GitHub Actions encrypted repo secrets,
// never in this file — see README.md "Setting up secrets".
export const firebaseConfig = {
  apiKey: 'AIzaSyAWsrjO71iPezYbZEOicOweep6LH7EVoFM',
  authDomain: 'hercommerce-299ba.firebaseapp.com',
  projectId: 'hercommerce-299ba',
  storageBucket: 'hercommerce-299ba.firebasestorage.app',
  messagingSenderId: '594944993656',
  appId: '1:594944993656:web:d4de26b8e7a3f8d9e9008d',
  measurementId: 'G-PTGJF7VP2C',
}

export const STOREFRONT_BASE_URL = 'https://hercommerce-299ba.web.app/store'

// Weekly rotation — JS Date#getDay(): 0=Sun ... 6=Sat.
// 6 posting days (per Maria's spec: 2 post, 2 carousel, 2 reel), Sunday off.
export const ROTATION = {
  0: null, // Sunday — off
  1: { format: 'carousel', theme: 'tips' }, // Monday
  2: { format: 'reel', theme: 'problem_solution' }, // Tuesday
  3: { format: 'post', theme: 'quick_tip' }, // Wednesday
  4: { format: 'carousel', theme: 'vision' }, // Thursday
  5: { format: 'reel', theme: 'feature_highlight' }, // Friday
  6: { format: 'post', theme: 'community' }, // Saturday
}

// Once HerCommerce crosses this many active businesses, the "store spotlight" theme
// (manual pick from the dashboard, suggested by product-count activity) becomes part
// of the rotation — see src/content/spotlight.mjs.
export const SPOTLIGHT_UNLOCK_STORE_COUNT = 40

// Stores that should never be auto-featured (name match, case-insensitive) — e.g. a
// business that asked not to be included. Add a name here any time a store opts out;
// no code change needed beyond this list. Checked in src/content/pick.mjs.
export const EXCLUDED_BUSINESS_NAMES = ['HOMIQ']
