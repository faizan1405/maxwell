import { NextResponse } from 'next/server';
import { getPublicProducts, getPublicCategories, getPublicShippingRates } from '../../../lib/cache';
import { getPublicSettings } from '../settings/route';

/**
 * GET /api/storefront — cached storefront bootstrap.
 *
 * Returns the minimum data the homepage/shop needs (products, categories,
 * public store settings, active shipping rates) in a SINGLE response, instead
 * of the storefront firing four separate uncached requests on every load.
 *
 * Every field is served from the tag-invalidated Data Cache, so a warm cache
 * answers with zero MongoDB round-trips, and the four reads run concurrently.
 * Only public, non-personalised data is included — nothing here varies by user.
 */
export async function GET() {
  try {
    const [products, categories, settings, shipping] = await Promise.all([
      getPublicProducts(),
      getPublicCategories(),
      getPublicSettings(),
      getPublicShippingRates(),
    ]);

    return NextResponse.json({ products, categories, settings, shipping });
  } catch (err) {
    console.error('[/api/storefront]', err);
    return NextResponse.json({ error: 'Failed to load storefront data.' }, { status: 500 });
  }
}
