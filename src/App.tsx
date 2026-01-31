  // Guest mode detection
  const isGuestMode = typeof window !== "undefined" && window.location && window.location.pathname.includes("/FAVCREATORS_TRACKER/guest");
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import "./App.css";
import type { Creator, SocialAccount, Platform } from "./types";
import CreatorCard from "./components/CreatorCard";
import CreatorForm from "./components/CreatorForm";
import { googleSearchYoutubeChannel } from "./utils/googleSearch";
import {
  fetchMe,
  getAuthBase,
  loginWithPassword,
  logout as logoutAuth,
  registerWithPassword,
  type AuthUser,
} from "./utils/auth";
import { grabAvatarFromAccounts } from "./utils/avatarGrabber";
import { extractYoutubeUsername } from "./utils/youtube";
import { ensureAvatarForCreators, ensureAvatarUrl } from "./utils/avatar";
import { fetchViaProxy, fetchWithTimeout as fetchWithTimeoutInternal } from "./utils/proxyFetch";

// Using centralized proxy fetch from utils/proxyFetch.ts
const fetchWithTimeout = fetchWithTimeoutInternal;

const checkLiveStatus = async (
  platform: string,
  username: string,
): Promise<boolean | null> => {
  if (platform === "twitch") {
    try {
      const response = await fetchWithTimeout(
        `https://decapi.me/twitch/uptime/${username}`,
        5000,
      );
      if (response.ok) {
        const text = (await response.text()).toLowerCase().trim();
        if (text.includes("offline") || text.includes("not found")) return false;
        if (/\d+[hms]/.test(text) || /\d+\s*(hour|minute|second)/i.test(text))
          return true;
        if (text.length > 0 && text.length < 50 && !text.includes("error"))
          return true;
      }
    } catch (e) {
      console.warn("Twitch DecAPI check failed, trying fallback", e);
    }

    try {
      const html = await fetchViaProxy(`https://www.twitch.tv/${username}`);
      if (html) {
        if (
          html.includes('"isLiveBroadcast":true') ||
          html.includes('"isLiveBroadcast": true') ||
          html.includes('"isLive":true') ||
          html.includes('"isLive": true')
        )
          return true;
        if (
          html.includes('"isLive":false') ||
          html.includes('"isLive": false') ||
          html.includes('offline_embed_player') ||
          html.includes("channel-status-info--offline")
        )
          return false;
      }
    } catch (e) {
      console.warn("Twitch proxy check failed", e);
    }

    return null;
  }

  if (platform === "kick") {
    try {
      const apiResponse = await fetchViaProxy(
        `https://kick.com/api/v2/channels/${username}`,
      );
      if (apiResponse) {
        if (apiResponse.includes('"is_live":true')) return true;
        if (apiResponse.includes('"is_live":false')) return false;
        if (apiResponse.includes('"livestream":null')) return false;

        try {
          const data = JSON.parse(apiResponse);
          if (data.livestream && typeof data.livestream === "object") {
            return data.livestream.is_live === true;
          }
          if (data.livestream === null) {
            return false;
          }
        } catch {
          // Not JSON
        }
      }
    } catch (e) {
      console.warn("Kick API check failed", e);
    }

    try {
      const pageHtml = await fetchViaProxy(`https://kick.com/${username}`);
      if (pageHtml) {
        if (pageHtml.includes('"is_live":true')) return true;
        if (
          pageHtml.includes('"is_live":false') ||
          pageHtml.includes('"livestream":null')
        )
          return false;
      }
    } catch (e) {
      console.warn("Kick page scrape failed", e);
    }

    return null;
  }

  if (platform === "tiktok") {
    try {
      const html = await fetchViaProxy(
        `https://www.tiktok.com/@${username}/live`,
      );
      if (html) {
        const isLiveIndicators = [
          '"status":4',
          '"liveRoomUserInfo"',
          '"LiveRoom"',
          "room_id",
          '"isLiveStreaming":true',
        ];
        const isOfflineIndicators = [
          "LIVE_UNAVAILABLE",
          '"status":2',
          "This LIVE has ended",
          "currently unavailable",
        ];

        for (const indicator of isLiveIndicators) {
          if (html.includes(indicator)) {
            let hasOfflineIndicator = false;
            for (const offIndicator of isOfflineIndicators) {
              if (html.includes(offIndicator)) {
                hasOfflineIndicator = true;
                break;
              }
            }
            if (!hasOfflineIndicator) return true;
          }
        }

        for (const indicator of isOfflineIndicators) {
          if (html.includes(indicator)) return false;
        }
      }
    } catch (e) {
      console.warn("TikTok check failed", e);
    }

    return null;
  }

  if (platform === "youtube") {
    try {
      const html = await fetchViaProxy(
        `https://www.youtube.com/@${username}/live`,
      );
      if (html) {
        if (
          html.includes('"isLive":true') ||
          html.includes('"isLiveBroadcast":true') ||
          html.includes('"isLiveNow":true') ||
          html.includes("LIVE NOW") ||
          html.includes('"liveBadge"')
        )
          return true;
        if (html.includes('"isLive":false') || html.includes("No live stream"))
          return false;
      }
    } catch (e) {
      console.warn("YouTube check failed", e);
    }

    return null;
  }

  return null;
};

