function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function createEventPlaceholder(title: string, accent = '#e11d48') {
  const safeTitle = title.replace(/[<>&"]/g, '');

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${safeTitle}">
      <defs>
        <linearGradient id="hero" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="52%" stop-color="${accent}" />
          <stop offset="100%" stop-color="#fecdd3" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#hero)" />
      <circle cx="980" cy="160" r="140" fill="rgba(255,255,255,0.12)" />
      <circle cx="170" cy="660" r="180" fill="rgba(255,255,255,0.1)" />
      <rect x="86" y="106" width="220" height="46" rx="23" fill="rgba(255,255,255,0.16)" />
      <text x="110" y="136" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="3">HAPPY LOKAM</text>
      <text x="86" y="410" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="74" font-weight="700">${safeTitle}</text>
      <text x="86" y="470" fill="rgba(255,255,255,0.82)" font-family="Arial, Helvetica, sans-serif" font-size="26">Premium event booking experience</text>
    </svg>
  `);
}

export function resolveServiceImage(src: string | null | undefined, fallbackTitle: string) {
  if (!src || !src.trim()) {
    return createEventPlaceholder(fallbackTitle);
  }

  return src;
}

export function isExternalImage(src: string) {
  return /^https?:\/\//i.test(src);
}
