const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const SUMMARY_META_PATTERNS = [
  /<meta[^>]+(?:property|name)=["']og:description["'][^>]*content=["']([^"']+)["']/i,
  /<meta[^>]+(?:property|name)=["']twitter:description["'][^>]*content=["']([^"']+)["']/i,
  /<meta[^>]+(?:property|name)=["']description["'][^>]*content=["']([^"']+)["']/i,
  /<meta[^>]+(?:property|name)=["']og:title["'][^>]*content=["']([^"']+)["']/i,
];
const SUMMARY_LENGTH = 220;

async function fetchWithTimeout(url: string, timeoutMs = 9000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeText(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string): string {
  if (value.length <= SUMMARY_LENGTH) return value;
  return `${value.slice(0, SUMMARY_LENGTH - 3).trim()}…`;
}

async function fetchHtml(url: string): Promise<string> {
  const targetUrl = url.startsWith("http") ? url : `https://${url}`;
  const response = await fetchWithTimeout(`${CORS_PROXY}${encodeURIComponent(targetUrl)}`);
  return response.text();
}

function extractFromMeta(html: string): string | null {
  for (const pattern of SUMMARY_META_PATTERNS) {
    const match = html.match(pattern);
    if (match?.[1]) {
      const normalized = normalizeText(match[1]);
      if (normalized.length >= 30) {
        return truncate(normalized);
      }
    }
  }
  return null;
}

function extractParagraph(html: string): string | null {
  const match = html.match(/<p[^>]*>([^<]{40,}?)<\/p>/i);
  if (!match?.[1]) return null;
  return truncate(normalizeText(match[1]));
}

export async function fetchSocialSummary(url: string): Promise<string | null> {
  try {
    const html = await fetchHtml(url);
    return extractFromMeta(html) || extractParagraph(html);
  } catch (error) {
    console.warn("Social summary scrape failed", error);
    return null;
  }
}