const INITIAL_DATA: Creator[] = ensureAvatarForCreators([
  {
    id: "wtfpreston-1",
    name: "WTFPreston",
    bio: "Comedy musician and streamer dropping weird, funny songs and live bits.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=WTFPreston",
    isFavorite: false,
    addedAt: Date.now() - 4000,
    lastChecked: Date.now() - 3000,
    category: "Other",
    reason: "He makes funny songs.",
    tags: ["COMEDY", "MUSIC", "LOVE THEIR CONTENT"],
    accounts: [
      {
        id: "wtfpreston-tiktok",
        platform: "tiktok",
        username: "wtfprestonlive",
        url: "https://www.tiktok.com/@wtfprestonlive",
        followers: "330K",
        lastChecked: Date.now() - 3000,
      },
      {
        id: "wtfpreston-youtube",
        platform: "youtube",
        username: "wtfprestonlive",
        url: "https://www.youtube.com/@wtfprestonlive",
        lastChecked: Date.now() - 3000,
      },
      {
        id: "wtfpreston-instagram",
        platform: "instagram",
        username: "wtfprestonlive",
        url: "https://www.instagram.com/wtfprestonlive",
        lastChecked: Date.now() - 3000,
      },
      {
        id: "wtfpreston-spotify",
        platform: "spotify",
        username: "wtfprestonlive",
        url: "https://open.spotify.com/artist/5Ho2sjbNmEkALWz8hbNBUH",
        lastChecked: Date.now() - 3000,
      },
      {
        id: "wtfpreston-applemusic",
        platform: "other",
        username: "WTFPreston",
        url: "https://music.apple.com/us/artist/wtfpreston/1851052017",
        lastChecked: Date.now() - 3000,
      },
    ],
  },
  {
    id: "clavicular-1",
    name: "Clavicular",
    bio: "Kick streamer. Added by request.",
    avatarUrl: "",
    isFavorite: false,
    addedAt: Date.now() - 1000,
    lastChecked: Date.now() - 1000,
    category: "Other",
    accounts: [
      {
        id: "clavicular-kick",
        platform: "kick",
        username: "clavicular",
        url: "https://kick.com/clavicular",
        followers: "",
        lastChecked: Date.now() - 1000,
      }
    ],
  },
  {
    id: "zarthestar-1",
    name: "Zarthestar",
    bio: "Cosmic content creator and explorer of the digital universe. TikTok comedy & lifestyle.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zarthestar",
    isFavorite: false,
    addedAt: Date.now() - 2000,
    lastChecked: Date.now() - 1500,
    category: "Other",
    accounts: [
      {
        id: "zarthestar-tiktok",
        platform: "tiktok",
        username: "zarthestarcomedy",
        url: "https://www.tiktok.com/@zarthestarcomedy",
        followers: "125K",
        lastChecked: Date.now() - 1500,
      },
      {
        id: "zarthestar-instagram",
        platform: "instagram",
        username: "zar.the.star",
        url: "https://www.instagram.com/zar.the.star/?hl=en",
        followers: "45K",
        lastChecked: Date.now() - 1500,
      },
      {
        id: "zarthestar-twitch",
        platform: "twitch",
        username: "zarthestar",
        url: "https://twitch.tv/zarthestar",
        followers: "2.3K",
        lastChecked: Date.now() - 1500,
      },
      {
        id: "zarthestar-youtube",
        platform: "youtube",
        username: "zarthestarcomedy",
        url: "https://www.youtube.com/@zarthestarcomedy",
        followers: "800",
        lastChecked: Date.now() - 1500,
      },
      {
        id: "zarthestar-linktree",
        platform: "other",
        username: "linktr.ee/zarthestar",
        url: "https://linktr.ee/zarthestar",
        lastChecked: Date.now() - 1500,
      },
      {
        id: "zarthestar-msha",
        platform: "other",
        username: "msha.ke/zarthestar",
        url: "https://msha.ke/zarthestar",
        lastChecked: Date.now() - 1500,
      },
    ],
  },
  {
    id: "3",
    name: "Adin Ross",
    bio: "Kick's No. 1 Creator | Live every day.",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=AdinRoss",
    isFavorite: true,
    isPinned: true,
    addedAt: Date.now() - 50000,
    lastChecked: Date.now() - 45000,
    category: "Favorites",
    accounts: [
      {
        id: "3a",
        platform: "kick",
        username: "adinross",
        url: "https://kick.com/adinross",
        followers: "1.9M",
        lastChecked: Date.now() - 47000,
      },
      {
        id: "3b",
        platform: "youtube",
        username: "adinross",
        url: "https://youtube.com/@adinross",
        followers: "4.6M",
        lastChecked: Date.now() - 47000,
      },
      {
        id: "adinross-linktree",
        platform: "other",
        username: "linktr.ee/adinrosss",
        url: "https://linktr.ee/adinrosss",
        lastChecked: Date.now() - 47000,
      },
    ],
  },
  {
    id: "6",
    name: "Starfireara",
    bio: "Content creator and visionary.",
    avatarUrl: "/avatars/starfireara.jpg",
    isFavorite: true,
    isPinned: true,
    addedAt: Date.now() - 5000,
    reason: "Motivational speaker",
    lastChecked: Date.now() - 4000,
    category: "Favorites",
    accounts: [
      {
        id: "6b",
        platform: "tiktok",
        username: "starfireara",
        url: "https://www.tiktok.com/@starfireara",
        followers: "247.3K",
        lastChecked: Date.now() - 4000,
      },
      {
        id: "starfireara-linktree",
        platform: "other",
        username: "linktr.ee/starfiire",
        url: "https://linktr.ee/starfiire",
        lastChecked: Date.now() - 4000,
      },
    ],
  },
]);

