import React, { useEffect, useMemo, useState } from "react";
import type { Creator } from "../types";

interface CreatorCardProps {
  creator: Creator;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onRemoveAccount: (creatorId: string, accountId: string) => void;
  onCheckStatus: (id: string) => Promise<void>;
  onTogglePin: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
}

const formatRelativeTime = (timestamp?: number) => {
  if (!timestamp) return "Not checked yet";
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "Checked just now";
  if (diffMinutes < 60) return `Checked ${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Checked ${diffHours}h ago`;

  return `Checked ${new Date(timestamp).toLocaleDateString()}`;
};

const parseFollowersCount = (followers?: string) => {
  if (!followers) return 0;
  const normalized = followers.replace(/,/g, "").trim().toLowerCase();
  const numberMatch = normalized.match(/[\d.]+/);
  if (!numberMatch) return 0;

  let value = parseFloat(numberMatch[0]);
  if (normalized.includes("m")) value *= 1_000_000;
  else if (normalized.includes("k")) value *= 1_000;

  return isFinite(value) ? value : 0;
};

const computeHealthScore = (creator: Creator) => {
  const followerSum = creator.accounts.reduce(
    (sum, acc) => sum + parseFollowersCount(acc.followers),
    0,
  );
  const base = Math.min(80, (followerSum / 1_000_000) * 10);
  let score = base;
  if (creator.isLive) score += 10;
  if (creator.isPinned) score += 5;
  if (creator.isFavorite) score += 5;
  return Math.min(100, Math.max(10, Math.round(score)));
};

