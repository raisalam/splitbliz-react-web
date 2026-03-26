import React, { useState, useEffect } from 'react';

// Global cache for resolved object URLs (or 'error' indicating fallback to direct url)
const imageCache = new Map<string, string | 'error'>();
// Global cache for inflight fetch promises to prevent concurrent requests to the same URL
const pendingFetches = new Map<string, Promise<string>>();

export type CachedAvatarProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src?: string | null;
  fallbackInitials?: string;
};

export function CachedAvatar({ src, className, alt, fallbackInitials = '?', ...rest }: CachedAvatarProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!src) return;

    // Fast path: already cached
    if (imageCache.has(src)) {
      const cached = imageCache.get(src);
      setResolvedSrc(cached === 'error' ? src : cached);
      return;
    }

    let isMounted = true;

    // Start fetch or wait for existing fetch
    if (!pendingFetches.has(src)) {
      const promise = fetch(src, { mode: 'cors' })
        .then(res => {
          if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
          return res.blob();
        })
        .then(blob => {
          const objectUrl = URL.createObjectURL(blob);
          imageCache.set(src, objectUrl);
          return objectUrl;
        })
        .catch(err => {
          console.warn('[CachedAvatar] Falling back to direct src due to error:', err);
          imageCache.set(src, 'error');
          return src;
        });

      pendingFetches.set(src, promise);
    }

    pendingFetches.get(src)!.then(finalSrc => {
      if (isMounted) setResolvedSrc(finalSrc);
    });

    return () => {
      isMounted = false;
    };
  }, [src]);

  // Loading or missing src state
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold ${className || ''}`}>
        {fallbackInitials}
      </div>
    );
  }

  if (!resolvedSrc) {
    return <div className={`bg-slate-200 dark:bg-slate-800 animate-pulse ${className || ''}`} />;
  }

  return <img src={resolvedSrc} className={className} alt={alt} referrerPolicy="no-referrer" {...rest} />;
}
