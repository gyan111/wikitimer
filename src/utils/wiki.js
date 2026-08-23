/**
 * Wikimedia Commons & MediaWiki Image Resolution Utilities
 */

/**
 * Resolves any pasted Wikimedia Commons link (e.g. File: page URL or direct name)
 * into a direct upload.wikimedia.org image URL.
 */
export async function resolveCommonsImageUrl(input) {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();

  // If already a direct image CDN link or data URL
  if (
    trimmed.startsWith('https://upload.wikimedia.org/') ||
    trimmed.startsWith('http://upload.wikimedia.org/') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed;
  }

  // Check if it's a Wikimedia Commons or Wikipedia File/Bestand URL or namespace title
  let fileName = '';

  // Case 1: URL format (e.g. https://commons.wikimedia.org/wiki/File:Foo.jpg or /wiki/Bestand:Foo.jpg)
  const urlMatch = trimmed.match(/\/wiki\/(?:File|Bestand|Image|Archivo|Fichier):([^?#]+)/i);
  if (urlMatch) {
    fileName = decodeURIComponent(urlMatch[1]).replace(/_/g, ' ');
  }

  // Case 2: Special:FilePath URL
  if (!fileName) {
    const filePathMatch = trimmed.match(/\/Special:FilePath\/([^?#]+)/i);
    if (filePathMatch) {
      fileName = decodeURIComponent(filePathMatch[1]).replace(/_/g, ' ');
    }
  }

  // Case 3: Plain "File:Foo.jpg" or "Bestand:Foo.jpg"
  if (!fileName) {
    const filePrefixMatch = trimmed.match(/^(?:File|Bestand|Image|Archivo|Fichier):(.+)$/i);
    if (filePrefixMatch) {
      fileName = filePrefixMatch[1].trim().replace(/_/g, ' ');
    }
  }

  // Case 4: Plain filename without prefix (e.g. "Wmnl-hackathon-2026.jpg")
  if (!fileName && !trimmed.includes('/') && /\.(jpe?g|png|svg|webp|gif)$/i.test(trimmed)) {
    fileName = trimmed;
  }

  if (fileName) {
    try {
      const normalizedTitle = fileName.trim().replace(/ /g, '_');
      const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(normalizedTitle)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const pages = data.query?.pages || {};
        for (const pageId in pages) {
          const imageInfo = pages[pageId]?.imageinfo;
          if (imageInfo && imageInfo[0]?.url) {
            // Strip tracking query parameters if any
            return imageInfo[0].url.split('?')[0];
          }
        }
      }
    } catch (err) {
      console.warn('Could not resolve Commons file URL:', err);
    }
  }

  return trimmed;
}
