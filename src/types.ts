
export type Platform = 'youtube' | 'tiktok' | 'instagram' | 'other';

export interface SocialAccount {
    id: string;
    platform: Platform;
    username: string;
    url: string;
}

export interface Creator {
    id: string;
    name: string;
    bio: string;
    avatarUrl: string;
    accounts: SocialAccount[];
    isFavorite: boolean;
    addedAt: number;
}
