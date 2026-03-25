function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function dataUrlByteLength(dataUrl: string) {
  const base64 = dataUrl.split(',')[1] ?? '';
  const paddingMatch = base64.match(/=*$/);
  const padding = paddingMatch ? paddingMatch[0].length : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Unable to read the selected image.'));
    reader.readAsDataURL(file);
  });
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to process the selected image.'));
    };

    image.src = objectUrl;
  });
}

async function optimizeRasterImage(file: File, maxOutputBytes: number) {
  const image = await loadImageFromFile(file);
  const maxDimension = 1440;
  let targetWidth = image.width;
  let targetHeight = image.height;

  if (Math.max(targetWidth, targetHeight) > maxDimension) {
    const scale = maxDimension / Math.max(targetWidth, targetHeight);
    targetWidth = Math.max(1, Math.round(targetWidth * scale));
    targetHeight = Math.max(1, Math.round(targetHeight * scale));
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Image optimization is not available in this browser.');
  }

  const mimeType = 'image/webp';
  let attempt = 0;
  let currentWidth = targetWidth;
  let currentHeight = targetHeight;
  let dataUrl = '';

  while (attempt < 4) {
    canvas.width = currentWidth;
    canvas.height = currentHeight;
    context.clearRect(0, 0, currentWidth, currentHeight);
    context.drawImage(image, 0, 0, currentWidth, currentHeight);

    let quality = 0.86;
    while (quality >= 0.5) {
      dataUrl = canvas.toDataURL(mimeType, quality);
      if (dataUrlByteLength(dataUrl) <= maxOutputBytes) {
        return dataUrl;
      }
      quality -= 0.08;
    }

    currentWidth = Math.max(480, Math.round(currentWidth * 0.82));
    currentHeight = Math.max(480, Math.round(currentHeight * 0.82));
    attempt += 1;
  }

  if (dataUrl && dataUrlByteLength(dataUrl) <= maxOutputBytes * 1.15) {
    return dataUrl;
  }

  throw new Error('This photo is too large. Please upload a smaller image.');
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

export function isDataImage(src: string | null | undefined) {
  return typeof src === 'string' && src.startsWith('data:image/');
}

export async function fileToDataUrl(file: File, maxSizeMb = 4) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload a valid image file.');
  }

  if (file.size > maxSizeMb * 1024 * 1024) {
    throw new Error(`Please upload an image smaller than ${maxSizeMb} MB.`);
  }

  if (file.type === 'image/svg+xml') {
    return readFileAsDataUrl(file);
  }

  return optimizeRasterImage(file, 900 * 1024);
}

export async function filesToDataUrls(files: FileList | File[], maxFiles = 6, maxSizeMb = 4) {
  const items = Array.from(files).slice(0, maxFiles);
  return Promise.all(items.map((file) => fileToDataUrl(file, maxSizeMb)));
}
