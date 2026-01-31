import type { SocialAccount } from "../types";

const PROXY_PREFIX = "https://r.jina.ai/http://";
const PLATFORM_PRIORITY: SocialAccount["platform"][] = [
  "instagram",
  "youtube",
  "tiktok",
  "twitch",
  "kick",
  "other",
];

const buildProxyUrl = (targetUrl: string): string => {
  const sanitized = targetUrl.replace(/^https?:\/\//i, "");
  return `${PROXY_PREFIX}${sanitized}`;
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
  try {
    const proxyUrl = buildProxyUrl(url);
    const response = await fetchWithTimeout(proxyUrl);
    if (!response.ok) return null;
    const html = await response.text();
    return extractOgImage(html);
  } catch (error) {
    console.warn("Avatar grabber failed for", url, error);
    return null;
  }
};

export async function grabAvatarFromAccounts(
  accounts: SocialAccount[],
): Promise<string | null> {
  for (const platform of PLATFORM_PRIORITY) {
    const platformAccounts = accounts.filter(
      (account) => account.platform === platform && account.url,
    );
    for (const account of platformAccounts) {
      const avatar = await fetchAvatarFromUrl(account.url);
      if (avatar) return avatar;
    }
  }
  return null;
}
