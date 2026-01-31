import type { SocialAccount } from "../types";
import { googleSearchImage } from "./googleSearch";

const ALLORIGINS_PROXY = "https://api.allorigins.win/raw?url=";
const THINGPROXY = "https://thingproxy.freeboard.io/fetch/";
const PLATFORM_PRIORITY: SocialAccount["platform"][] = [
  "instagram",
  "youtube",
  "tiktok",
  "twitch",
  "kick",
  "other",
];

const buildProxyUrl = (targetUrl: string, proxyType: 'allorigins' | 'thingproxy'): string => {
  if (proxyType === 'allorigins') return `${ALLORIGINS_PROXY}${encodeURIComponent(targetUrl)}`;
  if (proxyType === 'thingproxy') return `${THINGPROXY}${targetUrl}`;
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

const extractOgImage = (html: string): string | null => {
  const metaMatch =
    html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
    html.match(/<meta\s+name="og:image"\s+content="([^"]+)"/i);
  if (metaMatch && metaMatch[1]) {
    const url = metaMatch[1].split("?")[0];
    if (url.startsWith("http")) {
      return url;
    }
  }
  const linkMatch = html.match(/<link\s+rel="image_src"\s+href="([^"]+)"/i);
  if (linkMatch && linkMatch[1] && linkMatch[1].startsWith("http")) {
    return linkMatch[1];
  }
  return null;
};

const fetchAvatarFromUrl = async (url: string): Promise<string | null> => {
  // Try direct fetch first
  try {
    const response = await fetchWithTimeout(url);
    if (response.ok) {
      const html = await response.text();
      const ogImage = extractOgImage(html);
      if (ogImage) return ogImage;
      console.warn("No og:image found (direct)", url);
    } else {
      console.warn("Direct fetch failed", url, response.status, response.statusText);
    }
  } catch (error) {
    console.warn("Direct fetch error", url, error);
  }
  // Try allorigins.win proxy
  try {
    const proxyUrl = buildProxyUrl(url, 'allorigins');
    const response = await fetchWithTimeout(proxyUrl);
    if (response.ok) {
      const html = await response.text();
      const ogImage = extractOgImage(html);
      if (ogImage) return ogImage;
      console.warn("No og:image found (allorigins)", url);
    } else {
      console.warn("Allorigins proxy fetch failed", proxyUrl, response.status, response.statusText);
    }
  } catch (error) {
    console.warn("Allorigins proxy error", url, error);
  }
  // Try thingproxy.freeboard.io as last resort
  try {
    const proxyUrl = buildProxyUrl(url, 'thingproxy');
    const response = await fetchWithTimeout(proxyUrl);
    if (response.ok) {
      const html = await response.text();
      const ogImage = extractOgImage(html);
      if (ogImage) return ogImage;
      console.warn("No og:image found (thingproxy)", url);
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
        const avatar = await fetchAvatarFromUrl(account.url);
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
