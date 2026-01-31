// src/utils/avatarFetcher.ts
// Utility to fetch avatar/profile image for a given platform and username

export async function fetchAvatarUrl(platform: string, username: string): Promise<string | null> {
  const clean = username.trim().replace(/^@/, "");
  try {
    switch (platform) {
      case "youtube": {
        // Use YouTube channel page and parse og:image
        const url = `https://www.youtube.com/@${clean}`;
        const resp = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
        if (!resp.ok) return null;
        const html = await resp.text();
        const ogImg = html.match(/<meta property="og:image" content="([^"]+)"/i);
        if (ogImg && ogImg[1]) return ogImg[1];
        // fallback: YouTube default avatar
        return `https://yt3.ggpht.com/ytc/AAUvwng_${clean}=s176-c-k-c0x00ffffff-no-rj`;
      }
      case "tiktok": {
        // Use TikTok profile page and parse og:image
        const url = `https://www.tiktok.com/@${clean}`;
        const resp = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
        if (!resp.ok) return null;
        const html = await resp.text();
        const ogImg = html.match(/<meta property="og:image" content="([^"]+)"/i);
        if (ogImg && ogImg[1]) return ogImg[1];
        return null;
      }
      case "instagram": {
        // Use Instagram profile page and parse og:image
        const url = `https://www.instagram.com/${clean}/`;
        const resp = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
        if (!resp.ok) return null;
        const html = await resp.text();
        const ogImg = html.match(/<meta property="og:image" content="([^"]+)"/i);
        if (ogImg && ogImg[1]) return ogImg[1];
        return null;
      }
      case "twitch": {
        // Use Twitch profile image CDN
        return `https://static-cdn.jtvnw.net/jtv_user_pictures/${clean}-profile_image-70x70.png`;
      }
      case "kick": {
        // Kick does not have a public avatar CDN, fallback to default
        return null;
      }
      default:
        return null;
    }
  } catch (e) {
    return null;
  }
}
