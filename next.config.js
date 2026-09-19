/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ── Image optimisation ────────────────────────────────────────────────────
  // Next.js now optimises storefront imagery (resize, WebP/AVIF, per-device
  // sizes) instead of shipping full-resolution originals. `remotePatterns`
  // whitelists the only external hosts that serve product/category media:
  //   • Vercel Blob  — product media + payment proofs  (*.vercel-storage.com)
  //   • Cloudinary   — category banners + product media (res.cloudinary.com)
  images: {
    formats: ['image/avif', 'image/webp'],
    // Device widths tuned for a SA storefront (mobile-first up to desktop).
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536],
    imageSizes: [64, 96, 128, 200, 256, 384],
    // Cache optimised variants at the edge for 30 days.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: '**.vercel-storage.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  async headers() {
    return [
      {
        // Static imagery shipped in /public/assets only changes on deploy.
        // A long max-age with stale-while-revalidate keeps them off the origin
        // without the hard-pinning of `immutable` (the paths are not hashed,
        // so a redeploy that changes the logo/banner still propagates).
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=2592000' },
        ],
      },
      {
        source: '/thumbs/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=2592000' },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      { source: '/shop',            destination: '/' },
      { source: '/cart',            destination: '/' },
      { source: '/checkout',        destination: '/' },
      { source: '/account',         destination: '/' },
      { source: '/faq',             destination: '/' },
      { source: '/order-confirmed', destination: '/' },
    ];
  },
};

module.exports = nextConfig;
