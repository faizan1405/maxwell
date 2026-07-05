/**
 * Public storefront cache layer.
 *
 * The public catalogue (products, categories, store settings, shipping rates,
 * FAQs, homepage reviews) is read on nearly every storefront page load but
 * changes only when an admin mutates it. These helpers wrap the underlying DB
 * reads in Next.js's Data Cache (`unstable_cache`) keyed by stable tags, so a
 * warm cache serves storefront reads with zero MongoDB round-trips.
 *
 * Freshness model:
 *   • Every admin/system mutation calls `invalidate([...tags])`
 *     (→ `revalidateTag`) so changes are reflected on the very next request.
 *   • A short `revalidate` window acts only as a safety net if an invalidation
 *     is ever missed — it never lets data go permanently stale.
 *
 * Safety: only PUBLIC, non-personalised data is cached here. Authenticated
 * account/order/cart/admin responses never pass through this module. Cached
 * stock is display-only — order creation always re-validates stock against the
 * live DB, so a briefly-stale card can never cause overselling.
 */
import { unstable_cache, revalidateTag } from 'next/cache';
import { connectToDatabase } from './mongoose';
import { Product, Category, Settings, ShippingRate, Faq, Review } from './models';
import { normalizePurchaseMode } from '../utils/purchaseMode';

export const CACHE_TAGS = {
  products: 'products',
  categories: 'categories',
  settings: 'settings',
  shipping: 'shipping',
  faqs: 'faqs',
  reviews: 'reviews',
};

// Safety-net revalidation windows (seconds). Primary freshness comes from
// tag invalidation on mutation; these only bound the worst case.
const TTL = {
  products: 120,
  categories: 300,
  settings: 300,
  shipping: 300,
  faqs: 600,
  reviews: 300,
};

/**
 * Invalidate one or more public cache tags. Call after any admin/system
 * mutation that changes public data. Never throws into the caller's happy path.
 */
export function invalidate(tags) {
  const list = Array.isArray(tags) ? tags : [tags];
  for (const t of list) {
    if (!t) continue;
    try { revalidateTag(t); } catch { /* best-effort */ }
  }
}

/* ── Product card mapping ──────────────────────────────────────────────────── */
// Fields the public storefront never reads are dropped to shrink the payload.
// Everything the product card AND the QuickView modal consume is preserved.
const PUBLIC_PRODUCT_PROJECTION = { images: 0, video: 0, secondaryImg: 0, __v: 0 };

export function toPublicProductCard(raw) {
  const mode = normalizePurchaseMode(raw?.purchaseMode, raw?.price);
  const p = {
    ...raw,
    _id: raw?._id ? String(raw._id) : undefined,
    purchaseMode: mode,
    whatsappEnabled: mode === 'quote' ? true : !!raw?.whatsappEnabled,
  };
  if (p.media && p.media.length > 0) return p;
  if (!p.img) return { ...p, media: [] };
  return {
    ...p,
    media: [{
      id:         p.id + '-img',
      type:       'image',
      url:        p.img,
      storageKey: null,
      altText:    p.name || '',
      sortOrder:  0,
      isPrimary:  true,
      fileName:   p.img.split('/').pop(),
      mimeType:   p.img.endsWith('.png') ? 'image/png' : 'image/jpeg',
      fileSize:   0,
      createdAt:  p.createdAt || Date.now(),
    }],
  };
}

/* ── Cached public fetchers ────────────────────────────────────────────────── */

export const getPublicProducts = unstable_cache(
  async () => {
    await connectToDatabase();
    const products = await Product.find({ status: 'active' }, PUBLIC_PRODUCT_PROJECTION).lean();
    return products.map(toPublicProductCard);
  },
  ['public-products'],
  { tags: [CACHE_TAGS.products], revalidate: TTL.products }
);

export const getPublicCategories = unstable_cache(
  async () => {
    await connectToDatabase();
    const categories = await Category.find({ status: { $ne: 'inactive' } }, { __v: 0 }).lean();
    return categories.map(c => ({ ...c, _id: c._id ? String(c._id) : undefined }));
  },
  ['public-categories'],
  { tags: [CACHE_TAGS.categories], revalidate: TTL.categories }
);

/**
 * Raw stored value of the `global_settings` document (or null if unseeded).
 * The settings route merges this with its defaults and projects the
 * public/admin view — that merge is cheap and stays request-side; only the DB
 * read is cached here.
 */
export const getStoreSettingsValue = unstable_cache(
  async () => {
    await connectToDatabase();
    const doc = await Settings.findOne({ key: 'global_settings' }).lean();
    return doc?.value || null;
  },
  ['public-settings-value'],
  { tags: [CACHE_TAGS.settings], revalidate: TTL.settings }
);

export const getPublicShippingRates = unstable_cache(
  async () => {
    await connectToDatabase();
    const rates = await ShippingRate.find({ status: 'active' }, { __v: 0 }).lean();
    return rates.map(r => ({ ...r, _id: r._id ? String(r._id) : undefined }));
  },
  ['public-shipping'],
  { tags: [CACHE_TAGS.shipping], revalidate: TTL.shipping }
);

export const getPublicFaqs = unstable_cache(
  async () => {
    await connectToDatabase();
    const faqs = await Faq.find({}, { __v: 0 }).lean();
    return faqs
      .filter(f => f.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(f => ({ ...f, _id: f._id ? String(f._id) : undefined }));
  },
  ['public-faqs'],
  { tags: [CACHE_TAGS.faqs], revalidate: TTL.faqs }
);

/**
 * Public homepage reviews (approved, flagged for homepage). Falls back to any
 * approved reviews when none are explicitly flagged — mirrors the reviews route.
 */
export const getPublicHomepageReviews = unstable_cache(
  async (limit = 12) => {
    await connectToDatabase();
    const stripPii = r => ({
      id: r.id,
      productId: r.productId,
      productName: r.productName,
      customerName: r.customerName,
      customerInitials: r.customerInitials,
      customerPhoto: r.customerPhoto,
      location: r.location,
      rating: r.rating,
      text: r.text,
      status: r.status,
      isVerified: !!r.isVerified,
      source: r.source,
      showOnHomepage: !!r.showOnHomepage,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
    let docs = await Review.find({ showOnHomepage: true, status: 'approved' })
      .sort({ updatedAt: -1, createdAt: -1 }).limit(limit).lean();
    if (docs.length === 0) {
      docs = await Review.find({ status: 'approved' })
        .sort({ updatedAt: -1, createdAt: -1 }).limit(limit).lean();
    }
    return docs.map(stripPii);
  },
  ['public-homepage-reviews'],
  { tags: [CACHE_TAGS.reviews], revalidate: TTL.reviews }
);
