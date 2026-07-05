'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const PLACEHOLDER = '/assets/products/placeholder.svg';

/**
 * Storefront image wrapper around `next/image`.
 *
 * Product/category imagery comes from Vercel Blob and Cloudinary (whitelisted
 * in next.config.js). This wrapper adds:
 *   • Automatic resize / WebP-AVIF / responsive `sizes` via next/image.
 *   • The original placeholder-on-error fallback (previously done with
 *     `onError → e.target.src`). The local SVG placeholder is served
 *     `unoptimized` so the image optimizer never tries to rasterise an SVG.
 *   • Lazy loading by default; pass `priority` only for the LCP image.
 *
 * Defaults to `fill`, so the caller's container just needs `position: relative`
 * and a defined aspect ratio (which the existing card/hero CSS already provide),
 * preventing layout shift.
 */
export function StoreImage({
  src,
  alt = '',
  className,
  sizes = '100vw',
  priority = false,
  fill = true,
  width,
  height,
  style,
  'aria-hidden': ariaHidden,
}) {
  const [errored, setErrored] = useState(false);

  // Reset the error state if the source changes (e.g. gallery navigation).
  useEffect(() => { setErrored(false); }, [src]);

  const usingPlaceholder = errored || !src;
  const finalSrc = usingPlaceholder ? PLACEHOLDER : src;
  const unoptimized = usingPlaceholder || /\.svg(\?|$)/i.test(finalSrc);

  const common = {
    src: finalSrc,
    alt,
    className,
    sizes,
    priority,
    unoptimized,
    onError: () => setErrored(true),
    style,
    'aria-hidden': ariaHidden,
  };

  return fill
    ? <Image fill {...common} />
    : <Image width={width} height={height} {...common} />;
}
