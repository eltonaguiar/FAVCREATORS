import React, { useState } from "react";
import type { Creator, SocialAccount, Platform } from "../types";
import { googleSearchYoutubeChannel } from "../utils/googleSearch";
import { extractYoutubeUsername } from "../utils/youtube";

interface CreatorFormProps {
  onSave: (creator: Creator) => void;
  onCancel: () => void;
}

const CATEGORY_OPTIONS = [
  { value: "", label: "Select category" },
  { value: "Favorites", label: "Favorites" },
  { value: "Other", label: "Other" },
  { value: "Education", label: "Education" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Gaming", label: "Gaming" },
  { value: "Music", label: "Music" },
  { value: "Tech", label: "Tech" },
  { value: "Lifestyle", label: "Lifestyle" },
];

const ACCOUNT_PLATFORMS: { value: Platform; label: string }[] = [
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "kick", label: "Kick" },
  { value: "twitch", label: "Twitch" },
  { value: "other", label: "Other" },
];

const CreatorForm: React.FC<CreatorFormProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [category, setCategory] = useState("");

  const [newAccount, setNewAccount] = useState({
    platform: "youtube" as Platform,
    username: "",
    url: "",
  });

  const handleAddAccount = () => {
    if (!newAccount.username || !newAccount.url) return;
    setAccounts((prev) => [
      ...prev,
      { ...newAccount, id: crypto.randomUUID() },
    ]);
    setNewAccount({ platform: "youtube", username: "", url: "" });
  };

  const handleAutoFindYoutube = async () => {
    if (!name.trim()) return;
    const query = `${name.trim()} official youtube`;
    try {
      const url = await googleSearchYoutubeChannel(query);
      if (!url) {
        alert("Could not find a YouTube channel for this creator.");
        return;
      }
      const username = extractYoutubeUsername(url);
      setNewAccount((prev) => ({
        ...prev,
        platform: "youtube",
        url,
        username: username || prev.username,
      }));
    } catch (error) {
      console.error("Auto-find failed", error);
      alert("Auto-find failed. Try again in a moment.");
    }
  };

  const handleRemoveAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: crypto.randomUUID(),
      name,
      bio,
      reason,
      note,
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`,
      accounts,
      isFavorite: false,
      addedAt: Date.now(),
      category,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Creator</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="MrBeast"
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <button
              type="button"
              onClick={handleAutoFindYoutube}
              style={{ marginBottom: 8 }}
            >
              Auto-Find YouTube Channel
            </button>
          </div>
          <div className="form-group">
            <label>Reason for following (Optional)</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Motivational speaker"
            />
          </div>
          <div className="form-group">
            <label>Personal note (Optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why this creator matters to you"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Creator bio..."
            />
          </div>
          <div className="form-group">
            <label>Avatar URL (optional)</label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div
            className="accounts-section"
            style={{
              marginTop: "1.5rem",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "1rem",
            }}
          >
            <label>Social Accounts</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <select
                value={newAccount.platform}
                onChange={(e) =>
                  setNewAccount((prev) => ({
                    ...prev,
                    platform: e.target.value as Platform,
                  }))
                }
                style={{
                  background: "#0f172a",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "0.4rem",
                }}
              >
                {ACCOUNT_PLATFORMS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                placeholder="Username"
                value={newAccount.username}
                onChange={(e) =>
                  setNewAccount((prev) => ({ ...prev, username: e.target.value }))
                }
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
              <input
                placeholder="URL (https://...)"
                value={newAccount.url}
                onChange={(e) =>
                  setNewAccount((prev) => ({ ...prev, url: e.target.value }))
                }
                style={{ flex: 1 }}
              />
              <button type="button" onClick={handleAddAccount} className="btn-add" style={{ padding: "0.4rem 1rem" }}>
                Add
              </button>
            </div>

            <div className="accounts-list">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`account-link ${acc.platform}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemoveAccount(acc.id)}
                >
                  {acc.username} x
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-add">
              Save Creator
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatorForm;