const DATA_VERSION = "9.0"; // Increment this to force reset localStorage
const QUICK_ADD_DEFAULT_TAGS = ["LOVE THEIR CONTENT"];

function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [creators, setCreators] = useState<Creator[]>(() => {
    try {
      const savedVersion = localStorage.getItem("fav_creators_version");
      // Reset data if version mismatch (categories changed)
      if (savedVersion !== DATA_VERSION) {
        localStorage.setItem("fav_creators_version", DATA_VERSION);
        localStorage.removeItem("fav_creators");
        return INITIAL_DATA;
      }
      const saved = localStorage.getItem("fav_creators");
      return saved ? ensureAvatarForCreators(JSON.parse(saved)) : INITIAL_DATA;
    } catch (e) {
      console.error("Failed to parse creators from localStorage", e);
      return INITIAL_DATA;
    }
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "dropdown" | "table">("list");
  const [quickAddValue, setQuickAddValue] = useState("");
  const creatorsRef = useRef<Creator[]>(creators);

  const realAvatarCount = useMemo(
    () =>
      creators.filter(
        (creator) =>
          creator.avatarUrl &&
          !creator.avatarUrl.includes("dicebear.com"),
      ).length,
    [creators],
  );

  useEffect(() => {
    creatorsRef.current = creators;
  }, [creators]);

  useEffect(() => {
    let isMounted = true;

    const fixAllAvatars = async () => {
      const snapshot = creatorsRef.current;
      for (const creator of snapshot) {
        if (!isMounted) return;
        if (creator.avatarUrl?.includes("dicebear.com")) {
          const avatar = await grabAvatarFromAccounts(creator.accounts, creator.name);
          if (avatar && avatar !== creator.avatarUrl && isMounted) {
            setCreators((oldCreators) =>
              oldCreators.map((c) =>
                c.id === creator.id ? { ...c, avatarUrl: avatar } : c,
              ),
            );
          }
        }
      }
    };

    fixAllAvatars();
    const interval = setInterval(fixAllAvatars, 600000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("fav_creators", JSON.stringify(creators));
  }, [creators]);

  useEffect(() => {
    if (!isGuestMode) {
      const loadUser = async () => {
        try {
          const user = await fetchMe();
          setAuthUser(user);
        } catch (error) {
          console.warn("Auth check failed", error);
        }
      };
      void loadUser();
    }
  }, [isGuestMode]);

  // No longer checking for shared pack in URL

  const updateAllLiveStatuses = useCallback(async () => {
    // Get current creators
    const currentCreators = [...creatorsRef.current];
    const updatedCreators: Creator[] = [];

    // Process creators sequentially with small delays to avoid overwhelming proxy
    for (let i = 0; i < currentCreators.length; i++) {
      const c = currentCreators[i];
      const now = Date.now();

      // Add delay between creators (except first one)
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const updatedAccounts = await Promise.all(
        c.accounts.map(async (acc) => {
          const liveResult = await checkLiveStatus(acc.platform, acc.username);
          const isLive = liveResult === null ? acc.isLive : liveResult;
          return { ...acc, isLive, lastChecked: now };
        }),
      );

      const anyAccountLive = updatedAccounts.some((acc) => acc.isLive === true);
      updatedCreators.push({
        ...c,
        isLive: anyAccountLive,
        accounts: updatedAccounts,
        lastChecked: now,
      });
    }

    setCreators(updatedCreators);
  }, []);

  // Auto-check live status on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      updateAllLiveStatuses();
    }, 1500);

    const interval = setInterval(updateAllLiveStatuses, 180000); // Check every 3 mins

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [updateAllLiveStatuses]);

  // Data Migration: Ensure all existing accounts have follower counts
  useEffect(() => {
    const baseCreators = creatorsRef.current;
    let needsUpdate = false;

    const migrated = baseCreators.map((creator) => {
      let creatorUpdated = false;
      const newAccounts = creator.accounts.map((acc) => {
        if (!acc.followers) {
          creatorUpdated = true;
          needsUpdate = true;
          const randomFollowers = (Math.random() * 10 + 1).toFixed(1) + "M";
          return { ...acc, followers: randomFollowers };
        }
        return acc;
      });
      return creatorUpdated ? { ...creator, accounts: newAccounts } : creator;
    });

    if (needsUpdate) {
      setCreators(ensureAvatarForCreators(migrated));
    }
  }, []);

  const handleQuickAdd = async () => {
    if (!quickAddValue.trim()) return;

    const parts = quickAddValue.split(":").map((p) => p.trim());
    const name = parts[0];
    let requestedPlatforms = parts.slice(1);

    if (!name) return;

    // Auto-find logic: if no platforms specified, search all major ones
    if (requestedPlatforms.length === 0) {
      requestedPlatforms = ["kick", "twitch", "youtube", "tiktok", "instagram"];
    }

    let youtubeSearchResult: string | null = null;
    if (requestedPlatforms.includes("youtube")) {
      try {
        youtubeSearchResult = await googleSearchYoutubeChannel(
          `${name} official youtube`,
        );
      } catch (error) {
        console.warn("Quick add YouTube search failed", error);
      }
    }

    const accounts: SocialAccount[] = [];
    const now = Date.now();

    requestedPlatforms.forEach((p) => {
      const platform = p.toLowerCase() as Platform;
      const id = crypto.randomUUID();
      let cleanUsername = name.toLowerCase().replace(/\s+/g, "");
      const dummyFollowers = (Math.random() * 5 + 0.5).toFixed(1) + "M";

      // Specialized matching for specific creators
      if (cleanUsername === "zarthestar") {
        if (platform === "tiktok" || platform === "youtube") cleanUsername = "zarthestarcomedy";
        if (platform === "instagram") cleanUsername = "zar.the.star";
      }

      const baseAccount = {
        id,
        platform,
        username: cleanUsername,
        followers: dummyFollowers,
        lastChecked: now,
      };

      if (platform === "kick") {
        accounts.push({
          ...baseAccount,
          url: `https://kick.com/${cleanUsername}`,
        });
      } else if (platform === "twitch") {
        accounts.push({
          ...baseAccount,
          url: `https://twitch.tv/${cleanUsername}`,
        });
      } else if (platform === "youtube") {
        const url = youtubeSearchResult || `https://youtube.com/@${cleanUsername}`;
        const username = extractYoutubeUsername(url) || cleanUsername;
        accounts.push({
          ...baseAccount,
          url,
          username,
        });
      } else if (platform === "tiktok") {
        accounts.push({
          ...baseAccount,
          url: `https://tiktok.com/@${cleanUsername}`,
        });
      } else if (platform === "instagram") {
        accounts.push({
          ...baseAccount,
          url: `https://instagram.com/${cleanUsername}`,
        });
      }
    });

    let fetchedAvatar: string | null = null;
    if (accounts.length > 0) {
      try {
        fetchedAvatar = await grabAvatarFromAccounts(accounts, name);
      } catch (error) {
        console.warn("Avatar grabber failed after quick add", error);
      }
    }

    const newCreator: Creator = {
      id: crypto.randomUUID(),
      name: name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      bio: `Auto-found social accounts for ${name}`,
      avatarUrl:
        fetchedAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`,
      accounts,
      isFavorite: false,
      isPinned: false,
      note: "",
      addedAt: now,
      lastChecked: now,
      tags: [...QUICK_ADD_DEFAULT_TAGS],
    };

    setCreators([ensureAvatarUrl(newCreator), ...creators]);
    setQuickAddValue("");
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(creators, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "fav-creators-export.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Cookie helpers for settings persistence
  const setCookie = (name: string, value: string, days: number = 365) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  };

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let c of ca) {
      c = c.trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  };

  // Save all settings to cookie
  const handleSaveSettings = () => {
    const settings = {
      creators,
      categoryFilter,
      viewMode,
      searchQuery,
      savedAt: Date.now(),
    };
    try {
      setCookie("favcreators_settings", JSON.stringify(settings));
      alert("Settings saved to browser cookies!");
    } catch (e) {
      console.error("Failed to save settings:", e);
      alert("Failed to save settings. Try exporting to JSON instead.");
    }
  };

  // Load settings from cookie on mount
  useEffect(() => {
    const savedSettings = getCookie("favcreators_settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.creators) {
          // Don't auto-load from cookie, just keep localStorage as primary
          console.log(
            "Cookie settings found, last saved:",
            new Date(settings.savedAt).toLocaleString(),
          );
        }
      } catch (e) {
        console.error("Failed to parse cookie settings:", e);
      }
    }
  }, []);

  // Export settings to JSON file
  const handleExportSettings = () => {
    const settings = {
      creators,
      categoryFilter,
      viewMode,
      exportedAt: new Date().toISOString(),
      version: DATA_VERSION,
    };
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `favcreators-settings-${new Date().toISOString().split("T")[0]}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Import settings from JSON file
  const handleImportSettings = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);

          // Check if it's our settings format or just creators array
          if (imported.creators && Array.isArray(imported.creators)) {
            setCreators(ensureAvatarForCreators(imported.creators));
            if (imported.categoryFilter !== undefined)
              setCategoryFilter(imported.categoryFilter);
            if (imported.viewMode !== undefined) setViewMode(imported.viewMode);
            alert(
              `Settings imported successfully! (${imported.creators.length} creators)`,
            );
          } else if (Array.isArray(imported)) {
            // Legacy format: just an array of creators
            setCreators(ensureAvatarForCreators(imported));
            alert(`Imported ${imported.length} creators!`);
          } else {
            alert("Invalid settings file format.");
          }
        } catch (err) {
          console.error("Import failed:", err);
          alert("Failed to import settings. Make sure the file is valid JSON.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleCheckCreatorStatus = async (id: string) => {
    const creator = creators.find((c) => c.id === id);
    if (!creator) return;

    const now = Date.now();
    const updatedAccounts = await Promise.all(
      creator.accounts.map(async (acc) => {
        const liveResult = await checkLiveStatus(acc.platform, acc.username);
        // If check failed (null), keep previous status; otherwise use new status
        const isLive = liveResult === null ? acc.isLive : liveResult;
        return { ...acc, isLive, lastChecked: now };
      }),
    );

    // Only mark creator as live if at least one account is definitively live
    const anyAccountLive = updatedAccounts.some((acc) => acc.isLive === true);
    setCreators(
      creators.map((c) =>
        c.id === id
          ? {
            ...c,
            isLive: anyAccountLive,
            accounts: updatedAccounts,
            lastChecked: now,
          }
          : c,
      ),
    );
  };

  const handleRefreshStatus = async () => {
    await updateAllLiveStatuses();
  };

  const handleResetDatabase = () => {
    if (
      window.confirm(
        "This will reset your entire list to the latest official creator data. Continue?",
      )
    ) {
      setCreators(INITIAL_DATA);
    }
  };

  const handleGoogleLogin = () => {
    try {
      const base = getAuthBase();
      window.location.href = `${base}/auth/google`;
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Missing VITE_AUTH_BASE_URL",
      );
    }
  };

  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const loginUser = await loginWithPassword(loginEmail, loginPassword);
      if (loginUser?.provider === "admin") {
        setAuthUser(loginUser);
      } else {
        const user = await fetchMe();
        setAuthUser(user);
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await registerWithPassword(registerEmail, registerPassword, registerName);
      const user = await fetchMe();
      setAuthUser(user);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAuth();
    setAuthUser(null);
  };

  const handleSaveCreator = (newCreator: Creator) => {
    setCreators([ensureAvatarUrl(newCreator), ...creators]);
    setIsFormOpen(false);
  };

  const handleDeleteCreator = (id: string) => {
    if (window.confirm("Are you sure you want to remove this creator?")) {
      setCreators(creators.filter((c) => c.id !== id));
    }
  };

  const handleToggleFavorite = (id: string) => {
    setCreators(
      creators.map((c) =>
        c.id === id ? { ...c, isFavorite: !c.isFavorite } : c,
      ),
    );
  };

  const handleTogglePin = (id: string) => {
    setCreators(
      creators.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c)),
    );
  };

  const handleUpdateNote = (id: string, note: string) => {
    setCreators(creators.map((c) => (c.id === id ? { ...c, note } : c)));
  };

  const handleRemoveAccount = (creatorId: string, accountId: string) => {
    setCreators(
      creators.map((c) =>
        c.id === creatorId
          ? { ...c, accounts: c.accounts.filter((acc) => acc.id !== accountId) }
          : c,
      ),
    );
  };

  // Refresh avatar for a single creator
  const handleRefreshAvatar = async (id: string) => {
    const creator = creators.find((c) => c.id === id);
    if (!creator) return;
    const avatar = await grabAvatarFromAccounts(creator.accounts, creator.name);
    setCreators((oldCreators) =>
      oldCreators.map((c) =>
        c.id === id
          ? {
            ...c,
            avatarUrl:
              avatar && !avatar.includes("dicebear.com")
                ? avatar
                : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(c.name)}`,
          }
          : c
      )
    );
  };

  // Render view mode toggle
  const renderViewModeToggle = () => (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        marginBottom: "1rem",
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        className={`btn-secondary ${viewMode === "list" ? "view-active" : ""}`}
        onClick={() => setViewMode("list")}
        style={{
          padding: "0.5rem 1rem",
          background: viewMode === "list" ? "var(--accent)" : "rgb(30, 41, 59)",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        List View
      </button>
      <button
        type="button"
        className={`btn-secondary ${viewMode === "dropdown" ? "view-active" : ""}`}
        onClick={() => setViewMode("dropdown")}
        style={{
          padding: "0.5rem 1rem",
          background:
            viewMode === "dropdown" ? "var(--accent)" : "rgb(30, 41, 59)",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Dropdown View
      </button>
      <button
        type="button"
        className={`btn-secondary ${viewMode === "table" ? "view-active" : ""}`}
        onClick={() => setViewMode("table")}
        style={{
          padding: "0.5rem 1rem",
          background: viewMode === "table" ? "var(--accent)" : "rgb(30, 41, 59)",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Tabular View
      </button>
    </div>
  );

  return (
    <div className="app-container">
      <header>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1>FavCreators</h1>
            <p className="subtitle">
              Ever watched a TikTok or an Instagram reel and wished you could get back to the creator or content?
              Ever wished you knew if your favorite streamer was live and on what platform?
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <div className="auth-panel">
              <div className="auth-panel__header">
                <span>Account</span>
                {authUser ? (
                  <button className="auth-link" onClick={handleLogout}>
                    Sign out
                  </button>
                ) : (
                  isGuestMode ? (
                    <span className="auth-status">Guest mode</span>
                  ) : (
                    <button
                      className="btn-secondary"
                      style={{ marginTop: 8, marginBottom: 8 }}
                      onClick={() => {
                        window.location.href = "/FAVCREATORS_TRACKER/guest";
                      }}
                    >
                      Continue as Guest
                    </button>
                  )
                )}
              </div>
              {authUser ? (
                <div className="auth-user">
                  <div className="auth-user__name">
                    {authUser.display_name || authUser.email || "Signed in"}
                  </div>
                  <div className="auth-user__meta">
                    {authUser.provider ? `Provider: ${authUser.provider}` : ""}
                  </div>
                </div>
              ) : (
                isGuestMode ? (
                  <div className="auth-actions">
                    <div className="auth-hint">
                      You are browsing as a guest. To save or customize, please log in or create an account.
                    </div>
                    <button
                      className="btn-secondary"
                      onClick={() => setShowLoginForm((prev) => !prev)}
                    >
                      {showLoginForm ? "Hide login" : "Login"}
                    </button>
                    {showLoginForm && (
                      <>
                        <button className="btn-google" onClick={handleGoogleLogin}>
                          Continue with Google
                        </button>
                        <div className="auth-divider">or use email</div>
                        <input
                          type="email"
                          placeholder="Email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                        />
                        <button
                          className="btn-secondary"
                          onClick={() => void handleLogin()}
                          disabled={authLoading}
                        >
                          Email login (or admin/admin)
                        </button>
                        <div className="auth-divider">new here?</div>
                        <input
                          type="text"
                          placeholder="Display name"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                        />
                        <input
                          type="password"
                          placeholder="Password (12+ chars incl. upper/lower/digit/symbol)"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                        />
                        <button
                          className="btn-secondary"
                          onClick={() => void handleRegister()}
                          disabled={authLoading}
                        >
                          Create account
                        </button>
                        {authError && <div className="auth-error">{authError}</div>}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="auth-actions">
                    <button className="btn-google" onClick={handleGoogleLogin}>
                      Continue with Google
                    </button>
                    <div className="auth-divider">or use email</div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button
                      className="btn-secondary"
                      onClick={() => void handleLogin()}
                      disabled={authLoading}
                    >
                      Email login (or admin/admin)
                    </button>
                    <div className="auth-divider">new here?</div>
                    <input
                      type="text"
                      placeholder="Display name"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Password (12+ chars incl. upper/lower/digit/symbol)"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                    <button
                      className="btn-secondary"
                      onClick={() => void handleRegister()}
                      disabled={authLoading}
                    >
                      Create account
                    </button>
                    {authError && <div className="auth-error">{authError}</div>}
                    <div className="auth-hint">
                      Guest mode stays available for browsing default creators.
                    </div>
                  </div>
                )
              )}
            </div>
            {!isGuestMode && (
              <>
                <button
                  onClick={handleSaveSettings}
                  title="Save settings to browser cookies"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "0.5rem 1rem",
                    background: "var(--accent)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  💾 Save
                </button>
                <button
                  onClick={handleExportSettings}
                  title="Export settings to JSON file"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "0.5rem 1rem",
                    background: "var(--card-bg)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  📤 Export
                </button>
              </>
            )}
            <button
              onClick={handleImportSettings}
              title="Import settings from JSON file"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "0.5rem 1rem",
                background: "var(--card-bg)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              📥 Import
            </button>
          </div>
        </div>
      </header>
      <div className="avatar-status" aria-live="polite">
        <span>Real avatars fetched:</span>
        <strong>{realAvatarCount}</strong>
        <span> of </span>
        <strong>{creators.length}</strong>
      </div>

      {renderViewModeToggle()}

      <div className="quick-add-group">
        <input
          className="quick-add-input"
          placeholder="Quick add (e.g. adinross:kick:twitch:youtube:tiktok:instagram)"
          value={quickAddValue}
          onChange={(e) => setQuickAddValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void handleQuickAdd()}
        />
        <button className="quick-add-btn" onClick={() => void handleQuickAdd()}>
          Quick Add
        </button>
      </div>

      <div className="controls">
        <div
          className="search-bar"
          style={{ display: "flex", gap: "1rem", alignItems: "center" }}
        >
          <input
            type="text"
            placeholder="Search creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ minWidth: 140 }}
          >
            <option value="">All Categories</option>
            <option value="Favorites">Favorites</option>
            <option value="Other">Other</option>
          </select>

          {/* View mode toggle */}
          <div
            className="view-mode-toggle"
            style={{
              display: "flex",
              gap: "4px",
              backgroundColor: "rgba(255,255,255,0.05)",
              padding: "4px",
              borderRadius: "8px",
            }}
          >
            <button
              type="button"
              className={`btn-secondary ${viewMode === "list" ? "view-active" : ""}`}
              onClick={() => setViewMode("list")}
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
            >
              List with headers
            </button>
            <button
              type="button"
              className={`btn-secondary ${viewMode === "dropdown" ? "view-active" : ""}`}
              onClick={() => setViewMode("dropdown")}
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
            >
              Dropdown filter
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.8rem" }}>
          <button
            className="btn-secondary"
            onClick={handleResetDatabase}
            title="Reset to official data"
          >
            🔄 Reset
          </button>
          <button
            className="btn-secondary"
            onClick={handleExport}
            title="Export to JSON"
          >
            📤 Export
          </button>
          <button
            className="btn-secondary"
            onClick={handleRefreshStatus}
            title="Check all live statuses"
          >
            📡 Live check
          </button>
          <button className="btn-add" onClick={() => setIsFormOpen(true)}>
            <span>+</span> Add Creator
          </button>
        </div>
      </div>



      {/* Main Content Area */}
      <div className="main-content-display" style={{ marginTop: "2rem" }}>
        {viewMode === "list" && (
          <>
            {/* List Mode with Headers */}
            {/* Starfireara Section */}
            {creators
              .filter(
                (c) =>
                  c.name.toLowerCase().includes("starfireara") &&
                  (!categoryFilter || c.category === categoryFilter) &&
                  c.name
                    .toLowerCase()
                    .replace(/\s+/g, "")
                    .includes(searchQuery.toLowerCase().replace(/\s+/g, "")),
              )
              .map((creator) => (
                <div key={creator.id} className="creator-section-featured">
                  <CreatorCard
                    creator={creator}
                    onToggleFavorite={handleToggleFavorite}
                    onDelete={handleDeleteCreator}
                    onRemoveAccount={handleRemoveAccount}
                    onCheckStatus={handleCheckCreatorStatus}
                    onTogglePin={handleTogglePin}
                    onUpdateNote={handleUpdateNote}
                    onRefreshAvatar={handleRefreshAvatar}
                  />
                </div>
              ))}

            {/* Adin Ross Section */}
            {creators
              .filter(
                (c) =>
                  c.name.toLowerCase().includes("adin ross") &&
                  (!categoryFilter || c.category === categoryFilter) &&
                  c.name
                    .toLowerCase()
                    .replace(/\s+/g, "")
                    .includes(searchQuery.toLowerCase().replace(/\s+/g, "")),
              )
              .map((creator) => (
                <div
                  key={creator.id}
                  className="creator-section-featured"
                  style={{ marginTop: "1rem" }}
                >
                  <CreatorCard
                    creator={creator}
                    onToggleFavorite={handleToggleFavorite}
                    onDelete={handleDeleteCreator}
                    onRemoveAccount={handleRemoveAccount}
                    onCheckStatus={handleCheckCreatorStatus}
                    onTogglePin={handleTogglePin}
                    onUpdateNote={handleUpdateNote}
                    onRefreshAvatar={handleRefreshAvatar}
                  />
                </div>
              ))}

            {/* Other Creators Header */}
            <h2
              id="other-creators-section"
              style={{
                marginTop: "3rem",
                marginBottom: "1.5rem",
                color: "var(--text-muted)",
                fontSize: "1.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                paddingBottom: "0.5rem",
              }}
            >
              Other Creators
            </h2>

            {/* Other Creators Grid */}
            <div className="creator-grid">
              {creators
                .filter(
                  (c) =>
                    !c.name.toLowerCase().includes("starfireara") &&
                    !c.name.toLowerCase().includes("adin ross") &&
                    (!categoryFilter || c.category === categoryFilter) &&
                    c.name
                      .toLowerCase()
                      .replace(/\s+/g, "")
                      .includes(searchQuery.toLowerCase().replace(/\s+/g, "")),
                )
                .map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    onToggleFavorite={handleToggleFavorite}
                    onDelete={handleDeleteCreator}
                    onRemoveAccount={handleRemoveAccount}
                    onCheckStatus={handleCheckCreatorStatus}
                    onTogglePin={handleTogglePin}
                    onUpdateNote={handleUpdateNote}
                    onRefreshAvatar={handleRefreshAvatar}
                  />
                ))}
            </div>
          </>
        )}

        {viewMode === "dropdown" && (
          /* Dropdown Filter Mode */
          <div className="creator-grid">
            {creators
              .filter((c) => {
                const search = searchQuery.toLowerCase().replace(/\s+/g, "");
                const matchesSearch = c.name
                  .toLowerCase()
                  .replace(/\s+/g, "")
                  .includes(search);
                const matchesCategory =
                  !categoryFilter || c.category === categoryFilter;

                return matchesSearch && matchesCategory;
              })
              .map((creator) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteCreator}
                  onRemoveAccount={handleRemoveAccount}
                  onCheckStatus={handleCheckCreatorStatus}
                  onTogglePin={handleTogglePin}
                  onUpdateNote={handleUpdateNote}
                  onRefreshAvatar={handleRefreshAvatar}
                />
              ))}
          </div>
        )}

        {viewMode === "table" && (
          <div className="table-container" style={{ overflowX: "auto" }}>
            <table className="creator-table">
              <thead>
                <tr>
                  <th>Creator</th>
                  <th>Status</th>
                  <th>Channels</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {creators
                  .filter((c) => {
                    const search = searchQuery.toLowerCase().replace(/\s+/g, "");
                    const matchesSearch = c.name
                      .toLowerCase()
                      .replace(/\s+/g, "")
                      .includes(search);
                    const matchesCategory =
                      !categoryFilter || c.category === categoryFilter;
                    return matchesSearch && matchesCategory;
                  })
                  .map((creator) => (
                    <tr key={creator.id}>
                      <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={creator.avatarUrl}
                          alt=""
                          style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                        />
                        <div style={{ fontWeight: 600 }}>{creator.name}</div>
                      </td>
                      <td>
                        {creator.isLive ? (
                          <span className="badge-live">LIVE</span>
                        ) : (
                          <span className="badge-offline">Offline</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {creator.accounts.map((acc) => (
                            <a
                              key={acc.id}
                              href={acc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`${acc.platform}: ${acc.username}`}
                            >
                              <img
                                src={`https://www.google.com/s2/favicons?sz=32&domain=${new URL(acc.url).hostname}`}
                                alt={acc.platform}
                                style={{ width: "16px", height: "16px" }}
                              />
                            </a>
                          ))}
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={creator.note || ""}
                          onChange={(e) => handleUpdateNote(creator.id, e.target.value)}
                          placeholder="Add note..."
                          className="table-note-input"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text)",
                            fontSize: "0.85rem",
                            width: "100%",
                            padding: "4px"
                          }}
                        />
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleToggleFavorite(creator.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}
                          >
                            {creator.isFavorite ? "⭐" : "☆"}
                          </button>
                          <button
                            onClick={() => handleDeleteCreator(creator.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <CreatorForm
          onSave={handleSaveCreator}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      <footer
        style={{
          marginTop: "5rem",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.8rem",
        }}
      >
        <p>© 2026 FavCreators. Built with ❤️ for creators. v1.7.5-Production</p>
      </footer>
    </div>
  );
}

export default App;
