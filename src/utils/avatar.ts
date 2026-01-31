import type { Creator } from "../types";

const DEFAULT_AVATAR_BASE = "https://api.dicebear.com/7.x/pixel-art/svg?seed=";

const buildAvatarSeed = (creator: Creator) => {
  const base = creator.name || creator.id || "favcreator";
  return encodeURIComponent(base.trim() || "favcreator");
};

export const buildFallbackAvatar = (creator: Creator): string =>
  `${DEFAULT_AVATAR_BASE}${buildAvatarSeed(creator)}`;

export const ensureAvatarUrl = (creator: Creator): Creator => {
  const hasUrl = typeof creator.avatarUrl === "string" && creator.avatarUrl.trim().length > 0;
  if (hasUrl) {
    return creator;
  }
  return {
    ...creator,
    avatarUrl: buildFallbackAvatar(creator),
  };
};

export const ensureAvatarForCreators = (creators: Creator[]): Creator[] =>
  creators.map((creator) => ensureAvatarUrl(creator));
