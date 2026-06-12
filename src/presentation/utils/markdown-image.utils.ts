const WIKIMEDIA_THUMB_RE =
  /^https?:\/\/upload\.wikimedia\.org\/wikipedia\/(commons|en|[a-z]{2})\/thumb\/(.+?)\/\d+px-[^/]+$/i;

function addCandidate(candidates: string[], url: string | null | undefined) {
  const normalized = url?.trim();
  if (!normalized || candidates.includes(normalized)) return;
  candidates.push(normalized);
}

function extractWikimediaFilename(uri: string): string | null {
  const thumb = uri.match(/\/thumb\/(?:.+\/)([^/]+)\/\d+px-/i);
  if (thumb?.[1]) return decodeURIComponent(thumb[1]);

  const direct = uri.match(/upload\.wikimedia\.org\/wikipedia\/(?:commons|en|[a-z]{2})\/(?:.+\/)([^/]+)$/i);
  if (direct?.[1]) return decodeURIComponent(direct[1]);

  return null;
}

function altToCommonsCandidates(alt: string): string[] {
  const slug = alt
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w.-]/g, "");
  if (!slug) return [];

  return [".jpg", ".png", ".webp"].map(
    (ext) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(`${slug}${ext}`)}`,
  );
}

/** Ordered fallbacks for markdown image URLs (Wikimedia thumbs, redirects, alt slug). */
export function buildImageUriCandidates(uri: string, alt?: string): string[] {
  const candidates: string[] = [];
  const httpsUri = uri.replace(/^http:\/\//i, "https://");

  addCandidate(candidates, httpsUri);
  addCandidate(candidates, uri);

  const thumbMatch = httpsUri.match(WIKIMEDIA_THUMB_RE);
  if (thumbMatch) {
    addCandidate(
      candidates,
      `https://upload.wikimedia.org/wikipedia/${thumbMatch[1]}/${thumbMatch[2]}`,
    );
  }

  const filename = extractWikimediaFilename(httpsUri);
  if (filename) {
    addCandidate(
      candidates,
      `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`,
    );
  }

  if (alt?.trim()) {
    for (const url of altToCommonsCandidates(alt)) {
      addCandidate(candidates, url);
    }
  }

  return candidates;
}

/** Prefer first normalized candidate in markdown image syntax. */
export function preprocessMarkdownImageUrls(content: string): string {
  return content.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (match, alt: string, url: string) => {
    const candidates = buildImageUriCandidates(url, alt);
    const best = candidates[0] ?? url;
    return best === url ? match : `![${alt}](${best})`;
  });
}
