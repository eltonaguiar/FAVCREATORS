
import React from 'react';
import type { Creator } from '../types';

interface CreatorCardProps {
    creator: Creator;
    onToggleFavorite: (id: string) => void;
    onDelete: (id: string) => void;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, onToggleFavorite, onDelete }) => {
    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'youtube': return '▶️';
            case 'tiktok': return '🎵';
            case 'instagram': return '📸';
            default: return '🔗';
        }
    };

    return (
        <div className="creator-card">
            <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                <button
                    onClick={() => onToggleFavorite(creator.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                    {creator.isFavorite ? '⭐️' : '☆'}
                </button>
                <button
                    onClick={() => onDelete(creator.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5 }}
                >
                    🗑️
                </button>
            </div>

            <img src={creator.avatarUrl || 'https://via.placeholder.com/80'} alt={creator.name} className="creator-avatar" />
            <h3 className="creator-name">{creator.name}</h3>
            <p className="creator-bio">{creator.bio}</p>

            <div className="accounts-list">
                {creator.accounts.map(account => (
                    <a
                        key={account.id}
                        href={account.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`account-link ${account.platform}`}
                    >
                        {getPlatformIcon(account.platform)} {account.platform === 'other' ? account.username : `@${account.username}`}
                    </a>
                ))}
            </div>
        </div>
    );
};

export default CreatorCard;
