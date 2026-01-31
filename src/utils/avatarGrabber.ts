import type { SocialAccount } from "../types";
import { googleSearchImage } from "./googleSearch";

const ALLORIGINS_PROXY = "https://api.allorigins.win/raw?url=";
const THINGPROXY = "https://thingproxy.freeboard.io/fetch/";
const JINA_PROXY = "https://r.jina.ai/";
const PLATFORM_PRIORITY: SocialAccount["platform"][] = [
  "instagram",
  "youtube",
  "tiktok",
  "twitch",
  "kick",
  "other",
];

const buildProxyUrl = (targetUrl: string, proxyType: 'allorigins' | 'thingproxy' | 'jina'): string => {
  if (proxyType === 'allorigins') return `${ALLORIGINS_PROXY}${encodeURIComponent(targetUrl)}`;
  if (proxyType === 'thingproxy') return `${THINGPROXY}${targetUrl}`;
  if (proxyType === 'jina') return `${JINA_PROXY}${targetUrl}`;
  return targetUrl;
};

const fetchWithTimeout = async (url: string, timeoutMs = 9000): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return response;
  } finally {
    clearTimeout(timeout);
  }
};

const extractAvatarFromHtml = (html: string): string | null => {
  // 1. Try Kick specific ID first (common for Kick profiles)
  const kickAvatarMatch = html.match(/id\s*=\s*["']channel-avatar["'][^>]+src\s*=\s*["']([^"']+)["']/i) ||
    html.match(/src\s*=\s*["']([^"']+)["'][^>]+id\s*=\s*["']channel-avatar["']/i);
  if (kickAvatarMatch && kickAvatarMatch[1]) {
    return kickAvatarMatch[1];
  }

  // 2. Try og:image
  const metaMatch =
    html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (metaMatch && metaMatch[1]) {
    const url = metaMatch[1].split("?")[0];
    if (url.startsWith("http")) {
      return url;
    }
  }

  // 3. Try image_src link
  const linkMatch = html.match(/<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']/i);
  if (linkMatch && linkMatch[1] && linkMatch[1].startsWith("http")) {
    return linkMatch[1];
  }

  return null;
};

const fetchAvatarFromUrl = async (url: string, platform?: string, username?: string): Promise<string | null> => {
  // 1. Try platform-specific API for Twitch
  if (platform === "twitch" && username) {
    try {
      // Use Twitch public API (no auth needed for this endpoint)
      const apiUrl = `https://decapi.me/twitch/avatar/${username}`;
      const resp = await fetchWithTimeout(apiUrl);
      if (resp.ok) {
        const avatarUrl = await resp.text();
        if (avatarUrl && avatarUrl.startsWith("http")) return avatarUrl.trim();
      }
    } catch (err) {
      console.warn("Twitch API avatar fetch failed", err);
    }
  }
  // 2. Try platform-specific API for Kick
  if (platform === "kick" && username) {
    try {
      // Use proxy for Kick API as direct fetch often fails CORS
      const apiUrl = `https://kick.com/api/v2/channels/${username}`;
      const proxyApiUrl = buildProxyUrl(apiUrl, 'allorigins');
      const resp = await fetchWithTimeout(proxyApiUrl);
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.user && data.user.profile_picture) {
          return data.user.profile_picture;
        }
      }
    } catch (err) {
      console.warn("Kick API avatar fetch failed", err);
    }
  }
  // 3. Try scraping HTML as fallback
  try {
    const response = await fetchWithTimeout(url);
    if (response.ok) {
      const html = await response.text();
      const avatar = extractAvatarFromHtml(html);
      if (avatar) return avatar;
      console.warn("No avatar found (direct)", url);
    } else {
      console.warn("Direct fetch failed", url, response.status, response.statusText);
    }
  } catch (error) {
    console.warn("Direct fetch error", url, error);
  }
  // 4. Try allorigins.win proxy
  try {
    const proxyUrl = buildProxyUrl(url, 'allorigins');
    const response = await fetchWithTimeout(proxyUrl);
    if (response.ok) {
      const html = await response.text();
      const avatar = extractAvatarFromHtml(html);
      if (avatar) return avatar;
      console.warn("No avatar found (allorigins)", url);
    } else {
      console.warn("Allorigins proxy fetch failed", proxyUrl, response.status, response.statusText);
    }
  } catch (error) {
    console.warn("Allorigins proxy error", url, error);
  }
  // 5. Try Jina proxy (highly effective for bypassing Cloudflare)
  try {
    const proxyUrl = buildProxyUrl(url, 'jina');
    const response = await fetchWithTimeout(proxyUrl);
    if (response.ok) {
      const html = await response.text();
      const avatar = extractAvatarFromHtml(html);
      if (avatar) return avatar;
      console.warn("No avatar found (jina)", url);
    } else {
      console.warn("Jina proxy fetch failed", proxyUrl, response.status, response.statusText);
    }
  } catch (error) {
    console.warn("Jina proxy error", url, error);
  }
  // 6. Try thingproxy.freeboard.io as last resort
  try {
    const proxyUrl = buildProxyUrl(url, 'thingproxy');
    const response = await fetchWithTimeout(proxyUrl);
    if (response.ok) {
      const html = await response.text();
      const avatar = extractAvatarFromHtml(html);
      if (avatar) return avatar;
      console.warn("No avatar found (thingproxy)", url);
    } else {
      console.warn("Thingproxy fetch failed", proxyUrl, response.status, response.statusText);
    }
  } catch (error) {
    console.warn("Thingproxy error", url, error);
  }
  return null;
}

export async function grabAvatarFromAccounts(
  accounts: SocialAccount[],
  fallbackName?: string
): Promise<string | null> {
  // 1. Try to get avatar from social media profiles
  for (const platform of PLATFORM_PRIORITY) {
    const platformAccounts = accounts.filter(
      (account) => account.platform === platform && account.url,
    );
    for (const account of platformAccounts) {
      try {
        const avatar = await fetchAvatarFromUrl(account.url, account.platform, account.username);
        if (avatar) return avatar;
      } catch (err) {
        console.warn(`Failed to fetch avatar from ${account.platform}`, err);
      }
    }
  }

  // 2. If no avatar found and we have a name, try Google Image Search failover
  if (fallbackName) {
    console.log(`No avatar found for ${fallbackName} from social links. Trying Google Image failover...`);
    try {
      const googleAvatar = await googleSearchImage(fallbackName);
      if (googleAvatar) {
        console.log(`Successfully found failover avatar for ${fallbackName}:`, googleAvatar);
        return googleAvatar;
      }
    } catch (err) {
      console.warn("Google Image failover failed", err);
    }
  }

  return null;
}
