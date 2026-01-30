
export type Platform = 'youtube' | 'tiktok' | 'instagram' | 'kick' | 'twitch' | 'other';

export interface SocialAccount {
    id: string;
    platform: Platform;
    username: string;
    url: string;
    followers?: string;
    isLive?: boolean;
}

export interface Creator {
    id: string;
    name: string;
    bio: string;
    avatarUrl: string;
    accounts: SocialAccount[];
    isFavorite: boolean;
    addedAt: number;
    isLive?: boolean;
    reason?: string;
}