const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  onToggleFavorite,
  onDelete,
  onRemoveAccount,
  onCheckStatus,
  onTogglePin,
  onUpdateNote,
}) => {
  const [checking, setChecking] = useState(false);
  const [noteDraft, setNoteDraft] = useState(creator.note || "");

  const healthScore = useMemo(() => computeHealthScore(creator), [creator]);

  useEffect(() => {
    setNoteDraft(creator.note || "");
  }, [creator.note]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "youtube":
        return (
          <svg
            viewBox="0 0 24 24"
            className="platform-icon"
            fill="currentColor"
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        );
      case "tiktok":
        return (
          <svg
            viewBox="0 0 24 24"
            className="platform-icon"
            fill="currentColor"
          >
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-1.01V14.5c.01 2.32-.6 4.67-2.12 6.44-1.56 1.82-3.86 2.89-6.24 2.92-2.45.02-4.85-.92-6.49-2.73-1.74-1.92-2.43-4.63-1.89-7.14.47-2.2 1.84-4.22 3.82-5.32 1.76-1.01 3.86-1.31 5.88-.81v4.3c-1.19-.38-2.52-.16-3.52.54-.92.64-1.47 1.75-1.46 2.88-.01 1.15.54 2.29 1.48 2.95.96.69 2.21.84 3.33.4.98-.38 1.7-1.32 1.74-2.37.04-3.14.01-6.28.02-9.42z" />
          </svg>
        );
      case "instagram":
        return (
          <svg
            viewBox="0 0 24 24"
            className="platform-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        );
      case "kick":
        return (
          <svg
            viewBox="0 0 24 24"
            className="platform-icon"
            fill="currentColor"
          >
            <path d="M11.666 4.333H7.011v15.334h4.655v-3.889l4.643 3.889h5.68l-6.38-5.352 6.38-5.353h-5.68l-4.643 3.89V4.333z" />
          </svg>
        );
      case "twitch":
        return (
          <svg
            viewBox="0 0 24 24"
            className="platform-icon"
            fill="currentColor"
          >
            <path d="M11.571 1.429 1.286 4v14.571h4.285V22.5l4.286-3.929h3.857l7.286-7.286V1.429h-9.429zm8.571 9.429-3.429 3.429h-4.714l-2.571 2.571v-2.571H6.429V4h11.571L20.142 6.143v4.715zM15 7.429h-1.714v4.286H15V7.429zm-4.714 0H8.571v4.286h1.715V7.429z" />
          </svg>
        );
      default:
        return (
          <svg
            viewBox="0 0 24 24"
            className="platform-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        );
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    await onCheckStatus(creator.id);
    setChecking(false);
  };

  return (
    <div className="creator-card">
      {creator.isLive && (
        <div className="live-badge">
          <div className="live-dot"></div>
          Live
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: "15px",
          right: "15px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <button
          onClick={handleCheckStatus}
          disabled={checking}
          title="Check Live Status"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
            opacity: checking ? 0.3 : 0.6,
          }}
        >
          {checking ? "⏳" : "📡"}
        </button>
        <button
          onClick={() => onTogglePin(creator.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.2rem",
          }}
          title={creator.isPinned ? "Unpin creator" : "Pin creator"}
        >
          {creator.isPinned ? "📌" : "📍"}
        </button>
        <button
          onClick={() => onToggleFavorite(creator.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.2rem",
          }}
        >
          {creator.isFavorite ? "⭐️" : "☆"}
        </button>
        <button
          onClick={() => onDelete(creator.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
            opacity: 0.5,
          }}
        >
          🗑️
        </button>
      </div>

      <img
        src={creator.avatarUrl || "https://via.placeholder.com/80"}
        alt={creator.name}
        className="creator-avatar"
      />
      <h3 className="creator-name">{creator.name}</h3>
      {creator.category && (
        <div
          className="creator-category"
          style={{ fontSize: "0.9rem", color: "#7dd3fc", marginBottom: 4 }}
        >
          {creator.category}
        </div>
      )}
      <p className="creator-bio">{creator.bio}</p>
      {creator.reason && (
        <div className="creator-reason">
          <span className="reason-label">Reason:</span> {creator.reason}
        </div>
      )}

      <div
        className="health-score"
        title="More followers/live + pinned boosts the score"
      >
        <span>Creator health</span>
        <div className="health-meter">
          <span style={{ width: `${healthScore}%` }} />
        </div>
        <span className="health-label">{healthScore}%</span>
      </div>

      <div className="creator-note-wrapper">
        <label htmlFor={`note-${creator.id}`}>Personal note</label>
        <textarea
          id={`note-${creator.id}`}
          className="creator-note"
          value={noteDraft}
          placeholder="Add context, reminders, or how you met them"
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={() => {
            if ((creator.note || "") !== noteDraft) {
              onUpdateNote(creator.id, noteDraft);
            }
          }}
          rows={3}
        />
        <button
          className="btn-save-note"
          onClick={() => {
            if ((creator.note || "") !== noteDraft) {
              onUpdateNote(creator.id, noteDraft);
            }
          }}
          title="Save note"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "6px",
            padding: "4px 10px",
            fontSize: "0.8rem",
            background:
              (creator.note || "") !== noteDraft
                ? "var(--accent)"
                : "var(--card-bg)",
            color:
              (creator.note || "") !== noteDraft
                ? "white"
                : "var(--text-muted)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            cursor: "pointer",
            opacity: (creator.note || "") !== noteDraft ? 1 : 0.6,
          }}
        >
          💾 Save Note
        </button>
      </div>

      <div className="creator-last-checked">
        {formatRelativeTime(creator.lastChecked)}
      </div>

      <div className="accounts-list">
        {creator.accounts.map((account) => (
          <div key={account.id} className={`account-link ${account.platform}`}>
            <a
              href={account.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {getPlatformIcon(account.platform)}
              <div className="account-info">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span>
                    {account.platform === "other"
                      ? account.username
                      : `@${account.username}`}
                  </span>
                  {account.isLive && <div className="account-live-dot"></div>}
                </div>
                {account.followers && (
                  <span className="follower-count">
                    {account.followers} followers
                  </span>
                )}
              </div>
            </a>
            <button
              className="btn-remove-account"
              onClick={(e) => {
                e.preventDefault();
                onRemoveAccount(creator.id, account.id);
              }}
              title="Remove account"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatorCard;
