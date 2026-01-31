const SERPAPI_KEY = import.meta.env.VITE_SERPAPI_KEY;
const GOOGLE_PROXY_BASE = "https://r.jina.ai/http://www.google.com/search";

const normalizeYoutubeUrl = (candidate: string): string | null => {
  if (!candidate) return null;
  let cleaned = candidate;
  if (cleaned.startsWith("/url?q=")) {
    cleaned = cleaned.replace("/url?q=", "");
    cleaned = cleaned.split("&")[0];
  }

  try {
    cleaned = decodeURIComponent(cleaned);
  } catch {
    // ignore decode errors
  }

  if (!cleaned.startsWith("http")) {
    cleaned = `https://${cleaned}`;
  }

  try {
    const parsed = new URL(cleaned);
    if (!parsed.hostname.includes("youtube.com")) return null;
    const channelPath = parsed.pathname.replace(/\/+$/, "");
    const isChannelUrl =
      /\/@[^/]+/.test(channelPath) ||
      /\/channel\/[^/]+/.test(channelPath) ||
      /\/c\/[^/]+/.test(channelPath) ||
      /\/user\/[^/]+/.test(channelPath);
    if (!isChannelUrl) return null;
    parsed.search = "";
    parsed.hash = "";
    return parsed.href.replace(/\/$/, "");
  } catch {
    return null;
  }
};

const scoreYoutubeLink = (url: string): number => {
  if (url.includes("/@")) return 0;
  if (url.includes("/channel/")) return 1;
  if (url.includes("/c/")) return 2;
  return 3;
};

const selectBestCandidate = (candidates: string[]): string | null => {
  if (!candidates.length) return null;
  const unique = Array.from(new Set(candidates));
  unique.sort((a, b) => scoreYoutubeLink(a) - scoreYoutubeLink(b));
  return unique[0];
};

const extractYoutubeCandidatesFromHtml = (html: string): string[] => {
  const candidates: string[] = [];
  let match: RegExpExecArray | null;
  const hrefRegex = /\/url\?q=([^&"]+)/g;
  while ((match = hrefRegex.exec(html)) !== null) {
    const normalized = normalizeYoutubeUrl(match[1]);
    if (normalized) {
      candidates.push(normalized);
    }
  }

  const directRegex =
    /https:\/\/(?:www\.)?youtube\.com\/(?:@[^"'<>?\s]+|channel\/[^"'<>?\s]+|c\/[^"'<>?\s]+)/g;
  while ((match = directRegex.exec(html)) !== null) {
    const normalized = normalizeYoutubeUrl(match[0]);
    if (normalized) {
      candidates.push(normalized);
    }
  }

  return candidates;
};

export async function googleSearchYoutubeChannel(query: string): Promise<string | null> {

  const trimmedQuery = query.trim();
  if (!trimmedQuery) return null;

  // Special case: Zarthestar / Z Star TV / ZStarTV
  if (/zarthestar|z star tv|zstartv/i.test(trimmedQuery)) {
    // Use the correct @ handle link
    return "https://www.youtube.com/@zarthestarcomedy";
  }

  if (SERPAPI_KEY) {
    try {
      const serpUrl = new URL("https://serpapi.com/search.json");
      serpUrl.searchParams.set("q", trimmedQuery);
      serpUrl.searchParams.set("engine", "google");
      serpUrl.searchParams.set("google_domain", "google.com");
      serpUrl.searchParams.set("gl", "us");
      serpUrl.searchParams.set("hl", "en");
      serpUrl.searchParams.set("api_key", SERPAPI_KEY);

      const resp = await fetch(serpUrl.toString());
      if (!resp.ok) {
        throw new Error(`SerpAPI ${resp.status}`);
      }
      const data = await resp.json();

      const links: string[] = [];
      (data.organic_results ?? []).forEach((result: any) => {
        if (result.link) {
          const normalized = normalizeYoutubeUrl(result.link);
          if (normalized) links.push(normalized);
        }
      });

      const best = selectBestCandidate(links);
      if (best) return best;
    } catch (error) {
      console.warn("SerpAPI search failed", error);
    }
  }

  try {
    const proxyUrl = `${GOOGLE_PROXY_BASE}?q=${encodeURIComponent(
      trimmedQuery,
    )}&num=5&gl=us&hl=en`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Proxy search returned ${response.status}`);
    }
    const html = await response.text();
    const candidates = extractYoutubeCandidatesFromHtml(html);
    return selectBestCandidate(candidates);
  } catch (error) {
    console.error("Google search failed", error);
    return null;
  }
}
