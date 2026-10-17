// Reads real HerCommerce data straight from Firestore — businesses, categories, products.
// All three collections are publicly readable by HerCommerce's own Security Rules
// (allow read: if true), the same way the storefront itself reads them, so no service
// account or admin credentials are needed here — just the public web config in config.mjs.
//
// NOTE: this only works where outbound internet can actually reach firestore.googleapis.com
// (confirmed blocked inside the Cowork cloud sandbox used to build this repo — that's why
// the whole system runs via GitHub Actions instead, see .github/workflows/daily-post.yml).
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'
import { firebaseConfig } from '../config.mjs'

let _db = null
function db() {
  if (!_db) _db = getFirestore(initializeApp(firebaseConfig))
  return _db
}

/** Every active business, with the fields the content engine actually needs. */
export async function getActiveBusinesses() {
  const snap = await getDocs(query(collection(db(), 'businesses'), where('status', '==', 'active')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getCategories() {
  const snap = await getDocs(collection(db(), 'categories'))
  const byId = new Map()
  snap.forEach((d) => byId.set(d.id, d.data().name))
  return byId
}

/** Product count per business — the only public signal available for a "how active is
 *  this store" proxy (order/GMV data is not publicly readable, by design — see
 *  firestore.rules — so it can't be used here; the weekly top-store spotlight instead
 *  uses this as a suggestion, with Maria making the final pick). */
export async function getProductCountsByBusiness() {
  const snap = await getDocs(collection(db(), 'products'))
  const counts = new Map()
  snap.forEach((d) => {
    const businessId = d.data().businessId
    counts.set(businessId, (counts.get(businessId) ?? 0) + 1)
  })
  return counts
}

/** A handful of real product photo URLs for a given business, for reel/carousel visuals. */
export async function getProductImages(businessId, max = 5) {
  const snap = await getDocs(query(collection(db(), 'products'), where('businessId', '==', businessId)))
  const urls = []
  snap.forEach((d) => {
    const p = d.data()
    const primary = (p.images ?? []).find((img) => img.isPrimary) ?? p.images?.[0]
    if (primary?.url) urls.push(primary.url)
  })
  return urls.slice(0, max)
}
