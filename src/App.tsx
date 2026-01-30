
import { useState, useEffect } from 'react';
import './App.css';
import type { Creator } from './types';
import CreatorCard from './components/CreatorCard';
import CreatorForm from './components/CreatorForm';

const INITIAL_DATA: Creator[] = [
  {
    id: '1',
    name: 'MrBeast',
    bio: 'I want to make the world a better place before I die.',
    avatarUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_n_E3Qh8H-8G4Z_K2o8F-XwJ0R4X-K6M=s176-c-k-c0x00ffffff-no-rj',
    isFavorite: true,
    addedAt: Date.now(),
    accounts: [
      { id: '1a', platform: 'youtube', username: 'MrBeast', url: 'https://youtube.com/@MrBeast' },
      { id: '1b', platform: 'instagram', username: 'mrbeast', url: 'https://instagram.com/mrbeast' },
      { id: '1c', platform: 'tiktok', username: 'mrbeast', url: 'https://tiktok.com/@mrbeast' }
    ]
  },
  {
    id: '2',
    name: 'Marques Brownlee',
    bio: 'Quality Tech Videos | MKBHD',
    avatarUrl: 'https://yt3.googleusercontent.com/lkH3xt4nRzQKoxoxEncyZdx_n9S6S7E3Y2ba9BVA9_5uYx5rOsu_O2fD2m-v-j5v6k=s176-c-k-c0x00ffffff-no-rj',
    isFavorite: false,
    addedAt: Date.now() - 100000,
    accounts: [
      { id: '2a', platform: 'youtube', username: 'mkbhd', url: 'https://youtube.com/@mkbhd' },
      { id: '2b', platform: 'instagram', username: 'mkbhd', url: 'https://instagram.com/mkbhd' }
    ]
  }
];

function App() {
  const [creators, setCreators] = useState<Creator[]>(() => {
    const saved = localStorage.getItem('fav_creators');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('fav_creators', JSON.stringify(creators));
  }, [creators]);

  const handleSaveCreator = (newCreator: Creator) => {
    setCreators([newCreator, ...creators]);
    setIsFormOpen(false);
  };

  const handleDeleteCreator = (id: string) => {
    if (window.confirm('Are you sure you want to remove this creator?')) {
      setCreators(creators.filter(c => c.id !== id));
    }
  };

  const handleToggleFavorite = (id: string) => {
    setCreators(creators.map(c =>
      c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
    ));
  };

  const filteredCreators = creators
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.bio.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.isFavorite === b.isFavorite) return b.addedAt - a.addedAt;
      return a.isFavorite ? -1 : 1;
    });

  return (
    <div className="app-container">
      <header>
        <h1>FavCreators</h1>
        <p className="subtitle">Keep track of your favorite creators across the web</p>
      </header>

      <div className="controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn-add" onClick={() => setIsFormOpen(true)}>
          <span>+</span> Add Creator
        </button>
      </div>

      <div className="creator-grid">
        {filteredCreators.map(creator => (
          <CreatorCard
            key={creator.id}
            creator={creator}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDeleteCreator}
          />
        ))}
        {filteredCreators.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No creators found. Start by adding one!
          </div>
        )}
      </div>

      {isFormOpen && (
        <CreatorForm
          onSave={handleSaveCreator}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      <footer style={{ marginTop: '5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <p>© 2026 FavCreators. Built with ❤️ for creators.</p>
      </footer>
    </div>
  );
}

export default App;
